import {createServerFn} from '@tanstack/react-start';
import {adminFetch, adminFetchRaw} from './server-fn';

// Local type — apps/www does NOT depend on @domain (no path alias). Mirrors the
// API's Style shape ({id, name}).
export type Style = {id: number; name: string};

// Discriminated union matching <ConfirmDelete>'s dependents prop. `ok:false`
// carries the per-entity dependent counts surfaced by the API's 409 body.
export type DeleteResult =
  | {ok: true}
  | {ok: false; dependents: Record<string, number>};

// Pure, exported for unit testing without a server harness. Maps a DELETE
// response into a DeleteResult:
//   200 → {ok:true}
//   409 → {ok:false, dependents} (defaulting to {} when the body omits them)
//   any other non-2xx → throw (per error-handling.md, never swallow)
export function parseDeleteResult(status: number, body: unknown): DeleteResult {
  if (status === 200) return {ok: true};

  if (status === 409) {
    const dependents =
      body && typeof body === 'object' && 'dependents' in body
        ? ((body as {dependents?: Record<string, number>}).dependents ?? {})
        : {};
    return {ok: false, dependents};
  }

  throw new Error(
    `Delete failed: ${status} — ${JSON.stringify(body)}`,
  );
}

export const listStyles = createServerFn({method: 'GET'}).handler(
  async () => (await adminFetch('/admin/styles')).json() as Promise<Style[]>,
);

export const createStyle = createServerFn({method: 'POST'})
  .inputValidator((data: {name: string}) => data)
  .handler(
    async ({data}) =>
      (
        await adminFetch('/admin/styles', {
          method: 'POST',
          body: JSON.stringify(data),
        })
      ).json() as Promise<Style>,
  );

export const updateStyle = createServerFn({method: 'POST'})
  .inputValidator((data: {id: number; name: string}) => data)
  .handler(
    async ({data}) =>
      (
        await adminFetch(`/admin/styles/${data.id}`, {
          method: 'PATCH',
          body: JSON.stringify({name: data.name}),
        })
      ).json() as Promise<Style>,
  );

export const deleteStyle = createServerFn({method: 'POST'})
  .inputValidator((data: {id: number}) => data)
  .handler(async ({data}): Promise<DeleteResult> => {
    const res = await adminFetchRaw(`/admin/styles/${data.id}`, {
      method: 'DELETE',
    });
    const body = await res.json().catch(() => ({}));
    return parseDeleteResult(res.status, body);
  });
