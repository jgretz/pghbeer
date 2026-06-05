import {mkdir} from 'node:fs/promises';
import {join} from 'node:path';

import {createDatabase} from 'database';

import {fetchFormRows} from './lib/sheet.ts';
import {loadLedger, saveLedger} from './lib/state.ts';
import {planRows} from './lib/plan.ts';
import {preview} from './lib/preview.ts';
import {resolveParses} from './lib/resolve-parses.ts';
import {resolveEnrichment} from './lib/resolve-enrichment.ts';
import {persist} from './lib/persist.ts';
import {writeReport} from './lib/report.ts';

const SPREADSHEET_ID = process.env.SHEET_ID ?? '1z72xbr5QMxGOAHYKL5rqRUVtLoVvmGNkceUqX5xgS7w';
const GID = Number(process.env.SHEET_GID ?? 550756003);
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

  const rows = await fetchFormRows({spreadsheetId: SPREADSHEET_ID, gid: GID});
  const ledger = await loadLedger(STATE_PATH);
  console.log(`Fetched ${rows.length} brewery rows; importing into event ${eventId}`);

  const plan = planRows(rows, ledger);
  if (dryRun) return preview(plan);

  await mkdir(TMP_DIR, {recursive: true});
  const runway = {tmpDir: TMP_DIR, runStamp: String(Date.now())};

  const errors = await resolveParses(plan.fresh, runway);
  const review = await resolveEnrichment(plan.fresh, ledger, runway);

  const beerCount = await persist({db: createDatabase(databaseUrl)}, plan, ledger, eventId);

  await saveLedger(STATE_PATH, ledger);
  await writeReport(REPORT_PATH, {eventId, errors, review});

  console.log(
    `Done. ${plan.fresh.length} row(s) processed, ${plan.cached.length} cached, ${beerCount} beer link(s). ` +
      `${errors.length} error(s), ${review.length} value(s) to review → ${REPORT_PATH}`,
  );
}

main().then(() => process.exit(0));
