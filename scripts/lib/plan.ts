import {isNoiseCell, parseBeerCell, type ParsedBeer} from './parse-beers.ts';
import {rowHash, rowKey, type Ledger, type RowStatus} from './state.ts';
import type {SheetRow} from './sheet.ts';

/** A cell still owed to the runway parse batch. `primary` = the K beer-list column. */
export type PendingCell = {key: string; kind: 'primary' | 'extra'; raw: string};

/** A new/changed row whose beers are still being resolved across the runway phases. */
export type FreshRow = {
  row: SheetRow;
  beers: ParsedBeer[]; // accumulates deterministic + runway-parsed beers
  pending: PendingCell[]; // cells awaiting the runway parse batch
  error: boolean; // a primary cell or enrichment never resolved → retry next run
};

/** An unchanged row reused straight from the ledger (cheap re-upsert, no runway). */
export type CachedRow = {row: SheetRow; beers: ParsedBeer[]; status: RowStatus};

export type Plan = {fresh: FreshRow[]; cached: CachedRow[]};

/** Split rows into ledger cache-hits and fresh rows, deterministically parsing the latter. */
export function planRows(rows: SheetRow[], ledger: Ledger): Plan {
  const fresh: FreshRow[] = [];
  const cached: CachedRow[] = [];
  for (const row of rows) {
    const prev = ledger.rows[rowKey(row)];
    if (prev && prev.hash === rowHash(row) && prev.status !== 'error') {
      cached.push({row, beers: prev.beers, status: prev.status});
    } else {
      fresh.push(planFreshRow(row));
    }
  }
  return {fresh, cached};
}

/** Deterministically parse a row's K column; queue K (if messy) + M/N for runway. */
function planFreshRow(row: SheetRow): FreshRow {
  const beers: ParsedBeer[] = [];
  const pending: PendingCell[] = [];

  const k = parseBeerCell(row.beerListRaw);
  if (k.ok) beers.push(...k.beers);
  else if (k.reason === 'unparseable') {
    pending.push({key: `${rowKey(row)}|K`, kind: 'primary', raw: row.beerListRaw});
  }

  // M/N are mostly logistics prose; let the runway batch decide (it returns [] for
  // non-beers and extracts the rare misfiled beer, e.g. "Free For All NA IPA").
  for (const [col, raw] of [['M', row.naRaw] as const, ['N', row.specialRaw] as const]) {
    if (!isNoiseCell(raw)) pending.push({key: `${rowKey(row)}|${col}`, kind: 'extra', raw});
  }

  return {row, beers, pending, error: false};
}
