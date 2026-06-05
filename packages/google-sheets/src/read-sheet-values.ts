import {fetchSheetsJson} from './request.ts';
import type {ReadSheetValuesOptions, SheetsDeps} from './types.ts';

/**
 * Read a 2D array of cell values from a sheet range via Sheets API v4
 * `spreadsheets.values.get`. The token boundary is injectable via `deps` for
 * testing; it defaults to the real access-token provider.
 */
export async function readSheetValues(
  opts: ReadSheetValuesOptions,
  deps?: Partial<SheetsDeps>,
): Promise<string[][]> {
  const {spreadsheetId, range} = opts;
  const data = await fetchSheetsJson<{values?: string[][]}>(
    `${spreadsheetId}/values/${encodeURIComponent(range)}`,
    `values.get for ${spreadsheetId}!${range}`,
    deps,
  );

  return data.values ?? [];
}
