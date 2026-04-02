import {Hono} from 'hono';
import {cors} from 'hono/cors';
import {z} from 'zod';
import {parseEnv} from 'env';
import {init as initDomain} from '@domain';
import {healthRoutes} from './routes/health';
import {dataForEventRoutes} from './routes/dataforevent';
import {statsRoutes} from './routes/stats';

const envSchema = z.object({
  PORT: z.string().default('3001'),
  DATABASE_URL: z.string(),
  API_KEY: z.string(),
});
const env = parseEnv(envSchema);

export {env};

initDomain(env.DATABASE_URL);

const app = new Hono();

app.use('/*', cors());

app.route('/', healthRoutes);
app.route('/', dataForEventRoutes);
app.route('/', statsRoutes);

app.onError((err, c) => {
  const message = err instanceof Error ? err.message : 'Internal server error';
  console.error('API error:', err);
  return c.json({error: message}, 500);
});

console.log(`pghbeer-api is running on port ${env.PORT}`);

export default {
  port: Number(env.PORT),
  hostname: '0.0.0.0',
  fetch: app.fetch,
};
