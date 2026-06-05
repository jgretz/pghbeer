import {afterAll, beforeEach, describe, expect, it, mock} from 'bun:test';

import {listSheetTitles, readSheetValues} from '../src/index.ts';

const originalFetch = global.fetch;

const fakeToken = 'fake-token';
const deps = {getAccessToken: async () => fakeToken};

afterAll(function () {
  global.fetch = originalFetch;
});

beforeEach(function () {
  global.fetch = originalFetch;
});

describe('readSheetValues', function () {
  it('should return the parsed values 2D array when the request succeeds', async function () {
    const values = [['a', 'b'], ['c']];
    let capturedUrl = '';
    let capturedAuth: string | undefined;

    global.fetch = mock(async function (url: string, init: RequestInit) {
      capturedUrl = url;
      capturedAuth = (init.headers as Record<string, string>).Authorization;
      return {
        ok: true,
        status: 200,
        json: async () => ({values}),
      } as unknown as Response;
    }) as unknown as typeof fetch;

    const result = await readSheetValues({spreadsheetId: 'x', range: 'Sheet1!A1:B2'}, deps);

    expect(result).toEqual(values);
    expect(capturedUrl).toContain(encodeURIComponent('Sheet1!A1:B2'));
    expect(capturedAuth).toBe(`Bearer ${fakeToken}`);
  });

  it('should return an empty array when the response has no values', async function () {
    global.fetch = mock(
      async () => ({ok: true, status: 200, json: async () => ({})}) as unknown as Response,
    ) as unknown as typeof fetch;

    const result = await readSheetValues({spreadsheetId: 'x', range: 'Sheet1!A1'}, deps);

    expect(result).toEqual([]);
  });

  it('should reject with the status and body on a non-200 response', async function () {
    global.fetch = mock(
      async () =>
        ({
          ok: false,
          status: 403,
          text: async () => 'permission denied',
        }) as unknown as Response,
    ) as unknown as typeof fetch;

    let message = '';
    try {
      await readSheetValues({spreadsheetId: 'x', range: 'Sheet1!A1'}, deps);
    } catch (error) {
      message = (error as Error).message;
    }

    // message stays '' if the call unexpectedly resolves, failing both asserts.
    expect(message).toContain('403');
    expect(message).toContain('permission denied');
  });
});

describe('listSheetTitles', function () {
  it('should map sheets[].properties.title to a string array', async function () {
    global.fetch = mock(
      async () =>
        ({
          ok: true,
          status: 200,
          json: async () => ({
            sheets: [{properties: {title: 'Beers'}}, {properties: {title: 'Breweries'}}],
          }),
        }) as unknown as Response,
    ) as unknown as typeof fetch;

    const titles = await listSheetTitles({spreadsheetId: 'x'}, deps);

    expect(titles).toEqual(['Beers', 'Breweries']);
  });
});
