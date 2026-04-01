import {integer, pgTable, varchar} from 'drizzle-orm/pg-core';
import {sql} from 'drizzle-orm';

import {dates} from './helpers';

export const breweries = pgTable('breweries', {
  id: integer()
    .default(sql`nextval('breweries_id_seq'::regclass)`)
    .primaryKey()
    .notNull(),
  name: varchar('name', {length: 80}).notNull(),
  ...dates,
});
