import {Hono} from 'hono';
import {
  createBrewery,
  createBrewerySchema,
  deleteBrewery,
  listBreweries,
  updateBrewery,
  updateBrewerySchema,
} from '@domain';

export const breweryRoutes = new Hono();

breweryRoutes.get('/', async (c) => {
  return c.json(await listBreweries());
});

breweryRoutes.post('/', async (c) => {
  const parsed = createBrewerySchema.safeParse(await c.req.json());
  if (!parsed.success) {
    return c.json({error: parsed.error.flatten()}, 400);
  }

  return c.json(await createBrewery(parsed.data), 201);
});

breweryRoutes.patch('/:id', async (c) => {
  const id = Number(c.req.param('id'));
  if (Number.isNaN(id)) return c.json({error: 'invalid id'}, 400);

  const parsed = updateBrewerySchema.safeParse(await c.req.json());
  if (!parsed.success) {
    return c.json({error: parsed.error.flatten()}, 400);
  }

  const updated = await updateBrewery(id, parsed.data);
  if (!updated) return c.json({error: 'not found'}, 404);

  return c.json(updated);
});

breweryRoutes.delete('/:id', async (c) => {
  const id = Number(c.req.param('id'));
  if (Number.isNaN(id)) return c.json({error: 'invalid id'}, 400);

  const result = await deleteBrewery(id);
  if (!result.ok) {
    return c.json({error: 'has dependents', dependents: result.dependents}, 409);
  }

  return c.json({ok: true});
});
