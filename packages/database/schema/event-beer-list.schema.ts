import {foreignKey, integer, pgTable} from 'drizzle-orm/pg-core';
import {sql} from 'drizzle-orm';

import {beers} from './beer.schema';
import {events} from './event.schema';
import {dates} from './helpers';

export const eventbeerlist = pgTable(
  'eventbeerlist',
  {
    id: integer()
      .default(sql`nextval('eventbeerlist_id_seq'::regclass)`)
      .primaryKey()
      .notNull(),
    eventId: integer('event_id').notNull(),
    beerId: integer('beer_id').notNull(),
    ...dates,
  },
  (table) => [
    foreignKey({
      columns: [table.beerId],
      foreignColumns: [beers.id],
      name: 'eventbeerlist_beer_id_fkey',
    })
      .onUpdate('cascade')
      .onDelete('restrict'),
    foreignKey({
      columns: [table.eventId],
      foreignColumns: [events.id],
      name: 'eventbeerlist_event_id_fkey',
    })
      .onUpdate('cascade')
      .onDelete('restrict'),
  ],
);
