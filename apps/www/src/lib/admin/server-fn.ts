// SERVER-ONLY module. This file reads the admin API key from process.env and
// must never be imported into client code. It deliberately does NOT import
// lib/constants.ts (which exposes keys via import.meta.env client-side).
//
// Convention — each entity adds its OWN lib/admin/<entity>.ts, e.g.:
//   import {createServerFn} from '@tanstack/react-start';
//   import {adminFetch} from './server-fn';
//   export const listBreweries = createServerFn({method: 'GET'})
//     .handler(async () => (await adminFetch('/admin/breweries')).json());
// adminFetch only runs inside createServerFn handlers, so ADMIN_API_KEY stays
// server-side and is never bundled to the client. There is no shared client
// file — each entity wraps its own calls.

function resolveBaseUrl(): string {
  return (
    process.env.API_URL ?? process.env.VITE_API_URL ?? 'http://localhost:3001'
  );
}

function resolveApiKey(): string {
  return process.env.ADMIN_API_KEY ?? process.env.API_KEY ?? '';
}

export async function adminFetch(
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  const url = `${resolveBaseUrl()}${path}`;
  const key = resolveApiKey();

  const res = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
      ...init.headers,
    },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(
      `Admin API request failed: ${res.status} ${res.statusText} for ${path}${
        body ? ` — ${body}` : ''
      }`,
    );
  }

  return res;
}
