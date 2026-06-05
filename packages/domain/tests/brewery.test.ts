import {beforeEach, describe, expect, it} from 'bun:test';

import {
  createBeer,
  createBrewery,
  createStyle,
  deleteBrewery,
  listBreweries,
  updateBrewery,
} from '../src/index';
import {setupTestDb} from './helpers/test-db';

beforeEach(async function () {
  await setupTestDb();
});

describe('createBrewery', function () {
  it('should persist a brewery and return its id and name', async function () {
    const created = await createBrewery({name: 'Grist House'});

    expect(created.id).toBeGreaterThan(0);
    expect(created.name).toBe('Grist House');
  });
});

describe('listBreweries', function () {
  it('should return breweries ordered by name', async function () {
    await createBrewery({name: 'Zelienople Brewing'});
    await createBrewery({name: 'Allegheny City'});

    const names = (await listBreweries()).map((b) => b.name);

    expect(names).toEqual(['Allegheny City', 'Zelienople Brewing']);
  });
});

describe('updateBrewery', function () {
  it('should rename an existing brewery', async function () {
    const created = await createBrewery({name: 'Old Name'});

    const updated = await updateBrewery(created.id, {name: 'New Name'});

    expect(updated).toEqual({id: created.id, name: 'New Name'});
  });

  it('should return null when the brewery does not exist', async function () {
    const updated = await updateBrewery(9999, {name: 'Nope'});

    expect(updated).toBeNull();
  });
});

describe('deleteBrewery', function () {
  it('should delete a brewery with no dependents', async function () {
    const created = await createBrewery({name: 'Disposable'});

    const result = await deleteBrewery(created.id);

    expect(result).toEqual({ok: true});
    expect(await listBreweries()).toHaveLength(0);
  });

  it('should refuse to delete and report dependents when beers reference it', async function () {
    const brewery = await createBrewery({name: 'Has Beers'});
    const style = await createStyle({name: 'IPA'});
    await createBeer({
      name: 'Flagship',
      abv: 6.5,
      beverageType: 'beer',
      isNa: false,
      breweryId: brewery.id,
      styleId: style.id,
    });

    const result = await deleteBrewery(brewery.id);

    expect(result).toEqual({ok: false, dependents: {beers: 1}});
    // No delete performed.
    expect(await listBreweries()).toHaveLength(1);
  });
});
