import {beforeEach, describe, expect, it} from 'bun:test';

import {
  addBeerToEvent,
  createBeer,
  createBrewery,
  createEvent,
  createStyle,
  deleteEvent,
  listEvents,
  updateEvent,
} from '../src/index';
import {setupTestDb} from './helpers/test-db';

beforeEach(async function () {
  await setupTestDb();
});

describe('createEvent', function () {
  it('should persist an event and return id, name, and date string', async function () {
    const created = await createEvent({name: 'BOTB 2026', date: '2026-04-18'});

    expect(created.id).toBeGreaterThan(0);
    expect(created.name).toBe('BOTB 2026');
    expect(created.date).toBe('2026-04-18');
  });
});

describe('listEvents', function () {
  it('should return events ordered by date', async function () {
    await createEvent({name: 'Later', date: '2026-09-01'});
    await createEvent({name: 'Earlier', date: '2026-04-18'});

    const names = (await listEvents()).map((e) => e.name);

    expect(names).toEqual(['Earlier', 'Later']);
  });
});

describe('updateEvent', function () {
  it('should update name and date', async function () {
    const created = await createEvent({name: 'Old', date: '2026-04-18'});

    const updated = await updateEvent(created.id, {name: 'New', date: '2026-05-01'});

    expect(updated).toEqual({id: created.id, name: 'New', date: '2026-05-01'});
  });

  it('should return null when the event does not exist', async function () {
    expect(await updateEvent(9999, {name: 'Nope', date: '2026-01-01'})).toBeNull();
  });
});

describe('deleteEvent', function () {
  it('should delete an event with no dependents', async function () {
    const created = await createEvent({name: 'Disposable', date: '2026-04-18'});

    const result = await deleteEvent(created.id);

    expect(result).toEqual({ok: true});
    expect(await listEvents()).toHaveLength(0);
  });

  it('should refuse to delete and report event-link dependents', async function () {
    const brewery = await createBrewery({name: 'Brewery'});
    const style = await createStyle({name: 'IPA'});
    const beer = await createBeer({
      name: 'Beer',
      abv: 6,
      beverageType: 'beer',
      isNa: false,
      breweryId: brewery.id,
      styleId: style.id,
    });
    const event = await createEvent({name: 'Has Links', date: '2026-04-18'});
    await addBeerToEvent(event.id, beer.id);

    const result = await deleteEvent(event.id);

    expect(result).toEqual({ok: false, dependents: {eventLinks: 1, stats: 0}});
    expect(await listEvents()).toHaveLength(1);
  });
});
