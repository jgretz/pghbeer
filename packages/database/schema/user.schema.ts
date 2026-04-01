import {pgTable, serial, varchar} from 'drizzle-orm/pg-core';

import {dates} from './helpers';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  webuserid: varchar('webuserid', {length: 80}).notNull(),
  ...dates,
});
