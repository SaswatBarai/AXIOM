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
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages ./packages
COPY --from=deps /app/pnpm-workspace.yaml /app/package.json /app/pnpm-lock.yaml ./
COPY apps/api ./apps/api
RUN pnpm --filter @axiom/database db:generate
RUN pnpm --filter @axiom/api build

FROM node:22-alpine AS runner
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
WORKDIR /app
# node_modules alone is not enough — pnpm workspace packages (@axiom/database etc.)
# are symlinked from node_modules into packages/. Copy both so symlinks resolve.
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
RUN chown -R appuser:appgroup /app
USER appuser
EXPOSE 4000
CMD ["node", "dist/index.js"]
