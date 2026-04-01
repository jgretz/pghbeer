import {Hono} from 'hono';
import {dataForEvent} from '@domain';

export const dataForEventRoutes = new Hono();

dataForEventRoutes.get('/dataforevent', async (c) => {
  const eventId = Number(c.req.query('event_id'));
  if (!eventId) return c.json({error: 'event_id is required'}, 400);

  const data = await dataForEvent(eventId);
  return c.json(data);
});
