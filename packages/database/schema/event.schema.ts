import {boolean, date, integer, pgTable, varchar} from 'drizzle-orm/pg-core';
import {sql} from 'drizzle-orm';

import {dates} from './helpers';

export const events = pgTable('events', {
  id: integer()
    .default(sql`nextval('events_id_seq'::regclass)`)
    .primaryKey()
    .notNull(),
  name: varchar('name', {length: 80}).notNull(),
  date: date('date').notNull(),
  // Public feature flag: when true the festival map is shown to attendees.
  // The frontend always shows the map in dev and follows this flag in prod.
  mapEnabled: boolean('map_enabled').notNull().default(false),
  ...dates,
});
