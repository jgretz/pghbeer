import {styles} from 'database';
import {eq} from 'drizzle-orm';

import {getDb} from '../db';
import type {StyleRow, UpdateStyleInput} from '../types';

export async function updateStyle(
  id: number,
  input: UpdateStyleInput,
): Promise<StyleRow | null> {
  const db = getDb();
  const [updated] = await db
    .update(styles)
    .set({name: input.name, updateDate: new Date()})
    .where(eq(styles.id, id))
    .returning({id: styles.id, name: styles.name});

  return updated ?? null;
}
