import {events, mapLayouts} from 'database';
import {and, eq} from 'drizzle-orm';

import {getDb} from '../db';
import {loadLayoutSlots} from './load-map-slots';
import type {EventMap} from '../types';

// Public read: the per-event visibility flag plus the active layout (if any)
// with all of its slots. Returns enabled even when no layout exists so the
// client can distinguish "off" from "on but not built yet".
export async function getEventMap(eventId: number): Promise<EventMap> {
  const db = getDb();

  const [eventRow] = await db
    .select({mapEnabled: events.mapEnabled})
    .from(events)
    .where(eq(events.id, eventId))
    .limit(1);

  const enabled = eventRow?.mapEnabled ?? false;

  const [layoutRow] = await db
    .select({
      id: mapLayouts.id,
      eventId: mapLayouts.eventId,
      name: mapLayouts.name,
      isActive: mapLayouts.isActive,
      width: mapLayouts.width,
      height: mapLayouts.height,
    })
    .from(mapLayouts)
    .where(and(eq(mapLayouts.eventId, eventId), eq(mapLayouts.isActive, true)))
    .limit(1);

  if (!layoutRow) return {enabled, activeLayout: null};

  const slots = await loadLayoutSlots(layoutRow.id);
  return {enabled, activeLayout: {...layoutRow, slots}};
}
