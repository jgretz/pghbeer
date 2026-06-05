import {getAccessToken} from './auth.ts';
import type {SheetsDeps} from './types.ts';

const SHEETS_API_BASE = 'https://sheets.googleapis.com/v4/spreadsheets';

/**
 * Perform an authenticated GET against the Sheets API v4 and return the parsed
 * JSON body. The token boundary is injectable via `deps` for testing; it
 * defaults to the real {@link getAccessToken}. On a non-2xx response, throws an
 * error including the HTTP status and response body (per error-handling rules).
 *
 * @param path - request path relative to {@link SHEETS_API_BASE}
 * @param context - operation label woven into the error message
 */
export async function fetchSheetsJson<T>(
  path: string,
  context: string,
  deps?: Partial<SheetsDeps>,
): Promise<T> {
  const resolveToken = deps?.getAccessToken ?? getAccessToken;
  const token = await resolveToken();

  const res = await fetch(`${SHEETS_API_BASE}/${path}`, {
    headers: {Authorization: `Bearer ${token}`},
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Sheets ${context} failed (${res.status}): ${body}`);
  }

  return (await res.json()) as T;
}
