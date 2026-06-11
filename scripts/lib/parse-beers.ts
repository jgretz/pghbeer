import {detectNa} from './classify.ts';

export type ParsedBeer = {name: string; style: string | null; abv: number | null; isNa: boolean};

export type ParseResult =
  | {ok: true; beers: ParsedBeer[]}
  // no-beers: legitimately nothing to import (TBD / empty / non-beer vendor) → brewery only.
  // unparseable: there IS content but the deterministic patterns can't structure it → runway.
  | {ok: false; reason: 'no-beers' | 'unparseable'; raw: string};

/** Parse an ABV token: `5.3`, `6.4%`, `<0.5`, `5-6%` (low end), trailing `abv`. */
export function parseAbv(s: string): number | null {
  const t = s.trim();
  if (!t) return null;
  const lt = t.match(/<\s*(\d{1,2}(?:\.\d{1,2})?)/); // "<0.5"
  if (lt) return Number(lt[1]);
  const range = t.match(/(\d{1,2}(?:\.\d{1,2})?)\s*[-–]\s*\d{1,2}(?:\.\d{1,2})?\s*%?/); // "5-6%"
  if (range) return Number(range[1]);
  const m = t.match(/(\d{1,2}(?:\.\d{1,2})?)\s*%?/);
  return m ? Number(m[1]) : null;
}

/** Split a trailing ABV off a bare `Name 5.5%` / `Name 13.7` segment. */
function splitTrailingAbv(seg: string): {name: string; abv: number | null} {
  const m = seg.match(/^(.+?)[\s,]+(<?\s*\d{1,2}(?:\.\d{1,2})?\s*%?(?:\s*abv)?)\.?$/i);
  if (m && /\d/.test(m[2]!)) return {name: m[1]!.trim(), abv: parseAbv(m[2]!)};
  return {name: seg.trim(), abv: null};
}

/** Pull an end-anchored ABV off a `style abv%` fragment; the rest is the style. */
function trailingAbv(str: string): {style: string | null; abv: number | null} {
  const s = str.trim();
  const m = s.match(
    /^(.*?)[\s,–-]*(<\s*\d{1,2}(?:\.\d{1,2})?|\d{1,2}(?:\.\d{1,2})?)\s*%?(?:\s*abv)?\)?\.?$/i,
  );
  if (m) {
    const style = m[1]!.replace(/[\s,–-]+$/, '').trim();
    return {style: style || null, abv: parseAbv(m[2]!)};
  }
  return {style: s || null, abv: null};
}

const beer = (name: string, style: string | null, abv: number | null, raw: string): ParsedBeer => ({
  name: name.trim(),
  style: style && style.trim() ? style.trim() : null,
  abv,
  isNa: detectNa(raw),
});

const pureAbvRe = /^<?\s*\d{1,2}(?:\.\d{1,2})?\s*%?(?:\s*abv)?$/i;

/** Parse one beer segment into fields, or null when no pattern applies (→ punt the cell). */
function parseSegment(rawSeg: string): ParsedBeer | null {
  const seg = rawSeg
    .trim()
    .replace(/^\((.*)\)$/, '$1')
    .trim();
  if (!seg) return null;

  // name, style, abv  /  name, abv  — comma-delimited fields with a trailing abv token.
  // Used when a slash separates beers (see splitSegments) so the comma is the field sep.
  if (seg.includes(',')) {
    const parts = seg.split(',').map((p) => p.trim()).filter(Boolean);
    const last = parts.at(-1);
    if ((parts.length === 2 || parts.length === 3) && parts[0] && last && pureAbvRe.test(last)) {
      const style = parts.length === 3 ? parts[1]! : null;
      return beer(parts[0]!, style, parseAbv(last), seg);
    }
  }

  // name / style / abv   (space-padded slash only, so "N/A" is not a field separator)
  if (/\s\/\s/.test(seg)) {
    const parts = seg.split(/\s*\/\s*/).map((p) => p.trim());
    if (parts.length >= 2 && parts[0]) {
      const abv = parts.length >= 3 ? parseAbv(parts[2]!) : null;
      return beer(parts[0]!, parts[1] ?? null, abv, seg);
    }
  }

  // name | style | abv
  if (/\s\|\s/.test(seg)) {
    const parts = seg.split(/\s*\|\s*/).map((p) => p.trim());
    if (parts.length >= 2 && parts[0]) {
      const abv = parts.length >= 3 ? parseAbv(parts[2]!) : null;
      return beer(parts[0]!, parts[1] ?? null, abv, seg);
    }
  }

  // name (inner) tail  — e.g. "NZ HAHPS (6.6%) west-coast IPA", "Arlington (Grodziskie - 3.6%)"
  const paren = seg.match(/^(.+?)\s*\(([^)]*)\)\s*(.*)$/);
  if (paren && paren[1]!.trim()) {
    const name = paren[1]!.trim();
    const inner = paren[2]!.trim();
    const tail = paren[3]!.trim();
    // Multiple beers in one cell ("A (..) and B (..)") — too messy to split here; punt.
    if (tail.includes('(') || /\band\b/i.test(tail)) return null;
    if (tail) return beer(name, tail, parseAbv(inner), seg); // "name (abv%) style"
    if (parseAbv(inner) === null && !/\d/.test(inner)) return null; // non-abv prose (Flavors:…) → punt
    if (inner.includes('-')) {
      const [s, a] = inner.split(/\s*[-–]\s*/);
      return beer(name, s ?? null, parseAbv(a ?? ''), seg); // "style - abv" inside parens
    }
    const ts = trailingAbv(inner); // "Gose 5%" → style "Gose", abv 5
    return beer(name, ts.style, ts.abv, seg);
  }

  // name - style abv%   /   name - style - abv%   /   name - abv%
  if (/\s[-–]\s/.test(seg)) {
    const idx = seg.search(/\s[-–]\s/);
    const name = seg.slice(0, idx).trim();
    const remainder = seg.slice(idx).replace(/^\s*[-–]\s*/, '');
    const ts = trailingAbv(remainder);
    if (name) return beer(name, ts.style, ts.abv, seg);
  }

  // bare "Name 5.5%" — trailing abv, no style/delimiter (style → enrichment)
  const trailing = splitTrailingAbv(seg);
  if (trailing.abv !== null && trailing.name) return beer(trailing.name, null, trailing.abv, seg);

  // No delimiter and no abv: a fused "Name Style" or a lone name — too ambiguous to
  // split deterministically. Punt the whole cell to runway (which separates + enriches).
  return null;
}

