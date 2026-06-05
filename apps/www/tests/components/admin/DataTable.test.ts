import {describe, expect, it} from 'bun:test';

import {filterRows} from '../../../src/components/admin/DataTable';
import type {Column} from '../../../src/components/admin/DataTable';
import {formatDependents} from '../../../src/components/admin/ConfirmDelete';

type Brewery = {id: number; name: string; city: string; active: boolean};

function makeBrewery(overrides: Partial<Brewery> = {}): Brewery {
  return {id: 1, name: 'Acme Brewing', city: 'Pittsburgh', active: true, ...overrides};
}

const columns: Column<Brewery>[] = [
  {id: 'name', header: 'Name', accessor: (row) => row.name},
  {id: 'city', header: 'City', accessor: (row) => row.city},
  {id: 'active', header: 'Active', accessor: (row) => row.active},
];

describe('filterRows', function () {
  it('should narrow rows to those matching a first-column accessor', function () {
    const rows = [
      makeBrewery({id: 1, name: 'Acme Brewing'}),
      makeBrewery({id: 2, name: 'Hop House'}),
    ];

    const result = filterRows(rows, columns, 'acme');

    expect(result).toEqual([rows[0]!]);
  });

  it('should match a value in a non-first column', function () {
    const rows = [
      makeBrewery({id: 1, city: 'Pittsburgh'}),
      makeBrewery({id: 2, city: 'Cleveland'}),
    ];

    const result = filterRows(rows, columns, 'cleveland');

    expect(result).toEqual([rows[1]!]);
  });

  it('should stringify non-string accessors when matching', function () {
    const rows = [
      makeBrewery({id: 1, active: true}),
      makeBrewery({id: 2, active: false}),
    ];

    const result = filterRows(rows, columns, 'false');

    expect(result).toEqual([rows[1]!]);
  });

  it('should return an empty array when no rows match', function () {
    const rows = [makeBrewery({name: 'Acme Brewing'})];

    expect(filterRows(rows, columns, 'zzz')).toEqual([]);
  });

  it('should return all rows for an empty query', function () {
    const rows = [makeBrewery({id: 1}), makeBrewery({id: 2})];

    expect(filterRows(rows, columns, '')).toEqual(rows);
  });

  it('should return all rows for a whitespace-only query', function () {
    const rows = [makeBrewery({id: 1}), makeBrewery({id: 2})];

    expect(filterRows(rows, columns, '   ')).toEqual(rows);
  });
});

describe('formatDependents', function () {
  it('should join multiple counts with proper singular/plural', function () {
    expect(formatDependents({beers: 3, events: 1})).toBe('used by 3 beers and 1 event');
  });

  it('should omit zero counts', function () {
    expect(formatDependents({beers: 2, events: 0})).toBe('used by 2 beers');
  });

  it('should return an empty string when nothing depends on the entity', function () {
    expect(formatDependents({beers: 0})).toBe('');
  });
});
