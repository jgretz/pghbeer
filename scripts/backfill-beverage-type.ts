import {config} from 'dotenv';
config({path: '.env'});

import {createDatabase, beers, styles} from 'database';
import {eq, sql} from 'drizzle-orm';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) throw new Error('DATABASE_URL is required');

const db = createDatabase(DATABASE_URL);

// Style name patterns → beverage type
const wineStyles = [
  'cabernet sauvignon',
  'dry red',
  'dry rose',
  "dry rose'",
  'dry white',
  'malbec',
  'rose',
  'sauvignon blanc',
  'semi dry white',
  'semi-dry white',
  'sweet fruit',
];

const meadStyles = ['mead', 'sparkling mead'];

const cocktailStyles = ['cocktail', 'whiskey'];

const ciderStyles = [
  'cider',
  'cider ale',
  'hard cider',
  'hot honey cider',
  'off dry hard apple cider',
  'semi sweet hard apple cider with fresh celery seed',
];

const seltzerStyles = [
  'hard seltzer',
  'grape lemonade fruited hard seltzer',
  'raspberry seltzer',
  'smoothie seltzer',
];

const hardTeaStyles = [
  'hard tea',
  'hard iced tea with a hint of citrus for yinz. steam-brewed and fizz-free!',
];

const naStyles = [
  'non-alc kolsch',
  'non-alcoholic',
  'non-alcoholic beer',
  'non-alcoholic ginger beer',
  'non-alcoholic mango guava wheat',
];

function classifyStyle(styleName: string): {type: string; isNa: boolean} {
  const lower = styleName.toLowerCase().trim();

  if (naStyles.includes(lower)) return {type: 'beer', isNa: true};
  if (wineStyles.includes(lower)) return {type: 'wine', isNa: false};
  if (meadStyles.includes(lower)) return {type: 'mead', isNa: false};
  if (cocktailStyles.includes(lower)) return {type: 'cocktail', isNa: false};
  if (ciderStyles.includes(lower)) return {type: 'cider', isNa: false};
  if (seltzerStyles.includes(lower)) return {type: 'seltzer', isNa: false};
  if (hardTeaStyles.includes(lower)) return {type: 'hard_tea', isNa: false};

  return {type: 'beer', isNa: false};
}

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
