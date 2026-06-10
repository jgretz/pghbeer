import {mapLayouts} from 'database';

import {getDb} from '../db';
import type {CreateLayoutInput, MapLayout} from '../types';

export async function createLayout(
  eventId: number,
  input: CreateLayoutInput,
): Promise<MapLayout> {
  const db = getDb();
  const now = new Date();

  const [created] = await db
    .insert(mapLayouts)
    .values({
      eventId,
      name: input.name,
      width: input.width ?? 1000,
      height: input.height ?? 1000,
      isActive: false,
      createDate: now,
      updateDate: now,
    })
    .returning({
      id: mapLayouts.id,
      eventId: mapLayouts.eventId,
      name: mapLayouts.name,
      isActive: mapLayouts.isActive,
      width: mapLayouts.width,
      height: mapLayouts.height,
    });

  return {...created!, slots: []};
}
