import {beers, breweries, eventbeerlist, styles} from 'database';
import {asc, eq} from 'drizzle-orm';

import {getDb} from '../db';
import type {BeerListItem} from '../types';
import {beerListColumns, toBeerListItem} from './list-beers';

export async function listBeersForEvent(eventId: number): Promise<BeerListItem[]> {
  const db = getDb();
  const rows = await db
    .select(beerListColumns)
    .from(eventbeerlist)
    .innerJoin(beers, eq(eventbeerlist.beerId, beers.id))
    .innerJoin(breweries, eq(beers.breweryId, breweries.id))
    .innerJoin(styles, eq(beers.styleId, styles.id))
    .where(eq(eventbeerlist.eventId, eventId))
    .orderBy(asc(beers.name));

  return rows.map(toBeerListItem);
}
