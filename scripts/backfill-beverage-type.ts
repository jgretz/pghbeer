import {config} from 'dotenv';
config({path: '.env'});

import {createDatabase, beers, styles} from 'database';
import {eq, sql} from 'drizzle-orm';

import {classifyStyle} from './lib/classify.ts';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) throw new Error('DATABASE_URL is required');

const db = createDatabase(DATABASE_URL);

async function main() {
  // Get all beers with their style names
  const rows = await db
    .select({
      beerId: beers.id,
      beerName: beers.name,
      styleName: styles.name,
    })
    .from(beers)
    .innerJoin(styles, eq(beers.styleId, styles.id));

  let updated = 0;
  const summary: Record<string, number> = {};

  for (const row of rows) {
    const {type, isNa} = classifyStyle(row.styleName);
    const key = isNa ? `${type} (NA)` : type;
    summary[key] = (summary[key] ?? 0) + 1;

    await db
      .update(beers)
      .set({
        beverageType: sql`${type}::beverage_type`,
        isNa,
        updateDate: new Date(),
      })
      .where(eq(beers.id, row.beerId));

    updated++;
  }

  console.log(`Updated ${updated} beers:`);
  for (const [type, count] of Object.entries(summary).sort()) {
    console.log(`  ${type}: ${count}`);
  }

  process.exit(0);
}

main();
