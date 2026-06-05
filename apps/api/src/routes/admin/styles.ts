import {Hono} from 'hono';
import {
  createStyle,
  createStyleSchema,
  deleteStyle,
  listStyles,
  updateStyle,
  updateStyleSchema,
} from '@domain';

export const styleRoutes = new Hono();

styleRoutes.get('/', async (c) => {
  return c.json(await listStyles());
});

styleRoutes.post('/', async (c) => {
  const parsed = createStyleSchema.safeParse(await c.req.json());
  if (!parsed.success) {
    return c.json({error: parsed.error.flatten()}, 400);
  }

  return c.json(await createStyle(parsed.data), 201);
});

styleRoutes.patch('/:id', async (c) => {
  const id = Number(c.req.param('id'));
  if (Number.isNaN(id)) return c.json({error: 'invalid id'}, 400);

  const parsed = updateStyleSchema.safeParse(await c.req.json());
  if (!parsed.success) {
    return c.json({error: parsed.error.flatten()}, 400);
  }

  const updated = await updateStyle(id, parsed.data);
  if (!updated) return c.json({error: 'not found'}, 404);

  return c.json(updated);
});

styleRoutes.delete('/:id', async (c) => {
  const id = Number(c.req.param('id'));
  if (Number.isNaN(id)) return c.json({error: 'invalid id'}, 400);

  const result = await deleteStyle(id);
  if (!result.ok) {
    return c.json({error: 'has dependents', dependents: result.dependents}, 409);
  }

  return c.json({ok: true});
});