/** Split a cell into per-beer segments using the first applicable strategy. */
function splitSegments(text: string): string[] {
  // Penn-style: "A 0.5. B 5.3. C 13.7." — multiple "<number>. " separators, one line.
  if (!/[\n|]/.test(text) && (text.match(/\d\.\s/g) ?? []).length >= 2) {
    const segs = text.split(/(?<=\d)\.\s+/).map((s) => s.replace(/\.$/, '').trim());
    if (segs.length >= 2) return segs.filter(Boolean);
  }
  if (text.includes('---'))
    return text
      .split(/\s*---\s*/)
      .map((s) => s.trim())
      .filter(Boolean);
  if (/\n/.test(text))
    return text
      .split(/\n+/)
      .map((s) => s.trim())
      .filter(Boolean);
  // "title, style, abv / title, style, abv" — slash separates beers, comma separates
  // fields within each. Only when every slash-group carries a comma, so a lone
  // "name / style / abv" beer (no commas) still parses as a single beer below.
  if (/\s\/\s/.test(text)) {
    const groups = text
      .split(/\s*\/\s*/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (groups.length >= 2 && groups.every((g) => g.includes(','))) return groups;
  }
  // Parenthetical blocks: "(a / b / c) (d / e / f)"
  if (/^\s*\(.*\)\s*$/.test(text) && (text.match(/\(/g) ?? []).length >= 2) {
    return [...text.matchAll(/\(([^)]+)\)/g)].map((m) => m[1]!.trim());
  }
  // "a | b | c & d | e | f" — only treat & as a separator when pipes are present.
  if (text.includes('&') && text.includes('|')) {
    return text
      .split(/\s*&\s*/)
      .map((s) => s.trim())
      .filter(Boolean);
  }
  // Comma list — only when each part carries an abv token or a field delimiter.
  if (text.includes(',')) {
    const parts = text
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    if (parts.length >= 2 && parts.every((p) => /\d/.test(p) || /[/|]|\s[-–]\s/.test(p))) {
      return parts;
    }
  }
  return [text.trim()];
}

const vendorRe = /\b(jewelry|stickers?|magnets?|vendor|merch)\b/i;

/** Parse a free-text beer-list cell (col K, or M/N) into beers. */
export function parseBeerCell(raw: string): ParseResult {
  const text = raw.trim();
  if (!text) return {ok: false, reason: 'no-beers', raw};
  if (/^tbd\b/i.test(text)) return {ok: false, reason: 'no-beers', raw};
  // Non-beer vendor row with no ABV anywhere → brewery only.
  if (vendorRe.test(text) && !/\d{1,2}(?:\.\d{1,2})?\s*%/.test(text)) {
    return {ok: false, reason: 'no-beers', raw};
  }

  const segments = splitSegments(text);
  const beers: ParsedBeer[] = [];
  for (const seg of segments) {
    const parsed = parseSegment(seg);
    if (!parsed) return {ok: false, reason: 'unparseable', raw}; // any failed segment → runway
    beers.push(parsed);
  }
  if (beers.length === 0) return {ok: false, reason: 'no-beers', raw};
  return {ok: true, beers};
}

const noiseRe = /^(option\s*\d+|n\.?\/?a|yes|no|none|tbd|maybe|tba)$/i;

/** True when an M/N cell is form-noise ("Option 1", "N/A", …) rather than a beer. */
export function isNoiseCell(text: string): boolean {
  const t = text.trim();
  return !t || noiseRe.test(t);
}

/** Canonical name key for cross-column dedup. */
export function normalizeName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '');
}

/** Drop `extra` beers whose name already appears in `primary` (same brewery). */
export function dedupeBeers(primary: ParsedBeer[], extra: ParsedBeer[]): ParsedBeer[] {
  const seen = new Set(primary.map((b) => normalizeName(b.name)));
  return extra.filter((b) => {
    const key = normalizeName(b.name);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
