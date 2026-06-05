import {styles} from 'database';
import {asc} from 'drizzle-orm';

import {getDb} from '../db';
import type {StyleRow} from '../types';

export async function listStyles(): Promise<StyleRow[]> {
  const db = getDb();
  return db
    .select({id: styles.id, name: styles.name})
    .from(styles)
    .orderBy(asc(styles.name));
}
