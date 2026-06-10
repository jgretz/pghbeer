import {breweries, mapSlots} from 'database';
import {asc, eq} from 'drizzle-orm';

import {getDb} from '../db';
import type {MapSlot, MapSlotKind} from '../types';

const slotColumns = {
  id: mapSlots.id,
  label: mapSlots.label,
  kind: mapSlots.kind,
  x: mapSlots.x,
  y: mapSlots.y,
  width: mapSlots.width,
  height: mapSlots.height,
  rotation: mapSlots.rotation,
  locked: mapSlots.locked,
  breweryId: mapSlots.breweryId,
  breweryName: breweries.name,
};

function toMapSlot(row: {
  id: number;
  label: string;
  kind: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  locked: boolean;
  breweryId: number | null;
  breweryName: string | null;
}): MapSlot {
  return {
    id: row.id,
    label: row.label,
    kind: row.kind as MapSlotKind,
    x: row.x,
    y: row.y,
    width: row.width,
    height: row.height,
    rotation: row.rotation,
    locked: row.locked,
    breweryId: row.breweryId,
    breweryName: row.breweryName ?? null,
  };
}

// Internal helper (not exported from the package). Loads every slot of a layout
// with its assigned brewery name (left join — zones and empty tables have none).
export async function loadLayoutSlots(layoutId: number): Promise<MapSlot[]> {
  const db = getDb();
  const rows = await db
    .select(slotColumns)
    .from(mapSlots)
    .leftJoin(breweries, eq(mapSlots.breweryId, breweries.id))
    .where(eq(mapSlots.layoutId, layoutId))
    .orderBy(asc(mapSlots.id));

  return rows.map(toMapSlot);
}

export async function loadMapSlot(slotId: number): Promise<MapSlot | null> {
  const db = getDb();
  const [row] = await db
    .select(slotColumns)
    .from(mapSlots)
    .leftJoin(breweries, eq(mapSlots.breweryId, breweries.id))
    .where(eq(mapSlots.id, slotId))
    .limit(1);

  return row ? toMapSlot(row) : null;
}
