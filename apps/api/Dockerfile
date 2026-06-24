FROM node:22-alpine AS base
RUN npm install -g pnpm

FROM base AS deps
WORKDIR /app
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY packages/ ./packages/
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/
RUN pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app
COPY --from=deps /app ./
COPY apps/api ./apps/api
RUN pnpm --filter @axiom/database db:generate
RUN pnpm --filter @axiom/api build

FROM node:22-alpine AS runner
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/apps/api ./apps/api
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
RUN chown -R appuser:appgroup /app
USER appuser
EXPOSE 4000
CMD ["node", "apps/api/dist/index.js"]
