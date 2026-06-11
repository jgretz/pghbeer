import {events} from 'database';
import {eq} from 'drizzle-orm';

import {getDb} from '../db';

// "Bust cache" lever: stamp the event's updateDate so the public app's load-time
// version check detects a change and refetches the beer list + map. Returns the
// new version, or null when the event does not exist.
export async function bumpEventVersion(
  eventId: number,
): Promise<{version: string} | null> {
  const db = getDb();
  const [updated] = await db
    .update(events)
    .set({updateDate: new Date()})
    .where(eq(events.id, eventId))
    .returning({updateDate: events.updateDate});
  if (!updated) return null;
  return {version: updated.updateDate.toISOString()};
}
