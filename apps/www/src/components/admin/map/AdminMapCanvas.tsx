import {memo, useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {MapSlot} from '../../map/MapSlot';
import {usePanZoom} from '../../../hooks/usePanZoom';
import type {DraftSlot} from '../../../lib/admin/mapDraft';

interface SlotRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface AdminMapCanvasProps {
  width: number;
  height: number;
  slots: DraftSlot[];
  mode: 'layout' | 'assign';
  tool: 'move' | 'select';
  selectedIds: number[];
  onSelect: (ids: number[]) => void;
  onToggleSelect: (id: number) => void;
  onSlotsMove: (updates: {id: number; x: number; y: number}[]) => void;
  onSlotResize: (id: number, rect: SlotRect) => void;
  onAssignTap: (id: number) => void;
  onBackgroundTap: () => void;
}

const DRAG_THRESHOLD = 6;
const HANDLE_PX = 14;
const MIN_SIZE = 20;

type Corner = 'nw' | 'ne' | 'sw' | 'se';
const CORNERS: Corner[] = ['nw', 'ne', 'sw', 'se'];
const CORNER_CURSOR: Record<Corner, string> = {
  nw: 'nwse-resize',
  se: 'nwse-resize',
  ne: 'nesw-resize',
  sw: 'nesw-resize',
};

function resizeRect(corner: Corner, o: SlotRect, dx: number, dy: number): SlotRect {
  let {x, y, width, height} = o;
  if (corner.includes('e')) width = o.width + dx;
  if (corner.includes('s')) height = o.height + dy;
  if (corner.includes('w')) {
    width = o.width - dx;
    x = o.x + dx;
  }
  if (corner.includes('n')) {
    height = o.height - dy;
    y = o.y + dy;
  }
  if (width < MIN_SIZE) {
    if (corner.includes('w')) x = o.x + (o.width - MIN_SIZE);
    width = MIN_SIZE;
  }
  if (height < MIN_SIZE) {
    if (corner.includes('n')) y = o.y + (o.height - MIN_SIZE);
    height = MIN_SIZE;
  }
  return {
    x: Math.round(x),
    y: Math.round(y),
    width: Math.round(width),
    height: Math.round(height),
  };
}

function cornerPoint(corner: Corner, s: SlotRect): {cx: number; cy: number} {
  return {
    cx: corner.includes('e') ? s.x + s.width : s.x,
    cy: corner.includes('s') ? s.y + s.height : s.y,
  };
}

function overlaps(s: DraftSlot, box: {minX: number; minY: number; maxX: number; maxY: number}) {
  return !(
    s.x > box.maxX ||
    s.x + s.width < box.minX ||
    s.y > box.maxY ||
    s.y + s.height < box.minY
  );
}

function AdminMapCanvasImpl({
  width,
  height,
  slots,
  mode,
  tool,
  selectedIds,
  onSelect,
  onToggleSelect,
  onSlotsMove,
  onSlotResize,
  onAssignTap,
  onBackgroundTap,
}: AdminMapCanvasProps) {
  const {containerRef, groupRef, size, view, fit, zoomBy, bind} = usePanZoom({
    width,
    height,
  });
  const didInit = useRef(false);

  const zoomIn = useCallback(() => zoomBy(1.25), [zoomBy]);
  const zoomOut = useCallback(() => zoomBy(0.8), [zoomBy]);

  const drag = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    origins: {id: number; x: number; y: number}[];
    moved: boolean;
  } | null>(null);

  const resize = useRef<{
    id: number;
    corner: Corner;
    pointerId: number;
    startX: number;
    startY: number;
    orig: SlotRect;
  } | null>(null);

  const marqueeRef = useRef<{pointerId: number; x0: number; y0: number} | null>(null);
  const [marquee, setMarquee] = useState<SlotRect | null>(null);

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  const ordered = useMemo(() => {
    const zones = slots.filter((s) => s.kind === 'zone');
    const tables = slots.filter((s) => s.kind !== 'zone');
    return [...zones, ...tables];
  }, [slots]);

  const selectedSlots = useMemo(
    () => slots.filter((s) => selectedSet.has(s.id)),
    [slots, selectedSet],
  );

  // Resize handles show only for a single, unlocked selection.
  const handleSlot =
    mode === 'layout' && selectedSlots.length === 1 && !selectedSlots[0].locked
      ? selectedSlots[0]
      : null;

  useEffect(() => {
    if (!size.w || !size.h || didInit.current) return;
    fit();
    didInit.current = true;
  }, [size, fit]);

  const toWorld = (clientX: number, clientY: number) => {
    const rect = containerRef.current?.getBoundingClientRect();
    const sx = clientX - (rect?.left ?? 0);
    const sy = clientY - (rect?.top ?? 0);
    return {x: (sx - view.tx) / view.scale, y: (sy - view.ty) / view.scale};
  };

  // --- Slot move / select ---

  const onSlotPointerDown = (e: React.PointerEvent, slot: DraftSlot) => {
    if (mode !== 'layout') return;
    const additive = e.shiftKey || e.metaKey || e.ctrlKey || tool === 'select';
    if (additive) {
      e.stopPropagation();
      onToggleSelect(slot.id);
      return;
    }
    e.stopPropagation();
    (e.currentTarget as Element).setPointerCapture(e.pointerId);

    let groupIds: number[];
    if (selectedSet.has(slot.id) && selectedIds.length > 1) {
      groupIds = selectedIds; // drag the whole existing group
    } else {
      onSelect([slot.id]);
      groupIds = [slot.id];
    }
    const origins = slots
      .filter((s) => groupIds.includes(s.id) && !s.locked)
      .map((s) => ({id: s.id, x: s.x, y: s.y}));
    drag.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      origins,
      moved: false,
    };
  };

  const onSlotPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d || d.pointerId !== e.pointerId || d.origins.length === 0) return;
    const dxScreen = e.clientX - d.startX;
    const dyScreen = e.clientY - d.startY;
    if (!d.moved && Math.hypot(dxScreen, dyScreen) < DRAG_THRESHOLD) return;
    d.moved = true;
    e.stopPropagation();
    const dx = dxScreen / view.scale;
    const dy = dyScreen / view.scale;
    onSlotsMove(
      d.origins.map((o) => ({id: o.id, x: Math.round(o.x + dx), y: Math.round(o.y + dy)})),
    );
  };

  const onSlotPointerUp = (e: React.PointerEvent) => {
    if (drag.current?.pointerId === e.pointerId) drag.current = null;
  };

  // --- Resize ---

  const onHandlePointerDown = (e: React.PointerEvent, slot: DraftSlot, corner: Corner) => {
    e.stopPropagation();
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
    resize.current = {
      id: slot.id,
      corner,
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      orig: {x: slot.x, y: slot.y, width: slot.width, height: slot.height},
    };
  };

  const onHandlePointerMove = (e: React.PointerEvent) => {
    const r = resize.current;
    if (!r || r.pointerId !== e.pointerId) return;
    e.stopPropagation();
    const dx = (e.clientX - r.startX) / view.scale;
    const dy = (e.clientY - r.startY) / view.scale;
    onSlotResize(r.id, resizeRect(r.corner, r.orig, dx, dy));
  };

  const onHandlePointerUp = (e: React.PointerEvent) => {
    if (resize.current?.pointerId === e.pointerId) resize.current = null;
  };

  // --- Marquee (select tool, background drag) ---

  const onBgPointerDown = (e: React.PointerEvent) => {
    if (mode !== 'layout' || tool !== 'select') return;
    e.stopPropagation(); // suppress pan
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
    const p = toWorld(e.clientX, e.clientY);
    marqueeRef.current = {pointerId: e.pointerId, x0: p.x, y0: p.y};
    setMarquee({x: p.x, y: p.y, width: 0, height: 0});
  };

  const onBgPointerMove = (e: React.PointerEvent) => {
    const m = marqueeRef.current;
    if (!m || m.pointerId !== e.pointerId) return;
    e.stopPropagation();
    const p = toWorld(e.clientX, e.clientY);
    setMarquee({
      x: Math.min(m.x0, p.x),
      y: Math.min(m.y0, p.y),
      width: Math.abs(p.x - m.x0),
      height: Math.abs(p.y - m.y0),
    });
  };

  const onBgPointerUp = (e: React.PointerEvent) => {
    const m = marqueeRef.current;
    if (!m || m.pointerId !== e.pointerId) return;
    e.stopPropagation();
    const p = toWorld(e.clientX, e.clientY);
    const box = {
      minX: Math.min(m.x0, p.x),
      minY: Math.min(m.y0, p.y),
      maxX: Math.max(m.x0, p.x),
      maxY: Math.max(m.y0, p.y),
    };
    const tiny = box.maxX - box.minX < 3 && box.maxY - box.minY < 3;
    onSelect(tiny ? [] : slots.filter((s) => overlaps(s, box)).map((s) => s.id));
    marqueeRef.current = null;
    setMarquee(null);
  };

  const deselectOnClick = mode === 'layout' && tool === 'move' ? onBackgroundTap : undefined;

  return (
    <div className="relative h-full w-full overflow-hidden rounded-xl border border-border bg-bg">
      <div
        ref={containerRef}
        className="h-full w-full touch-none"
        style={{cursor: tool === 'select' ? 'crosshair' : 'grab'}}
        {...bind}
      >
        <svg
          width="100%"
          height="100%"
          onClick={deselectOnClick}
          onPointerDown={onBgPointerDown}
          onPointerMove={onBgPointerMove}
          onPointerUp={onBgPointerUp}
          onPointerCancel={onBgPointerUp}
        >
          {/* transform is owned by usePanZoom (imperative); no prop here. */}
          <g ref={groupRef}>
            {ordered.map((slot) => {
              const selectable = mode === 'layout' || slot.kind === 'table';
              const draggable = mode === 'layout' && !slot.locked;
              const lockGlyph = Math.max(8, Math.min(slot.width, slot.height) * 0.28);
              return (
                <g
                  key={slot.id}
                  onClick={(e) => {
                    if (mode === 'assign') {
                      if (!selectable) return;
                      e.stopPropagation();
                      onAssignTap(slot.id);
                      return;
                    }
                    // Layout selection happens on pointerdown; just stop the
                    // background deselect from firing.
                    e.stopPropagation();
                  }}
                  onPointerDown={(e) => onSlotPointerDown(e, slot)}
                  onPointerMove={onSlotPointerMove}
                  onPointerUp={onSlotPointerUp}
                  onPointerCancel={onSlotPointerUp}
                  style={{
                    cursor: slot.locked
                      ? 'pointer'
                      : draggable
                        ? 'move'
                        : selectable
                          ? 'pointer'
                          : 'default',
                  }}
                >
                  <MapSlot slot={slot} />
                  {slot.kind === 'table' && (
                    <text
                      x={slot.x + 3}
                      y={slot.y + 3}
                      textAnchor="start"
                      dominantBaseline="hanging"
                      fontSize={Math.max(7, Math.min(slot.width, slot.height) * 0.22)}
                      fontWeight={700}
                      fill="var(--color-text-secondary)"
                      pointerEvents="none"
                    >
                      {slot.label}
                    </text>
                  )}
                  {slot.locked && (
                    <text
                      x={slot.x + slot.width - lockGlyph * 0.6}
                      y={slot.y + lockGlyph}
                      textAnchor="middle"
                      fontSize={lockGlyph}
                    >
                      🔒
                    </text>
                  )}
                  {selectable && (
                    <rect
                      x={slot.x}
                      y={slot.y}
                      width={slot.width}
                      height={slot.height}
                      fill="transparent"
                    />
                  )}
                </g>
              );
            })}

            {/* Selection overlay: ring per selected slot + resize handles for a
                single unlocked selection. Drawn on top WITHOUT reordering slot
                DOM (which would break the selecting click). */}
            {mode === 'layout' &&
              selectedSlots.map((s) => (
                <rect
                  key={`ring-${s.id}`}
                  x={s.x - 5}
                  y={s.y - 5}
                  width={s.width + 10}
                  height={s.height + 10}
                  rx={8}
                  fill="none"
                  stroke="var(--color-gold)"
                  strokeWidth={2.5}
                  strokeDasharray={s.locked ? '6 4' : undefined}
                  pointerEvents="none"
                />
              ))}

            {handleSlot &&
              CORNERS.map((corner) => {
                const h = HANDLE_PX / view.scale;
                const {cx, cy} = cornerPoint(corner, handleSlot);
                return (
                  <rect
                    key={`handle-${corner}`}
                    x={cx - h / 2}
                    y={cy - h / 2}
                    width={h}
                    height={h}
                    rx={h * 0.25}
                    fill="var(--color-gold)"
                    stroke="var(--color-surface)"
                    strokeWidth={h * 0.12}
                    style={{cursor: CORNER_CURSOR[corner]}}
                    onClick={(e) => e.stopPropagation()}
                    onPointerDown={(e) => onHandlePointerDown(e, handleSlot, corner)}
                    onPointerMove={onHandlePointerMove}
                    onPointerUp={onHandlePointerUp}
                    onPointerCancel={onHandlePointerUp}
                  />
                );
              })}

            {marquee && (
              <rect
                x={marquee.x}
                y={marquee.y}
                width={marquee.width}
                height={marquee.height}
                fill="var(--color-gold)"
                fillOpacity={0.12}
                stroke="var(--color-gold)"
                strokeWidth={1.5 / view.scale}
                strokeDasharray={`${6 / view.scale} ${4 / view.scale}`}
                pointerEvents="none"
              />
            )}
          </g>
        </svg>
      </div>

      <div className="absolute bottom-3 right-3 flex flex-col gap-2">
        <CanvasButton label="+" onClick={zoomIn} />
        <CanvasButton label="−" onClick={zoomOut} />
        <CanvasButton label="⤢" title="Fit" onClick={fit} />
      </div>
    </div>
  );
}

// Re-render only when props change — the parent dispatches draft updates on
// every drag pointermove, so an unmemoized canvas would reconcile the full slot
// tree each frame.
export const AdminMapCanvas = memo(AdminMapCanvasImpl);

const CanvasButton = memo(function CanvasButton({
  label,
  title,
  onClick,
}: {
  label: string;
  title?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className="flex h-10 w-10 items-center justify-center rounded-xl border-[1.5px] border-border bg-surface text-base font-semibold text-text shadow-[0_2px_8px_var(--color-shadow)]"
    >
      {label}
    </button>
  );
});
