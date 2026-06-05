import {styles} from 'database';

import {getDb} from '../db';
import type {CreateStyleInput, StyleRow} from '../types';

export async function createStyle(input: CreateStyleInput): Promise<StyleRow> {
  const db = getDb();
  const now = new Date();
  const [created] = await db
    .insert(styles)
    .values({name: input.name, createDate: now, updateDate: now})
    .returning({id: styles.id, name: styles.name});

  return created!;
}
