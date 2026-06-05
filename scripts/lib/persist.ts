import {classifyStyle, detectNa} from './classify.ts';
import type {ParsedBeer} from './parse-beers.ts';
import type {FreshRow, Plan} from './plan.ts';
import {rowHash, rowKey, type Ledger, type RowStatus} from './state.ts';
import {findOrCreateBrewery, upsertEventBeer, type UpsertDeps} from './upsert.ts';

const UNKNOWN_STYLE = 'Unknown';

/** Persist every row to the DB and update the ledger; returns the beer-link count. */
export async function persist(
  deps: UpsertDeps,
  plan: Plan,
  ledger: Ledger,
  eventId: number,
): Promise<number> {
  let count = 0;
  for (const f of plan.fresh) {
    count += await importRow(deps, f.row.brewery, f.beers, eventId);
    ledger.rows[rowKey(f.row)] = {
      hash: rowHash(f.row),
      status: freshStatus(f),
      beers: f.beers,
      parsedAt: new Date().toISOString(),
    };
  }
  for (const c of plan.cached) {
    count += await importRow(deps, c.row.brewery, c.beers, eventId);
  }
  return count;
}

function freshStatus(f: FreshRow): RowStatus {
  if (f.error) return 'error';
  return f.beers.length > 0 ? 'parsed' : 'no-beers';
}

/** Find-or-create the brewery, then upsert each beer (with its style) onto the event. */
async function importRow(
  deps: UpsertDeps,
  breweryName: string,
  beers: ParsedBeer[],
  eventId: number,
): Promise<number> {
  const brewery = await findOrCreateBrewery(deps, breweryName);
  for (const beer of beers) await importBeer(deps, brewery.id, beer, eventId);
  return beers.length;
}

/** Resolve a beer's style/beverage-type/NA and upsert it onto the event. */
async function importBeer(
  deps: UpsertDeps,
  breweryId: number,
  beer: ParsedBeer,
  eventId: number,
): Promise<void> {
  const styleName = beer.style ?? UNKNOWN_STYLE;
  const cls = classifyStyle(styleName);
  await upsertEventBeer(deps, {
    name: beer.name,
    abv: beer.abv,
    breweryId,
    styleName,
    isNa: beer.isNa || cls.isNa || detectNa(`${beer.name} ${styleName}`),
    beverageType: cls.type,
    eventId,
  });
}
