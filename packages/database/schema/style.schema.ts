import {pgTable, serial, varchar} from 'drizzle-orm/pg-core';

import {dates} from './helpers';

export const styles = pgTable('styles', {
  id: serial('id').primaryKey(),
  name: varchar('name', {length: 80}).notNull(),
  ...dates,
});
