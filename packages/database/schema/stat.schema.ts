import {integer, pgTable, serial, timestamp} from 'drizzle-orm/pg-core';

import {beers} from './beer.schema';
import {events} from './event.schema';
import {dates} from './helpers';
import {users} from './user.schema';

export const stats = pgTable('stats', {
  id: serial('id').primaryKey(),
  date: timestamp('date', {precision: 6}).notNull(),
  opinion: integer('opinion').notNull(),
  beerId: integer('beer_id')
    .notNull()
    .references(() => beers.id),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  eventId: integer('event_id')
    .notNull()
    .references(() => events.id),
  ...dates,
});
