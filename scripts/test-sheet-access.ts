import {listSheetTitles, readSheetValues, getAccessToken} from 'google-sheets';

const SPREADSHEET_ID = '1z72xbr5QMxGOAHYKL5rqRUVtLoVvmGNkceUqX5xgS7w';
const TARGET_GID = 550756003;

const SHEETS_API_BASE = 'https://sheets.googleapis.com/v4/spreadsheets';

type SheetsPropertiesResponse = {
  sheets?: Array<{properties?: {title?: string; sheetId?: number}}>;
};

/**
 * Resolve a tab's title from its gid (`sheetId`). `listSheetTitles` only
 * requests `sheets.properties.title`, so it cannot map gid -> title; fetch the
 * `sheetId` alongside the title directly via the already-minted access token.
 */
async function resolveTitleForGid(gid: number): Promise<string> {
  const token = await getAccessToken();
  const res = await fetch(
    `${SHEETS_API_BASE}/${SPREADSHEET_ID}?fields=sheets.properties(title,sheetId)`,
    {headers: {Authorization: `Bearer ${token}`}},
  );

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Sheets spreadsheets.get for ${SPREADSHEET_ID} failed (${res.status}): ${body}`);
  }

  const data = (await res.json()) as SheetsPropertiesResponse;
  const match = (data.sheets ?? []).find((sheet) => sheet.properties?.sheetId === gid);
  const title = match?.properties?.title;

  if (!title) {
    throw new Error(`tab gid ${gid} not found in spreadsheet ${SPREADSHEET_ID}`);
  }

  return title;
}

async function main() {
  const titles = await listSheetTitles({spreadsheetId: SPREADSHEET_ID});
  console.log(`Tabs (${titles.length}): ${titles.join(', ')}`);

  const title = await resolveTitleForGid(TARGET_GID);
  console.log(`Target tab gid ${TARGET_GID} -> "${title}"`);

  const rows = await readSheetValues({spreadsheetId: SPREADSHEET_ID, range: `${title}!1:5`});
  console.log(`First ${rows.length} rows of "${title}":`);
  for (const row of rows) {
    console.log(row.join(' | '));
  }

  process.exit(0);
}

main().catch((error) => {
  console.error('test:sheet-access failed:', error);
  process.exit(1);
});
