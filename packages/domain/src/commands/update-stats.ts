import {stats} from 'database';
import {and, eq} from 'drizzle-orm';

import {getDb} from '../db';
import type {UpdateStatsInput} from '../types';
import {StatOpinion} from '../types';
import {findOrCreateUser} from './find-or-create-user';

export async function updateStats(input: UpdateStatsInput): Promise<void> {
  const db = getDb();
  const user = await findOrCreateUser(input.userId);

  const [existing] = await db
    .select()
    .from(stats)
    .where(
      and(
        eq(stats.beerId, input.beerId),
        eq(stats.eventId, input.eventId),
        eq(stats.userId, user.id),
      ),
    )
    .limit(1);

  // update existing record
  if (input.tasted && existing) {
    await db
      .update(stats)
      .set({
        opinion: StatOpinion.Tasted,
        updateDate: new Date(),
      })
      .where(eq(stats.id, existing.id));
    return;
  }

  // create record
  if (input.tasted && !existing) {
    const now = new Date();
    await db.insert(stats).values({
      date: now,
      beerId: input.beerId,
      eventId: input.eventId,
      userId: user.id,
      opinion: StatOpinion.Tasted,
      createDate: now,
      updateDate: now,
    });
    return;
  }

  // delete record
  if (!input.tasted && existing) {
    await db.delete(stats).where(eq(stats.id, existing.id));
  }
}
