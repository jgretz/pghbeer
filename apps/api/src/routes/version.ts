import {Hono} from 'hono';
import {getEventVersion} from '@domain';

export const versionRoutes = new Hono();

// Public, ultra-cheap data-version probe (one indexed PK lookup). The festival
// app fetches this on load and refetches its cached beer list + map only when
// the version changed — no continuous polling.
versionRoutes.get('/version', async (c) => {
  const eventId = Number(c.req.query('event_id'));
  if (!eventId) return c.json({error: 'event_id is required'}, 400);

  const result = await getEventVersion(eventId);
  if (!result) return c.json({error: 'not found'}, 404);

  return c.json(result);
});
