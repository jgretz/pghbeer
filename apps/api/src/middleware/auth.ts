import type {Context, Next} from 'hono';

export function authMiddleware(getApiKey: () => string) {
  return async (c: Context, next: Next) => {
    const authHeader = c.req.header('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return c.json({error: 'Unauthorized'}, 401);
    }

    const token = authHeader.slice(7);
    if (token !== getApiKey()) {
      return c.json({error: 'Unauthorized'}, 401);
    }

    await next();
  };
}
