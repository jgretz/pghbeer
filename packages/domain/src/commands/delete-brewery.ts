import {beers, breweries} from 'database';
import {count, eq} from 'drizzle-orm';

import {getDb} from '../db';
import type {DeleteResult} from '../types';

export async function deleteBrewery(id: number): Promise<DeleteResult> {
  const db = getDb();

  const [dependents] = await db
    .select({count: count()})
    .from(beers)
    .where(eq(beers.breweryId, id));

  const beerCount = dependents?.count ?? 0;
  if (beerCount > 0) {
    return {ok: false, dependents: {beers: beerCount}};
  }

  await db.delete(breweries).where(eq(breweries.id, id));
  return {ok: true};
}
