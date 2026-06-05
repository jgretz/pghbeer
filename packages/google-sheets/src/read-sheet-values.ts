import {getAccessToken} from './auth.ts';
import type {ReadSheetValuesOptions, SheetsDeps} from './types.ts';

const SHEETS_API_BASE = 'https://sheets.googleapis.com/v4/spreadsheets';

/**
 * Read a 2D array of cell values from a sheet range via Sheets API v4
 * `spreadsheets.values.get`. The token boundary is injectable via `deps` for
 * testing; it defaults to the real {@link getAccessToken}.
 */
export async function readSheetValues(
  opts: ReadSheetValuesOptions,
  deps?: Partial<SheetsDeps>,
): Promise<string[][]> {
  const resolveToken = deps?.getAccessToken ?? getAccessToken;
  const token = await resolveToken();

  const {spreadsheetId, range} = opts;
  const url = `${SHEETS_API_BASE}/${spreadsheetId}/values/${encodeURIComponent(range)}`;

  const res = await fetch(url, {
    headers: {Authorization: `Bearer ${token}`},
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(
      `Sheets values.get failed (${res.status}) for ${spreadsheetId}!${range}: ${body}`,
    );
  }

  const data = (await res.json()) as {values?: string[][]};
  return data.values ?? [];
}
