import {useCallback, useEffect, useMemo, useReducer, useRef, useState} from 'react';
import {createFileRoute} from '@tanstack/react-router';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';

import {listEvents} from '../../lib/admin/events';
import * as maps from '../../lib/admin/maps';
import {
  draftReducer,
  isTempId,
  makeSlot,
  type DraftSlot,
} from '../../lib/admin/mapDraft';
import {alignSlots, type AlignKind} from '../../lib/admin/mapAlign';
import {AdminMapCanvas} from '../../components/admin/map/AdminMapCanvas';
import {SlotInspector} from '../../components/admin/map/SlotInspector';
import {BreweryPickerSheet} from '../../components/admin/map/BreweryPickerSheet';
import {LayoutSwitcher} from '../../components/admin/map/LayoutSwitcher';
import {ConfirmDelete} from '../../components/admin/ConfirmDelete';
import {EVENT_ID} from '../../lib/constants';

export const Route = createFileRoute('/admin/map')({
  head: () => ({meta: [{title: 'PghBeer — Map'}]}),
  component: AdminMap,
});

function AdminMap() {
  const qc = useQueryClient();
  const eventsQ = useQuery({queryKey: ['admin', 'events'], queryFn: () => listEvents()});

  const [eventId, setEventId] = useState<number | null>(null);
  const [selectedLayoutId, setSelectedLayoutId] = useState<number | null>(null);
  const [mode, setMode] = useState<'layout' | 'assign'>('layout');
  const [tool, setTool] = useState<'move' | 'select'>('move');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [pickerSlotId, setPickerSlotId] = useState<number | null>(null);
  const [switchTarget, setSwitchTarget] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  const [deleteDeps, setDeleteDeps] = useState<Record<string, number> | undefined>();

  const [draft, dispatch] = useReducer(draftReducer, [] as DraftSlot[]);
  const [dirty, setDirty] = useState(false);
  const tempIdRef = useRef(-1);
  const nextTempId = () => tempIdRef.current--;

  // Default the selected event once the list loads.
  useEffect(() => {
    if (eventId == null && eventsQ.data?.length) {
      const preferred = eventsQ.data.find((e) => String(e.id) === EVENT_ID);
      setEventId(preferred?.id ?? eventsQ.data[0].id);
    }
  }, [eventsQ.data, eventId]);

  const enabledQ = useQuery({
    queryKey: ['admin', 'map', 'enabled', eventId],
    queryFn: () => maps.fetchEventEnabled({data: {eventId: eventId!}}),
    enabled: eventId != null,
  });
  const layoutsQ = useQuery({
    queryKey: ['admin', 'map', 'layouts', eventId],
    queryFn: () => maps.listLayouts({data: {eventId: eventId!}}),
    enabled: eventId != null,
  });
  const rosterQ = useQuery({
    queryKey: ['admin', 'map', 'roster', eventId],
    queryFn: () => maps.listEventBreweries({data: {eventId: eventId!}}),
    enabled: eventId != null,
  });
  const layoutQ = useQuery({
    queryKey: ['admin', 'map', 'layout', selectedLayoutId],
    queryFn: () => maps.getLayout({data: {layoutId: selectedLayoutId!}}),
    enabled: selectedLayoutId != null,
  });

  // Auto-select the active (or first) layout when the list loads.
  useEffect(() => {
    if (selectedLayoutId == null && layoutsQ.data?.length) {
      const active = layoutsQ.data.find((l) => l.isActive);
      setSelectedLayoutId(active?.id ?? layoutsQ.data[0].id);
    }
  }, [layoutsQ.data, selectedLayoutId]);

  // Load the editing draft whenever the persisted layout (re)loads.
  useEffect(() => {
    if (layoutQ.data) {
      dispatch({type: 'LOAD', slots: layoutQ.data.slots});
      setDirty(false);
    }
  }, [layoutQ.data]);

  const world = {
    width: layoutQ.data?.width ?? 1000,
    height: layoutQ.data?.height ?? 1000,
  };

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const selectedSlots = draft.filter((s) => selectedSet.has(s.id));
  const pickerSlot = draft.find((s) => s.id === pickerSlotId) ?? null;

  const assignedLabels = useMemo(() => {
    const m: Record<number, string> = {};
    for (const s of draft) {
      if (s.kind === 'table' && s.breweryId != null) m[s.breweryId] = s.label;
    }
    return m;
  }, [draft]);

  const unassignedCount = draft.filter(
    (s) => s.kind === 'table' && s.breweryId == null,
  ).length;

  const nextTableLabel = useCallback(() => {
    const nums = draft
      .filter((s) => s.kind === 'table')
      .map((s) => Number(s.label))
      .filter((n) => Number.isFinite(n));
    return nums.length ? Math.max(...nums) + 1 : 1;
  }, [draft]);

  // --- Selection ---

  const toggleSelect = useCallback((id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }, []);

  // --- Geometry editing (layout mode) ---

  // Apply a single geometry field to every selected, unlocked slot.
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
    (kind: 'table' | 'zone') => {
      const label = kind === 'zone' ? 'Zone' : String(nextTableLabel());
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
      const layoutId = selectedLayoutId!;
      const original = layoutQ.data?.slots ?? [];
      const draftRealIds = new Set(
        draft.filter((s) => !isTempId(s.id)).map((s) => s.id),
      );
      for (const o of original) {
        if (!draftRealIds.has(o.id)) await maps.deleteSlot({data: {slotId: o.id}});
      }
      for (const s of draft) {
        const slot = {
          label: s.label,
          kind: s.kind,
          x: s.x,
          y: s.y,
          width: s.width,
          height: s.height,
          rotation: s.rotation,
          locked: s.locked,
          breweryId: s.breweryId,
        };
        if (isTempId(s.id)) await maps.createSlot({data: {layoutId, slot}});
        else await maps.updateSlot({data: {layoutId, slotId: s.id, slot}});
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({queryKey: ['admin', 'map', 'layout', selectedLayoutId]});
      setDirty(false);
    },
  });

  const assignMutation = useMutation({
    mutationFn: (vars: {slotId: number; breweryId: number | null}) =>
      maps.assignBrewery({data: vars}),
    onError: () =>
      qc.invalidateQueries({queryKey: ['admin', 'map', 'layout', selectedLayoutId]}),
  });

  const assign = useCallback(
    (slotId: number, breweryId: number | null) => {
      const name =
        breweryId == null
          ? null
          : rosterQ.data?.find((b) => b.id === breweryId)?.name ?? null;
      dispatch({type: 'ASSIGN', id: slotId, breweryId, breweryName: name});
      assignMutation.mutate({slotId, breweryId});
      setPickerSlotId(null);
    },
    [rosterQ.data, assignMutation],
  );

  // --- Layout actions ---

  const createMutation = useMutation({
    mutationFn: (name: string) =>
      maps.createLayout({data: {eventId: eventId!, name}}),
    onSuccess: (layout) => {
      qc.invalidateQueries({queryKey: ['admin', 'map', 'layouts', eventId]});
      setSelectedLayoutId(layout.id);
    },
  });

  const duplicateMutation = useMutation({
    mutationFn: (vars: {layoutId: number; name: string}) =>
      maps.duplicateLayout({data: vars}),
    onSuccess: (layout) => {
      qc.invalidateQueries({queryKey: ['admin', 'map', 'layouts', eventId]});
      setSelectedLayoutId(layout.id);
    },
  });

  const setActiveMutation = useMutation({
    mutationFn: (layoutId: number) =>
      maps.setActiveLayout({data: {eventId: eventId!, layoutId}}),
    onSuccess: () => {
      qc.invalidateQueries({queryKey: ['admin', 'map', 'layouts', eventId]});
      if (switchTarget != null) {
        qc.invalidateQueries({queryKey: ['admin', 'map', 'layout', switchTarget]});
      }
      setSwitchTarget(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (layoutId: number) => maps.deleteLayout({data: {layoutId}}),
    onSuccess: (res) => {
      if (res.ok) {
        qc.invalidateQueries({queryKey: ['admin', 'map', 'layouts', eventId]});
        if (deleteTarget === selectedLayoutId) setSelectedLayoutId(null);
        setDeleteTarget(null);
        setDeleteDeps(undefined);
      } else {
        setDeleteDeps(res.dependents);
      }
    },
  });

  const enabledMutation = useMutation({
    mutationFn: (enabled: boolean) =>
      maps.setMapEnabled({data: {eventId: eventId!, enabled}}),
    onSuccess: () =>
      qc.invalidateQueries({queryKey: ['admin', 'map', 'enabled', eventId]}),
  });

  const previewQ = useQuery({
    queryKey: ['admin', 'map', 'preview', eventId, switchTarget],
    queryFn: () =>
      maps.previewLayoutSwitch({data: {eventId: eventId!, layoutId: switchTarget!}}),
    enabled: eventId != null && switchTarget != null,
  });

  // --- Handlers ---

  const changeEvent = (id: number) => {
    setEventId(id);
    setSelectedLayoutId(null);
    setSelectedIds([]);
    setMode('layout');
  };

  const selectLayout = (id: number) => {
    setSelectedLayoutId(id);
    setSelectedIds([]);
    setMode('layout');
  };

  const onCreateLayout = () => {
    const name = window.prompt('Layout name', 'Good Weather');
    if (name) createMutation.mutate(name);
  };

  const onDuplicateLayout = (layoutId: number) => {
    const name = window.prompt('Name for the copy', 'Bad Weather');
    if (name) duplicateMutation.mutate({layoutId, name});
  };

  const onAssignTap = (id: number) => {
    const s = draft.find((x) => x.id === id);
    if (s?.kind === 'table' && !isTempId(s.id)) setPickerSlotId(id);
  };

  const switchToAssign = async () => {
    if (dirty) await saveMutation.mutateAsync();
    setSelectedIds([]);
    setMode('assign');
  };

  const eventEnabled = enabledQ.data?.enabled ?? false;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold text-gold">Festival Map</h1>
        <div className="flex items-center gap-3">
          <select
            value={eventId ?? ''}
            onChange={(e) => changeEvent(Number(e.target.value))}
            className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text"
          >
            {(eventsQ.data ?? []).map((e) => (
              <option key={e.id} value={e.id}>
                {e.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => enabledMutation.mutate(!eventEnabled)}
            disabled={eventId == null || enabledMutation.isPending}
            className={`rounded-lg px-3 py-2 text-sm font-semibold ${
              eventEnabled
                ? 'bg-gold text-check-fg'
                : 'border border-border bg-surface text-text-secondary'
            }`}
          >
            {eventEnabled ? 'Map: Public' : 'Map: Hidden'}
          </button>
        </div>
      </div>

      {layoutsQ.isLoading ? (
        <p className="text-sm text-text-secondary">Loading layouts…</p>
      ) : (
        <LayoutSwitcher
          layouts={layoutsQ.data ?? []}
          selectedLayoutId={selectedLayoutId}
          onSelect={selectLayout}
          onCreate={onCreateLayout}
          onDuplicate={onDuplicateLayout}
          onSetActive={(id) => setSwitchTarget(id)}
          onDelete={(id) => {
            setDeleteDeps(undefined);
            deleteMutation.reset();
            setDeleteTarget(id);
          }}
        />
      )}

      {selectedLayoutId != null && layoutQ.data && (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex overflow-hidden rounded-lg border border-border">
              <ModeTab active={mode === 'layout'} onClick={() => setMode('layout')}>
                Layout
              </ModeTab>
              <ModeTab active={mode === 'assign'} onClick={switchToAssign}>
                Assign
              </ModeTab>
            </div>

            {mode === 'layout' ? (
              <>
                <ToolbarButton onClick={() => addSlot('table')}>+ Table</ToolbarButton>
                <ToolbarButton onClick={() => addSlot('zone')}>+ Zone</ToolbarButton>
                <div className="flex overflow-hidden rounded-lg border border-border">
                  <ModeTab active={tool === 'move'} onClick={() => setTool('move')}>
                    Move
                  </ModeTab>
                  <ModeTab active={tool === 'select'} onClick={() => setTool('select')}>
                    Box select
                  </ModeTab>
                </div>
                <button
                  type="button"
                  onClick={() => saveMutation.mutate()}
                  disabled={!dirty || saveMutation.isPending}
                  className="ml-auto rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-check-fg disabled:opacity-50"
                >
                  {saveMutation.isPending
                    ? 'Saving…'
                    : dirty
                      ? 'Save changes'
                      : 'Saved'}
                </button>
              </>
            ) : (
              <span className="ml-auto rounded-lg border border-border px-3 py-2 text-sm font-medium text-text-secondary">
                {unassignedCount} unassigned
              </span>
            )}
          </div>

          <div className="h-[60vh] min-h-[320px]">
            <AdminMapCanvas
              width={world.width}
              height={world.height}
              slots={draft}
              mode={mode}
              tool={tool}
              selectedIds={selectedIds}
              onSelect={setSelectedIds}
              onToggleSelect={toggleSelect}
              onSlotsMove={moveSlots}
              onSlotResize={resizeSlot}
              onAssignTap={onAssignTap}
              onBackgroundTap={() => setSelectedIds([])}
            />
          </div>

          {mode === 'layout' && selectedSlots.length > 0 && (
            <SlotInspector
              slots={selectedSlots}
              onField={editField}
              onToggleLock={toggleLock}
              onDuplicate={duplicateSelected}
              onDelete={deleteSelected}
              onAlign={alignSelected}
            />
          )}
        </>
      )}

      {pickerSlot && (
        <BreweryPickerSheet
          slotLabel={pickerSlot.label}
          breweries={rosterQ.data ?? []}
          assignedLabels={assignedLabels}
          currentBreweryId={pickerSlot.breweryId}
          onPick={(breweryId) => assign(pickerSlot.id, breweryId)}
          onClear={() => assign(pickerSlot.id, null)}
          onClose={() => setPickerSlotId(null)}
        />
      )}

      {switchTarget != null && (
        <SwitchConfirm
          loading={previewQ.isLoading}
          preview={previewQ.data}
          confirming={setActiveMutation.isPending}
          onConfirm={() => setActiveMutation.mutate(switchTarget)}
          onCancel={() => setSwitchTarget(null)}
        />
      )}

      <ConfirmDelete
        open={deleteTarget !== null}
        title="Delete this layout?"
        message="This removes the layout and its slots. This cannot be undone."
        dependents={deleteDeps}
        confirming={deleteMutation.isPending}
        onConfirm={() => deleteTarget != null && deleteMutation.mutate(deleteTarget)}
        onCancel={() => {
          setDeleteTarget(null);
          setDeleteDeps(undefined);
        }}
      />
    </div>
  );
}

function ModeTab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2 text-sm font-medium ${
        active ? 'bg-gold text-check-fg' : 'bg-surface text-text-secondary'
      }`}
    >
      {children}
    </button>
  );
}

function ToolbarButton({
  onClick,
  children,
}: {
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-text"
    >
      {children}
    </button>
  );
}

function SwitchConfirm({
  loading,
  preview,
  confirming,
  onConfirm,
  onCancel,
}: {
  loading: boolean;
  preview: maps.LayoutSwitchPreview | undefined;
  confirming: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-overlay p-4"
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-sm rounded-xl border border-border bg-surface p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-display text-lg font-bold text-text">
          Make this the live map?
        </h2>
        {loading || !preview ? (
          <p className="mt-2 text-sm text-text-secondary">Checking assignments…</p>
        ) : (
          <div className="mt-2 text-sm text-text-secondary">
            <p>✓ {preview.carried} assignments carry over.</p>
            {preview.droppedBreweries.length > 0 && (
              <p className="mt-1 text-red">
                ⚠ {preview.droppedBreweries.length} brewery
                {preview.droppedBreweries.length === 1 ? '' : 's'} have no matching slot
                and will be unassigned:{' '}
                {preview.droppedBreweries.map((b) => b.name).join(', ')}.
              </p>
            )}
            <p className="mt-2">The public map switches immediately.</p>
          </div>
        )}
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-border bg-surface px-4 py-2 text-sm text-text-secondary hover:text-text"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={confirming || loading}
            className="rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-check-fg disabled:opacity-60"
          >
            {confirming ? 'Switching…' : 'Switch'}
          </button>
        </div>
      </div>
    </div>
  );
}
