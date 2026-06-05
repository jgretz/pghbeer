import {events} from 'database';

import {getDb} from '../db';
import type {CreateEventInput, EventRow} from '../types';

export async function createEvent(input: CreateEventInput): Promise<EventRow> {
  const db = getDb();
  const now = new Date();
  const [created] = await db
    .insert(events)
    .values({name: input.name, date: input.date, createDate: now, updateDate: now})
    .returning({id: events.id, name: events.name, date: events.date});

  return created!;
}
