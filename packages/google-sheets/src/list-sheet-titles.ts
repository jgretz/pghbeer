import {fetchSheetsJson} from './request.ts';
import type {SheetsDeps, SheetTitlesOptions} from './types.ts';

type SheetsGetResponse = {
  sheets?: Array<{properties?: {title?: string}}>;
};

/**
 * List the tab/sheet titles of a spreadsheet via Sheets API v4
 * `spreadsheets.get`, requesting only `sheets.properties.title`. The token
 * boundary is injectable via `deps`; it defaults to the real access-token
 * provider.
 */
export async function listSheetTitles(
  opts: SheetTitlesOptions,
  deps?: Partial<SheetsDeps>,
): Promise<string[]> {
  const {spreadsheetId} = opts;
  const data = await fetchSheetsJson<SheetsGetResponse>(
    `${spreadsheetId}?fields=sheets.properties.title`,
    `spreadsheets.get for ${spreadsheetId}`,
    deps,
  );

  return (data.sheets ?? [])
    .map((sheet) => sheet.properties?.title)
    .filter((title): title is string => Boolean(title));
}
