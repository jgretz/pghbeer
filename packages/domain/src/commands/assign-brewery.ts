import {mapSlots} from 'database';
import {eq} from 'drizzle-orm';

import {getDb} from '../db';
import {loadMapSlot} from '../queries/load-map-slots';
import type {MapSlot} from '../types';

// The hot day-of path: a single-row update assigning (or clearing, with null) a
// brewery on a table slot. Returns null if the slot doesn't exist; throws if the
// slot is a zone (zones are never assignable — the admin UI never calls this for
// them, so this is a defensive guard).
export async function assignBreweryToSlot(
  slotId: number,
  breweryId: number | null,
): Promise<MapSlot | null> {
  const db = getDb();

  const [slot] = await db
    .select({kind: mapSlots.kind})
    .from(mapSlots)
    .where(eq(mapSlots.id, slotId))
    .limit(1);

  if (!slot) return null;
  if (slot.kind !== 'table') {
    throw new Error(`Cannot assign a brewery to a ${slot.kind} slot`);
  }

  await db
    .update(mapSlots)
    .set({breweryId, updateDate: new Date()})
    .where(eq(mapSlots.id, slotId));

  return loadMapSlot(slotId);
}
