import {mkdir} from 'node:fs/promises';
import {join} from 'node:path';

import {createDatabase} from 'database';

import {fetchFormRows, type SheetSource} from './lib/sheet.ts';
import {loadLedger, saveLedger} from './lib/state.ts';
import {planRows} from './lib/plan.ts';
import {preview} from './lib/preview.ts';
import {resolveParses} from './lib/resolve-parses.ts';
import {resolveEnrichment} from './lib/resolve-enrichment.ts';
import {resolveClassification} from './lib/resolve-classification.ts';
import {persist} from './lib/persist.ts';
import {writeReport} from './lib/report.ts';

// The festival publishes responses across two Google Forms with different layouts:
// the original brewery form and a separate form for non-brewery vendors.
const SOURCES: SheetSource[] = [
  {
    name: 'brewery-form',
    spreadsheetId: process.env.SHEET_ID ?? '1z72xbr5QMxGOAHYKL5rqRUVtLoVvmGNkceUqX5xgS7w',
    gid: Number(process.env.SHEET_GID ?? 550756003),
    columns: {timestamp: 0, brewery: 1, beerList: 10, na: 12, special: 13},
    range: 'A1:N1000',
    header: {brewery: 'brewery', beer: 'beer'},
    keyPrefix: '', // original sheet — bare timestamps preserve the existing ledger
  },
  {
    name: 'vendor-form',
    spreadsheetId: '1xluK34ouzg7Def9erODdyv6Vqjt7xCxfa_a-JPsYdE8',
    gid: 709109338,
    columns: {timestamp: 0, brewery: 1, beerList: 7, na: 9, special: 10},
    range: 'A1:K1000',
    header: {brewery: 'vendor', beer: 'drink'},
    keyPrefix: 'vendor:',
  },
];
// Absolute so the runway runner (a separate process with its own cwd) and otter's
// fileExists success-check resolve the batch output files to the same place we do.
const STATE_PATH = join(import.meta.dir, '.import-state.json');
const REPORT_PATH = join(import.meta.dir, '.import-report.json');
const TMP_DIR = join(import.meta.dir, '.import-tmp');

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error('DATABASE_URL is required');
  const eventId = Number(process.env.EVENT_ID ?? 8);
  const dryRun = process.env.DRY_RUN === '1' || process.env.DRY_RUN === 'true';

  const perSource = await Promise.all(SOURCES.map(fetchFormRows));
  const rows = perSource.flat();
  const ledger = await loadLedger(STATE_PATH);
  const counts = SOURCES.map((s, i) => `${s.name}=${perSource[i]!.length}`).join(', ');
  console.log(`Fetched ${rows.length} rows (${counts}); importing into event ${eventId}`);

  const plan = planRows(rows, ledger);
  if (dryRun) return preview(plan);

  await mkdir(TMP_DIR, {recursive: true});
  const runway = {tmpDir: TMP_DIR, runStamp: String(Date.now())};

  const errors = await resolveParses(plan.fresh, runway);
  const review = await resolveEnrichment(plan.fresh, ledger, runway);
  // After enrichment so newly web-filled styles get a beverage type too.
  const classifications = await resolveClassification(plan, ledger, runway);

  const beerCount = await persist(
    {db: createDatabase(databaseUrl)},
    plan,
    ledger,
    eventId,
    classifications,
  );

  await saveLedger(STATE_PATH, ledger);
  await writeReport(REPORT_PATH, {eventId, errors, review});

  console.log(
    `Done. ${plan.fresh.length} row(s) processed, ${plan.cached.length} cached, ${beerCount} beer link(s). ` +
      `${errors.length} error(s), ${review.length} value(s) to review → ${REPORT_PATH}`,
  );
}

main().then(() => process.exit(0));
