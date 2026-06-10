import {Hono} from 'hono';
import {
  assignBreweryToSlot,
  assignBrewerySchema,
  createLayout,
  createLayoutSchema,
  deleteLayout,
  deleteSlot,
  duplicateLayout,
  duplicateLayoutSchema,
  getLayout,
  listLayouts,
  previewLayoutSwitch,
  setActiveLayout,
  setActiveLayoutSchema,
  setMapEnabled,
  setMapEnabledSchema,
  updateLayout,
  updateLayoutSchema,
  upsertSlot,
  upsertSlotSchema,
} from '@domain';

// Mounted under /admin/maps (behind the shared Bearer authMiddleware).
export const mapRoutes = new Hono();

// --- Layouts (scoped to an event) ---

mapRoutes.get('/events/:eventId/layouts', async (c) => {
  const eventId = Number(c.req.param('eventId'));
  if (Number.isNaN(eventId)) return c.json({error: 'invalid id'}, 400);

  return c.json(await listLayouts(eventId));
});

mapRoutes.post('/events/:eventId/layouts', async (c) => {
  const eventId = Number(c.req.param('eventId'));
  if (Number.isNaN(eventId)) return c.json({error: 'invalid id'}, 400);

  const parsed = createLayoutSchema.safeParse(await c.req.json());
  if (!parsed.success) return c.json({error: parsed.error.flatten()}, 400);

  return c.json(await createLayout(eventId, parsed.data), 201);
});

mapRoutes.get('/layouts/:layoutId', async (c) => {
  const layoutId = Number(c.req.param('layoutId'));
  if (Number.isNaN(layoutId)) return c.json({error: 'invalid id'}, 400);

  const layout = await getLayout(layoutId);
  if (!layout) return c.json({error: 'not found'}, 404);

  return c.json(layout);
});

mapRoutes.patch('/layouts/:layoutId', async (c) => {
  const layoutId = Number(c.req.param('layoutId'));
  if (Number.isNaN(layoutId)) return c.json({error: 'invalid id'}, 400);

  const parsed = updateLayoutSchema.safeParse(await c.req.json());
  if (!parsed.success) return c.json({error: parsed.error.flatten()}, 400);

  const updated = await updateLayout(layoutId, parsed.data);
  if (!updated) return c.json({error: 'not found'}, 404);

  return c.json(updated);
});

mapRoutes.post('/layouts/:layoutId/duplicate', async (c) => {
  const layoutId = Number(c.req.param('layoutId'));
  if (Number.isNaN(layoutId)) return c.json({error: 'invalid id'}, 400);

  const parsed = duplicateLayoutSchema.safeParse(await c.req.json());
  if (!parsed.success) return c.json({error: parsed.error.flatten()}, 400);

  const created = await duplicateLayout(layoutId, parsed.data.name);
  if (!created) return c.json({error: 'not found'}, 404);

  return c.json(created, 201);
});

mapRoutes.delete('/layouts/:layoutId', async (c) => {
  const layoutId = Number(c.req.param('layoutId'));
  if (Number.isNaN(layoutId)) return c.json({error: 'invalid id'}, 400);

  const result = await deleteLayout(layoutId);
  if (!result.ok) {
    return c.json({error: 'has dependents', dependents: result.dependents}, 409);
  }

  return c.json({ok: true});
});

// --- Active layout & visibility flag ---

mapRoutes.get('/events/:eventId/switch-preview/:layoutId', async (c) => {
  const eventId = Number(c.req.param('eventId'));
  const layoutId = Number(c.req.param('layoutId'));
  if (Number.isNaN(eventId) || Number.isNaN(layoutId)) {
    return c.json({error: 'invalid id'}, 400);
  }

  return c.json(await previewLayoutSwitch(eventId, layoutId));
});

mapRoutes.post('/events/:eventId/active', async (c) => {
  const eventId = Number(c.req.param('eventId'));
  if (Number.isNaN(eventId)) return c.json({error: 'invalid id'}, 400);

  const parsed = setActiveLayoutSchema.safeParse(await c.req.json());
  if (!parsed.success) return c.json({error: parsed.error.flatten()}, 400);

  const result = await setActiveLayout(eventId, parsed.data.layoutId);
  if (!result) return c.json({error: 'not found'}, 404);

  return c.json(result);
});

mapRoutes.patch('/events/:eventId/enabled', async (c) => {
  const eventId = Number(c.req.param('eventId'));
  if (Number.isNaN(eventId)) return c.json({error: 'invalid id'}, 400);

  const parsed = setMapEnabledSchema.safeParse(await c.req.json());
  if (!parsed.success) return c.json({error: parsed.error.flatten()}, 400);

  const result = await setMapEnabled(eventId, parsed.data.enabled);
  if (!result) return c.json({error: 'not found'}, 404);

  return c.json(result);
});

// --- Slots ---

mapRoutes.post('/layouts/:layoutId/slots', async (c) => {
  const layoutId = Number(c.req.param('layoutId'));
  if (Number.isNaN(layoutId)) return c.json({error: 'invalid id'}, 400);

  const parsed = upsertSlotSchema.safeParse(await c.req.json());
  if (!parsed.success) return c.json({error: parsed.error.flatten()}, 400);

  // POST always creates — ignore any id in the body.
  return c.json(await upsertSlot(layoutId, {...parsed.data, id: undefined}), 201);
});

mapRoutes.patch('/layouts/:layoutId/slots/:slotId', async (c) => {
  const layoutId = Number(c.req.param('layoutId'));
  const slotId = Number(c.req.param('slotId'));
  if (Number.isNaN(layoutId) || Number.isNaN(slotId)) {
    return c.json({error: 'invalid id'}, 400);
  }

  const parsed = upsertSlotSchema.safeParse(await c.req.json());
  if (!parsed.success) return c.json({error: parsed.error.flatten()}, 400);

  const updated = await upsertSlot(layoutId, {...parsed.data, id: slotId});
  if (!updated) return c.json({error: 'not found'}, 404);

  return c.json(updated);
});

mapRoutes.delete('/slots/:slotId', async (c) => {
  const slotId = Number(c.req.param('slotId'));
  if (Number.isNaN(slotId)) return c.json({error: 'invalid id'}, 400);

  return c.json(await deleteSlot(slotId));
});

mapRoutes.patch('/slots/:slotId/assignment', async (c) => {
  const slotId = Number(c.req.param('slotId'));
  if (Number.isNaN(slotId)) return c.json({error: 'invalid id'}, 400);

  const parsed = assignBrewerySchema.safeParse(await c.req.json());
  if (!parsed.success) return c.json({error: parsed.error.flatten()}, 400);

  const updated = await assignBreweryToSlot(slotId, parsed.data.breweryId);
  if (!updated) return c.json({error: 'not found'}, 404);

  return c.json(updated);
});
