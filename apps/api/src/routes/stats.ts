import {Hono} from 'hono';
import {statsForEvent, updateStats, updateStatsSchema} from '@domain';

export const statsRoutes = new Hono();

statsRoutes.get('/stats', async (c) => {
  const eventId = Number(c.req.query('event_id'));
  if (!eventId) return c.json({error: 'event_id is required'}, 400);

  const data = await statsForEvent(eventId);
  return c.json(data);
});

statsRoutes.post('/stats', async (c) => {
  const body = await c.req.json();
  const parsed = updateStatsSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({error: parsed.error.flatten()}, 400);
  }

  await updateStats(parsed.data);
  return c.json({ok: true});
});
