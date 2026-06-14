// SERVER-ONLY module. Every server function runs inside createServerFn so the
// admin API key stays server-side. Types mirror @domain's map shapes (the www
// app does not depend on @domain).

import {createServerFn} from '@tanstack/react-start';
import {adminFetch, adminFetchRaw} from './server-fn';
import {parseDeleteResponse, type DeleteEventResult} from './events';

export type AdminMapSlotKind = 'table' | 'zone' | 'label';

export type AdminMapSlot = {
  id: number;
  label: string;
  kind: AdminMapSlotKind;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  fontSize: number | null;
  vertical: boolean;
  locked: boolean;
  breweryId: number | null;
  breweryName: string | null;
};

export type AdminMapLayout = {
  id: number;
  eventId: number;
  name: string;
  isActive: boolean;
  width: number;
  height: number;
  slots: AdminMapSlot[];
};

export type AdminMapLayoutSummary = {
  id: number;
  name: string;
  isActive: boolean;
};

export type AdminEventMap = {
  enabled: boolean;
  activeLayout: AdminMapLayout | null;
};

export type LayoutSwitchPreview = {
  carried: number;
  unmatchedLabels: string[];
  droppedBreweries: {id: number; name: string}[];
};

// Geometry/label/kind payload for creating or updating a slot.
export type SlotInput = {
  label: string;
  kind: AdminMapSlotKind;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  fontSize?: number | null;
  vertical: boolean;
  locked: boolean;
  breweryId?: number | null;
};

export type EventBrewery = {id: number; name: string};

// --- Visibility flag (read via the public endpoint; no key required) ---

export const fetchEventEnabled = createServerFn({method: 'GET'})
  .validator((input: {eventId: number}) => input)
  .handler(async ({data}): Promise<{enabled: boolean}> => {
    const base =
      process.env.API_URL ?? process.env.VITE_API_URL ?? 'http://localhost:3001';
    const res = await fetch(`${base}/eventmap?event_id=${data.eventId}`);
    if (!res.ok) throw new Error(`Failed to load map flag: ${res.status}`);
    const body = (await res.json()) as AdminEventMap;
    return {enabled: body.enabled};
  });

export const setMapEnabled = createServerFn({method: 'POST'})
  .validator((input: {eventId: number; enabled: boolean}) => input)
  .handler(
    async ({data}): Promise<{enabled: boolean}> =>
      (
        await adminFetch(`/admin/maps/events/${data.eventId}/enabled`, {
          method: 'PATCH',
          body: JSON.stringify({enabled: data.enabled}),
        })
      ).json(),
  );

// --- Layouts ---

export const listLayouts = createServerFn({method: 'GET'})
  .validator((input: {eventId: number}) => input)
  .handler(
    async ({data}): Promise<AdminMapLayoutSummary[]> =>
      (await adminFetch(`/admin/maps/events/${data.eventId}/layouts`)).json(),
  );

export const getLayout = createServerFn({method: 'GET'})
  .validator((input: {layoutId: number}) => input)
  .handler(
    async ({data}): Promise<AdminMapLayout> =>
      (await adminFetch(`/admin/maps/layouts/${data.layoutId}`)).json(),
  );

export const createLayout = createServerFn({method: 'POST'})
  .validator((input: {eventId: number; name: string; width?: number; height?: number}) => input)
  .handler(
    async ({data}): Promise<AdminMapLayout> =>
      (
        await adminFetch(`/admin/maps/events/${data.eventId}/layouts`, {
          method: 'POST',
          body: JSON.stringify({name: data.name, width: data.width, height: data.height}),
        })
      ).json(),
  );

export const duplicateLayout = createServerFn({method: 'POST'})
  .validator((input: {layoutId: number; name: string}) => input)
  .handler(
    async ({data}): Promise<AdminMapLayout> =>
      (
        await adminFetch(`/admin/maps/layouts/${data.layoutId}/duplicate`, {
          method: 'POST',
          body: JSON.stringify({name: data.name}),
        })
      ).json(),
  );

