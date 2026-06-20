# AXIOM — AI Career Copilot

> AI-powered platform for resume analysis, smart job search, skill gap detection, and GenAI career guidance.

## Stack

| Layer | Tech |
|-------|------|
| Monorepo | Turborepo + pnpm workspaces |
| Frontend | Next.js 15, Tailwind v4, Redux, TanStack Query |
| API | Node.js, Express, TypeScript |
| AI/ML | Python, FastAPI, LangChain, Gemini, FAISS |
| Database | PostgreSQL (Prisma 7), Redis |
| Infra | Docker, Kafka, Elasticsearch |

## Quickstart

```bash
# 1. Install dependencies
pnpm install

# 2. Copy env files
cp .env.example apps/api/.env
cp .env.example apps/ai/.env
# Edit each with real values

# 3. Start infrastructure
docker compose -f docker/docker-compose.yml up -d

# 4. Run DB migrations
pnpm db:migrate

# 5. Start all apps
pnpm dev
```

Services after startup:
- Frontend → http://localhost:3000
- API → http://localhost:4000
- AI service → http://localhost:8000 (Swagger: /docs)

## Monorepo Structure

```
apps/
  web/    Next.js frontend
  api/    Node.js Express API
  ai/     Python FastAPI AI service
packages/
  database/      Prisma schema + client
  shared-types/  Shared TypeScript types
  ui/            cn() utility (Shadcn lives in apps/web)
  config-typescript/
  config-eslint/
docker/           Infrastructure (PostgreSQL, Redis, Kafka, ES)
```

## Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start all JS apps in parallel |
| `pnpm build` | Build all apps |
| `pnpm lint` | Lint all packages |
| `pnpm typecheck` | Type-check all packages |
| `pnpm db:migrate` | Run Prisma migrations |
| `pnpm db:generate` | Regenerate Prisma client |
| `make -C apps/ai dev` | Start Python AI service |

## Development Phases

See [Development.md](Development.md) for the full 18-phase roadmap.
