import {mapSlots} from 'database';
import {eq} from 'drizzle-orm';

import {getDb} from '../db';
import {loadMapSlot} from '../queries/load-map-slots';
import type {MapSlot, UpsertSlotInput} from '../types';

// Create (no id) or update (id present) a single slot. Zones never carry a
// brewery assignment regardless of input.
export async function upsertSlot(
  layoutId: number,
  input: UpsertSlotInput,
): Promise<MapSlot> {
  const db = getDb();
  const now = new Date();
  const breweryId = input.kind === 'zone' ? null : input.breweryId ?? null;

  const fields = {
    label: input.label,
    kind: input.kind,
    x: input.x,
    y: input.y,
    width: input.width,
    height: input.height,
    rotation: input.rotation,
    locked: input.locked,
    breweryId,
  };

  let slotId: number;
  if (input.id) {
    const [updated] = await db
      .update(mapSlots)
      .set({...fields, updateDate: now})
      .where(eq(mapSlots.id, input.id))
      .returning({id: mapSlots.id});
    slotId = updated!.id;
  } else {
    const [created] = await db
      .insert(mapSlots)
      .values({layoutId, ...fields, createDate: now, updateDate: now})
      .returning({id: mapSlots.id});
    slotId = created!.id;
  }

  const slot = await loadMapSlot(slotId);
  return slot!;
}
