import {pgTable, serial, varchar} from 'drizzle-orm/pg-core';

import {dates} from './helpers';

export const breweries = pgTable('breweries', {
  id: serial('id').primaryKey(),
  name: varchar('name', {length: 80}).notNull(),
  ...dates,
});
