import {date, integer, pgTable, varchar} from 'drizzle-orm/pg-core';
import {sql} from 'drizzle-orm';

import {dates} from './helpers';

export const events = pgTable('events', {
  id: integer()
    .default(sql`nextval('events_id_seq'::regclass)`)
    .primaryKey()
    .notNull(),
  name: varchar('name', {length: 80}).notNull(),
  date: date('date').notNull(),
  ...dates,
});
