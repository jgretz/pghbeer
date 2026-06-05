import {beers, eventbeerlist, stats} from 'database';
import {count, eq} from 'drizzle-orm';

import {getDb} from '../db';
import type {DeleteResult} from '../types';

export async function deleteBeer(id: number): Promise<DeleteResult> {
  const db = getDb();

  const [statRow] = await db
    .select({count: count()})
    .from(stats)
    .where(eq(stats.beerId, id));
  const [linkRow] = await db
    .select({count: count()})
    .from(eventbeerlist)
    .where(eq(eventbeerlist.beerId, id));

  const statCount = statRow?.count ?? 0;
  const linkCount = linkRow?.count ?? 0;
  if (statCount > 0 || linkCount > 0) {
    return {ok: false, dependents: {stats: statCount, eventLinks: linkCount}};
  }

  await db.delete(beers).where(eq(beers.id, id));
  return {ok: true};
}
