import {breweries} from 'database';
import {asc} from 'drizzle-orm';

import {getDb} from '../db';
import type {BreweryRow} from '../types';

export async function listBreweries(): Promise<BreweryRow[]> {
  const db = getDb();
  return db
    .select({id: breweries.id, name: breweries.name})
    .from(breweries)
    .orderBy(asc(breweries.name));
}
