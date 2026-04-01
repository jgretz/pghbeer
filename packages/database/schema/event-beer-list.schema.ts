import {integer, pgTable, serial} from 'drizzle-orm/pg-core';

import {beers} from './beer.schema';
import {events} from './event.schema';
import {dates} from './helpers';

export const eventbeerlist = pgTable('eventbeerlist', {
  id: serial('id').primaryKey(),
  eventId: integer('event_id')
    .notNull()
    .references(() => events.id),
  beerId: integer('beer_id')
    .notNull()
    .references(() => beers.id),
  ...dates,
});
