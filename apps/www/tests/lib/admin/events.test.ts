import {describe, expect, it} from 'bun:test';

import {parseDeleteResponse} from '../../../src/lib/admin/events';

describe('parseDeleteResponse', function () {
  it('should return ok when the status is 200', function () {
    expect(parseDeleteResponse(200, {ok: true})).toEqual({ok: true});
  });

  it('should return ok when the status is 204 with no body', function () {
    expect(parseDeleteResponse(204, null)).toEqual({ok: true});
  });

  it('should surface dependents from a 409 body', function () {
    const result = parseDeleteResponse(409, {
      error: 'has dependents',
      dependents: {eventLinks: 2},
    });

    expect(result).toEqual({ok: false, dependents: {eventLinks: 2}});
  });

  it('should fall back to empty dependents for a malformed 409 body', function () {
    expect(parseDeleteResponse(409, 'oops')).toEqual({ok: false, dependents: {}});
  });

  it('should fall back to empty dependents for an empty 409 body', function () {
    expect(parseDeleteResponse(409, null)).toEqual({ok: false, dependents: {}});
  });

  it('should throw on a non-409 error status rather than masking it', function () {
    expect(() => parseDeleteResponse(500, {error: 'boom'})).toThrow(
      'Delete failed: 500',
    );
  });
});
