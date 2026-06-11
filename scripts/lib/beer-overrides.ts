// Hand-authored parse overrides for festival cells the deterministic + LLM
// parsers structure wrong — fused multi-beer names, descriptive prefixes
// ("Canned cocktails - …"), or ambiguous "&" that is a flavor name in one row
// and a list separator in the next. When a fresh row's cell matches an entry,
// these beers are used verbatim and the cell skips BOTH parse paths.
//
// Keyed by canonical brewery + the exact raw cell text (whitespace/case
// normalized). A non-matching override simply falls through to normal parsing,
// so a stale `raw` is safe — it just stops applying. Always pair an override
// with locking the resulting DB rows: a re-import that predates an override
// edit still must not clobber the admin correction.
//
// Style names here feed the existing classifier (e.g. "Cocktail" -> type
// cocktail); leave style/abv null to let enrichment fill them on a first import.

import type {ParsedBeer} from './parse-beers.ts';
import type {SheetRow} from './sheet.ts';

import {canonicalBreweryName} from './brewery-aliases.ts';

export type BeerOverride = {
  brewery: string; // raw or canonical sheet name — normalized through canonicalBreweryName
  raw: string; // the exact cell text this override replaces (normalized when matched)
  beers: ParsedBeer[];
};

const beer = (name: string, style: string | null, abv: number | null, isNa: boolean): ParsedBeer => ({
  name,
  style,
  abv,
  isNa,
});

export const BEER_OVERRIDES: BeerOverride[] = [
  {
    // K cell: "Canned cocktails -" is a descriptor; the two flavors each carry an "&".
    brewery: 'Lucky Sign Spirits',
    raw: 'Canned cocktails - Key Lime & Dill, Blood Orange & Rosemary',
    beers: [
      beer('Key Lime & Dill', 'Cocktail', null, false),
      beer('Blood Orange & Rosemary', 'Cocktail', null, false),
    ],
  },
  {
    // NA cell: a dash-joined list with a trailing "maybe more" that is not a beer.
    brewery: 'Lucky Sign Spirits',
    raw: 'Grapefruit Cucumber Dill - Watermelon Elderflower Basil - maybe more',
    beers: [
      beer('Grapefruit Cucumber Dill', 'Cocktail', null, true),
      beer('Watermelon Elderflower Basil', 'Cocktail', null, true),
    ],
  },
  {
    // K cell: comma list whose final item is joined with "&" -> three honey waters.
    brewery: 'Blume Honey Water',
    raw: 'Citrus Vanilla, Wild Blueberry & Ginger Zest',
    beers: [
      beer('Citrus Vanilla', 'Honey Water', 0, true),
      beer('Wild Blueberry', 'Honey Water', 0, true),
      beer('Ginger Zest', 'Honey Water', 0, true),
    ],
  },
];

const norm = (s: string): string => s.trim().toLowerCase().replace(/\s+/g, ' ');

const overrideKey = (brewery: string, raw: string): string =>
  `${norm(canonicalBreweryName(brewery))}\n${norm(raw)}`;

const INDEX = new Map<string, ParsedBeer[]>(
  BEER_OVERRIDES.map((o) => [overrideKey(o.brewery, o.raw), o.beers]),
);

/** The hand-authored beers for a (brewery, raw cell) override, or null if none. */
export function lookupOverride(brewery: string, raw: string): ParsedBeer[] | null {
  return INDEX.get(overrideKey(brewery, raw)) ?? null;
}

/** True when any of a row's beer-bearing cells has an override (forces a re-plan). */
export function rowHasOverride(row: SheetRow): boolean {
  return [row.beerListRaw, row.naRaw, row.specialRaw].some(
    (raw) => lookupOverride(row.brewery, raw) !== null,
  );
}
