import {afterEach, describe, expect, it} from 'bun:test';
import {tmpdir} from 'node:os';
import {mkdir, rm} from 'node:fs/promises';

import {enrichBatch, parseBatch, type ExecuteJob} from '../../scripts/lib/runway-batch.ts';

const dirs: string[] = [];
async function freshDir(): Promise<string> {
  const dir = `${tmpdir()}/runway-batch-${Date.now()}-${dirs.length}`;
  await mkdir(dir, {recursive: true});
  dirs.push(dir);
  return dir;
}

afterEach(async () => {
  await Promise.all(dirs.map((d) => rm(d, {recursive: true, force: true})));
  dirs.length = 0;
});

/** Build a stub runner that writes `payload` (or nothing) to the kind's out file. */
function stubRunner(
  dir: string,
  runStamp: string,
  kind: string,
  payload: unknown | null,
): ExecuteJob {
  return async () => {
    if (payload !== null)
      await Bun.write(`${dir}/${kind}-out-${runStamp}.json`, JSON.stringify(payload));
    return {ok: true};
  };
}

describe('parseBatch', () => {
  it('should map each result key to its beers', async () => {
    const dir = await freshDir();
    const runStamp = 'p1';
    const execute = stubRunner(dir, runStamp, 'parse', {
      results: [
        {key: 'a', beers: [{name: 'Lustra', style: 'Hazy Pale', abv: 5.8, isNa: false}]},
        {key: 'b', beers: []},
      ],
    });
    const map = await parseBatch({tmpDir: dir, runStamp, execute}, [
      {key: 'a', brewery: 'Dancing Gnome', raw: 'Lustra ...'},
      {key: 'b', brewery: 'Trace', raw: 'logistics text'},
    ]);
    expect(map.get('a')).toEqual([{name: 'Lustra', style: 'Hazy Pale', abv: 5.8, isNa: false}]);
    expect(map.get('b')).toEqual([]);
  });

  it('should omit keys the runner never returned', async () => {
    const dir = await freshDir();
    const runStamp = 'p2';
    const execute = stubRunner(dir, runStamp, 'parse', {results: [{key: 'a', beers: []}]});
    const map = await parseBatch({tmpDir: dir, runStamp, execute}, [
      {key: 'a', brewery: 'B', raw: 'x'},
      {key: 'b', brewery: 'B', raw: 'y'},
    ]);
    expect(map.has('b')).toBe(false);
  });

  it('should throw when the job does not succeed', async () => {
    const dir = await freshDir();
    const execute: ExecuteJob = async () => ({ok: false, error: 'job crashed: boom'});
    await expect(
      parseBatch({tmpDir: dir, runStamp: 'p3', execute}, [{key: 'a', brewery: 'B', raw: 'x'}]),
    ).rejects.toThrow(/parse batch failed: job crashed/);
  });

  it('should throw when the success file is missing', async () => {
    const dir = await freshDir();
    const execute = stubRunner(dir, 'p4', 'parse', null); // succeed but write nothing
    await expect(
      parseBatch({tmpDir: dir, runStamp: 'p4', execute}, [{key: 'a', brewery: 'B', raw: 'x'}]),
    ).rejects.toThrow(/output file .* missing/);
  });

  it('should throw when the output file is not valid JSON', async () => {
    const dir = await freshDir();
    const runStamp = 'p5';
    const execute: ExecuteJob = async () => {
      await Bun.write(`${dir}/parse-out-${runStamp}.json`, 'not json {');
      return {ok: true};
    };
    await expect(
      parseBatch({tmpDir: dir, runStamp, execute}, [{key: 'a', brewery: 'B', raw: 'x'}]),
    ).rejects.toThrow(/not valid JSON/);
  });

  it('should drop malformed result items but keep valid ones', async () => {
    const dir = await freshDir();
    const runStamp = 'p6';
    const execute = stubRunner(dir, runStamp, 'parse', {
      results: [
        {key: 'a', beers: [{name: 'Good', style: null, abv: null, isNa: false}]},
        {nope: true}, // no key → dropped
      ],
    });
    const map = await parseBatch({tmpDir: dir, runStamp, execute}, [
      {key: 'a', brewery: 'B', raw: 'x'},
    ]);
    expect([...map.keys()]).toEqual(['a']);
  });
});

describe('enrichBatch', () => {
  it('should map each result key to its enrichment', async () => {
    const dir = await freshDir();
    const runStamp = 'e1';
    const execute = stubRunner(dir, runStamp, 'enrich', {
      results: [
        {key: 'k1', style: 'Hefeweizen', abv: 5, isNa: false, sources: ['https://shubrew.com']},
      ],
    });
    const map = await enrichBatch({tmpDir: dir, runStamp, execute}, [
      {key: 'k1', brewery: 'ShuBrew', name: 'Banana Hammock', style: null, abv: null},
    ]);
    expect(map.get('k1')).toEqual({
      key: 'k1',
      style: 'Hefeweizen',
      abv: 5,
      isNa: false,
      sources: ['https://shubrew.com'],
    });
  });
});
