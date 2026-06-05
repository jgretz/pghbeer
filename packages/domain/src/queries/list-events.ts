import {events} from 'database';
import {asc} from 'drizzle-orm';

import {getDb} from '../db';
import type {EventRow} from '../types';

export async function listEvents(): Promise<EventRow[]> {
  const db = getDb();
  return db
    .select({id: events.id, name: events.name, date: events.date})
    .from(events)
    .orderBy(asc(events.date));
}
