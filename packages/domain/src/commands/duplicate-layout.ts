import {mapLayouts, mapSlots} from 'database';
import {eq} from 'drizzle-orm';

import {getDb} from '../db';
import {getLayout} from '../queries/get-layout';
import type {MapLayout} from '../types';

// Copies a layout and all its slots (preserving assignments) into a new,
// inactive layout for the same event — the basis for good/bad-weather variants.
export async function duplicateLayout(
  layoutId: number,
  name: string,
): Promise<MapLayout | null> {
  const db = getDb();

  const [src] = await db
    .select({
      eventId: mapLayouts.eventId,
      width: mapLayouts.width,
      height: mapLayouts.height,
    })
    .from(mapLayouts)
    .where(eq(mapLayouts.id, layoutId))
    .limit(1);

  if (!src) return null;

  const now = new Date();
  const [created] = await db
    .insert(mapLayouts)
    .values({
      eventId: src.eventId,
      name,
      width: src.width,
      height: src.height,
      isActive: false,
      createDate: now,
      updateDate: now,
    })
    .returning({id: mapLayouts.id});

  const srcSlots = await db
    .select()
    .from(mapSlots)
    .where(eq(mapSlots.layoutId, layoutId));

  if (srcSlots.length > 0) {
    await db.insert(mapSlots).values(
      srcSlots.map((s) => ({
        layoutId: created!.id,
        label: s.label,
        kind: s.kind,
        x: s.x,
        y: s.y,
        width: s.width,
        height: s.height,
        rotation: s.rotation,
        locked: s.locked,
        breweryId: s.breweryId,
        createDate: now,
        updateDate: now,
      })),
    );
  }

  return getLayout(created!.id);
}
