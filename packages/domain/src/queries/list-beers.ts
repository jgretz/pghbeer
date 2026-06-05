import {beers, breweries, styles} from 'database';
import {asc, eq} from 'drizzle-orm';

import {getDb} from '../db';
import type {BeerListItem} from '../types';

// Shared join projection for the admin beer shape: ids + names on both
// relations. Used by listBeers, listBeersForEvent (filtered), and the
// create/update commands (single-id re-read).
export const beerListColumns = {
  id: beers.id,
  name: beers.name,
  abv: beers.abv,
  beverageType: beers.beverageType,
  isNa: beers.isNa,
  breweryId: breweries.id,
  breweryName: breweries.name,
  styleId: styles.id,
  styleName: styles.name,
};

type BeerListRow = {
  id: number;
  name: string;
  abv: number | null;
  beverageType: BeerListItem['beverageType'];
  isNa: boolean;
  breweryId: number;
  breweryName: string;
  styleId: number;
  styleName: string;
};

export function toBeerListItem(row: BeerListRow): BeerListItem {
  return {
    id: row.id,
    name: row.name,
    abv: row.abv,
    beverageType: row.beverageType,
    isNa: row.isNa,
    brewery: {id: row.breweryId, name: row.breweryName},
    style: {id: row.styleId, name: row.styleName},
  };
}

export async function findBeerListItem(id: number): Promise<BeerListItem | null> {
  const db = getDb();
  const [row] = await db
    .select(beerListColumns)
    .from(beers)
    .innerJoin(breweries, eq(beers.breweryId, breweries.id))
    .innerJoin(styles, eq(beers.styleId, styles.id))
    .where(eq(beers.id, id))
    .limit(1);

  return row ? toBeerListItem(row) : null;
}

export async function listBeers(): Promise<BeerListItem[]> {
  const db = getDb();
  const rows = await db
    .select(beerListColumns)
    .from(beers)
    .innerJoin(breweries, eq(beers.breweryId, breweries.id))
    .innerJoin(styles, eq(beers.styleId, styles.id))
    .orderBy(asc(beers.name));

  return rows.map(toBeerListItem);
}
