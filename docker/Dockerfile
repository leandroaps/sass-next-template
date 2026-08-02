# syntax=docker/dockerfile:1

FROM node:24-slim AS base
RUN corepack enable
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml ./
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile

FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
# Build-time-only placeholders so src/lib/env.ts's fail-fast Zod validation
# passes during `next build`'s page-data collection. Real values are supplied
# at container start via compose.yaml's env_file/environment (see docker/compose.yaml).
ENV NEXT_PUBLIC_APP_URL=http://localhost:3000
ENV NEXT_PUBLIC_DEFAULT_LOCALE=pt-BR
ENV BETTER_AUTH_SECRET=build-time-placeholder-32-characters
ENV BETTER_AUTH_URL=http://localhost:3000
ENV SMTP_URL=smtp://localhost:1025
ENV DATABASE_URL=postgres://app:app@localhost:5432/app_build
RUN pnpm build

FROM node:24-slim AS runner
RUN corepack enable
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN groupadd --system --gid 1001 nodejs \
  && useradd --system --uid 1001 --gid nodejs nextjs

COPY --from=build /app/public ./public
COPY --from=build --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=build /app/drizzle ./drizzle

USER nextjs
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/api/health').then(r=>{if(!r.ok){console.error('unhealthy status', r.status);process.exit(1)}}).catch(e=>{console.error(e);process.exit(1)})"

CMD ["node", "server.js"]
