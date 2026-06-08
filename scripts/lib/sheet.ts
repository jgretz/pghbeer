import {getAccessToken, readSheetValues} from 'google-sheets';

const SHEETS_API_BASE = 'https://sheets.googleapis.com/v4/spreadsheets';

/** Zero-based column indices for a form's beer-bearing cells (layout varies per form). */
export type ColumnMap = {
  timestamp: number;
  brewery: number;
  beerList: number;
  na: number;
  special: number;
};

/** A single Google Form's response sheet, with its layout and ledger namespace. */
export type SheetSource = {
  name: string; // logging label
  spreadsheetId: string;
  gid: number;
  columns: ColumnMap;
  range: string; // e.g. 'A1:N1000' — column span depends on the form's layout
  header: {brewery: string; beer: string}; // expected lowercase header substrings (drift guard)
  keyPrefix: string; // ledger-key namespace ('' for the original sheet → preserves its ledger)
};

export type SheetRow = {
  rowIndex: number; // 1-based sheet row (header = 1)
  timestamp: string; // timestamp column
  brewery: string; // brewery/vendor column
  beerListRaw: string; // beer-list column
  naRaw: string; // NA column
  specialRaw: string; // special-requests column
  keyPrefix?: string; // ledger-key namespace, inherited from the source
};

type SheetsPropertiesResponse = {
  sheets?: Array<{properties?: {title?: string; sheetId?: number}}>;
};

/**
 * Resolve a tab's title from its gid. Mirrors test-sheet-access.ts — listSheetTitles
 * only requests titles, so fetch sheetId alongside title via the minted token.
 */
async function resolveTitleForGid(spreadsheetId: string, gid: number): Promise<string> {
  const token = await getAccessToken();
  const res = await fetch(
    `${SHEETS_API_BASE}/${spreadsheetId}?fields=sheets.properties(title,sheetId)`,
    {headers: {Authorization: `Bearer ${token}`}},
  );
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Sheets spreadsheets.get for ${spreadsheetId} failed (${res.status}): ${body}`);
  }
  const data = (await res.json()) as SheetsPropertiesResponse;
  const title = (data.sheets ?? []).find((s) => s.properties?.sheetId === gid)?.properties?.title;
  if (!title) throw new Error(`tab gid ${gid} not found in spreadsheet ${spreadsheetId}`);
  return title;
}

/** Guard against silent column drift before trusting the configured indices. */
function assertHeader(source: SheetSource, header: string[]): void {
  const {columns, header: want} = source;
  const b = (header[columns.brewery] ?? '').toLowerCase();
  const k = (header[columns.beerList] ?? '').toLowerCase();
  if (!b.includes(want.brewery) || !k.includes(want.beer)) {
    throw new Error(
      `unexpected header for "${source.name}" — brewery col="${header[columns.brewery]}", ` +
        `beer col="${header[columns.beerList]}". The form columns may have changed; ` +
        'update the source columns in scripts/import-from-sheet.ts.',
    );
  }
}

/** Read one form's responses into typed rows (header row excluded). */
export async function fetchFormRows(source: SheetSource): Promise<SheetRow[]> {
  const title = await resolveTitleForGid(source.spreadsheetId, source.gid);
  const values = await readSheetValues({
    spreadsheetId: source.spreadsheetId,
    range: `${title}!${source.range}`,
  });
  if (values.length === 0) return [];

  assertHeader(source, values[0]!);

  const {columns} = source;
  return values.slice(1).flatMap((row, i): SheetRow[] => {
    const at = (idx: number) => (row[idx] ?? '').trim();
    const brewery = at(columns.brewery);
    if (!brewery) return []; // skip blank trailing rows
    return [
      {
        rowIndex: i + 2, // +1 header, +1 to 1-base
        timestamp: at(columns.timestamp),
        brewery,
        beerListRaw: at(columns.beerList),
        naRaw: at(columns.na),
        specialRaw: at(columns.special),
        keyPrefix: source.keyPrefix,
      },
    ];
  });
}
