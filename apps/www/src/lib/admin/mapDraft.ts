import type {AdminMapSlot, AdminMapSlotKind} from './maps';

// Local editing model. New slots get negative temporary ids until a Save
// persists them and swaps in the server id.
export type DraftSlot = AdminMapSlot;

export type DraftAction =
  | {type: 'LOAD'; slots: DraftSlot[]}
  | {type: 'ADD'; slot: DraftSlot}
  | {type: 'UPDATE'; id: number; patch: Partial<DraftSlot>}
  | {type: 'UPDATE_MANY'; updates: {id: number; patch: Partial<DraftSlot>}[]}
  | {type: 'DELETE'; ids: number[]}
  | {type: 'ASSIGN'; id: number; breweryId: number | null; breweryName: string | null};

export function draftReducer(state: DraftSlot[], action: DraftAction): DraftSlot[] {
  switch (action.type) {
    case 'LOAD':
      return action.slots;
    case 'ADD':
      return [...state, action.slot];
    case 'UPDATE':
      return state.map((s) => (s.id === action.id ? {...s, ...action.patch} : s));
    case 'UPDATE_MANY': {
      const byId = new Map(action.updates.map((u) => [u.id, u.patch]));
      return state.map((s) => {
        const patch = byId.get(s.id);
        return patch ? {...s, ...patch} : s;
      });
    }
    case 'DELETE':
      return state.filter((s) => !action.ids.includes(s.id));
    case 'ASSIGN':
      return state.map((s) =>
        s.id === action.id
          ? {...s, breweryId: action.breweryId, breweryName: action.breweryName}
          : s,
      );
    default:
      return state;
  }
}

export function isTempId(id: number): boolean {
  return id < 0;
}

export const DEFAULT_LABEL_FONT_SIZE = 28;

// Approximate the rendered text box for a label so it gets a tight, draggable
// hit area in the editor — SVG <text> has no intrinsic layout box. Kept in sync
// whenever a label's text, font size, or orientation changes. Vertical labels
// stack one character per row, so they're narrow and tall.
export function labelBox(
  text: string,
  fontSize: number,
  vertical = false,
): {width: number; height: number} {
  const chars = Math.max(text.length, 1);
  return vertical
    ? {width: Math.round(fontSize * 1.4), height: Math.round(chars * fontSize * 1.05)}
    : {width: Math.round(Math.max(fontSize, chars * fontSize * 0.62)), height: Math.round(fontSize * 1.4)};
}

// A fresh slot of the given kind, dropped near the center of the world with a
// sensible default size (zones larger than tables; labels fit their text).
// `offset` cascades successive additions so new slots don't land exactly on top
// of each other.
export function makeSlot(
  tempId: number,
  kind: AdminMapSlotKind,
  label: string,
  world: {width: number; height: number},
  offset = 0,
): DraftSlot {
  const fontSize = kind === 'label' ? DEFAULT_LABEL_FONT_SIZE : null;
  const size =
    kind === 'zone'
      ? {w: 300, h: 200}
      : kind === 'label'
        ? (() => {
            const b = labelBox(label, DEFAULT_LABEL_FONT_SIZE);
            return {w: b.width, h: b.height};
          })()
        : {w: 50, h: 50};
  const shift = (offset % 8) * 24;
  return {
    id: tempId,
    label,
    kind,
    x: Math.round(world.width / 2 - size.w / 2 + shift),
    y: Math.round(world.height / 2 - size.h / 2 + shift),
    width: size.w,
    height: size.h,
    rotation: 0,
    fontSize,
    vertical: false,
    locked: false,
    breweryId: null,
    breweryName: null,
  };
}
