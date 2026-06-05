import {eventbeerlist} from 'database';
import {and, eq} from 'drizzle-orm';

import {getDb} from '../db';

// Idempotent: a beer is either on an event's list or it isn't. Re-adding an
// existing link is a no-op rather than a duplicate row or an error.
export async function addBeerToEvent(eventId: number, beerId: number): Promise<void> {
  const db = getDb();

  const [existing] = await db
    .select({id: eventbeerlist.id})
    .from(eventbeerlist)
    .where(and(eq(eventbeerlist.eventId, eventId), eq(eventbeerlist.beerId, beerId)))
    .limit(1);

  if (existing) return;

  const now = new Date();
  await db
    .insert(eventbeerlist)
    .values({eventId, beerId, createDate: now, updateDate: now});
}
