import {events} from 'database';
import {eq} from 'drizzle-orm';

import {getDb} from '../db';

// Returns null when the event does not exist so the route can answer 404
// rather than a false-success 200 on a no-op update.
export async function setMapEnabled(
  eventId: number,
  enabled: boolean,
): Promise<{enabled: boolean} | null> {
  const db = getDb();
  const [updated] = await db
    .update(events)
    .set({mapEnabled: enabled, updateDate: new Date()})
    .where(eq(events.id, eventId))
    .returning({id: events.id});
  if (!updated) return null;
  return {enabled};
}
