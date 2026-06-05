import {PGlite} from '@electric-sql/pglite';
import {beforeEach, describe, expect, it} from 'bun:test';
import {createBeer, createBrewery, createStyle, setDatabaseForTests} from '@domain';
import {type Database} from 'database';
import * as schema from 'database';
import {pushSchema} from 'drizzle-kit/api';
import {drizzle} from 'drizzle-orm/pglite';
import {Hono} from 'hono';

import {authMiddleware} from '../src/middleware/auth';
import {breweryRoutes} from '../src/routes/admin/breweries';

// Bootstraps a fresh in-memory pglite and injects it into the domain singleton.
// Mirrors packages/domain/tests/helpers/test-db.ts; the helper can't be shared
// because cross-package imports into another package's tests dir are disallowed.
async function setupTestDb(): Promise<void> {
  const db = drizzle(new PGlite(), {schema});
  const {apply} = await pushSchema(
    schema as unknown as Record<string, unknown>,
    db as never,
  );
  await apply();
  setDatabaseForTests(db as unknown as Database);
}

// These cases never reach a domain command: the auth middleware rejects before
// the handler (401), and zod validation rejects before the DB call (400). So
// no database is needed — this mirrors how adminRoutes wires auth + sub-routers
// without importing the env-coupled admin/index.ts.
function buildApp(apiKey: string) {
  const app = new Hono();
  app.use('/*', authMiddleware(() => apiKey));
  app.route('/breweries', breweryRoutes);
  return app;
}

describe('admin route auth', function () {
  it('should return 401 when the Authorization header is missing', async function () {
    const app = buildApp('secret');

    const res = await app.request('/breweries');

    expect(res.status).toBe(401);
  });

  it('should return 401 when the bearer token does not match', async function () {
    const app = buildApp('secret');

    const res = await app.request('/breweries', {
      headers: {Authorization: 'Bearer wrong'},
    });

    expect(res.status).toBe(401);
  });
});

describe('admin route validation', function () {
  it('should return 400 when the request body fails schema validation', async function () {
    const app = buildApp('secret');

    const res = await app.request('/breweries', {
      method: 'POST',
      headers: {Authorization: 'Bearer secret', 'Content-Type': 'application/json'},
      body: JSON.stringify({name: ''}),
    });

    expect(res.status).toBe(400);
  });
});

describe('admin route blocked delete', function () {
  beforeEach(async function () {
    await setupTestDb();
  });

  it('should return 409 with dependents when the row has dependents', async function () {
    const brewery = await createBrewery({name: 'Has Beers'});
    const style = await createStyle({name: 'IPA'});
    await createBeer({
      name: 'Flagship',
      abv: 6.5,
      beverageType: 'beer',
      isNa: false,
      breweryId: brewery.id,
      styleId: style.id,
    });

    const app = buildApp('secret');
    const res = await app.request(`/breweries/${brewery.id}`, {
      method: 'DELETE',
      headers: {Authorization: 'Bearer secret'},
    });

    expect(res.status).toBe(409);
    expect(await res.json()).toEqual({error: 'has dependents', dependents: {beers: 1}});
  });
});
