import {boolean, foreignKey, integer, pgTable, varchar} from 'drizzle-orm/pg-core';
import {sql} from 'drizzle-orm';

import {events} from './event.schema';
import {dates} from './helpers';

// A festival map for an event. An event can have several layouts (e.g. a
// good-weather and a bad-weather variant); exactly one is active at a time,
// enforced transactionally in the setActiveLayout command.
export const mapLayouts = pgTable(
  'map_layouts',
  {
    id: integer()
      .default(sql`nextval('map_layouts_id_seq'::regclass)`)
      .primaryKey()
      .notNull(),
    eventId: integer('event_id').notNull(),
    name: varchar('name', {length: 80}).notNull(),
    isActive: boolean('is_active').notNull().default(false),
    // SVG viewBox dimensions ("the room") in arbitrary layout units.
    width: integer('width').notNull().default(1000),
    height: integer('height').notNull().default(1000),
    ...dates,
  },
  (table) => [
    foreignKey({
      columns: [table.eventId],
      foreignColumns: [events.id],
      name: 'map_layouts_event_id_fkey',
    })
      .onUpdate('cascade')
      .onDelete('cascade'),
  ],
);
