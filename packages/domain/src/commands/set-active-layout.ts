import {mapLayouts, mapSlots} from 'database';
import {and, eq, inArray, isNull, sql} from 'drizzle-orm';

import {getDb} from '../db';
import {getEventMap} from '../queries/get-event-map';
import type {EventMap} from '../types';

// Makes `layoutId` the single active layout for the event and carries brewery
// assignments over from the previously-active layout by matching slot label
// (only into target tables that are currently empty). Runs in one transaction
// so the public map never observes a half-switched state. Returns null when the
// layout does not exist or belongs to another event — without this guard a bad
// id would deactivate the current layout and activate nothing, silently blanking
// the public map.
export async function setActiveLayout(
  eventId: number,
  layoutId: number,
): Promise<EventMap | null> {
  const db = getDb();

  const [target] = await db
    .select({id: mapLayouts.id})
    .from(mapLayouts)
    .where(and(eq(mapLayouts.id, layoutId), eq(mapLayouts.eventId, eventId)))
    .limit(1);
  if (!target) return null;

  await db.transaction(async (tx) => {
    const [current] = await tx
      .select({id: mapLayouts.id})
      .from(mapLayouts)
      .where(and(eq(mapLayouts.eventId, eventId), eq(mapLayouts.isActive, true)))
      .limit(1);

    // label -> breweryId for assigned tables on the outgoing active layout
    const assignments = new Map<string, number>();
    if (current && current.id !== layoutId) {
      const rows = await tx
        .select({label: mapSlots.label, breweryId: mapSlots.breweryId})
        .from(mapSlots)
        .where(and(eq(mapSlots.layoutId, current.id), eq(mapSlots.kind, 'table')));
      for (const r of rows) {
        if (r.breweryId != null) assignments.set(r.label, r.breweryId);
      }
    }

    const now = new Date();
    await tx
      .update(mapLayouts)
      .set({isActive: false, updateDate: now})
      .where(eq(mapLayouts.eventId, eventId));
    await tx
      .update(mapLayouts)
      .set({isActive: true, updateDate: now})
      .where(eq(mapLayouts.id, layoutId));

    // Carry assignments into matching, currently-empty target tables in one
    // statement (label -> breweryId via CASE) instead of an UPDATE per table.
    // inArray restricts to carried labels; isNull leaves occupied targets alone.
    if (assignments.size > 0) {
      const labels = [...assignments.keys()];
      const cases = sql.join(
        labels.map((l) => sql`when ${l} then ${assignments.get(l)!}::int`),
        sql` `,
      );
      await tx
        .update(mapSlots)
        .set({
          breweryId: sql`case ${mapSlots.label} ${cases} end`,
          updateDate: now,
        })
        .where(
          and(
            eq(mapSlots.layoutId, layoutId),
            eq(mapSlots.kind, 'table'),
            isNull(mapSlots.breweryId),
            inArray(mapSlots.label, labels),
          ),
        );
    }
  });

  return getEventMap(eventId);
}
