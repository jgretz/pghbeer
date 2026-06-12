import {useCallback, useEffect, useMemo, useReducer, useRef, useState} from 'react';
import {useMutation, useQueryClient} from '@tanstack/react-query';

import * as maps from '../../lib/admin/maps';
import {alignSlots, type AlignKind} from '../../lib/admin/mapAlign';
import {
  DEFAULT_LABEL_FONT_SIZE,
  draftReducer,
  isTempId,
  labelBox,
  makeSlot,
  type DraftSlot,
} from '../../lib/admin/mapDraft';

type World = {width: number; height: number};

// Bounded concurrency for the save fan-out: parallel within a chunk, chunks
// sequential, so a large layout doesn't fire hundreds of requests at once.
const SAVE_CHUNK = 8;

async function inChunks<T, R>(
  items: T[],
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  const out: R[] = [];
  for (let i = 0; i < items.length; i += SAVE_CHUNK) {
    out.push(...(await Promise.all(items.slice(i, i + SAVE_CHUNK).map(fn))));
  }
  return out;
}

// Owns the editable slot draft for one layout: selection, geometry editing,
// add/duplicate/delete, save-diff persistence, and day-of brewery assignment.
export function useMapEditor(params: {
  layout: maps.AdminMapLayout | undefined;
  world: World;
  roster: maps.EventBrewery[];
  layoutId: number | null;
}) {
  const {layout, world, roster, layoutId} = params;
  const qc = useQueryClient();

  const [draft, dispatch] = useReducer(draftReducer, [] as DraftSlot[]);
  const [dirty, setDirty] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [pickerSlotId, setPickerSlotId] = useState<number | null>(null);
  const tempIdRef = useRef(-1);
  const nextTempId = () => tempIdRef.current--;

  const layoutKey = ['admin', 'map', 'layout', layoutId];

  // (Re)load the draft whenever the persisted layout loads or refetches.
  useEffect(() => {
    if (layout) {
      dispatch({type: 'LOAD', slots: layout.slots});
      setDirty(false);
    }
  }, [layout]);

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const selectedSlots = useMemo(
    () => draft.filter((s) => selectedSet.has(s.id)),
    [draft, selectedSet],
  );
  const pickerSlot = useMemo(
    () => draft.find((s) => s.id === pickerSlotId) ?? null,
    [draft, pickerSlotId],
  );

  const assignedLabels = useMemo(() => {
    const m: Record<number, string> = {};
    for (const s of draft) {
      if (s.kind === 'table' && s.breweryId != null) m[s.breweryId] = s.label;
    }
    return m;
  }, [draft]);

  const unassignedCount = useMemo(
    () => draft.filter((s) => s.kind === 'table' && s.breweryId == null).length,
    [draft],
  );

  const nextTableLabel = useCallback(() => {
    const nums = draft
      .filter((s) => s.kind === 'table')
      .map((s) => Number(s.label))
      .filter((n) => Number.isFinite(n));
    return nums.length ? Math.max(...nums) + 1 : 1;
  }, [draft]);

  // --- Selection ---

  const clearSelection = useCallback(() => setSelectedIds([]), []);

  const toggleSelect = useCallback((id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }, []);

  // --- Geometry editing (layout mode) ---

  const editField = useCallback(
    (field: 'x' | 'y' | 'width' | 'height', value: number) => {
      const updates = selectedSlots
        .filter((s) => !s.locked)
        .map((s) => ({id: s.id, patch: {[field]: value}}));
      if (updates.length === 0) return;
      dispatch({type: 'UPDATE_MANY', updates});
      setDirty(true);
    },
    [selectedSlots],
  );

  // Zone title / table label / label text. Capped to the column's 24 chars. A
  // label's box tracks its text so its draggable hit area stays tight.
  const editLabel = useCallback(
    (value: string) => {
      const label = value.slice(0, 24);
      const updates = selectedSlots
        .filter((s) => !s.locked)
        .map((s) =>
          s.kind === 'label'
            ? {
                id: s.id,
                patch: {
                  label,
                  ...labelBox(label || 'Label', s.fontSize ?? DEFAULT_LABEL_FONT_SIZE, s.vertical),
                },
              }
            : {id: s.id, patch: {label}},
        );
      if (updates.length === 0) return;
      dispatch({type: 'UPDATE_MANY', updates});
      setDirty(true);
    },
    [selectedSlots],
  );

  // Label text size. Recomputes the box so the hit area follows the glyphs.
  const editFontSize = useCallback(
    (value: number) => {
      const fontSize = Math.max(8, Math.round(value));
      const updates = selectedSlots
        .filter((s) => !s.locked && s.kind === 'label')
        .map((s) => ({
          id: s.id,
          patch: {fontSize, ...labelBox(s.label || 'Label', fontSize, s.vertical)},
        }));
      if (updates.length === 0) return;
      dispatch({type: 'UPDATE_MANY', updates});
      setDirty(true);
    },
    [selectedSlots],
  );

  // Label orientation: vertical stacks characters top-to-bottom. Resize the box
  // for the new shape and keep the label centered in place so it doesn't jump.
  const setLabelOrientation = useCallback(
    (vertical: boolean) => {
      const updates = selectedSlots
        .filter((s) => !s.locked && s.kind === 'label')
        .map((s) => {
          const box = labelBox(s.label || 'Label', s.fontSize ?? DEFAULT_LABEL_FONT_SIZE, vertical);
          const cx = s.x + s.width / 2;
          const cy = s.y + s.height / 2;
          return {
            id: s.id,
            patch: {
              vertical,
              width: box.width,
              height: box.height,
              x: Math.round(cx - box.width / 2),
              y: Math.round(cy - box.height / 2),
            },
          };
        });
      if (updates.length === 0) return;
      dispatch({type: 'UPDATE_MANY', updates});
      setDirty(true);
    },
    [selectedSlots],
  );

  const moveSlots = useCallback((updates: {id: number; x: number; y: number}[]) => {
    dispatch({
      type: 'UPDATE_MANY',
      updates: updates.map((u) => ({id: u.id, patch: {x: u.x, y: u.y}})),
    });
    setDirty(true);
  }, []);

  const resizeSlot = useCallback(
    (id: number, rect: {x: number; y: number; width: number; height: number}) => {
      dispatch({type: 'UPDATE', id, patch: rect});
      setDirty(true);
    },
    [],
  );

  const toggleLock = useCallback(() => {
    if (selectedSlots.length === 0) return;
    const lock = !selectedSlots.every((s) => s.locked);
    dispatch({
      type: 'UPDATE_MANY',
      updates: selectedSlots.map((s) => ({id: s.id, patch: {locked: lock}})),
    });
    setDirty(true);
  }, [selectedSlots]);

  const alignSelected = useCallback(
    (kind: AlignKind) => {
      const movable = selectedSlots.filter((s) => !s.locked);
      const patches = alignSlots(movable, kind);
      if (patches.length === 0) return;
      dispatch({
        type: 'UPDATE_MANY',
        updates: patches.map((p) => ({id: p.id, patch: p})),
      });
      setDirty(true);
    },
    [selectedSlots],
  );

  const addSlot = useCallback(
    (kind: 'table' | 'zone' | 'label') => {
      const label =
        kind === 'zone' ? 'Zone' : kind === 'label' ? 'Label' : String(nextTableLabel());
      const slot = makeSlot(nextTempId(), kind, label, world, draft.length);
      dispatch({type: 'ADD', slot});
      setSelectedIds([slot.id]);
      setDirty(true);
    },
    [nextTableLabel, world, draft.length],
  );

  const duplicateSelected = useCallback(() => {
    if (selectedSlots.length === 0) return;
    const copies: DraftSlot[] = [];
    let labelSeed = nextTableLabel();
    for (const s of selectedSlots) {
      copies.push({
        ...s,
        id: nextTempId(),
        x: s.x + s.width + 10,
        label: s.kind === 'table' ? String(labelSeed++) : s.label,
        locked: false,
        breweryId: null,
        breweryName: null,
      });
    }
    for (const c of copies) dispatch({type: 'ADD', slot: c});
    setSelectedIds(copies.map((c) => c.id));
    setDirty(true);
  }, [selectedSlots, nextTableLabel]);

  const deleteSelected = useCallback(() => {
    if (selectedIds.length === 0) return;
    dispatch({type: 'DELETE', ids: selectedIds});
    setSelectedIds([]);
    setDirty(true);
  }, [selectedIds]);

  // --- Persistence ---

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (layoutId == null) return [] as {tempId: number; id: number}[];
      const original = layout?.slots ?? [];
      const draftRealIds = new Set(draft.filter((s) => !isTempId(s.id)).map((s) => s.id));
      const toDelete = original.filter((o) => !draftRealIds.has(o.id));

      await inChunks(toDelete, (o) => maps.deleteSlot({data: {slotId: o.id}}));

      const results = await inChunks(draft, async (s) => {
        const slot = {
          label: s.label,
          kind: s.kind,
          x: s.x,
          y: s.y,
          width: s.width,
          height: s.height,
          rotation: s.rotation,
          fontSize: s.fontSize,
          vertical: s.vertical,
          locked: s.locked,
          breweryId: s.breweryId,
        };
        if (isTempId(s.id)) {
          const created = await maps.createSlot({data: {layoutId, slot}});
          return {tempId: s.id, id: created.id};
        }
        await maps.updateSlot({data: {layoutId, slotId: s.id, slot}});
        return null;
      });
      return results.filter((r): r is {tempId: number; id: number} => r != null);
    },
    onSuccess: (reconciled) => {
      // Swap temp ids for the persisted ids so a follow-up edit (before the
      // refetch lands) doesn't re-create already-saved slots.
      for (const r of reconciled) dispatch({type: 'UPDATE', id: r.tempId, patch: {id: r.id}});
      qc.invalidateQueries({queryKey: layoutKey});
      setDirty(false);
    },
  });

  const assignMutation = useMutation({
    mutationFn: (vars: {slotId: number; breweryId: number | null}) =>
      maps.assignBrewery({data: vars}),
    onError: (error) => {
      // Roll the optimistic update back by refetching, and surface the failure.
      console.error('Failed to assign brewery', error);
      qc.invalidateQueries({queryKey: layoutKey});
    },
  });

  const assign = useCallback(
    (slotId: number, breweryId: number | null) => {
      const name =
        breweryId == null ? null : roster.find((b) => b.id === breweryId)?.name ?? null;
      dispatch({type: 'ASSIGN', id: slotId, breweryId, breweryName: name});
      assignMutation.mutate({slotId, breweryId});
      setPickerSlotId(null);
    },
    [roster, assignMutation],
  );

  const onAssignTap = useCallback(
    (id: number) => {
      const s = draft.find((x) => x.id === id);
      if (s?.kind === 'table' && !isTempId(s.id)) setPickerSlotId(id);
    },
    [draft],
  );

  return {
    draft,
    dirty,
    selectedIds,
    setSelectedIds,
    clearSelection,
    toggleSelect,
    selectedSlots,
    assignedLabels,
    unassignedCount,
    editField,
    editLabel,
    editFontSize,
    setLabelOrientation,
    moveSlots,
    resizeSlot,
    toggleLock,
    alignSelected,
    addSlot,
    duplicateSelected,
    deleteSelected,
    save: saveMutation.mutate,
    saveAsync: saveMutation.mutateAsync,
    saving: saveMutation.isPending,
    saveError: saveMutation.error,
    // assignment
    pickerSlot,
    closePicker: () => setPickerSlotId(null),
    onAssignTap,
    assign,
  };
}
