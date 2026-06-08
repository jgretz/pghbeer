import {afterEach, describe, expect, it} from 'bun:test';
import {tmpdir} from 'node:os';
import {mkdir, rm} from 'node:fs/promises';

import {resolveClassification} from '../../scripts/lib/resolve-classification.ts';
import {emptyLedger} from '../../scripts/lib/state.ts';
import type {ExecuteJob} from '../../scripts/lib/runway-batch.ts';
import type {Plan, FreshRow} from '../../scripts/lib/plan.ts';
import type {ParsedBeer} from '../../scripts/lib/parse-beers.ts';
import type {SheetRow} from '../../scripts/lib/sheet.ts';

const sheetRow = (brewery: string): SheetRow => ({
  rowIndex: 2,
  timestamp: 't',
  brewery,
  beerListRaw: '',
  naRaw: '',
  specialRaw: '',
});

const freshRow = (brewery: string, beers: ParsedBeer[]): FreshRow => ({
  row: sheetRow(brewery),
  beers,
  pending: [],
  error: false,
});

const beer = (style: string | null): ParsedBeer => ({name: 'X', style, abv: null, isNa: false});

describe('resolveClassification', () => {
  const dirs: string[] = [];

  afterEach(async () => {
    await Promise.all(dirs.map((d) => rm(d, {recursive: true, force: true})));
    dirs.length = 0;
  });

  const makeRunway = async (results: Array<{key: string; type: string; isNa?: boolean}>) => {
    const dir = `${tmpdir()}/cls-${dirs.length}-${process.hrtime.bigint()}`;
    await mkdir(dir, {recursive: true});
    dirs.push(dir);
    const runStamp = 'test';
    let calls = 0;
    const execute: ExecuteJob = async () => {
      calls++;
      await Bun.write(`${dir}/classify-out-${runStamp}.json`, JSON.stringify({results}));
      return {ok: true};
    };
    return {runway: {tmpDir: dir, runStamp, execute}, calls: () => calls};
  };

  it('should history-match known styles without calling the LLM', async () => {
    const plan: Plan = {fresh: [freshRow('B', [beer('Hard Apple Cider')])], cached: []};
    const {runway, calls} = await makeRunway([]);

    const resolved = await resolveClassification(plan, emptyLedger(), runway);

    expect(resolved.get('hard apple cider')).toEqual({type: 'cider', isNa: false});
    expect(calls()).toBe(0); // no miss → no batch
  });

  it('should send misses to the LLM and cache the answer into the ledger', async () => {
    const plan: Plan = {fresh: [freshRow('B', [beer('Kombucha')])], cached: []};
    const ledger = emptyLedger();
    const {runway, calls} = await makeRunway([{key: 'kombucha', type: 'hard_tea', isNa: false}]);

    const resolved = await resolveClassification(plan, ledger, runway);

    expect(resolved.get('kombucha')).toEqual({type: 'hard_tea', isNa: false});
    expect(ledger.classification['kombucha']).toMatchObject({type: 'hard_tea', isNa: false});
    expect(calls()).toBe(1);
  });

  it('should default a miss to beer when the batch returns nothing', async () => {
    const plan: Plan = {fresh: [freshRow('B', [beer('Kombucha')])], cached: []};
    const ledger = emptyLedger();
    const {runway} = await makeRunway([]); // batch ran but produced no result for the key

    const resolved = await resolveClassification(plan, ledger, runway);

    expect(resolved.get('kombucha')).toEqual({type: 'beer', isNa: false});
    expect(ledger.classification['kombucha']).toBeUndefined(); // unconfirmed → not cached
  });

  it('should reuse a ledger cache entry instead of re-asking the LLM', async () => {
    const plan: Plan = {fresh: [freshRow('B', [beer('Kombucha')])], cached: []};
    const ledger = emptyLedger();
    ledger.classification['kombucha'] = {type: 'cider', isNa: false, at: 'earlier'};
    const {runway, calls} = await makeRunway([]);

    const resolved = await resolveClassification(plan, ledger, runway);

    expect(resolved.get('kombucha')).toEqual({type: 'cider', isNa: false});
    expect(calls()).toBe(0);
  });
});
