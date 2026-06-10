import {events} from 'database';
import {eq} from 'drizzle-orm';

import {getDb} from '../db';

export async function setMapEnabled(
  eventId: number,
  enabled: boolean,
): Promise<{enabled: boolean}> {
  const db = getDb();
  await db
    .update(events)
    .set({mapEnabled: enabled, updateDate: new Date()})
    .where(eq(events.id, eventId));
  return {enabled};
}
