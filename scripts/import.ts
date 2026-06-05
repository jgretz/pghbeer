import {createDatabase} from 'database';

import {
  ensureBeerAtEvent,
  findOrCreateBeer,
  findOrCreateBrewery,
  findOrCreateStyle,
} from './lib/upsert.ts';

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

const deps = {db: createDatabase(DATABASE_URL)};

async function main() {
  const data: LoadData[] = await Bun.file(DATA_FILE).json();

  console.log(`Importing ${data.length} beers for event ${EVENT_ID} from ${DATA_FILE}`);

  for (const d of data) {
    const brewery = await findOrCreateBrewery(deps, d.brewery);
    const style = await findOrCreateStyle(deps, d.style);
    const beer = await findOrCreateBeer(deps, {
      name: d.name,
      abv: d.abv,
      breweryId: brewery.id,
      styleId: style.id,
    });
    await ensureBeerAtEvent(deps, beer.id, EVENT_ID);
  }

  console.log('Import complete');
  process.exit(0);
}

main();
