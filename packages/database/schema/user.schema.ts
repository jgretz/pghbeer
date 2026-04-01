import {integer, pgTable, varchar} from 'drizzle-orm/pg-core';
import {sql} from 'drizzle-orm';

import {dates} from './helpers';

export const users = pgTable('users', {
  id: integer()
    .default(sql`nextval('users_id_seq'::regclass)`)
    .primaryKey()
    .notNull(),
  webuserid: varchar('webuserid', {length: 80}).notNull(),
  ...dates,
});
