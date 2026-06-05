import {describe, expect, it} from 'bun:test';
import {Hono} from 'hono';

import {authMiddleware} from '../src/middleware/auth';
import {breweryRoutes} from '../src/routes/admin/breweries';

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
