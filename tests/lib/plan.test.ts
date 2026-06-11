import {describe, expect, it} from 'bun:test';

import {planRows} from '../../scripts/lib/plan.ts';
import {emptyLedger, rowHash, rowKey, type Ledger} from '../../scripts/lib/state.ts';
import type {SheetRow} from '../../scripts/lib/sheet.ts';

const row = (over: Partial<SheetRow> = {}): SheetRow => ({
  rowIndex: 2,
  timestamp: '5/28/2026 12:00:17',
  brewery: 'Spoonwood',
  beerListRaw: 'Shooting Space - West Coast Pils 4.8%',
  naRaw: '',
  specialRaw: '',
  ...over,
});

describe('planRows', () => {
  it('should deterministically parse a clean K cell with no pending cells', () => {
    const {fresh, cached} = planRows([row()], emptyLedger());
    expect(cached).toHaveLength(0);
    expect(fresh).toHaveLength(1);
    expect(fresh[0]!.beers).toEqual([
      {name: 'Shooting Space', style: 'West Coast Pils', abv: 4.8, isNa: false},
    ]);
    expect(fresh[0]!.pending).toHaveLength(0);
  });

  it('should queue an unparseable K cell as a primary pending cell', () => {
    const {fresh} = planRows(
      [row({beerListRaw: 'Banana Hammock Hefeweizen, Gabagool Pils'})],
      emptyLedger(),
    );
    expect(fresh[0]!.beers).toHaveLength(0);
    expect(fresh[0]!.pending).toEqual([
      {
        key: '5/28/2026 12:00:17|K',
        kind: 'primary',
        raw: 'Banana Hammock Hefeweizen, Gabagool Pils',
      },
    ]);
  });

  it('should queue non-noise M/N cells as extras and skip noise', () => {
    const {fresh} = planRows(
      [row({naRaw: 'Option 1', specialRaw: 'Free For All NA IPA'})],
      emptyLedger(),
    );
    expect(fresh[0]!.pending.map((c) => c.kind)).toEqual(['extra']);
    expect(fresh[0]!.pending[0]!.key).toBe('5/28/2026 12:00:17|N');
  });

  it('should reuse a row from the ledger when the hash matches', () => {
    const r = row();
    const ledger: Ledger = {
      rows: {[rowKey(r)]: {hash: rowHash(r), status: 'parsed', beers: [], parsedAt: 'now'}},
      enrichment: {},
      classification: {},
    };
    const {fresh, cached} = planRows([r], ledger);
    expect(fresh).toHaveLength(0);
    expect(cached).toHaveLength(1);
  });

  it('should reprocess a row whose cached status is error', () => {
    const r = row();
    const ledger: Ledger = {
      rows: {[rowKey(r)]: {hash: rowHash(r), status: 'error', beers: [], parsedAt: 'now'}},
      enrichment: {},
      classification: {},
    };
    const {fresh, cached} = planRows([r], ledger);
    expect(fresh).toHaveLength(1);
    expect(cached).toHaveLength(0);
  });

  it('should use a K-cell override verbatim and queue no pending cell', () => {
    const {fresh} = planRows(
      [
        row({
          brewery: 'Lucky Sign Spirits',
          beerListRaw: 'Canned cocktails - Key Lime & Dill, Blood Orange & Rosemary',
        }),
      ],
      emptyLedger(),
    );
    expect(fresh[0]!.beers.map((b) => b.name)).toEqual([
      'Key Lime & Dill',
      'Blood Orange & Rosemary',
    ]);
    expect(fresh[0]!.pending).toHaveLength(0);
  });

  it('should fold an M-cell override in as deduped extras', () => {
    const {fresh} = planRows(
      [
        row({
          brewery: 'Lucky Sign Spirits',
          beerListRaw: 'Canned cocktails - Key Lime & Dill, Blood Orange & Rosemary',
          naRaw: 'Grapefruit Cucumber Dill - Watermelon Elderflower Basil - maybe more',
        }),
      ],
      emptyLedger(),
    );
    expect(fresh[0]!.beers.map((b) => b.name)).toEqual([
      'Key Lime & Dill',
      'Blood Orange & Rosemary',
      'Grapefruit Cucumber Dill',
      'Watermelon Elderflower Basil',
    ]);
    expect(fresh[0]!.pending).toHaveLength(0);
  });

  it('should re-plan an overridden row even when the ledger holds an old parse', () => {
    const r = row({
      brewery: 'Lucky Sign Spirits',
      beerListRaw: 'Canned cocktails - Key Lime & Dill, Blood Orange & Rosemary',
    });
    const stale = [{name: 'Canned cocktails', style: null, abv: null, isNa: false}];
    const ledger: Ledger = {
      rows: {[rowKey(r)]: {hash: rowHash(r), status: 'parsed', beers: stale, parsedAt: 'now'}},
      enrichment: {},
      classification: {},
    };
    const {fresh, cached} = planRows([r], ledger);
    expect(cached).toHaveLength(0);
    expect(fresh[0]!.beers.map((b) => b.name)).toEqual([
      'Key Lime & Dill',
      'Blood Orange & Rosemary',
    ]);
  });
});
