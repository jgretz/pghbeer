import {Hono} from 'hono';
import {
  createBeer,
  createBeerSchema,
  deleteBeer,
  listBeers,
  updateBeer,
  updateBeerSchema,
} from '@domain';

export const beerRoutes = new Hono();

beerRoutes.get('/', async (c) => {
  return c.json(await listBeers());
});

beerRoutes.post('/', async (c) => {
  const parsed = createBeerSchema.safeParse(await c.req.json());
  if (!parsed.success) {
    return c.json({error: parsed.error.flatten()}, 400);
  }

  return c.json(await createBeer(parsed.data), 201);
});

beerRoutes.patch('/:id', async (c) => {
  const id = Number(c.req.param('id'));
  if (Number.isNaN(id)) return c.json({error: 'invalid id'}, 400);

  const parsed = updateBeerSchema.safeParse(await c.req.json());
  if (!parsed.success) {
    return c.json({error: parsed.error.flatten()}, 400);
  }

  const updated = await updateBeer(id, parsed.data);
  if (!updated) return c.json({error: 'not found'}, 404);

  return c.json(updated);
});

beerRoutes.delete('/:id', async (c) => {
  const id = Number(c.req.param('id'));
  if (Number.isNaN(id)) return c.json({error: 'invalid id'}, 400);

  const result = await deleteBeer(id);
  if (!result.ok) {
    return c.json({error: 'has dependents', dependents: result.dependents}, 409);
  }

  return c.json({ok: true});
});
