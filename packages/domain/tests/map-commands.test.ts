import {beforeEach, describe, expect, it} from 'bun:test';

import {
  assignBreweryToSlot,
  createBrewery,
  createEvent,
  createLayout,
  deleteLayout,
  duplicateLayout,
  setActiveLayout,
  setMapEnabled,
  upsertSlot,
} from '../src/index';
import {setupTestDb} from './helpers/test-db';

type SlotOverrides = {kind?: 'table' | 'zone'; breweryId?: number | null};

async function addSlot(layoutId: number, label: string, o: SlotOverrides = {}) {
  const slot = await upsertSlot(layoutId, {
    label,
    kind: o.kind ?? 'table',
    x: 0,
    y: 0,
    width: 50,
    height: 50,
    rotation: 0,
    locked: false,
    breweryId: o.breweryId ?? null,
  });
  if (!slot) throw new Error(`failed to create slot ${label}`);
  return slot;
}

beforeEach(async function () {
  await setupTestDb();
});

describe('upsertSlot', function () {
  it('should return null when updating a slot id that does not exist', async function () {
    const event = await createEvent({name: 'BOTB', date: '2026-04-18'});
    const layout = await createLayout(event.id, {name: 'L1'});

    const result = await upsertSlot(layout.id, {
      id: 99999,
      label: 'T1',
      kind: 'table',
      x: 0,
      y: 0,
      width: 50,
      height: 50,
      rotation: 0,
      locked: false,
      breweryId: null,
    });

    expect(result).toBeNull();
  });

  it('should reject a duplicate table label within the same layout', async function () {
    const event = await createEvent({name: 'BOTB', date: '2026-04-18'});
    const layout = await createLayout(event.id, {name: 'L1'});
    await addSlot(layout.id, 'T1');

    expect(addSlot(layout.id, 'T1')).rejects.toThrow();
  });

  it('should allow zones to share a label within a layout', async function () {
    const event = await createEvent({name: 'BOTB', date: '2026-04-18'});
    const layout = await createLayout(event.id, {name: 'L1'});
    await addSlot(layout.id, 'Inside', {kind: 'zone'});

    // The unique index is partial (kind='table'), so zones may repeat.
    const second = await addSlot(layout.id, 'Inside', {kind: 'zone'});
    expect(second.label).toBe('Inside');
  });

  it('should never assign a brewery to a zone slot', async function () {
    const event = await createEvent({name: 'BOTB', date: '2026-04-18'});
    const brewery = await createBrewery({name: 'Dancing Gnome'});
    const layout = await createLayout(event.id, {name: 'L1'});

    const zone = await addSlot(layout.id, 'Inside', {
      kind: 'zone',
      breweryId: brewery.id,
    });

    expect(zone.kind).toBe('zone');
    expect(zone.breweryId).toBeNull();
  });
});

describe('assignBreweryToSlot', function () {
  it('should assign and then clear a brewery on a table slot', async function () {
    const event = await createEvent({name: 'BOTB', date: '2026-04-18'});
    const brewery = await createBrewery({name: 'Dancing Gnome'});
    const layout = await createLayout(event.id, {name: 'L1'});
    const t1 = await addSlot(layout.id, 'T1');

    const assigned = await assignBreweryToSlot(t1.id, brewery.id);
    expect(assigned?.breweryId).toBe(brewery.id);
    expect(assigned?.breweryName).toBe('Dancing Gnome');

    const cleared = await assignBreweryToSlot(t1.id, null);
    expect(cleared?.breweryId).toBeNull();
    expect(cleared?.breweryName).toBeNull();
  });

  it('should return null for a slot id that does not exist', async function () {
    expect(await assignBreweryToSlot(99999, 1)).toBeNull();
  });

  it('should throw when assigning a brewery to a zone slot', async function () {
    const event = await createEvent({name: 'BOTB', date: '2026-04-18'});
    const brewery = await createBrewery({name: 'Dancing Gnome'});
    const layout = await createLayout(event.id, {name: 'L1'});
    const zone = await addSlot(layout.id, 'Inside', {kind: 'zone'});

    expect(assignBreweryToSlot(zone.id, brewery.id)).rejects.toThrow(/zone/);
  });
});

describe('deleteLayout', function () {
  it('should delete an inactive layout', async function () {
    const event = await createEvent({name: 'BOTB', date: '2026-04-18'});
    const layout = await createLayout(event.id, {name: 'L1'});

    expect(await deleteLayout(layout.id)).toEqual({ok: true});
  });

  it('should refuse to delete the active layout', async function () {
    const event = await createEvent({name: 'BOTB', date: '2026-04-18'});
    const layout = await createLayout(event.id, {name: 'L1'});
    await setActiveLayout(event.id, layout.id);

    expect(await deleteLayout(layout.id)).toEqual({ok: false, dependents: {active: 1}});
  });
});

describe('duplicateLayout', function () {
  it('should copy all slots and preserve their assignments into a new inactive layout', async function () {
    const event = await createEvent({name: 'BOTB', date: '2026-04-18'});
    const brewery = await createBrewery({name: 'Dancing Gnome'});
    const src = await createLayout(event.id, {name: 'Good weather'});
    const t1 = await addSlot(src.id, 'T1');
    await addSlot(src.id, 'Inside', {kind: 'zone'});
    await setActiveLayout(event.id, src.id);
    await assignBreweryToSlot(t1.id, brewery.id);

    const copy = await duplicateLayout(src.id, 'Bad weather');

    expect(copy?.name).toBe('Bad weather');
    expect(copy?.isActive).toBe(false);
    expect(copy?.slots).toHaveLength(2);
    const copiedTable = copy?.slots.find((s) => s.label === 'T1');
    expect(copiedTable?.breweryId).toBe(brewery.id);
  });

  it('should return null when the source layout does not exist', async function () {
    expect(await duplicateLayout(99999, 'Copy')).toBeNull();
  });
});

describe('setMapEnabled', function () {
  it('should return null for an event that does not exist', async function () {
    expect(await setMapEnabled(99999, true)).toBeNull();
  });

  it('should toggle the flag for a real event', async function () {
    const event = await createEvent({name: 'BOTB', date: '2026-04-18'});

    expect(await setMapEnabled(event.id, true)).toEqual({enabled: true});
  });
});
