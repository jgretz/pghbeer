import type {SheetRow} from './sheet.ts';

export type ErrorEntry = {
  timestamp: string;
  brewery: string;
  rowIndex: number;
  raw: {k: string; m: string; n: string};
  reason: string;
};

export type ReviewEntry = {
  brewery: string;
  name: string;
  field: 'abv' | 'style';
  value: string | number | null;
  sources: string[];
};

/** A cell the pipeline couldn't turn into beers (or a failed batch). */
export function errorEntry(row: SheetRow, reason: string): ErrorEntry {
  return {
    timestamp: row.timestamp,
    brewery: row.brewery,
    rowIndex: row.rowIndex,
    raw: {k: row.beerListRaw, m: row.naRaw, n: row.specialRaw},
    reason,
  };
}

/** A value worth eyeballing — web-enriched, or still missing after enrichment. */
export function reviewEntry(
  brewery: string,
  name: string,
  field: 'abv' | 'style',
  value: string | number | null,
  sources: string[],
): ReviewEntry {
  return {brewery, name, field, value, sources};
}

export type Report = {
  generatedAt: string;
  eventId: number;
  errors: ErrorEntry[];
  review: ReviewEntry[];
};

/** Write the human-facing report: cells that couldn't be parsed, and values to spot-check. */
export async function writeReport(
  path: string,
  data: {eventId: number; errors: ErrorEntry[]; review: ReviewEntry[]},
): Promise<void> {
  const report: Report = {generatedAt: new Date().toISOString(), ...data};
  await Bun.write(path, JSON.stringify(report, null, 2) + '\n');
}
