import {beers, breweries, eventbeerlist, styles} from 'database';
import {eq} from 'drizzle-orm';

import {getDb} from '../db';
import type {EventBeerItem} from '../types';

export async function dataForEvent(eventId: number): Promise<EventBeerItem[]> {
  const db = getDb();

  const rows = await db
    .select({
      beerId: beers.id,
      beerName: beers.name,
      abv: beers.abv,
      beverageType: beers.beverageType,
      isNa: beers.isNa,
      breweryId: breweries.id,
      breweryName: breweries.name,
      styleName: styles.name,
    })
    .from(eventbeerlist)
    .innerJoin(beers, eq(eventbeerlist.beerId, beers.id))
    .innerJoin(breweries, eq(beers.breweryId, breweries.id))
    .innerJoin(styles, eq(beers.styleId, styles.id))
    .where(eq(eventbeerlist.eventId, eventId));

  return rows.map((row) => ({
    beer: {
      id: row.beerId,
      name: row.beerName,
      abv: row.abv,
      beverageType: row.beverageType,
      isNA: row.isNa,
      brewery: {
        id: row.breweryId,
        name: row.breweryName,
      },
      style: {
        name: row.styleName,
      },
    },
  }));
}
