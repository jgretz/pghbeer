import {mapLayouts, mapSlots} from 'database';
import {and, eq} from 'drizzle-orm';

import {getDb} from '../db';
import {getEventMap} from '../queries/get-event-map';
import type {EventMap} from '../types';

// Makes `layoutId` the single active layout for the event and carries brewery
// assignments over from the previously-active layout by matching slot label
// (only into target tables that are currently empty). Runs in one transaction
// so the public map never observes a half-switched state.
export async function setActiveLayout(
  eventId: number,
  layoutId: number,
): Promise<EventMap> {
  const db = getDb();

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

    if (assignments.size > 0) {
      const targetTables = await tx
        .select({
          id: mapSlots.id,
          label: mapSlots.label,
          breweryId: mapSlots.breweryId,
        })
        .from(mapSlots)
        .where(and(eq(mapSlots.layoutId, layoutId), eq(mapSlots.kind, 'table')));

      for (const t of targetTables) {
        const incoming = assignments.get(t.label);
        if (incoming != null && t.breweryId == null) {
          await tx
            .update(mapSlots)
            .set({breweryId: incoming, updateDate: now})
            .where(eq(mapSlots.id, t.id));
        }
      }
    }
  });

  return getEventMap(eventId);
}
