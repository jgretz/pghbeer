import {beers, styles} from 'database';
import {count, eq} from 'drizzle-orm';

import {getDb} from '../db';
import type {DeleteResult} from '../types';

export async function deleteStyle(id: number): Promise<DeleteResult> {
  const db = getDb();

  const [dependents] = await db
    .select({count: count()})
    .from(beers)
    .where(eq(beers.styleId, id));

  const beerCount = dependents?.count ?? 0;
  if (beerCount > 0) {
    return {ok: false, dependents: {beers: beerCount}};
  }

  await db.delete(styles).where(eq(styles.id, id));
  return {ok: true};
}
