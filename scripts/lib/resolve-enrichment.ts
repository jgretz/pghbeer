import type {ParsedBeer} from './parse-beers.ts';
import {beerKey, type Ledger} from './state.ts';
import {
  enrichBatch,
  safeBatch,
  type EnrichBatchItem,
  type EnrichResult,
  type RunwayDeps,
} from './runway-batch.ts';
import {reviewEntry, type ReviewEntry} from './report.ts';
import type {FreshRow} from './plan.ts';

type EnrichTarget = {row: FreshRow; beer: ParsedBeer; brewery: string};

/**
 * Web-enrich beers missing style/abv. Cache hits are applied inline; the rest
 * go through one batch. Returns review notes (filled values + values still
 * missing afterward) and updates the ledger's enrichment cache.
 */
export async function resolveEnrichment(
  fresh: FreshRow[],
  ledger: Ledger,
  runway: RunwayDeps,
): Promise<ReviewEntry[]> {
  const review: ReviewEntry[] = [];
  const jobs = new Map<string, EnrichBatchItem>(); // dedup by beerKey
  const targets = new Map<string, EnrichTarget[]>();

  for (const f of fresh) {
    for (const beer of f.beers) {
      if (beer.style !== null && beer.abv !== null) continue;
      const key = beerKey(f.row.brewery, beer.name);
      const cached = ledger.enrichment[key];
      if (cached) {
        review.push(...fillBeer(beer, cached, f.row.brewery));
        continue;
      }
      jobs.set(key, {
        key,
        brewery: f.row.brewery,
        name: beer.name,
        style: beer.style,
        abv: beer.abv,
      });
      targets.set(key, [...(targets.get(key) ?? []), {row: f, beer, brewery: f.row.brewery}]);
    }
  }
  if (jobs.size === 0) return review;

  console.log(`Runway enrich batch: ${jobs.size} beer(s) missing style/abv`);
  const {results, failed} = await safeBatch(
    () => enrichBatch(runway, [...jobs.values()]),
    'enrich',
  );
  for (const [key, group] of targets) {
    review.push(...applyEnrichResult(key, group, results.get(key), ledger, failed));
  }
  return review;
}

/** Apply one beerKey's enrichment result (or record it unresolved) across its targets. */
function applyEnrichResult(
  key: string,
  group: EnrichTarget[],
  res: EnrichResult | undefined,
  ledger: Ledger,
  failed: boolean,
): ReviewEntry[] {
  if (res) {
    ledger.enrichment[key] = {
      style: res.style,
      abv: res.abv,
      isNa: res.isNa,
      sources: res.sources,
      at: new Date().toISOString(),
    };
    return group.flatMap((t) => fillBeer(t.beer, res, t.brewery));
  }
  // Batch infra failure → flag the rows so a later run retries them. A genuine
  // "not found" (batch ok, no result) just leaves the values null for review.
  if (failed) for (const t of group) t.row.error = true;
  return group.flatMap((t) => unconfirmed(t.beer, t.brewery));
}

/** Fill a beer's null fields from an enrichment result; return what was filled. */
function fillBeer(
  beer: ParsedBeer,
  res: {style: string | null; abv: number | null; isNa: boolean; sources: string[]},
  brewery: string,
): ReviewEntry[] {
  const notes: ReviewEntry[] = [];
  if (beer.style === null && res.style) {
    beer.style = res.style;
    notes.push(reviewEntry(brewery, beer.name, 'style', res.style, res.sources));
  }
  if (beer.abv === null && res.abv !== null) {
    beer.abv = res.abv;
    notes.push(reviewEntry(brewery, beer.name, 'abv', res.abv, res.sources));
  }
  beer.isNa = beer.isNa || res.isNa;
  return notes;
}

/** Review notes for fields still missing after enrichment (imported as null / "Unknown"). */
function unconfirmed(beer: ParsedBeer, brewery: string): ReviewEntry[] {
  const notes: ReviewEntry[] = [];
  if (beer.style === null) notes.push(reviewEntry(brewery, beer.name, 'style', null, []));
  if (beer.abv === null) notes.push(reviewEntry(brewery, beer.name, 'abv', null, []));
  return notes;
}
