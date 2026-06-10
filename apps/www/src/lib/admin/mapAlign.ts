import type {DraftSlot} from './mapDraft';

export type AlignKind =
  | 'left'
  | 'hcenter'
  | 'right'
  | 'top'
  | 'vcenter'
  | 'bottom'
  | 'distribute-h'
  | 'distribute-v';

export type PositionPatch = {id: number; x?: number; y?: number};

// Position patches to align the given slots relative to their combined bounding
// box. Caller passes the unlocked subset (locked slots stay put). Returns [] for
// fewer than 2 slots (or fewer than 3 for distribute).
export function alignSlots(slots: DraftSlot[], kind: AlignKind): PositionPatch[] {
  if (slots.length < 2) return [];

  const minX = Math.min(...slots.map((s) => s.x));
  const maxX = Math.max(...slots.map((s) => s.x + s.width));
  const minY = Math.min(...slots.map((s) => s.y));
  const maxY = Math.max(...slots.map((s) => s.y + s.height));
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;

  switch (kind) {
    case 'left':
      return slots.map((s) => ({id: s.id, x: Math.round(minX)}));
    case 'right':
      return slots.map((s) => ({id: s.id, x: Math.round(maxX - s.width)}));
    case 'hcenter':
      return slots.map((s) => ({id: s.id, x: Math.round(cx - s.width / 2)}));
    case 'top':
      return slots.map((s) => ({id: s.id, y: Math.round(minY)}));
    case 'bottom':
      return slots.map((s) => ({id: s.id, y: Math.round(maxY - s.height)}));
    case 'vcenter':
      return slots.map((s) => ({id: s.id, y: Math.round(cy - s.height / 2)}));
    case 'distribute-h':
      return distribute(slots, 'h');
    case 'distribute-v':
      return distribute(slots, 'v');
  }
}

// Evenly space the slot centers between the first and last along the axis.
function distribute(slots: DraftSlot[], axis: 'h' | 'v'): PositionPatch[] {
  if (slots.length < 3) return [];
  const center = (s: DraftSlot) =>
    axis === 'h' ? s.x + s.width / 2 : s.y + s.height / 2;
  const sorted = [...slots].sort((a, b) => center(a) - center(b));
  const first = center(sorted[0]);
  const last = center(sorted[sorted.length - 1]);
  const step = (last - first) / (sorted.length - 1);
  return sorted.map((s, i) => {
    const c = first + step * i;
    return axis === 'h'
      ? {id: s.id, x: Math.round(c - s.width / 2)}
      : {id: s.id, y: Math.round(c - s.height / 2)};
  });
}
