import {doublePrecision, integer, pgTable, serial, varchar} from 'drizzle-orm/pg-core';

import {breweries} from './brewery.schema';
import {dates} from './helpers';
import {styles} from './style.schema';

export const beers = pgTable('beers', {
  id: serial('id').primaryKey(),
  name: varchar('name', {length: 80}).notNull(),
  abv: doublePrecision('abv'),
  breweryId: integer('brewery_id')
    .notNull()
    .references(() => breweries.id),
  styleId: integer('style_id')
    .notNull()
    .references(() => styles.id),
  ...dates,
});
