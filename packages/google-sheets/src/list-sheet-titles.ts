import {getAccessToken} from './auth.ts';
import type {SheetsDeps, SheetTitlesOptions} from './types.ts';

const SHEETS_API_BASE = 'https://sheets.googleapis.com/v4/spreadsheets';

type SheetsGetResponse = {
  sheets?: Array<{properties?: {title?: string}}>;
};

/**
 * List the tab/sheet titles of a spreadsheet via Sheets API v4
 * `spreadsheets.get`, requesting only `sheets.properties.title`. The token
 * boundary is injectable via `deps`; it defaults to the real
 * {@link getAccessToken}.
 */
export async function listSheetTitles(
  opts: SheetTitlesOptions,
  deps?: Partial<SheetsDeps>,
): Promise<string[]> {
  const resolveToken = deps?.getAccessToken ?? getAccessToken;
  const token = await resolveToken();

  const {spreadsheetId} = opts;
  const url = `${SHEETS_API_BASE}/${spreadsheetId}?fields=sheets.properties.title`;

  const res = await fetch(url, {
    headers: {Authorization: `Bearer ${token}`},
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Sheets spreadsheets.get failed (${res.status}) for ${spreadsheetId}: ${body}`);
  }

  const data = (await res.json()) as SheetsGetResponse;
  return (data.sheets ?? [])
    .map((sheet) => sheet.properties?.title)
    .filter((title): title is string => Boolean(title));
}
