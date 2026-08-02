# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## What this is

Reusable full-stack SaaS starter: Next.js 16 (App Router), TypeScript, Tailwind CSS 4,
Better Auth, Drizzle ORM + PostgreSQL, next-intl, TanStack Query, deployed to Cloudflare
Workers via OpenNext — with a self-host/Docker fallback that needs no code changes.
`README.md` has the full bootstrap steps, command table, and Definition of Done; don't
duplicate that here.

## Commands

```bash
pnpm dev / build / start          # Next.js dev / production build / start
pnpm ci:verify                    # lint + typecheck + format:check (run before considering work done)
pnpm lint / typecheck / format:check
pnpm db:generate                  # regenerate drizzle/ SQL from src/db/schema/
pnpm db:migrate                   # apply migrations (tsx src/db/migrate.ts)
pnpm db:seed                      # demo@sass-next-template.dev / demo12345678
pnpm db:studio
pnpm test:e2e                     # full Playwright suite (auto-runs db:migrate + db:seed via global-setup)
pnpm test:e2e:ui
npx playwright test e2e/auth.spec.ts          # single file
npx playwright test -g "some test name"       # by name
pnpm cf:build / cf:preview        # OpenNext Cloudflare build/preview (local validation only)
```

There is no unit test runner (no Jest/Vitest) — only Playwright. Local Postgres/Mailpit
come from `docker compose -f docker/compose.yaml --env-file .env up -d postgres mailpit`;
Mailpit UI (verification/reset emails) is at http://localhost:8025.

## Architecture

- **i18n-rooted routing**: `src/app/[locale]` is the App Router root — there is no
  top-level `layout.tsx`. Routes are grouped `(marketing)`, `(auth)`, `(app)` under it.
  Locales are `pt-BR` (default) and `en`, always prefixed (`/pt-BR/...`); config in
  `src/i18n/routing.ts`, request config in `src/i18n/request.ts`, and locale-aware
  `Link`/`redirect`/`usePathname`/`useRouter` come from `src/i18n/navigation.ts` — not
  `next/link` / `next/navigation`. Messages live in `src/messages/{pt-BR,en}.json`;
  every user-facing string must exist in both.
- **Only `src/proxy.ts` exists — do not recreate `src/middleware.ts`**: Next.js 16
  renamed the `middleware.ts` convention to `proxy.ts`, and having both present is a
  hard error at startup (`Both middleware file './src/middleware.ts' and proxy file
  './src/proxy.ts' are detected...`), not a silent ignore — this actually broke
  `npm run dev` once when both briefly existed. `src/proxy.ts` wraps next-intl's
  middleware; it's the only file of this kind that should exist in the tree.
- **DB schema is split by domain** under `src/db/schema/*.ts` (`auth.ts`,
  `organizations.ts`, `projects.ts`, `audit-logs.ts`), barrel-exported from
  `src/db/schema/index.ts`, which is what `drizzle.config.ts` and `getDb()` both point
  at. Shared column helpers (`idColumn` = UUIDv7 default, `timestampColumns` =
  `createdAt`/`updatedAt`) live in `src/db/columns.ts` — reuse them on any new table.
  Casing is `snake_case` in Postgres, `camelCase` in TS (Drizzle `casing: "snake_case"`
  in both `drizzle.config.ts` and `getDb()`).
- **`getDb()` is async and environment-aware** (`src/db/index.ts`): it first tries to
  resolve a connection string from a Cloudflare Hyperdrive binding
  (`getCloudflareContext`), and falls back to `env.DATABASE_URL` (plain `postgres.js`)
  everywhere else, including local dev and the Docker self-host path. The resolved
  client is memoized in a module-level `cached` promise — always `await getDb()`, never
  assume a sync `db` export exists.
- **Auth**: Better Auth (`src/lib/auth.ts`, `getAuth()` — also async/memoized) with the
  Drizzle adapter, email/password + required email verification (sent via
  `src/lib/mailer.ts`, Mailpit in dev), Google OAuth only when both `GOOGLE_CLIENT_ID`
  and `GOOGLE_CLIENT_SECRET` are set, and the `organization` plugin for multi-tenancy.
  All IDs — including Better Auth's own tables (`user`, `session`, `account`,
  `verification`, `organization`, `membership`, `invitation`) — are generated as UUIDv7
  via `advanced.database.generateId`. `src/lib/require-session.ts`'s
  `requireSession(locale)` is the page-level guard: no session → `redirect` to
  `/{locale}/login`. The single Next.js catch-all route
  `src/app/api/auth/[...all]/route.ts` (`toNextJsHandler`) serves all Better Auth
  endpoints.
- **Organization scoping is membership-derived, not session-stored**: there's no
  `session.user.organizationId`. Server actions resolve the caller's org by querying
  `membership` for the first row matching `userId` (see
  `requireActiveOrganization()` in `src/lib/actions/projects.ts`) — a user is expected
  to belong to exactly one organization in this template's current form. Follow that
  pattern (schema table → session lookup → membership lookup) for any new tenant-scoped
  resource rather than trusting a client-supplied org id.
