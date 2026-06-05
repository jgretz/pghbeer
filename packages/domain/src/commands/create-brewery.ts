import {breweries} from 'database';

import {getDb} from '../db';
import type {BreweryRow, CreateBreweryInput} from '../types';

export async function createBrewery(input: CreateBreweryInput): Promise<BreweryRow> {
  const db = getDb();
  const now = new Date();
  const [created] = await db
    .insert(breweries)
    .values({name: input.name, createDate: now, updateDate: now})
    .returning({id: breweries.id, name: breweries.name});

  return created!;
}
