import {dedupeBeers, type ParsedBeer} from './parse-beers.ts';
import {parseBatch, safeBatch, type ParseBatchItem, type RunwayDeps} from './runway-batch.ts';
import {errorEntry, type ErrorEntry} from './report.ts';
import type {FreshRow} from './plan.ts';

/**
 * Run the single parse batch over every pending cell and fold its results back
 * into each fresh row. Returns the cells the runner couldn't turn into beers.
 */
export async function resolveParses(fresh: FreshRow[], runway: RunwayDeps): Promise<ErrorEntry[]> {
  const jobs: ParseBatchItem[] = fresh.flatMap((f) =>
    f.pending.map((c) => ({key: c.key, brewery: f.row.brewery, raw: c.raw})),
  );
  if (jobs.length === 0) return [];

  console.log(`Runway parse batch: ${jobs.length} cell(s)`);
  const {results, failed} = await safeBatch(() => parseBatch(runway, jobs), 'parse');
  return fresh.flatMap((f) => foldParses(f, results, failed));
}

/** Fold one row's parsed cells in: primary K appends, extra M/N dedups against K. */
function foldParses(
  f: FreshRow,
  results: Map<string, ParsedBeer[]>,
  failed: boolean,
): ErrorEntry[] {
  const errors: ErrorEntry[] = [];
  const extras: ParsedBeer[] = [];
  for (const cell of f.pending) {
    const beers = results.get(cell.key);
    if (beers === undefined) {
      // The runner never returned this key — genuinely unresolved.
      if (cell.kind === 'primary') f.error = true;
      errors.push(
        errorEntry(f.row, failed ? 'runway parse batch failed' : `cell ${cell.key} not parsed`),
      );
    } else if (cell.kind === 'primary') {
      f.beers.push(...beers);
    } else {
      extras.push(...beers); // beers.length === 0 (logistics) just contributes nothing
    }
  }
  f.beers.push(...dedupeBeers(f.beers, extras));
  f.pending = [];
  return errors;
}
