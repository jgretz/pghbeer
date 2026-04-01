import {createDatabase, beers, breweries, styles, eventbeerlist} from 'database';
import {eq, and} from 'drizzle-orm';

interface LoadData {
  brewery: string;
  name: string;
  style: string;
  abv: number;
}

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) throw new Error('DATABASE_URL is required');

const EVENT_ID = Number(process.env.EVENT_ID ?? 7);
const DATA_FILE = process.env.DATA_FILE ?? './scripts/data/2025/load6.json';

const db = createDatabase(DATABASE_URL);

async function findOrCreateBrewery(name: string) {
  const [existing] = await db
    .select()
    .from(breweries)
    .where(eq(breweries.name, name))
    .limit(1);

  if (existing) return existing;

  const now = new Date();
  const [created] = await db
    .insert(breweries)
    .values({name, createDate: now, updateDate: now})
    .returning();

  console.log(`+ brewery: ${name}`);
  return created!;
}

async function findOrCreateStyle(name: string) {
  const [existing] = await db
    .select()
    .from(styles)
    .where(eq(styles.name, name))
    .limit(1);

  if (existing) return existing;

  const now = new Date();
  const [created] = await db
    .insert(styles)
    .values({name, createDate: now, updateDate: now})
    .returning();

  console.log(`+ style: ${name}`);
  return created!;
}

async function findOrCreateBeer(
  name: string,
  abv: number,
  breweryId: number,
  styleId: number,
) {
  const [existing] = await db
    .select()
    .from(beers)
    .where(
      and(eq(beers.name, name), eq(beers.breweryId, breweryId), eq(beers.styleId, styleId)),
    )
    .limit(1);

  if (existing) return existing;

  const now = new Date();
  const [created] = await db
    .insert(beers)
    .values({name, abv, breweryId, styleId, createDate: now, updateDate: now})
    .returning();

  console.log(`+ beer: ${name}`);
  return created!;
}

async function ensureBeerAtEvent(beerId: number, eventId: number) {
  const [existing] = await db
    .select()
    .from(eventbeerlist)
    .where(and(eq(eventbeerlist.beerId, beerId), eq(eventbeerlist.eventId, eventId)))
    .limit(1);

  if (existing) return;

  const now = new Date();
  await db
    .insert(eventbeerlist)
    .values({beerId, eventId, createDate: now, updateDate: now});

  console.log(`+ event beer: ${beerId}`);
}

async function main() {
  const file = Bun.file(DATA_FILE);
  const data: LoadData[] = await file.json();

  console.log(`Importing ${data.length} beers for event ${EVENT_ID} from ${DATA_FILE}`);

  for (const d of data) {
    const brewery = await findOrCreateBrewery(d.brewery);
    const style = await findOrCreateStyle(d.style);

    if (!brewery || !style) {
      console.log(`Something weird with ${d.name}`);
      continue;
    }

    const beer = await findOrCreateBeer(d.name, d.abv, brewery.id, style.id);
    await ensureBeerAtEvent(beer.id, EVENT_ID);
  }

  console.log('Import complete');
  process.exit(0);
}

main();
