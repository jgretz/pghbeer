import {events} from 'database';
import {eq} from 'drizzle-orm';

import {getDb} from '../db';
import type {EventRow, UpdateEventInput} from '../types';

export async function updateEvent(
  id: number,
  input: UpdateEventInput,
): Promise<EventRow | null> {
  const db = getDb();
  const [updated] = await db
    .update(events)
    .set({name: input.name, date: input.date, updateDate: new Date()})
    .where(eq(events.id, id))
    .returning({id: events.id, name: events.name, date: events.date});

  return updated ?? null;
}
