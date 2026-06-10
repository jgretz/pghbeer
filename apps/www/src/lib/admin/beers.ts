import {createServerFn} from '@tanstack/react-start';
import type {
  BeerListItem,
  BreweryRow,
  CreateBeerInput,
  StyleRow,
  UpdateBeerInput,
} from '@domain';

import {adminFetch, adminFetchRaw} from './server-fn';
import type {FieldValue} from '../../components/admin/EntityForm';

// Source of truth: packages/database/schema/helpers.ts:3. Hardcoded here to
// avoid pulling the `database` (drizzle) runtime into the client bundle; the
// API re-validates against the same enum. 'na' is NOT a value here — NA-ness
// is the separate `isNa` boolean.
export const BEVERAGE_TYPES = [
  'beer',
  'wine',
  'mead',
  'cocktail',
  'cider',
  'seltzer',
  'hard_tea',
] as const;

export type DeleteBeerResult =
  | {ok: true}
  | {ok: false; dependents: {stats: number; eventLinks: number}};

// --- Pure helpers (unit-tested) ---

// Coerce raw EntityForm values into a create payload matching createBeerSchema:
// FK select ids string -> number, blank ABV -> null. Returns null when a
// required field is missing (name empty, beverageType/brewery/style
// unselected) so the caller can block submit without issuing a request.
export function toBeerPayload(
  values: Record<string, FieldValue>,
): CreateBeerInput | null {
  const name = typeof values.name === 'string' ? values.name.trim() : '';
  const beverageType = values.beverageType;
  const breweryRaw = values.breweryId;
  const styleRaw = values.styleId;

  if (name === '' || beverageType === '' || beverageType == null) return null;
  if (breweryRaw === '' || breweryRaw == null) return null;
  if (styleRaw === '' || styleRaw == null) return null;

  const breweryId = Number(breweryRaw);
  const styleId = Number(styleRaw);
  if (!Number.isInteger(breweryId) || !Number.isInteger(styleId)) return null;

  const abv =
    values.abv === '' || values.abv == null ? null : Number(values.abv);

  return {
    name,
    abv,
    beverageType: beverageType as CreateBeerInput['beverageType'],
    isNa: values.isNa === true,
    breweryId,
    styleId,
  };
}

// Map a DELETE response (status + parsed body) to a typed result. A 409 carries
// the blocking dependent counts; any 2xx is success. Other statuses are
// handled by the caller (which throws) before reaching here.
export function parseDeleteResult(
  status: number,
  body: unknown,
): DeleteBeerResult {
  if (status === 409) {
    const dependents =
      (body as {dependents?: {stats?: number; eventLinks?: number}})
        ?.dependents ?? {};
    return {
      ok: false,
      dependents: {
        stats: dependents.stats ?? 0,
        eventLinks: dependents.eventLinks ?? 0,
      },
    };
  }
  return {ok: true};
}

// --- Server functions (ADMIN_API_KEY stays server-side) ---

export const listBeers = createServerFn({method: 'GET'}).handler(
  async () => (await adminFetch('/admin/beers')).json() as Promise<BeerListItem[]>,
);

export const listBreweries = createServerFn({method: 'GET'}).handler(
  async () =>
    (await adminFetch('/admin/breweries')).json() as Promise<BreweryRow[]>,
);

export const listStyles = createServerFn({method: 'GET'}).handler(
  async () => (await adminFetch('/admin/styles')).json() as Promise<StyleRow[]>,
);

export const createBeer = createServerFn({method: 'POST'})
  .validator((data: CreateBeerInput) => data)
  .handler(
    async ({data}) =>
      (
        await adminFetch('/admin/beers', {
          method: 'POST',
          body: JSON.stringify(data),
        })
      ).json() as Promise<BeerListItem>,
  );

export const updateBeer = createServerFn({method: 'POST'})
  .validator((input: {id: number; data: UpdateBeerInput}) => input)
  .handler(
    async ({data: {id, data}}) =>
      (
        await adminFetch(`/admin/beers/${id}`, {
          method: 'PATCH',
          body: JSON.stringify(data),
        })
      ).json() as Promise<BeerListItem>,
  );

export const deleteBeer = createServerFn({method: 'POST'})
  .validator((id: number) => id)
  .handler(async ({data: id}): Promise<DeleteBeerResult> => {
    const res = await adminFetchRaw(`/admin/beers/${id}`, {method: 'DELETE'});
    if (res.ok) return {ok: true};
    if (res.status === 409) {
      const body = await res.json().catch(() => ({}));
      return parseDeleteResult(409, body);
    }
    const text = await res.text().catch(() => '');
    throw new Error(
      `Delete failed: ${res.status} ${res.statusText}${text ? ` — ${text}` : ''}`,
    );
  });
