import {users} from 'database';
import {eq} from 'drizzle-orm';

import {getDb} from '../db';

export async function findOrCreateUser(webuserid: string) {
  const db = getDb();

  const [existing] = await db
    .select()
    .from(users)
    .where(eq(users.webuserid, webuserid))
    .limit(1);

  if (existing) return existing;

  const now = new Date();
  const [created] = await db
    .insert(users)
    .values({
      webuserid,
      createDate: now,
      updateDate: now,
    })
    .returning();

  return created!;
}
