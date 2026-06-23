FROM node:22-alpine AS base
RUN npm install -g pnpm

FROM base AS deps
WORKDIR /app
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY packages/ ./packages/
COPY apps/web/package.json ./apps/web/
COPY apps/api/package.json ./apps/api/
RUN pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages ./packages
COPY --from=deps /app/pnpm-workspace.yaml /app/package.json /app/pnpm-lock.yaml ./
COPY apps/web ./apps/web
# Set environment variables if needed during build (e.g. Next.js build variables)
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm --filter @axiom/web build

FROM node:22-alpine AS runner
WORKDIR /app
RUN npm install -g pnpm
ENV NODE_ENV=production
ENV PORT=3000
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/apps/web ./apps/web
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./

EXPOSE 3000
CMD ["pnpm", "--filter", "@axiom/web", "start"]
