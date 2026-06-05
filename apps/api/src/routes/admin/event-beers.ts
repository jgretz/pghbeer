import {Hono} from 'hono';
import {
  addBeerToEvent,
  addBeerToEventSchema,
  listBeersForEvent,
  removeBeerFromEvent,
} from '@domain';

// Mounted on the same `/events` base as eventRoutes; paths are deeper
// (`/:id/beers`) so they don't collide with the event CRUD routes.
export const eventBeerRoutes = new Hono();

eventBeerRoutes.get('/:id/beers', async (c) => {
  const id = Number(c.req.param('id'));
  if (Number.isNaN(id)) return c.json({error: 'invalid id'}, 400);

  return c.json(await listBeersForEvent(id));
});

eventBeerRoutes.post('/:id/beers', async (c) => {
  const id = Number(c.req.param('id'));
  if (Number.isNaN(id)) return c.json({error: 'invalid id'}, 400);

  const parsed = addBeerToEventSchema.safeParse(await c.req.json());
  if (!parsed.success) {
    return c.json({error: parsed.error.flatten()}, 400);
  }

  await addBeerToEvent(id, parsed.data.beerId);
  return c.json({ok: true});
});

eventBeerRoutes.delete('/:id/beers/:beerId', async (c) => {
  const id = Number(c.req.param('id'));
  const beerId = Number(c.req.param('beerId'));
  if (Number.isNaN(id) || Number.isNaN(beerId)) {
    return c.json({error: 'invalid id'}, 400);
  }

  await removeBeerFromEvent(id, beerId);
  return c.json({ok: true});
});
