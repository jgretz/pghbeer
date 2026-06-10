import {and, eq, sql} from 'drizzle-orm';
import {beers, breweries, eventbeerlist, styles} from 'database';
import type {BeverageType, Database} from 'database';

import {canonicalBreweryName} from './brewery-aliases';

export type UpsertDeps = {db: Database};

// breweries.name / styles.name / beers.name are all varchar(80).
const NAME_MAX = 80;
const cap = (s: string): string => s.trim().slice(0, NAME_MAX);

export async function findOrCreateBrewery(deps: UpsertDeps, name: string) {
  // Apply known aliases, then match case-insensitively so "SPOONWOOD BREWING
  // CO" reuses "Spoonwood Brewing Co" instead of creating a duplicate.
  const trimmed = cap(canonicalBreweryName(name));
  const [existing] = await deps.db
    .select()
    .from(breweries)
    .where(sql`lower(${breweries.name}) = ${trimmed.toLowerCase()}`)
    .limit(1);

  if (existing) return existing;

  const now = new Date();
  const [created] = await deps.db
    .insert(breweries)
    .values({name: trimmed, createDate: now, updateDate: now})
    .returning();

  console.log(`+ brewery: ${trimmed}`);
  return created!;
}

export async function findOrCreateStyle(deps: UpsertDeps, name: string) {
  const trimmed = cap(name);
  const [existing] = await deps.db
    .select()
    .from(styles)
    .where(sql`lower(${styles.name}) = ${trimmed.toLowerCase()}`)
    .limit(1);

  if (existing) return existing;

  const now = new Date();
  const [created] = await deps.db
    .insert(styles)
    .values({name: trimmed, createDate: now, updateDate: now})
    .returning();

  console.log(`+ style: ${trimmed}`);
  return created!;
}

/**
 * Insert-only beer find-or-create keyed on (name, breweryId, styleId). Preserves
 * the original scripts/import.ts behavior for the JSON-load path.
 */
export async function findOrCreateBeer(
  deps: UpsertDeps,
  args: {name: string; abv: number; breweryId: number; styleId: number},
) {
  const name = cap(args.name);
  const [existing] = await deps.db
    .select()
    .from(beers)
    .where(
      and(
        eq(beers.name, name),
        eq(beers.breweryId, args.breweryId),
        eq(beers.styleId, args.styleId),
      ),
    )
    .limit(1);

  if (existing) return existing;

  const now = new Date();
  const [created] = await deps.db
    .insert(beers)
    .values({
      name,
      abv: args.abv,
      breweryId: args.breweryId,
      styleId: args.styleId,
      createDate: now,
      updateDate: now,
    })
    .returning();

  console.log(`+ beer: ${name}`);
  return created!;
}

export async function ensureBeerAtEvent(deps: UpsertDeps, beerId: number, eventId: number) {
  const [existing] = await deps.db
    .select()
    .from(eventbeerlist)
    .where(and(eq(eventbeerlist.beerId, beerId), eq(eventbeerlist.eventId, eventId)))
    .limit(1);

  if (existing) return;

  const now = new Date();
  await deps.db.insert(eventbeerlist).values({beerId, eventId, createDate: now, updateDate: now});

  console.log(`+ event beer: ${beerId}`);
}

/** The mutable fields the sheet importer keeps in sync on an existing beer. */
export type BeerFields = {
  abv: number | null;
  styleId: number;
  isNa: boolean;
  beverageType: BeverageType;
};

/**
 * Pure decision: does the existing beer row differ from the desired fields?
 * Drives whether upsertEventBeer issues an UPDATE. Kept pure so it's testable
 * without a database.
 */
export function beerNeedsUpdate(existing: BeerFields, next: BeerFields): boolean {
  return (
    existing.abv !== next.abv ||
    existing.styleId !== next.styleId ||
    existing.isNa !== next.isNa ||
    existing.beverageType !== next.beverageType
  );
}

/**
 * Sheet-importer beer upsert: identity is (name, breweryId) so a corrected
 * style/abv UPDATES the row rather than orphaning it under a new style. Creates
 * the style as needed, then links the beer to the event. Idempotent.
 */
export async function upsertEventBeer(
  deps: UpsertDeps,
  args: {
    name: string;
    abv: number | null;
    breweryId: number;
    styleName: string;
    isNa: boolean;
    beverageType: BeverageType;
    eventId: number;
  },
) {
  const name = cap(args.name);
  const style = await findOrCreateStyle(deps, args.styleName);
  const next: BeerFields = {
    abv: args.abv,
    styleId: style.id,
    isNa: args.isNa,
    beverageType: args.beverageType,
  };

  const [existing] = await deps.db
    .select()
    .from(beers)
    .where(and(eq(beers.name, name), eq(beers.breweryId, args.breweryId)))
    .limit(1);

  let beerId: number;
  if (existing) {
    beerId = existing.id;
    if (existing.locked) {
      console.log(`= beer (locked): ${name}`); // admin-corrected; importer skips its fields
    } else if (beerNeedsUpdate(existing, next)) {
      await deps.db
        .update(beers)
        .set({...next, updateDate: new Date()})
        .where(eq(beers.id, existing.id));
      console.log(`~ beer: ${name}`);
    }
  } else {
    const now = new Date();
    const [created] = await deps.db
      .insert(beers)
      .values({name, ...next, breweryId: args.breweryId, createDate: now, updateDate: now})
      .returning();
    beerId = created!.id;
    console.log(`+ beer: ${name}`);
  }

  await ensureBeerAtEvent(deps, beerId, args.eventId);
  return beerId;
}
