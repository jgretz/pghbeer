import {describe, expect, it} from 'bun:test';

import {parseDeleteResult} from '../../../src/lib/admin/styles';

describe('parseDeleteResult', function () {
  it('should return ok when the status is 200', function () {
    expect(parseDeleteResult(200, {ok: true})).toEqual({ok: true});
  });

  it('should surface dependents when the status is 409', function () {
    const result = parseDeleteResult(409, {
      error: 'has dependents',
      dependents: {beers: 3},
    });

    expect(result).toEqual({ok: false, dependents: {beers: 3}});
  });

  it('should default dependents to an empty object when 409 omits them', function () {
    expect(parseDeleteResult(409, {error: 'has dependents'})).toEqual({
      ok: false,
      dependents: {},
    });
  });

  it('should throw on any other non-2xx status', function () {
    expect(() => parseDeleteResult(500, {error: 'boom'})).toThrow();
  });
});
