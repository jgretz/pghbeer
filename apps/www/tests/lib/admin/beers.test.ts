import {describe, expect, it} from 'bun:test';

import {parseDeleteResult, toBeerPayload} from '../../../src/lib/admin/beers';
import type {FieldValue} from '../../../src/components/admin/EntityForm';

function makeValues(
  overrides: Record<string, FieldValue> = {},
): Record<string, FieldValue> {
  return {
    name: 'Hazy IPA',
    abv: 6.5,
    beverageType: 'beer',
    isNa: false,
    breweryId: '3',
    styleId: '7',
    ...overrides,
  };
}

describe('toBeerPayload', function () {
  it('should coerce FK select string ids to numbers', function () {
    const payload = toBeerPayload(makeValues({breweryId: '3', styleId: '7'}));

    expect(payload).not.toBeNull();
    expect(payload!.breweryId).toBe(3);
    expect(payload!.styleId).toBe(7);
  });

  it('should keep a numeric abv as a number', function () {
    const payload = toBeerPayload(makeValues({abv: 6.5}));

    expect(payload!.abv).toBe(6.5);
  });

  it('should map a blank abv to null', function () {
    const payload = toBeerPayload(makeValues({abv: ''}));

    expect(payload!.abv).toBeNull();
  });

  it('should map an absent abv to null', function () {
    const payload = toBeerPayload(makeValues({abv: null}));

    expect(payload!.abv).toBeNull();
  });

  it('should pass through the isNa boolean', function () {
    const payload = toBeerPayload(makeValues({isNa: true}));

    expect(payload!.isNa).toBe(true);
  });

  it('should trim the name', function () {
    const payload = toBeerPayload(makeValues({name: '  Saison  '}));

    expect(payload!.name).toBe('Saison');
  });

  it('should block when name is empty', function () {
    expect(toBeerPayload(makeValues({name: '   '}))).toBeNull();
  });

  it('should block when brewery is unselected', function () {
    expect(toBeerPayload(makeValues({breweryId: ''}))).toBeNull();
  });

  it('should block when style is unselected', function () {
    expect(toBeerPayload(makeValues({styleId: ''}))).toBeNull();
  });

  it('should block when beverageType is unselected', function () {
    expect(toBeerPayload(makeValues({beverageType: ''}))).toBeNull();
  });
});

describe('parseDeleteResult', function () {
  it('should treat a 200 as success', function () {
    expect(parseDeleteResult(200, {ok: true})).toEqual({ok: true});
  });

  it('should map a 409 body to the blocking dependent counts', function () {
    const result = parseDeleteResult(409, {
      error: 'has dependents',
      dependents: {stats: 4, eventLinks: 2},
    });

    expect(result).toEqual({
      ok: false,
      dependents: {stats: 4, eventLinks: 2},
    });
  });

  it('should default missing dependent counts to zero on a 409', function () {
    const result = parseDeleteResult(409, {dependents: {stats: 3}});

    expect(result).toEqual({
      ok: false,
      dependents: {stats: 3, eventLinks: 0},
    });
  });

  it('should not throw when a 409 body is malformed', function () {
    const result = parseDeleteResult(409, {});

    expect(result).toEqual({
      ok: false,
      dependents: {stats: 0, eventLinks: 0},
    });
  });
});
