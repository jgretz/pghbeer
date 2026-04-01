import {integer, pgTable, varchar} from 'drizzle-orm/pg-core';
import {sql} from 'drizzle-orm';

import {dates} from './helpers';

export const styles = pgTable('styles', {
  id: integer()
    .default(sql`nextval('styles_id_seq'::regclass)`)
    .primaryKey()
    .notNull(),
  name: varchar('name', {length: 80}).notNull(),
  ...dates,
});
