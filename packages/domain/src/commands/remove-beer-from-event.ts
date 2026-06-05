import {eventbeerlist} from 'database';
import {and, eq} from 'drizzle-orm';

import {getDb} from '../db';

export async function removeBeerFromEvent(
  eventId: number,
  beerId: number,
): Promise<void> {
  const db = getDb();
  await db
    .delete(eventbeerlist)
    .where(and(eq(eventbeerlist.eventId, eventId), eq(eventbeerlist.beerId, beerId)));
}
