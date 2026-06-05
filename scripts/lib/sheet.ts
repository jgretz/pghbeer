import {getAccessToken, readSheetValues} from 'google-sheets';

const SHEETS_API_BASE = 'https://sheets.googleapis.com/v4/spreadsheets';

// Fixed column indices in the festival form's "Form Responses 1" tab.
const COL = {timestamp: 0, brewery: 1, beerList: 10, na: 12, special: 13} as const;

export type SheetRow = {
  rowIndex: number; // 1-based sheet row (header = 1)
  timestamp: string; // col A
  brewery: string; // col B
  beerListRaw: string; // col K
  naRaw: string; // col M
  specialRaw: string; // col N
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

/** Guard against silent column drift before trusting the fixed indices. */
function assertHeader(header: string[]): void {
  const b = (header[COL.brewery] ?? '').toLowerCase();
  const k = (header[COL.beerList] ?? '').toLowerCase();
  if (!b.includes('brewery') || !k.includes('beer')) {
    throw new Error(
      `unexpected sheet header — col B="${header[COL.brewery]}", col K="${header[COL.beerList]}". ` +
        'The form columns may have changed; update scripts/lib/sheet.ts COL indices.',
    );
  }
}

/** Read the festival form responses into typed rows (header row excluded). */
export async function fetchFormRows(deps: {
  spreadsheetId: string;
  gid: number;
}): Promise<SheetRow[]> {
  const title = await resolveTitleForGid(deps.spreadsheetId, deps.gid);
  const values = await readSheetValues({
    spreadsheetId: deps.spreadsheetId,
    range: `${title}!A1:N1000`,
  });
  if (values.length === 0) return [];

  assertHeader(values[0]!);

  return values.slice(1).flatMap((row, i): SheetRow[] => {
    const at = (idx: number) => (row[idx] ?? '').trim();
    const brewery = at(COL.brewery);
    if (!brewery) return []; // skip blank trailing rows
    return [
      {
        rowIndex: i + 2, // +1 header, +1 to 1-base
        timestamp: at(COL.timestamp),
        brewery,
        beerListRaw: at(COL.beerList),
        naRaw: at(COL.na),
        specialRaw: at(COL.special),
      },
    ];
  });
}
