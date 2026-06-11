import {events} from 'database';
import {eq} from 'drizzle-orm';

import {getDb} from '../db';

// Lightweight version probe for the public app: returns the event's updateDate
// as an ISO string. The client compares it against its last-seen value on load
// and refetches its cached beer list + map only when it changed. Null when the
// event is missing so the route can answer 404.
export async function getEventVersion(
  eventId: number,
): Promise<{version: string} | null> {
  const db = getDb();
  const [row] = await db
    .select({updateDate: events.updateDate})
    .from(events)
    .where(eq(events.id, eventId))
    .limit(1);
  if (!row) return null;
  return {version: row.updateDate.toISOString()};
}
