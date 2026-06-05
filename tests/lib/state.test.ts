import {afterEach, describe, expect, it} from 'bun:test';
import {tmpdir} from 'node:os';
import {unlink} from 'node:fs/promises';

import {
  beerKey,
  loadLedger,
  rowHash,
  rowKey,
  saveLedger,
  type Ledger,
} from '../../scripts/lib/state.ts';
import type {SheetRow} from '../../scripts/lib/sheet.ts';

const row = (over: Partial<SheetRow> = {}): SheetRow => ({
  rowIndex: 2,
  timestamp: '5/28/2026 12:00:17',
  brewery: 'Penn Brewery',
  beerListRaw: 'Penn Light 4.1',
  naRaw: '',
  specialRaw: '',
  ...over,
});

describe('rowHash', () => {
  it('should ignore fields outside the beer-bearing columns', () => {
    expect(rowHash(row())).toBe(
      rowHash(row({timestamp: 'different', rowIndex: 99, brewery: 'Renamed'})),
    );
  });

  it('should change when a beer cell changes', () => {
    expect(rowHash(row())).not.toBe(rowHash(row({beerListRaw: 'Penn Light 4.2'})));
    expect(rowHash(row())).not.toBe(rowHash(row({naRaw: 'Free For All NA IPA'})));
  });
});

describe('rowKey', () => {
  it('should use the timestamp as identity', () => {
    expect(rowKey(row())).toBe('5/28/2026 12:00:17');
  });

  it('should fall back to the row index when timestamp is blank', () => {
    expect(rowKey(row({timestamp: ''}))).toBe('row-2');
  });
});

describe('beerKey', () => {
  it('should be stable across case and surrounding whitespace', () => {
    expect(beerKey('Penn Brewery', 'Penn Light')).toBe(beerKey('  penn brewery ', 'PENN LIGHT'));
  });

  it('should differ by brewery', () => {
    expect(beerKey('Penn Brewery', 'Light')).not.toBe(beerKey('Trace Brewing', 'Light'));
  });
});

describe('loadLedger / saveLedger', () => {
  const paths: string[] = [];
  const tmpPath = () => {
    const p = `${tmpdir()}/ledger-${Date.now()}-${paths.length}.json`;
    paths.push(p);
    return p;
  };

  afterEach(async () => {
    await Promise.all(paths.map((p) => unlink(p).catch(() => undefined)));
    paths.length = 0;
  });

  it('should return an empty ledger when the file is absent', async () => {
    const led = await loadLedger(tmpPath());
    expect(led).toEqual({rows: {}, enrichment: {}});
  });

  it('should round-trip rows and enrichment', async () => {
    const path = tmpPath();
    const led: Ledger = {
      rows: {
        ts1: {
          hash: 'h',
          status: 'parsed',
          beers: [{name: 'X', style: 'IPA', abv: 5, isNa: false}],
          parsedAt: 'now',
        },
      },
      enrichment: {bk1: {style: 'Stout', abv: 7, isNa: false, sources: ['https://x'], at: 'now'}},
    };
    await saveLedger(path, led);
    expect(await loadLedger(path)).toEqual(led);
  });

  it('should throw on a corrupt ledger file', async () => {
    const path = tmpPath();
    await Bun.write(path, '{not json');
    await expect(loadLedger(path)).rejects.toThrow(/corrupt ledger/);
  });
});
