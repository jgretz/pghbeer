import {Hono} from 'hono';
import {
  createEvent,
  createEventSchema,
  deleteEvent,
  listEvents,
  updateEvent,
  updateEventSchema,
} from '@domain';

export const eventRoutes = new Hono();

eventRoutes.get('/', async (c) => {
  return c.json(await listEvents());
});

eventRoutes.post('/', async (c) => {
  const parsed = createEventSchema.safeParse(await c.req.json());
  if (!parsed.success) {
    return c.json({error: parsed.error.flatten()}, 400);
  }

  return c.json(await createEvent(parsed.data), 201);
});

eventRoutes.patch('/:id', async (c) => {
  const id = Number(c.req.param('id'));
  if (Number.isNaN(id)) return c.json({error: 'invalid id'}, 400);

  const parsed = updateEventSchema.safeParse(await c.req.json());
  if (!parsed.success) {
    return c.json({error: parsed.error.flatten()}, 400);
  }

  const updated = await updateEvent(id, parsed.data);
  if (!updated) return c.json({error: 'not found'}, 404);

  return c.json(updated);
});

eventRoutes.delete('/:id', async (c) => {
  const id = Number(c.req.param('id'));
  if (Number.isNaN(id)) return c.json({error: 'invalid id'}, 400);

  const result = await deleteEvent(id);
  if (!result.ok) {
    return c.json({error: 'has dependents', dependents: result.dependents}, 409);
  }

  return c.json({ok: true});
});
