import {breweries} from 'database';
import {eq} from 'drizzle-orm';

import {getDb} from '../db';
import type {BreweryRow, UpdateBreweryInput} from '../types';

export async function updateBrewery(
  id: number,
  input: UpdateBreweryInput,
): Promise<BreweryRow | null> {
  const db = getDb();
  const [updated] = await db
    .update(breweries)
    .set({name: input.name, updateDate: new Date()})
    .where(eq(breweries.id, id))
    .returning({id: breweries.id, name: breweries.name});

  return updated ?? null;
}
