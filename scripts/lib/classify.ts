import type {BeverageType} from 'database';

// Style name → beverage type, matched exactly (lowercased/trimmed). Extracted
// verbatim from backfill-beverage-type.ts so that script's behavior is unchanged.
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

/**
 * Classify a style name into a beverage type + NA flag by exact-match lists.
 * Behavior is identical to the original in backfill-beverage-type.ts; the only
 * change is the return `type` is narrowed to {@link BeverageType}.
 */
export function classifyStyle(styleName: string): {type: BeverageType; isNa: boolean} {
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

// Free-text NA markers for the sheet importer — brewers write NA beers as
// "Free For All NA IPA", "<0.5%", "Non-Alc ...", "seltzer water", etc. Kept
// separate from classifyStyle so the backfill script's exact-match stays intact.
const naMarker =
  /\b(n\.?\/?a|non[ -]?alc(?:oholic)?|0\.0\s*%?|<\s*0\.5|alcohol[ -]?free|seltzer water|hop water|sparkling\b[^,;]*\bwater)\b/i;

/** True when free text looks like a non-alcoholic / NA / water entry. */
export function detectNa(text: string): boolean {
  return naMarker.test(text);
}
