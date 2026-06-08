import {boolean, doublePrecision, foreignKey, integer, pgTable, varchar} from 'drizzle-orm/pg-core';
import {sql} from 'drizzle-orm';

import {breweries} from './brewery.schema';
import {beverageTypeEnum, dates} from './helpers';
import {styles} from './style.schema';

export const beers = pgTable(
  'beers',
  {
    id: integer()
      .default(sql`nextval('beers_id_seq'::regclass)`)
      .primaryKey()
      .notNull(),
    name: varchar('name', {length: 80}).notNull(),
    abv: doublePrecision('abv'),
    beverageType: beverageTypeEnum('beverage_type').notNull().default('beer'),
    isNa: boolean('is_na').notNull().default(false),
    // Set by any admin write; tells the sheet importer to leave this beer's
    // importer-managed fields (abv/style/isNa/beverageType) alone on re-import.
    locked: boolean('locked').notNull().default(false),
    breweryId: integer('brewery_id').notNull(),
    styleId: integer('style_id').notNull(),
    ...dates,
  },
  (table) => [
    foreignKey({
      columns: [table.breweryId],
      foreignColumns: [breweries.id],
      name: 'beers_brewery_id_fkey',
    })
      .onUpdate('cascade')
      .onDelete('restrict'),
    foreignKey({
      columns: [table.styleId],
      foreignColumns: [styles.id],
      name: 'beers_style_id_fkey',
    })
      .onUpdate('cascade')
      .onDelete('restrict'),
  ],
);
