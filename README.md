# sass-next-template

Reusable full-stack SaaS starter: Next.js 16 (App Router), TypeScript, Tailwind
CSS 4, Better Auth, Drizzle ORM + PostgreSQL, next-intl, TanStack Query, and a
Cloudflare Workers deploy path via OpenNext — with a self-host/Docker fallback
that needs no code changes.

Based on `spec-template-saas-next16-cloudflare.md`.

## Bootstrap (new project in under 10 commands)

```bash
git clone <this-repo> my-project && cd my-project
corepack enable && pnpm install
cp .env.example .env            # edit BETTER_AUTH_SECRET, DB_PORT, etc.
docker compose -f docker/compose.yaml --env-file .env up -d postgres mailpit
pnpm db:migrate
pnpm db:seed                    # creates demo@sass-next-template.dev / demo12345678
pnpm dev                        # http://localhost:3000
```

Mailpit UI (verification/reset emails in dev): http://localhost:8025

## Commands

| Command | What it does |
|---|---|
| `pnpm dev` / `pnpm build` / `pnpm start` | Next.js dev server / production build / start |
| `pnpm lint` / `pnpm typecheck` / `pnpm format:check` | Quality gates (see `ci:verify` for all three) |
| `pnpm db:generate` | Generate a new Drizzle migration from schema changes |
| `pnpm db:migrate` | Apply migrations to `DATABASE_URL` |
| `pnpm db:seed` | Seed a demo user, organization, and sample project |
| `pnpm db:studio` | Open Drizzle Studio |
| `pnpm test:e2e` / `pnpm test:e2e:ui` | Run the Playwright smoke suite |
| `pnpm cf:build` / `pnpm cf:preview` | Build/preview the Cloudflare Worker via OpenNext |

## Architecture decisions

- **i18n**: `next-intl` with `pt-BR` (default) and `en`, always-prefixed routes
  (`/pt-BR/...`). All example pages/forms are fully translated — no hardcoded
  strings. Locale segment lives at `src/app/[locale]`, which doubles as the
  App Router root (there is no separate top-level `layout.tsx`).
- **Proxy, not Middleware**: Next.js 16 renamed the `middleware.ts` convention
  to `proxy.ts` (the old name is deprecated). `next-intl`'s middleware handler
  is exported from `src/proxy.ts`.
- **Auth**: Better Auth with the Drizzle adapter, email/password +
  verification (Mailpit in dev), and the `organization` plugin for
  multi-tenancy. All IDs (including Better Auth's own tables) are generated
  as UUIDv7 via `advanced.database.generateId` for global sortability.
- **DB**: `postgres.js` locally; on Cloudflare Workers the client resolves its
  connection string from a Hyperdrive binding instead (see `src/db/index.ts`).
  Schema uses `snake_case` in Postgres, `camelCase` in TS (Drizzle `casing`).
- **Server Actions**: every action returns a discriminated
  `{ ok: true, data } | { ok: false, fieldErrors, message? }` result, so React
  Hook Form's `setError` can map field errors back onto the form — including
  with JS disabled, since the same Zod schema validates client and server.
- **Data fetching**: Server Components query Drizzle directly; TanStack Query
  is only used for client-side server-state (the Projects list: cursor
  pagination + optimistic create), hydrated from a server `prefetchInfiniteQuery`.
- **Lint**: `eslint.config.ts` deliberately avoids `eslint-config-next`. That
  package still pulls in `eslint-plugin-react@7.37`, whose peer range caps at
  `eslint@^9.7` and throws at runtime under ESLint 10
  (`context.getFilename is not a function`). We use `@next/eslint-plugin-next`
  directly instead (same Next-specific rules, no broken transitive dependency).
  `eslint-plugin-react-hooks@7`'s **flat** config lives at
  `configs.flat["recommended-latest"]`, not `configs["recommended-latest"]`
  (that one is the legacy eslintrc shape) — easy to get wrong.
- **TypeScript**: pinned to `^5.9` rather than `6.x`. TypeScript 6 never
  shipped stably (the project jumped from 5.x betas to 7.0 on npm); pinning to
  the last 5.x line keeps `typescript-eslint`'s peer range (`<6.1.0`) satisfied.

## Cloudflare deploy limitations

- No `fs` access at runtime; Better Auth and `postgres.js` work under the
  `nodejs_compat` compatibility flag (already set in `wrangler.jsonc`), not the
  Edge Runtime.
- Postgres connections go through a **Hyperdrive** binding (`HYPERDRIVE` in
  `wrangler.jsonc`) rather than a direct TCP pool — Workers don't keep
  long-lived pools.
- Background/cron work should use Cloudflare Cron Triggers/Queues, not
  long-running Node timers.
- `pnpm cf:build` validates the OpenNext build locally. Actual `wrangler
  deploy` requires a real Cloudflare account/API token and is intentionally
  not something this template runs for you.

## Self-host / Docker fallback

The same repository builds as a standalone container for any Node host (VPS,
Fly, Railway, etc.) with **no code changes** — only the `DATABASE_URL` driver
target changes, since `src/db/index.ts` falls back to `postgres.js` with
`process.env.DATABASE_URL` whenever it isn't running on Cloudflare Workers.

```bash
docker compose -f docker/compose.yaml --env-file .env up --build
```

`docker/Dockerfile` is a multi-stage build (`deps` → `build` → `runner`,
`node:24-slim`, non-root user, `output: "standalone"`, `HEALTHCHECK` against
`/api/health`). This image is for dev/self-host only — the Cloudflare deploy
path does not use it (see `cf:build` above).

## Definition of Done checklist

- [x] `git clone` → `.env` → `docker compose up` → app running with auth in <10 commands
- [x] 100% of example-page strings via next-intl (pt-BR + en)
- [x] Zero explicit `any`; `tsc --noEmit` clean under full strict mode
- [ ] Smoke suite green in CI in <5 min (verify in your own CI run)
- [ ] Automatic preview deploy on a test PR (requires your own Cloudflare account/secrets)
- [x] README covers bootstrap, commands, architecture decisions, Cloudflare limitations, self-host fallback
