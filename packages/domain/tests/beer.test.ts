import {beforeEach, describe, expect, it} from 'bun:test';

import {
  addBeerToEvent,
  createBeer,
  createBrewery,
  createEvent,
  createStyle,
  deleteBeer,
  listBeers,
  updateBeer,
} from '../src/index';
import type {CreateBeerInput} from '../src/index';
import {setupTestDb} from './helpers/test-db';

async function seedBeer(overrides: Partial<CreateBeerInput> = {}) {
  const brewery = await createBrewery({name: 'East End Brewing'});
  const style = await createStyle({name: 'Amber Ale'});
  const beer = await createBeer({
    name: 'Big Hop',
    abv: 7.2,
    beverageType: 'beer',
    isNa: false,
    breweryId: brewery.id,
    styleId: style.id,
    ...overrides,
  });
  return {brewery, style, beer};
}

beforeEach(async function () {
  await setupTestDb();
});

describe('createBeer', function () {
  it('should return the joined shape with brewery and style names', async function () {
    const {brewery, style, beer} = await seedBeer();

    expect(beer).toEqual({
      id: beer.id,
      name: 'Big Hop',
      abv: 7.2,
      beverageType: 'beer',
      isNa: false,
      locked: true,
      brewery: {id: brewery.id, name: 'East End Brewing'},
      style: {id: style.id, name: 'Amber Ale'},
    });
  });
});

describe('listBeers', function () {
  it('should return objects carrying joined brewery and style names', async function () {
    const {brewery, style} = await seedBeer();

    const [item] = await listBeers();

    expect(item).toMatchObject({
      name: 'Big Hop',
      abv: 7.2,
      beverageType: 'beer',
      isNa: false,
      brewery: {id: brewery.id, name: 'East End Brewing'},
      style: {id: style.id, name: 'Amber Ale'},
    });
  });
});

describe('updateBeer', function () {
  it('should partially update and return the joined shape', async function () {
    const {beer} = await seedBeer();

    const updated = await updateBeer(beer.id, {name: 'Renamed', abv: 4.0});

    expect(updated?.name).toBe('Renamed');
    expect(updated?.abv).toBe(4.0);
    expect(updated?.brewery.name).toBe('East End Brewing');
  });

  it('should return null when the beer does not exist', async function () {
    expect(await updateBeer(9999, {name: 'Nope'})).toBeNull();
  });
});

describe('deleteBeer', function () {
  it('should delete a beer with no dependents', async function () {
    const {beer} = await seedBeer();

    const result = await deleteBeer(beer.id);

    expect(result).toEqual({ok: true});
    expect(await listBeers()).toHaveLength(0);
  });

  it('should refuse to delete and report event-link dependents', async function () {
    const {beer} = await seedBeer();
    const event = await createEvent({name: 'BOTB 2026', date: '2026-04-18'});
    await addBeerToEvent(event.id, beer.id);

    const result = await deleteBeer(beer.id);

    expect(result).toEqual({ok: false, dependents: {stats: 0, eventLinks: 1}});
    expect(await listBeers()).toHaveLength(1);
  });
});
