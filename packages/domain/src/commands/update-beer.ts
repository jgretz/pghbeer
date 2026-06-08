import {beers} from 'database';
import {eq} from 'drizzle-orm';

import {getDb} from '../db';
import {findBeerListItem} from '../queries/list-beers';
import type {BeerListItem, UpdateBeerInput} from '../types';

export async function updateBeer(
  id: number,
  input: UpdateBeerInput,
): Promise<BeerListItem | null> {
  const db = getDb();

  const [updated] = await db
    .update(beers)
    // Any admin edit locks the beer against importer overwrites; the Unlock
    // toggle passes locked:false explicitly to hand it back to the importer.
    .set({...input, locked: input.locked ?? true, updateDate: new Date()})
    .where(eq(beers.id, id))
    .returning({id: beers.id});

  if (!updated) return null;

  return findBeerListItem(updated.id);
}
