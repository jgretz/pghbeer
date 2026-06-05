import {describe, expect, it} from 'bun:test';

import {parseDeleteResult} from '../../../src/lib/admin/breweries';

describe('parseDeleteResult', function () {
  it('should return {ok:true} for a 200 success', function () {
    expect(parseDeleteResult(200, {ok: true})).toEqual({ok: true});
  });

  it('should surface dependents for a 409 blocked delete', function () {
    const body = {error: 'has dependents', dependents: {beers: 3}};

    expect(parseDeleteResult(409, body)).toEqual({
      ok: false,
      dependents: {beers: 3},
    });
  });

  it('should default dependents to {} when a 409 body omits them', function () {
    expect(parseDeleteResult(409, {error: 'has dependents'})).toEqual({
      ok: false,
      dependents: {},
    });
  });

  it('should throw on an unexpected status', function () {
    expect(() => parseDeleteResult(500, {error: 'boom'})).toThrow();
  });
});
