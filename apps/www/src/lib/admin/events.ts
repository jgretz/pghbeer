// SERVER-ONLY module. Every server function here runs inside createServerFn,
// so the admin API key (read via adminFetch / process.env) stays server-side
// and is never bundled to the client. Do not import this into client-only code
// except to call the exported server functions (which marshal across the
// boundary) or the pure parseDeleteResponse helper.

import {createServerFn} from '@tanstack/react-start';
import {adminFetch} from './server-fn';

// Minimal row shapes mirroring @domain's EventRow / BeerListItem. The www app
// does not depend on @domain (avoids a workspace dep), so they are redeclared
// here in the lib/types.ts style.
export type EventRow = {
  id: number;
  name: string;
  date: string;
};

export type AdminBeer = {
  id: number;
  name: string;
  abv: number | null;
  beverageType: string;
  isNa: boolean;
  brewery: {id: number; name: string};
  style: {id: number; name: string};
};

export type DeleteEventResult =
  | {ok: true}
  | {ok: false; dependents: Record<string, number>};

// Pure, exported for unit testing without the Start runtime. Maps a delete
// response (status + parsed body) to the typed result. Any 2xx is success; a
// non-2xx carries the dependents map if present, else an empty map.
export function parseDeleteResponse(
  status: number,
  body: unknown,
): DeleteEventResult {
  if (status >= 200 && status < 300) return {ok: true};

  const dependents =
    body !== null &&
    typeof body === 'object' &&
    'dependents' in body &&
    typeof (body as {dependents: unknown}).dependents === 'object' &&
    (body as {dependents: unknown}).dependents !== null
      ? ((body as {dependents: Record<string, number>}).dependents)
      : {};

  return {ok: false, dependents};
}

export const listEvents = createServerFn({method: 'GET'}).handler(
  async (): Promise<EventRow[]> => (await adminFetch('/admin/events')).json(),
);

export const createEvent = createServerFn({method: 'POST'})
  .inputValidator((input: {name: string; date: string}) => input)
  .handler(
    async ({data}): Promise<EventRow> =>
      (
        await adminFetch('/admin/events', {
          method: 'POST',
          body: JSON.stringify(data),
        })
      ).json(),
  );

export const updateEvent = createServerFn({method: 'POST'})
  // Schema rejects partial updates — always send both name and date.
  .inputValidator((input: {id: number; name: string; date: string}) => input)
  .handler(
    async ({data}): Promise<EventRow> =>
      (
        await adminFetch(`/admin/events/${data.id}`, {
          method: 'PATCH',
          body: JSON.stringify({name: data.name, date: data.date}),
        })
      ).json(),
  );

// Raw fetch (not adminFetch): adminFetch throws on every non-2xx, discarding
// the structured 409 dependents payload. Replicate the ~2 lines of env
// resolution inline and branch via parseDeleteResponse.
export const deleteEvent = createServerFn({method: 'POST'})
  .inputValidator((input: {id: number}) => input)
  .handler(async ({data}): Promise<DeleteEventResult> => {
    const baseUrl =
      process.env.API_URL ??
      process.env.VITE_API_URL ??
      'http://localhost:3001';
    const key = process.env.ADMIN_API_KEY ?? process.env.API_KEY ?? '';

    const res = await fetch(`${baseUrl}/admin/events/${data.id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
    });

    const body = await res.json().catch(() => null);
    return parseDeleteResponse(res.status, body);
  });

export const listBeersForEvent = createServerFn({method: 'GET'})
  .inputValidator((input: {eventId: number}) => input)
  .handler(
    async ({data}): Promise<AdminBeer[]> =>
      (await adminFetch(`/admin/events/${data.eventId}/beers`)).json(),
  );

export const addBeerToEvent = createServerFn({method: 'POST'})
  .inputValidator((input: {eventId: number; beerId: number}) => input)
  .handler(async ({data}): Promise<{ok: true}> => {
    await adminFetch(`/admin/events/${data.eventId}/beers`, {
      method: 'POST',
      body: JSON.stringify({beerId: data.beerId}),
    });
    return {ok: true};
  });

export const removeBeerFromEvent = createServerFn({method: 'POST'})
  .inputValidator((input: {eventId: number; beerId: number}) => input)
  .handler(async ({data}): Promise<{ok: true}> => {
    await adminFetch(`/admin/events/${data.eventId}/beers/${data.beerId}`, {
      method: 'DELETE',
    });
    return {ok: true};
  });

export const listBeers = createServerFn({method: 'GET'}).handler(
  async (): Promise<AdminBeer[]> => (await adminFetch('/admin/beers')).json(),
);
