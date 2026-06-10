import {createServerFn} from '@tanstack/react-start';
import {adminFetch} from './server-fn';

export type Brewery = {id: number; name: string};

export type DeleteResult = {ok: true} | {ok: false; dependents: Record<string, number>};

// Pure mapping of the DELETE response (status + parsed body) to the DeleteResult
// union. Exported so the 200/409 branching is testable without a network. The
// 409 body shape is {error, dependents:{beers:<n>}} per the API contract.
export function parseDeleteResult(status: number, body: unknown): DeleteResult {
  if (status === 200) return {ok: true};

  if (status === 409) {
    const dependents =
      body && typeof body === 'object' && 'dependents' in body
        ? ((body as {dependents: Record<string, number>}).dependents ?? {})
        : {};
    return {ok: false, dependents};
  }

  throw new Error(`Admin API delete failed: ${status} — ${JSON.stringify(body)}`);
}

export const listBreweries = createServerFn({method: 'GET'}).handler(async () => {
  const res = await adminFetch('/admin/breweries');
  return (await res.json()) as Brewery[];
});

export const createBrewery = createServerFn({method: 'POST'})
  .validator((d: {name: string}) => d)
  .handler(async ({data}) => {
    const res = await adminFetch('/admin/breweries', {
      method: 'POST',
      body: JSON.stringify({name: data.name}),
    });
    return (await res.json()) as Brewery;
  });

export const updateBrewery = createServerFn({method: 'POST'})
  .validator((d: {id: number; name: string}) => d)
  .handler(async ({data}) => {
    const res = await adminFetch(`/admin/breweries/${data.id}`, {
      method: 'PATCH',
      body: JSON.stringify({name: data.name}),
    });
    return (await res.json()) as Brewery;
  });

// Delete bypasses adminFetch (which throws on the 409) so the structured
// `dependents` payload survives as data for ConfirmDelete. Env resolution mirrors
// server-fn.ts; the ~handful of duplicated lines keep that shared file untouched.
export const deleteBrewery = createServerFn({method: 'POST'})
  .validator((d: {id: number}) => d)
  .handler(async ({data}): Promise<DeleteResult> => {
    const baseUrl = process.env.API_URL ?? process.env.VITE_API_URL ?? 'http://localhost:3001';
    const key = process.env.ADMIN_API_KEY ?? process.env.API_KEY ?? '';

    const res = await fetch(`${baseUrl}/admin/breweries/${data.id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
    });

    const body = await res.json().catch(() => null);
    return parseDeleteResult(res.status, body);
  });
