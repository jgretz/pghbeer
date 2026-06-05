import {beforeEach, describe, expect, it} from 'bun:test';

import {
  createBeer,
  createBrewery,
  createStyle,
  deleteStyle,
  listStyles,
  updateStyle,
} from '../src/index';
import {setupTestDb} from './helpers/test-db';

beforeEach(async function () {
  await setupTestDb();
});

describe('createStyle', function () {
  it('should persist a style and return its id and name', async function () {
    const created = await createStyle({name: 'Stout'});

    expect(created.id).toBeGreaterThan(0);
    expect(created.name).toBe('Stout');
  });
});

describe('listStyles', function () {
  it('should return styles ordered by name', async function () {
    await createStyle({name: 'Saison'});
    await createStyle({name: 'Lager'});

    const names = (await listStyles()).map((s) => s.name);

    expect(names).toEqual(['Lager', 'Saison']);
  });
});

describe('updateStyle', function () {
  it('should rename an existing style', async function () {
    const created = await createStyle({name: 'Pale Ale'});

    const updated = await updateStyle(created.id, {name: 'Hazy IPA'});

    expect(updated).toEqual({id: created.id, name: 'Hazy IPA'});
  });

  it('should return null when the style does not exist', async function () {
    expect(await updateStyle(9999, {name: 'Nope'})).toBeNull();
  });
});

describe('deleteStyle', function () {
  it('should delete a style with no dependents', async function () {
    const created = await createStyle({name: 'Disposable'});

    const result = await deleteStyle(created.id);

    expect(result).toEqual({ok: true});
    expect(await listStyles()).toHaveLength(0);
  });

  it('should refuse to delete and report dependents when beers reference it', async function () {
    const brewery = await createBrewery({name: 'Brewery'});
    const style = await createStyle({name: 'Porter'});
    await createBeer({
      name: 'Robust Porter',
      abv: 5.5,
      beverageType: 'beer',
      isNa: false,
      breweryId: brewery.id,
      styleId: style.id,
    });

    const result = await deleteStyle(style.id);

    expect(result).toEqual({ok: false, dependents: {beers: 1}});
    expect(await listStyles()).toHaveLength(1);
  });
});
