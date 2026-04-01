# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

PghBeer.com — a beer festival checklist app for Pittsburgh's Beers of the Burgh festivals. Users browse beers by brewery, search, track tastings, and view stats. Mobile-first — primary use is on phones during events.

## Architecture

Bun monorepo with workspaces, deployed to Fly.io:

- **`apps/api/`** — Hono REST API (Drizzle ORM, PostgreSQL). Deployed as `pghbeer-api`.
- **`apps/www/`** — TanStack Start frontend (stub — UI migration in progress).
- **`apps/site-legacy/`** — Old Remix v1 frontend (reference only, not deployed).
- **`packages/database/`** — Drizzle schema + `createDatabase()` factory.
- **`packages/domain/`** — Business logic (queries, commands, types).
- **`packages/env/`** — Zod-based `parseEnv()`.
- **`deploy/`** — Dockerfiles and fly.toml per app.
- **`scripts/import.ts`** — CLI to load beer data from `scripts/data/{year}/`.

### Data flow

The www app fetches from the API. The API's `/dataforevent?event_id=` endpoint aggregates beers, breweries, styles for a given event. `/stats` handles user tasting records. User identity is a client-generated UUID stored in localStorage.

### Database

PostgreSQL via Drizzle ORM. Schema in `packages/database/schema/`. Core tables: `beers`, `breweries`, `styles`, `events`, `eventbeerlist` (many-to-many), `stats` (user opinions), `users`.

## Commands

```bash
bun install              # install all workspace deps
bun run dev              # start api + www concurrently
bun run dev:api          # api only (port 3001)
bun run dev:www          # www only (port 3000)
bun run typecheck        # tsc across all packages
bun run db:generate      # drizzle-kit generate migration
bun run db:migrate       # drizzle-kit apply migrations
bun run import           # load beer data (needs DATABASE_URL, EVENT_ID, DATA_FILE env vars)
bun run deploy:api       # fly deploy api
bun run deploy:www       # fly deploy www
```

## Key patterns

- API routes in `apps/api/src/routes/`, domain logic in `packages/domain/`.
- TanStack Start file-based routing in `apps/www/src/routes/`.
- `routeTree.gen.ts` is auto-generated — do not edit.
- Local dev requires `DATABASE_URL` in `.env` at root or in the api app.
