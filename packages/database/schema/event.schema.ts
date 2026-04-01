import {date, pgTable, serial, varchar} from 'drizzle-orm/pg-core';

import {dates} from './helpers';

export const events = pgTable('events', {
  id: serial('id').primaryKey(),
  name: varchar('name', {length: 80}).notNull(),
  date: date('date').notNull(),
  ...dates,
});
