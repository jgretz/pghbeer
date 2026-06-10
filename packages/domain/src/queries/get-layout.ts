import {mapLayouts} from 'database';
import {eq} from 'drizzle-orm';

import {getDb} from '../db';
import {loadLayoutSlots} from './load-map-slots';
import type {MapLayout} from '../types';

// Full layout (all slots) for the admin editor, regardless of active state.
export async function getLayout(layoutId: number): Promise<MapLayout | null> {
  const db = getDb();

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
    .where(eq(mapLayouts.id, layoutId))
    .limit(1);

  if (!layoutRow) return null;

  const slots = await loadLayoutSlots(layoutRow.id);
  return {...layoutRow, slots};
}
