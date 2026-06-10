import {beforeEach, describe, expect, it} from 'bun:test';

import {
  assignBreweryToSlot,
  createBrewery,
  createEvent,
  createLayout,
  previewLayoutSwitch,
  setActiveLayout,
  upsertSlot,
} from '../src/index';
import {setupTestDb} from './helpers/test-db';

async function addTable(layoutId: number, label: string) {
  return upsertSlot(layoutId, {
    label,
    kind: 'table',
    x: 0,
    y: 0,
    width: 50,
    height: 50,
    rotation: 0,
    locked: false,
    breweryId: null,
  });
}

beforeEach(async function () {
  await setupTestDb();
});

describe('previewLayoutSwitch', function () {
  it('should report nothing carried or dropped when no layout is active', async function () {
    const event = await createEvent({name: 'BOTB', date: '2026-04-18'});
    const l1 = await createLayout(event.id, {name: 'L1'});

    const preview = await previewLayoutSwitch(event.id, l1.id);

    expect(preview).toEqual({carried: 0, unmatchedLabels: [], droppedBreweries: []});
  });

  it('should report nothing when previewing the already-active layout', async function () {
    const event = await createEvent({name: 'BOTB', date: '2026-04-18'});
    const a = await createBrewery({name: 'Brewery A'});
    const l1 = await createLayout(event.id, {name: 'L1'});
    const t1 = await addTable(l1.id, 'T1');
    await setActiveLayout(event.id, l1.id);
    await assignBreweryToSlot(t1.id, a.id);

    const preview = await previewLayoutSwitch(event.id, l1.id);

    expect(preview).toEqual({carried: 0, unmatchedLabels: [], droppedBreweries: []});
  });

  it('should count assignments whose label exists in the target as carried', async function () {
    const event = await createEvent({name: 'BOTB', date: '2026-04-18'});
    const a = await createBrewery({name: 'Brewery A'});
    const b = await createBrewery({name: 'Brewery B'});

    const l1 = await createLayout(event.id, {name: 'L1'});
    const t1 = await addTable(l1.id, 'T1');
    const t2 = await addTable(l1.id, 'T2');
    await setActiveLayout(event.id, l1.id);
    await assignBreweryToSlot(t1.id, a.id);
    await assignBreweryToSlot(t2.id, b.id);

    const l2 = await createLayout(event.id, {name: 'L2'});
    await addTable(l2.id, 'T1');
    await addTable(l2.id, 'T2');

    const preview = await previewLayoutSwitch(event.id, l2.id);

    expect(preview).toEqual({carried: 2, unmatchedLabels: [], droppedBreweries: []});
  });

  it('should report unmatched labels and dropped breweries for labels missing in the target', async function () {
    const event = await createEvent({name: 'BOTB', date: '2026-04-18'});
    const a = await createBrewery({name: 'Brewery A'});
    const b = await createBrewery({name: 'Brewery B'});

    const l1 = await createLayout(event.id, {name: 'L1'});
    const t1 = await addTable(l1.id, 'T1');
    const t2 = await addTable(l1.id, 'T2');
    await setActiveLayout(event.id, l1.id);
    await assignBreweryToSlot(t1.id, a.id);
    await assignBreweryToSlot(t2.id, b.id);

    const l2 = await createLayout(event.id, {name: 'L2'});
    await addTable(l2.id, 'T1');

    const preview = await previewLayoutSwitch(event.id, l2.id);

    expect(preview.carried).toBe(1);
    expect(preview.unmatchedLabels).toEqual(['T2']);
    expect(preview.droppedBreweries).toEqual([{id: b.id, name: 'Brewery B'}]);
  });

  it('should ignore unassigned tables', async function () {
    const event = await createEvent({name: 'BOTB', date: '2026-04-18'});
    const a = await createBrewery({name: 'Brewery A'});

    const l1 = await createLayout(event.id, {name: 'L1'});
    const t1 = await addTable(l1.id, 'T1');
    await addTable(l1.id, 'T3'); // left unassigned
    await setActiveLayout(event.id, l1.id);
    await assignBreweryToSlot(t1.id, a.id);

    const l2 = await createLayout(event.id, {name: 'L2'});
    await addTable(l2.id, 'T1');

    const preview = await previewLayoutSwitch(event.id, l2.id);

    expect(preview).toEqual({carried: 1, unmatchedLabels: [], droppedBreweries: []});
  });
});
