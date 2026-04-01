import {foreignKey, integer, pgTable, timestamp} from 'drizzle-orm/pg-core';
import {sql} from 'drizzle-orm';

import {beers} from './beer.schema';
import {events} from './event.schema';
import {dates} from './helpers';
import {users} from './user.schema';

export const stats = pgTable(
  'stats',
  {
    id: integer()
      .default(sql`nextval('stats_id_seq'::regclass)`)
      .primaryKey()
      .notNull(),
    date: timestamp('date').notNull(),
    opinion: integer('opinion').notNull(),
    beerId: integer('beer_id').notNull(),
    userId: integer('user_id').notNull(),
    eventId: integer('event_id').notNull(),
    ...dates,
  },
  (table) => [
    foreignKey({
      columns: [table.beerId],
      foreignColumns: [beers.id],
      name: 'stats_beer_id_fkey',
    })
      .onUpdate('cascade')
      .onDelete('restrict'),
    foreignKey({
      columns: [table.eventId],
      foreignColumns: [events.id],
      name: 'stats_event_id_fkey',
    })
      .onUpdate('cascade')
      .onDelete('restrict'),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: 'stats_user_id_fkey',
    })
      .onUpdate('cascade')
      .onDelete('restrict'),
  ],
);
