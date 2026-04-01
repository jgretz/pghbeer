import {beers, breweries, stats, styles} from 'database';
import {eq} from 'drizzle-orm';

import {getDb} from '../db';
import type {StatItem} from '../types';

export async function statsForEvent(eventId: number): Promise<StatItem[]> {
  const db = getDb();

  const rows = await db
    .select({
      opinion: stats.opinion,
      userId: stats.userId,
      date: stats.date,
      beerId: beers.id,
      beerName: beers.name,
      abv: beers.abv,
      breweryId: breweries.id,
      breweryName: breweries.name,
      styleName: styles.name,
    })
    .from(stats)
    .innerJoin(beers, eq(stats.beerId, beers.id))
    .innerJoin(breweries, eq(beers.breweryId, breweries.id))
    .innerJoin(styles, eq(beers.styleId, styles.id))
    .where(eq(stats.eventId, eventId));

  return rows.map((row) => ({
    opinion: row.opinion,
    user_id: row.userId,
    date: row.date,
    beer: {
      id: row.beerId,
      name: row.beerName,
      abv: row.abv,
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
