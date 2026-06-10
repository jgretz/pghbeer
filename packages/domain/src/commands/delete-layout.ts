import {mapLayouts} from 'database';
import {eq} from 'drizzle-orm';

import {getDb} from '../db';
import type {DeleteResult} from '../types';

// Refuses to delete the active layout (it's what the public map reads); the
// admin must switch to another layout first. Slots cascade on delete.
export async function deleteLayout(layoutId: number): Promise<DeleteResult> {
  const db = getDb();

  const [row] = await db
    .select({isActive: mapLayouts.isActive})
    .from(mapLayouts)
    .where(eq(mapLayouts.id, layoutId))
    .limit(1);

  if (!row) return {ok: true};
  if (row.isActive) return {ok: false, dependents: {active: 1}};

  await db.delete(mapLayouts).where(eq(mapLayouts.id, layoutId));
  return {ok: true};
}
