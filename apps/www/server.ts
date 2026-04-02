import {join} from 'node:path';

const clientDir = join(import.meta.dir, 'dist', 'client');

const ssrModule = await import('./dist/server/server.js');
const ssrHandler = ssrModule.default;

export default {
  port: process.env.PORT ?? 3000,
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    // Serve static assets from dist/client/
    const filePath = join(clientDir, url.pathname);
    const file = Bun.file(filePath);
    if (await file.exists()) {
      return new Response(file);
    }

    // Fall through to SSR
    return ssrHandler.fetch(request);
  },
};
