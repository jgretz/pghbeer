import {mapLayouts} from 'database';
import {eq} from 'drizzle-orm';

import {getDb} from '../db';
import {getLayout} from '../queries/get-layout';
import type {MapLayout, UpdateLayoutInput} from '../types';

export async function updateLayout(
  layoutId: number,
  input: UpdateLayoutInput,
): Promise<MapLayout | null> {
  const db = getDb();

  const [updated] = await db
    .update(mapLayouts)
    .set({...input, updateDate: new Date()})
    .where(eq(mapLayouts.id, layoutId))
    .returning({id: mapLayouts.id});

  if (!updated) return null;

  return getLayout(updated.id);
}
