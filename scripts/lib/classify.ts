import {join} from 'node:path';

import type {BeverageType} from 'database';

export type Classification = {type: BeverageType; isNa: boolean};

type SeedEntry = {type: BeverageType; isNa?: boolean};

/** The checked-in historical lookup table (scripts/data/style-types.json). */
export type StyleSeed = {
  exact: Record<string, SeedEntry>;
  keywords: Array<{includes: string} & SeedEntry>;
};

const SEED_PATH = join(import.meta.dir, '../data/style-types.json');

/** Load the historical style→type seed. Kept as data so it can grow without code changes. */
export async function loadStyleSeed(path: string = SEED_PATH): Promise<StyleSeed> {
  const raw = (await Bun.file(path).json()) as StyleSeed & {_comment?: string};
  return {exact: raw.exact, keywords: raw.keywords};
}

/** Lowercase, trim, collapse internal whitespace — the canonical key for a style name. */
export function normalizeStyle(style: string): string {
  return style.toLowerCase().trim().replace(/\s+/g, ' ');
}

function toClassification(e: SeedEntry): Classification {
  return {type: e.type, isNa: e.isNa ?? false};
}

/**
 * Build the exact-match history map from the seed plus any accumulated cache
 * (ledger entries override seed entries for the same normalized style).
 */
export function buildHistory(
  exact: Record<string, SeedEntry>,
  cache: Record<string, SeedEntry> = {},
): Map<string, Classification> {
  const map = new Map<string, Classification>();
  for (const [k, v] of Object.entries(exact)) map.set(normalizeStyle(k), toClassification(v));
  for (const [k, v] of Object.entries(cache)) map.set(normalizeStyle(k), toClassification(v));
  return map;
}

/**
 * Match a style against the exact history first, then the ordered substring
 * keywords. Returns null when nothing matches — the caller falls back to the
 * LLM classify batch.
 */
export function matchStyle(
  style: string,
  history: Map<string, Classification>,
  keywords: StyleSeed['keywords'],
): Classification | null {
  const norm = normalizeStyle(style);
  const exact = history.get(norm);
  if (exact) return exact;
  for (const kw of keywords) {
    if (norm.includes(normalizeStyle(kw.includes))) return toClassification(kw);
  }
  return null;
}

// Free-text NA markers for the sheet importer — brewers write NA beers as
// "Free For All NA IPA", "<0.5%", "Non-Alc ...", "seltzer water", etc.
const naMarker =
  /\b(n\.?\/?a|non[ -]?alc(?:oholic)?|0\.0\s*%?|<\s*0\.5|alcohol[ -]?free|seltzer water|hop water|sparkling\b[^,;]*\bwater)\b/i;

/** True when free text looks like a non-alcoholic / NA / water entry. */
export function detectNa(text: string): boolean {
  return naMarker.test(text);
}
