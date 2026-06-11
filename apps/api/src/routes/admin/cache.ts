import {Hono} from 'hono';
import {z} from 'zod';
import {bumpEventVersion} from '@domain';

// Mounted under /admin/cache (behind the shared Bearer authMiddleware).
export const cacheRoutes = new Hono();

const bustSchema = z.object({eventId: z.number().int().positive()});

// Stamps a new data version for the event so attendee phones refetch the beer
// list + map on their next page load.
cacheRoutes.post('/bust', async (c) => {
  const parsed = bustSchema.safeParse(await c.req.json());
  if (!parsed.success) return c.json({error: parsed.error.flatten()}, 400);

  const result = await bumpEventVersion(parsed.data.eventId);
  if (!result) return c.json({error: 'not found'}, 404);

  return c.json(result);
});
