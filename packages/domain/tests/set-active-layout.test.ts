import {beforeEach, describe, expect, it} from 'bun:test';

import {
  assignBreweryToSlot,
  createBrewery,
  createEvent,
  createLayout,
  listLayouts,
  setActiveLayout,
  upsertSlot,
} from '../src/index';
import {setupTestDb} from './helpers/test-db';

type SlotOverrides = {kind?: 'table' | 'zone'; breweryId?: number | null};

async function addSlot(layoutId: number, label: string, o: SlotOverrides = {}) {
  return upsertSlot(layoutId, {
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
}

beforeEach(async function () {
  await setupTestDb();
});

describe('setActiveLayout', function () {
  it('should activate the target layout and deactivate the previously active one', async function () {
    const event = await createEvent({name: 'BOTB', date: '2026-04-18'});
    const l1 = await createLayout(event.id, {name: 'L1'});
    const l2 = await createLayout(event.id, {name: 'L2'});

    await setActiveLayout(event.id, l1.id);
    const result = await setActiveLayout(event.id, l2.id);

    expect(result.activeLayout?.id).toBe(l2.id);

    const summaries = await listLayouts(event.id);
    expect(summaries.find((s) => s.id === l1.id)?.isActive).toBe(false);
    expect(summaries.find((s) => s.id === l2.id)?.isActive).toBe(true);
  });

  it('should carry a brewery assignment to the target table with the same label', async function () {
    const event = await createEvent({name: 'BOTB', date: '2026-04-18'});
    const brewery = await createBrewery({name: 'Dancing Gnome'});

    const l1 = await createLayout(event.id, {name: 'Good weather'});
    const t1 = await addSlot(l1.id, 'T1');
    await setActiveLayout(event.id, l1.id);
    await assignBreweryToSlot(t1.id, brewery.id);

    const l2 = await createLayout(event.id, {name: 'Bad weather'});
    await addSlot(l2.id, 'T1');

    const result = await setActiveLayout(event.id, l2.id);

    const carried = result.activeLayout?.slots.find((s) => s.label === 'T1');
    expect(carried?.breweryId).toBe(brewery.id);
  });

  it('should not overwrite an assignment already present on the target table', async function () {
    const event = await createEvent({name: 'BOTB', date: '2026-04-18'});
    const a = await createBrewery({name: 'Brewery A'});
    const b = await createBrewery({name: 'Brewery B'});

    const l1 = await createLayout(event.id, {name: 'L1'});
    const t1a = await addSlot(l1.id, 'T1');
    await setActiveLayout(event.id, l1.id);
    await assignBreweryToSlot(t1a.id, a.id);

    const l2 = await createLayout(event.id, {name: 'L2'});
    const t1b = await addSlot(l2.id, 'T1');
    await assignBreweryToSlot(t1b.id, b.id);

    const result = await setActiveLayout(event.id, l2.id);

    const target = result.activeLayout?.slots.find((s) => s.label === 'T1');
    expect(target?.breweryId).toBe(b.id);
  });

  it('should drop assignments whose label has no matching table in the target', async function () {
    const event = await createEvent({name: 'BOTB', date: '2026-04-18'});
    const a = await createBrewery({name: 'Brewery A'});
    const b = await createBrewery({name: 'Brewery B'});

    const l1 = await createLayout(event.id, {name: 'L1'});
    const t1 = await addSlot(l1.id, 'T1');
    const t2 = await addSlot(l1.id, 'T2');
    await setActiveLayout(event.id, l1.id);
    await assignBreweryToSlot(t1.id, a.id);
    await assignBreweryToSlot(t2.id, b.id);

    const l2 = await createLayout(event.id, {name: 'L2'});
    await addSlot(l2.id, 'T1');

    const result = await setActiveLayout(event.id, l2.id);
    const slots = result.activeLayout?.slots ?? [];

    expect(slots.map((s) => s.label)).toEqual(['T1']);
    expect(slots[0]?.breweryId).toBe(a.id);
    expect(slots.some((s) => s.breweryId === b.id)).toBe(false);
  });

  it('should preserve assignments when re-activating the already-active layout', async function () {
    const event = await createEvent({name: 'BOTB', date: '2026-04-18'});
    const brewery = await createBrewery({name: 'Dancing Gnome'});

    const l1 = await createLayout(event.id, {name: 'L1'});
    const t1 = await addSlot(l1.id, 'T1');
    await setActiveLayout(event.id, l1.id);
    await assignBreweryToSlot(t1.id, brewery.id);

    const result = await setActiveLayout(event.id, l1.id);

    const slot = result.activeLayout?.slots.find((s) => s.label === 'T1');
    expect(slot?.breweryId).toBe(brewery.id);
  });
});
