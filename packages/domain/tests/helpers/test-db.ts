import {PGlite} from '@electric-sql/pglite';
import {type Database} from 'database';
import * as schema from 'database';
import {pushSchema} from 'drizzle-kit/api';
import {drizzle} from 'drizzle-orm/pglite';

import {setDatabaseForTests} from '../../src/db';

// Spin up a fresh in-memory pglite, bootstrap the schema programmatically
// (the committed migrations are introspection ALTERs that produce an empty
// schema against pglite — see CLAUDE-TASK.md), and inject it into the domain
// singleton. A fresh DB per call keeps tests isolated despite the module-level
// `instance` (testing.md: module-level state persists across a run).
//
// The `schema` namespace includes both tables and pgSequence definitions, so
// pushSchema emits CREATE SEQUENCE before the nextval()-defaulted tables.
export async function setupTestDb(): Promise<Database> {
  const client = new PGlite();
  const db = drizzle(client, {schema});

  const {apply} = await pushSchema(
    schema as unknown as Record<string, unknown>,
    // pglite's PgliteDatabase is not nominally PgDatabase; cast at this single
    // test boundary (drizzle repo-boundary rule).
    db as never,
  );
  await apply();

  // PgliteDatabase != PostgresJsDatabase nominally; the queries the domain runs
  // are structurally compatible. Single cast at the test boundary.
  const injected = db as unknown as Database;
  setDatabaseForTests(injected);
  return injected;
}
