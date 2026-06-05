import {createDatabase, type Database} from 'database';

let instance: Database | null = null;

export function init(databaseUrl: string): void {
  if (instance) throw new Error('domain already initialized');
  instance = createDatabase(databaseUrl);
}

export function getDb(): Database {
  if (!instance) throw new Error('domain not initialized — call init() first');
  return instance;
}

// Test-only injection point. pglite's PgliteDatabase is structurally compatible
// with the queries we run but not nominally equal to PostgresJsDatabase, so the
// cast lives once at the test boundary (see drizzle repo-boundary rule).
export function setDatabaseForTests(db: Database): void {
  instance = db;
}
