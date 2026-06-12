import {
  boolean,
  doublePrecision,
  foreignKey,
  integer,
  pgTable,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/pg-core';
import {sql} from 'drizzle-orm';

import {breweries} from './brewery.schema';
import {mapLayouts} from './map-layout.schema';
import {dates} from './helpers';

// A positioned element within a layout: an assignable brewery `table`, a
// decorative `zone` (Inside / Outside / Entrance) used for orientation, or a
// free-standing text `label`. All kinds share geometry so they reuse the same
// editor and render path. `kind` is a varchar, not a pg enum, to avoid
// migration churn if more kinds are added later.
export const mapSlots = pgTable(
  'map_slots',
  {
    id: integer()
      .default(sql`nextval('map_slots_id_seq'::regclass)`)
      .primaryKey()
      .notNull(),
    layoutId: integer('layout_id').notNull(),
    // For tables this is the carry-over match key when switching layouts; for
    // zones it is the displayed name.
    label: varchar('label', {length: 24}).notNull(),
    kind: varchar('kind', {length: 16}).notNull().default('table'),
    x: doublePrecision('x').notNull(),
    y: doublePrecision('y').notNull(),
    width: doublePrecision('width').notNull().default(40),
    height: doublePrecision('height').notNull().default(40),
    rotation: doublePrecision('rotation').notNull().default(0),
    // Explicit text size for `label` slots (tables/zones derive theirs from
    // geometry). Null for non-label kinds.
    fontSize: integer('font_size'),
    // `label` slots only: stack characters top-to-bottom instead of left-to-right.
    vertical: boolean('vertical').notNull().default(false),
    // Editor convenience: a locked slot can't be moved/resized/aligned.
    locked: boolean('locked').notNull().default(false),
    // Null for zones and unassigned tables.
    breweryId: integer('brewery_id'),
    ...dates,
  },
  (table) => [
    // Table labels are the carry-over match key when switching layouts, so they
    // must be unique within a layout. Partial — zones may repeat labels freely.
    uniqueIndex('map_slots_layout_table_label_unq')
      .on(table.layoutId, table.label)
      .where(sql`${table.kind} = 'table'`),
    foreignKey({
      columns: [table.layoutId],
      foreignColumns: [mapLayouts.id],
      name: 'map_slots_layout_id_fkey',
    })
      .onUpdate('cascade')
      .onDelete('cascade'),
    foreignKey({
      columns: [table.breweryId],
      foreignColumns: [breweries.id],
      name: 'map_slots_brewery_id_fkey',
    })
      .onUpdate('cascade')
      .onDelete('set null'),
  ],
);
