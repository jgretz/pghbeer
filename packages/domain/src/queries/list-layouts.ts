import {mapLayouts} from 'database';
import {asc, eq} from 'drizzle-orm';

import {getDb} from '../db';
import type {MapLayoutSummary} from '../types';

export async function listLayouts(eventId: number): Promise<MapLayoutSummary[]> {
  const db = getDb();
  return db
    .select({
      id: mapLayouts.id,
      name: mapLayouts.name,
      isActive: mapLayouts.isActive,
    })
    .from(mapLayouts)
    .where(eq(mapLayouts.eventId, eventId))
    .orderBy(asc(mapLayouts.id));
}