export const renameLayout = createServerFn({method: 'POST'})
  .validator((input: {layoutId: number; name: string}) => input)
  .handler(
    async ({data}): Promise<AdminMapLayout> =>
      (
        await adminFetch(`/admin/maps/layouts/${data.layoutId}`, {
          method: 'PATCH',
          body: JSON.stringify({name: data.name}),
        })
      ).json(),
  );

export const deleteLayout = createServerFn({method: 'POST'})
  .validator((input: {layoutId: number}) => input)
  .handler(async ({data}): Promise<DeleteEventResult> => {
    const res = await adminFetchRaw(`/admin/maps/layouts/${data.layoutId}`, {
      method: 'DELETE',
    });
    const body = await res.json().catch(() => null);
    return parseDeleteResponse(res.status, body);
  });

export const previewLayoutSwitch = createServerFn({method: 'GET'})
  .validator((input: {eventId: number; layoutId: number}) => input)
  .handler(
    async ({data}): Promise<LayoutSwitchPreview> =>
      (
        await adminFetch(
          `/admin/maps/events/${data.eventId}/switch-preview/${data.layoutId}`,
        )
      ).json(),
  );

export const setActiveLayout = createServerFn({method: 'POST'})
  .validator((input: {eventId: number; layoutId: number}) => input)
  .handler(
    async ({data}): Promise<AdminEventMap> =>
      (
        await adminFetch(`/admin/maps/events/${data.eventId}/active`, {
          method: 'POST',
          body: JSON.stringify({layoutId: data.layoutId}),
        })
      ).json(),
  );

// --- Slots ---

export const createSlot = createServerFn({method: 'POST'})
  .validator((input: {layoutId: number; slot: SlotInput}) => input)
  .handler(
    async ({data}): Promise<AdminMapSlot> =>
      (
        await adminFetch(`/admin/maps/layouts/${data.layoutId}/slots`, {
          method: 'POST',
          body: JSON.stringify(data.slot),
        })
      ).json(),
  );

export const updateSlot = createServerFn({method: 'POST'})
  .validator((input: {layoutId: number; slotId: number; slot: SlotInput}) => input)
  .handler(
    async ({data}): Promise<AdminMapSlot> =>
      (
        await adminFetch(`/admin/maps/layouts/${data.layoutId}/slots/${data.slotId}`, {
          method: 'PATCH',
          body: JSON.stringify(data.slot),
        })
      ).json(),
  );

export const deleteSlot = createServerFn({method: 'POST'})
  .validator((input: {slotId: number}) => input)
  .handler(async ({data}): Promise<{ok: true}> => {
    await adminFetch(`/admin/maps/slots/${data.slotId}`, {method: 'DELETE'});
    return {ok: true};
  });

export const assignBrewery = createServerFn({method: 'POST'})
  .validator((input: {slotId: number; breweryId: number | null}) => input)
  .handler(
    async ({data}): Promise<AdminMapSlot> =>
      (
        await adminFetch(`/admin/maps/slots/${data.slotId}/assignment`, {
          method: 'PATCH',
          body: JSON.stringify({breweryId: data.breweryId}),
        })
      ).json(),
  );

// --- Event brewery roster (breweries that have beers on the event) ---

export const listEventBreweries = createServerFn({method: 'GET'})
  .validator((input: {eventId: number}) => input)
  .handler(async ({data}): Promise<EventBrewery[]> => {
    const beers: {brewery: {id: number; name: string}}[] = await (
      await adminFetch(`/admin/events/${data.eventId}/beers`)
    ).json();
    const map = new Map<number, string>();
    for (const b of beers) map.set(b.brewery.id, b.brewery.name);
    return Array.from(map, ([id, name]) => ({id, name})).sort((a, b) =>
      a.name.localeCompare(b.name),
    );
  });

// Every brewery in the catalog, not just those with beers on the event. Used by
// the picker's "search all" toggle to assign non-beer vendors (food trucks, etc).
export const listAllBreweries = createServerFn({method: 'GET'})
  .handler(
    async (): Promise<EventBrewery[]> =>
      (await adminFetch('/admin/breweries')).json(),
  );