- **Server Actions, not API CRUD routes, for app data**: `projects` (the one non-auth
  domain resource) is read/written through `"use server"` actions in
  `src/lib/actions/projects.ts`, not `src/app/api/**` handlers — the only API routes
  today are Better Auth's catch-all and `/api/health`. Every action returns a
  discriminated `ActionResult<T>` (`{ ok: true, data } | { ok: false, fieldErrors,
  message? }`), built from the same Zod schema (`src/schemas/*.ts`) the client form
  validates with via `zodResolver`, so React Hook Form's `setError` can map field errors
  back — including with JS disabled.
- **Data fetching split**: Server Components (e.g. `dashboard`) query Drizzle directly.
  The `projects` list is the one place using TanStack Query for client-side
  server-state — cursor pagination + optimistic create — hydrated from a server
  `prefetchInfiniteQuery`. Query keys are centralized in `src/lib/query-keys.ts`
  (`projectKeys`); the fetcher wrapping the server action is
  `src/lib/queries/projects.ts`. `src/lib/query-client.ts`'s `makeQueryClient()` is
  instantiated per-request in `src/lib/providers.tsx`.
- **Env validation** (`src/lib/env.ts`): a Zod `serverSchema` (DB/auth/SMTP secrets) and
  `clientSchema` (`NEXT_PUBLIC_*`) are parsed at import time — `clientSchema` always,
  `serverSchema` only when `typeof window === "undefined"`. Add any new required env var
  here rather than reading `process.env.X` ad hoc elsewhere, so missing config fails
  fast at boot instead of at first use.
- **Lint config deliberately avoids `eslint-config-next`** (`eslint.config.ts`) — that
  package pulls in `eslint-plugin-react@7.37`, whose peer range caps at `eslint@^9.7`
  and breaks under ESLint 10. `@next/eslint-plugin-next`'s flat config
  (`core-web-vitals`) is used directly instead, alongside
  `eslint-plugin-react-hooks@7`'s `configs.flat["recommended-latest"]` (not the
  legacy-shaped `configs["recommended-latest"]`) and `tseslint.configs.strictTypeChecked`.
- **TypeScript pinned to `^5.9`**, not `6.x` — TS 6 never shipped stably, and pinning
  keeps `typescript-eslint`'s `<6.1.0` peer range satisfied.
- **Node.js pinned to 24** (`.node-version`, `engines.node` in `package.json`, CI's
  `setup-node`, both Dockerfile stages) — matches the version Cloudflare Workers Builds
  defaults to/preinstalls. Bump this file whenever Workers Builds' default changes rather
  than drifting from it.
- **Cloudflare deploy path** (`wrangler.jsonc`, `open-next.config.ts`): OpenNext build
  targets Workers with `nodejs_compat` (required for Better Auth and `postgres.js`, not
  Edge Runtime), a Hyperdrive binding for Postgres (no long-lived TCP pools on Workers),
  a KV namespace for the Next incremental cache, and an R2 bucket. `pnpm cf:build`
  validates the build locally; an actual `wrangler deploy` needs real Cloudflare
  account/API credentials and is intentionally not run by anything in this repo.
- **Self-host/Docker fallback**: `docker/Dockerfile` is a multi-stage
  (`deps`→`build`→`runner`) `node:24-slim` build using `next.config.ts`'s
  `output: "standalone"`, non-root user, `HEALTHCHECK` against `/api/health`. No code
  changes are needed to switch targets — `getDb()`'s Hyperdrive-then-`DATABASE_URL`
  fallback handles it.

## Testing conventions

- One spec file per concern under `e2e/` (`auth.spec.ts`, `landing.spec.ts`,
  `locale-switch.spec.ts`, `projects.spec.ts`). `e2e/global-setup.ts` runs
  `db:migrate && db:seed` before the suite.
- `playwright.config.ts`: `webServer` runs `pnpm build && pnpm start` (not `pnpm dev`)
  for every run including local, `reuseExistingServer` only outside CI; default `locale:
  "pt-BR"`; single `chromium` project. Assertions/labels in tests are Portuguese
  (`pt-BR` strings), matching the default locale.
- Auth flow tests run `test.describe.configure({ mode: "serial" })` since register →
  verify → login is a stateful sequence sharing one generated email.

## Known drift to check before trusting stale docs

`.claude/skills/{backend,frontend,test}/SKILL.md` describe an earlier shape of this
template (a single `src/db/schema.ts`, a generic `createCrudHandlers()`/`crud.ts`, a
`todos` resource, `sign-in`/`sign-up` routes, `src/lib/toast.ts`, `src/lib/forms/`).
None of that exists in the current tree — the real structure is the split
`src/db/schema/*.ts`, Server Actions for `projects`, and `login`/`register`/`forgot-password`/`verify`
routes described above. Prefer what's actually in the repo over those skill docs when
they conflict.
