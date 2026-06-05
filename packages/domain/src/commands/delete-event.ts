import {eventbeerlist, events, stats} from 'database';
import {count, eq} from 'drizzle-orm';

import {getDb} from '../db';
import type {DeleteResult} from '../types';

export async function deleteEvent(id: number): Promise<DeleteResult> {
  const db = getDb();

  const [linkRow] = await db
    .select({count: count()})
    .from(eventbeerlist)
    .where(eq(eventbeerlist.eventId, id));
  const [statRow] = await db
    .select({count: count()})
    .from(stats)
    .where(eq(stats.eventId, id));

  const linkCount = linkRow?.count ?? 0;
  const statCount = statRow?.count ?? 0;
  if (linkCount > 0 || statCount > 0) {
    return {ok: false, dependents: {eventLinks: linkCount, stats: statCount}};
  }

  await db.delete(events).where(eq(events.id, id));
  return {ok: true};
}
