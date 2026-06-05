import {beers} from 'database';

import {getDb} from '../db';
import {findBeerListItem} from '../queries/list-beers';
import type {BeerListItem, CreateBeerInput} from '../types';

export async function createBeer(input: CreateBeerInput): Promise<BeerListItem> {
  const db = getDb();
  const now = new Date();
  const [created] = await db
    .insert(beers)
    .values({
      name: input.name,
      abv: input.abv,
      beverageType: input.beverageType,
      isNa: input.isNa,
      breweryId: input.breweryId,
      styleId: input.styleId,
      createDate: now,
      updateDate: now,
    })
    .returning({id: beers.id});

  // Re-read through the join to return the brewery/style names.
  const item = await findBeerListItem(created!.id);
  return item!;
}
