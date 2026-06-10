import {Hono} from 'hono';
import {getEventMap} from '@domain';

export const eventMapRoutes = new Hono();

// Public read for the festival map: the per-event visibility flag plus the
// active layout (if any). Separate from /dataforevent so the client fetches it
// lazily, only when the user opens the map.
eventMapRoutes.get('/eventmap', async (c) => {
  const eventId = Number(c.req.query('event_id'));
  if (!eventId) return c.json({error: 'event_id is required'}, 400);

  return c.json(await getEventMap(eventId));
});
