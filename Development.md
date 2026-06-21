# 🚀 AXIOM Development Roadmap - 18 Phases

**Project Name:** AXIOM - AI Resume Analyzer + Smart Job Search + GenAI Career Assistant  
**Last Updated:** June 2026  
**Current Version:** 1.1 (Enhanced with Dependencies & Risk Assessment)  

---

## 📋 Table of Contents

- [Phase Dependencies & Prerequisites](#phase-dependencies--prerequisites)
- [Definition of Done](#definition-of-done)
- [Sprint Structure](#sprint-structure)
- [Phase 1: Project Setup & Infrastructure](#phase-1-project-setup--infrastructure)
- [Phase 2: Database Design & Setup](#phase-2-database-design--setup)
- [Phase 3: Authentication System](#phase-3-authentication-system)
- [Phase 4: User Management System](#phase-4-user-management-system)
- [Phase 5: Resume Upload & Storage](#phase-5-resume-upload--storage)
- [Phase 6: Resume Parsing & Extraction](#phase-6-resume-parsing--extraction)
- [Phase 7: ATS Resume Analyzer](#phase-7-ats-resume-analyzer)
- [Phase 8: Job Search Integration](#phase-8-job-search-integration)
- [Phase 9: Job Matching Engine](#phase-9-job-matching-engine)
- [Phase 10: Application Tracker](#phase-10-application-tracker)
- [Phase 11: Skill Gap Detection](#phase-11-skill-gap-detection)
- [Phase 12: AI Career Chatbot](#phase-12-ai-career-chatbot)
- [Phase 13: Cover Letter Generator](#phase-13-cover-letter-generator)
- [Phase 14: Interview Question Generator](#phase-14-interview-question-generator)
- [Phase 15: Career Roadmap Generator](#phase-15-career-roadmap-generator)
- [Phase 16: Analytics & Dashboard](#phase-16-analytics--dashboard)
- [Phase 17: Email & Notification System](#phase-17-email--notification-system)
- [Phase 18: Deployment & Production Ready](#phase-18-deployment--production-ready)

---

## Phase Dependencies & Prerequisites

### Dependency Map

```
Phase 1 (Setup) ──────────────────► Foundation for ALL phases
    │
    └──► Phase 2 (Database) ──────────────► Required by all backend
         │
         ├──► Phase 3 (Auth) ──────────────► Required: Phase 4, 10, 16, 17
         │
         ├──► Phase 5 (Upload) ──────────────► Required: Phase 6, 7
         │    ├──► Phase 6 (Parsing) ──────────► Required: Phase 7, 9, 11, 12, 13
         │    ├──► Phase 7 (ATS) ──────────────► Depends: Phase 6
         │    └──► Phase 8 (Job Search) ──────► Parallel with Phases 5-7
         │         └──► Phase 9 (Matching) ──► Required: Phase 11, 14, 15
         │
         ├──► Phase 4 (User) ──────────────────► Required: Phase 5, 10
         │
         ├──► Phase 10 (Tracker) ────────────► Can start: After Phase 3, 4
         ├──► Phase 11 (Skill Gaps) ────────► Depends: Phase 6, 9
         ├──► Phase 12 (Chatbot) ──────────► Depends: Phase 6, 9, LLM
         ├──► Phase 13 (Cover Letter) ─────► Depends: Phase 6, LLM
         ├──► Phase 14 (Interview QGen) ───► Depends: Phase 8, 9, LLM
         ├──► Phase 15 (Roadmap) ─────────► Depends: Phase 11, LLM
         │
         ├──► Phase 16 (Analytics) ────────► Can start: After Phase 3, Depends on all
         ├──► Phase 17 (Notifications) ────► Can start: After Phase 3, 10
         │
         └──► Phase 18 (Deployment) ────────► MUST be after ALL phases complete
```

### Critical Path (Must Complete First)
1. **Phase 1** - Project Setup
2. **Phase 2** - Database Design
3. **Phase 3** - Authentication
4. **Phase 5** - Resume Upload
5. **Phase 6** - Resume Parsing
6. **Phase 8** - Job Search
7. **Phase 7, 9, 10, 11** (can run in parallel)
8. **Phase 12-17** (mostly parallel, some dependencies)
9. **Phase 18** - Deployment

### Blocking Dependencies
- Phase 1 blocks: Everything
- Phase 2 blocks: Phase 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17
- Phase 3 blocks: Phase 4, 10, 16, 17
- Phase 6 blocks: Phase 7, 9, 11, 12, 13

---

## Definition of Done

For a phase to be marked **✅ COMPLETE**, ALL of the following must be satisfied:

### Code Quality
- [ ] All code follows project style guide (ESLint, Prettier)
- [ ] Test coverage >90% for critical features
- [ ] All unit tests passing (100%)
- [ ] All integration tests passing (100%)
- [ ] Code review approved by 2+ team members
- [ ] No critical/high severity bugs
- [ ] No security vulnerabilities (SonarQube/OWASP)

### Documentation
- [ ] API endpoints documented (OpenAPI/Swagger)
- [ ] Database schema documented (ER diagram)
- [ ] README updated with new features
- [ ] Complex logic includes inline comments
- [ ] Architecture decisions documented (ADR)
- [ ] Deployment steps documented

### Testing
- [ ] Manual QA testing completed (checklist)
- [ ] Edge cases tested and passing
- [ ] Error scenarios handled gracefully
- [ ] Performance benchmarks met
- [ ] Load testing passed (if applicable)
- [ ] Cross-browser testing (if frontend)

### Git & CI/CD
- [ ] Feature branch merged to dev branch
- [ ] Staging deployment successful
- [ ] No merge conflicts
- [ ] Database migrations tested
- [ ] CI/CD pipeline passing 100%
- [ ] Rollback procedure tested and documented

### Performance
- [ ] API response time <200ms (p95)
- [ ] Page load time <2s (if frontend)
- [ ] Database query optimization verified
- [ ] Memory leaks checked
- [ ] No N+1 queries

### Security
- [ ] Authentication/authorization reviewed
- [ ] SQL injection prevention verified
- [ ] XSS protection implemented
- [ ] CSRF protection implemented
- [ ] Input validation on all endpoints
- [ ] Rate limiting configured

---

## Sprint Structure

### Sprint Format (1-2 weeks per phase)

**Sprint Planning (Day 1)**
- [ ] Team planning meeting (1 hour)
- [ ] Task breakdown and estimation
- [ ] Dependency verification
- [ ] Assign team members
- [ ] Setup sprint in GitHub Projects

**Development (Days 2-4)**
- [ ] Daily standups (15 min, 9:30 AM)
  - What did I complete yesterday?
  - What am I working on today?
  - Any blockers or help needed?
- [ ] Work on assigned tasks
- [ ] Create PRs for review
- [ ] Update progress in GitHub Projects

**Sprint Review & Retrospective (Day 5)**
- [ ] Sprint review (30 min) - Demo completed work
- [ ] Code review wrap-up
- [ ] Retrospective (30 min) - What went well? What can improve?
- [ ] Update documentation

### Deliverables per Sprint
- [ ] Working code committed to dev branch
- [ ] All tests passing (unit + integration)
- [ ] Updated documentation
- [ ] Code reviews completed
- [ ] Demo-ready feature
- [ ] Blockers identified and escalated

### Git Workflow
```
main (production)
  ↑
  └─ dev (staging)
      ↑
      └─ feature/phase-X branches
```

---

## 📁 Project File & Folder Structure

```
axiom/                                      ← Turborepo root
│
├── turbo.json                              ← Pipeline task config
├── package.json                            ← Root workspace (pnpm)
├── pnpm-workspace.yaml                     ← Workspace globs
├── .gitignore
├── .env.example                            ← Shared env template
│
├── apps/
│   │
│   ├── web/                                ← Next.js Frontend (apps/web)
│   │   ├── public/
│   │   │   ├── fonts/
│   │   │   │   └── geist/                  ← Geist font files
│   │   │   └── logos/                      ← Company logos (SVG)
│   │   ├── src/
│   │   │   ├── app/                        ← Next.js App Router
│   │   │   │   ├── layout.tsx              ← Root layout
│   │   │   │   ├── page.tsx                ← Landing page
│   │   │   │   ├── (auth)/
│   │   │   │   │   ├── login/page.tsx
│   │   │   │   │   ├── signup/page.tsx
│   │   │   │   │   ├── forgot-password/page.tsx
│   │   │   │   │   └── verify-otp/page.tsx
│   │   │   │   └── dashboard/
│   │   │   │       ├── layout.tsx          ← Dashboard shell (sidebar)
│   │   │   │       ├── page.tsx            ← Overview
│   │   │   │       ├── resume/page.tsx
│   │   │   │       ├── jobs/page.tsx
│   │   │   │       ├── applications/page.tsx
│   │   │   │       ├── copilot/page.tsx
│   │   │   │       ├── analytics/page.tsx
│   │   │   │       └── settings/page.tsx
│   │   │   ├── components/
│   │   │   │   ├── layout/
│   │   │   │   │   ├── Navbar.tsx
│   │   │   │   │   ├── Sidebar.tsx
│   │   │   │   │   └── Footer.tsx
│   │   │   │   ├── landing/
│   │   │   │   │   ├── HeroSection.tsx
│   │   │   │   │   ├── FeaturesSection.tsx
│   │   │   │   │   ├── ResumeShowcase.tsx
│   │   │   │   │   ├── JobSearchShowcase.tsx
│   │   │   │   │   ├── ChatbotSection.tsx
│   │   │   │   │   ├── AnalyticsPreview.tsx
│   │   │   │   │   ├── PricingSection.tsx
│   │   │   │   │   └── FAQSection.tsx
│   │   │   │   ├── dashboard/
│   │   │   │   │   ├── StatsCard.tsx
│   │   │   │   │   ├── ResumeUploader.tsx
│   │   │   │   │   ├── ATSScoreCard.tsx
│   │   │   │   │   ├── JobCard.tsx
│   │   │   │   │   ├── ApplicationTable.tsx
│   │   │   │   │   ├── ChatWindow.tsx
│   │   │   │   │   └── SkillGapChart.tsx
│   │   │   │   └── shared/
│   │   │   │       ├── LoadingSpinner.tsx
│   │   │   │       ├── ErrorBoundary.tsx
│   │   │   │       └── ProtectedRoute.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useAuth.ts
│   │   │   │   ├── useResume.ts
│   │   │   │   ├── useJobs.ts
│   │   │   │   └── useChat.ts
│   │   │   ├── lib/
│   │   │   │   ├── api.ts                  ← Axios instance + interceptors
│   │   │   │   ├── queryClient.ts          ← TanStack Query config
│   │   │   │   └── utils.ts                ← cn(), formatters
│   │   │   ├── store/
│   │   │   │   ├── index.ts                ← Redux store
│   │   │   │   ├── authSlice.ts
│   │   │   │   ├── resumeSlice.ts
│   │   │   │   └── jobsSlice.ts
│   │   │   └── styles/
│   │   │       └── globals.css
│   │   ├── .env.local
│   │   ├── next.config.ts
│   │   ├── tailwind.config.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   ├── api/                                ← Node.js Express API (apps/api)
│   │   ├── src/
│   │   │   ├── routes/
│   │   │   │   ├── auth.routes.ts
│   │   │   │   ├── user.routes.ts
│   │   │   │   ├── resume.routes.ts
│   │   │   │   ├── job.routes.ts
│   │   │   │   ├── application.routes.ts
│   │   │   │   └── notification.routes.ts
│   │   │   ├── controllers/
│   │   │   │   ├── auth.controller.ts
│   │   │   │   ├── user.controller.ts
│   │   │   │   ├── resume.controller.ts
│   │   │   │   ├── job.controller.ts
│   │   │   │   └── application.controller.ts
│   │   │   ├── middleware/
│   │   │   │   ├── auth.middleware.ts      ← JWT verification
│   │   │   │   ├── role.middleware.ts      ← RBAC
│   │   │   │   ├── rateLimit.middleware.ts
│   │   │   │   ├── validate.middleware.ts  ← Zod validation
│   │   │   │   └── errorHandler.middleware.ts
│   │   │   ├── services/
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── user.service.ts
│   │   │   │   ├── resume.service.ts
│   │   │   │   ├── job.service.ts
│   │   │   │   ├── s3.service.ts
│   │   │   │   ├── redis.service.ts
│   │   │   │   ├── email.service.ts
│   │   │   │   └── kafka.service.ts
│   │   │   ├── queues/
│   │   │   │   ├── email.queue.ts          ← Bull queue
│   │   │   │   └── notification.queue.ts
│   │   │   ├── utils/
│   │   │   │   ├── jwt.ts
│   │   │   │   ├── hash.ts
│   │   │   │   ├── logger.ts
│   │   │   │   └── constants.ts
│   │   │   └── index.ts                    ← Express app entry
│   │   ├── .env
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   └── ai/                                 ← Python FastAPI AI/ML (apps/ai)
│       ├── routes/
│       │   ├── resume.py                   ← /parse, /analyze (ATS)
│       │   ├── jobs.py                     ← /match, /recommend
│       │   ├── skills.py                   ← /gap-detect
│       │   ├── genai.py                    ← /cover-letter, /improve
│       │   ├── chat.py                     ← /chat (RAG chatbot)
│       │   ├── interview.py                ← /questions
│       │   └── roadmap.py                  ← /generate
│       ├── services/
│       │   ├── parser.py                   ← PDF/DOCX extraction
│       │   ├── ats_analyzer.py
│       │   ├── embedding.py                ← Sentence Transformers
│       │   ├── vector_store.py             ← FAISS
│       │   ├── llm.py                      ← LangChain + Gemini/OpenAI
│       │   ├── rag.py                      ← RAG pipeline
│       │   ├── recommendation.py
│       │   └── kafka_consumer.py
│       ├── models/
│       │   ├── schemas.py                  ← Pydantic models
│       │   └── db.py                       ← SQLAlchemy models
│       ├── utils/
│       │   ├── auth.py                     ← JWT verify (shared secret)
│       │   ├── logger.py
│       │   └── constants.py
│       ├── alembic/                        ← DB migrations
│       │   └── versions/
│       ├── main.py                         ← FastAPI entry
│       ├── requirements.txt
│       ├── .env
│       └── Makefile                        ← dev/test/migrate shortcuts
│
├── packages/
│   │
│   ├── ui/                                 ← Shared UI components (@axiom/ui)
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Card.tsx
│   │   │   │   ├── Badge.tsx
│   │   │   │   ├── Input.tsx
│   │   │   │   ├── Progress.tsx
│   │   │   │   └── index.ts                ← barrel export
│   │   │   └── lib/
│   │   │       └── utils.ts                ← cn() helper
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   ├── database/                           ← Prisma ORM (@axiom/database)
│   │   ├── prisma/
│   │   │   ├── schema.prisma               ← All models
│   │   │   ├── seed.ts                     ← Dev seed data
│   │   │   └── migrations/
│   │   ├── src/
│   │   │   └── index.ts                    ← Export PrismaClient singleton
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   ├── shared-types/                       ← TS types (@axiom/shared-types)
│   │   ├── src/
│   │   │   ├── user.ts
│   │   │   ├── resume.ts
│   │   │   ├── job.ts
│   │   │   ├── application.ts
│   │   │   └── index.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   ├── config-eslint/                      ← Shared ESLint (@axiom/eslint-config)
│   │   ├── index.js                        ← Base config
│   │   ├── next.js                         ← Next.js override
│   │   ├── node.js                         ← Node.js override
│   │   └── package.json
│   │
│   └── config-typescript/                  ← Shared tsconfig bases
│       ├── base.json
│       ├── nextjs.json
│       ├── node.json
│       └── package.json
│
├── docker/
│   ├── docker-compose.yml                  ← PostgreSQL, Redis, Kafka, Elasticsearch
│   ├── docker-compose.override.yml         ← Dev volume mounts
│   └── nginx/
│       └── nginx.conf                      ← Reverse proxy config
│
├── docs/
│   ├── Setup.md
│   ├── Architecture.md
│   ├── API.md
│   └── ADR/                                ← Architecture Decision Records
│
└── .github/
    ├── workflows/
    │   ├── ci.yml                          ← turbo run lint test build --filter=...[origin/main]
    │   └── ai-backend-test.yml             ← Python pytest workflow
    └── PULL_REQUEST_TEMPLATE.md
```

---

## Phase 1: Project Setup & Infrastructure

**Estimated Duration:** 3-4 days (0.5 sprint)  
**Team Size:** 1-2 developers  
**Depends On:** None (starting point)  
**Blocking:** All 17 other phases  

### Risk Assessment
| Risk | Impact | Mitigation |
|------|--------|-----------|
| Team unfamiliar with tech stack | High | Conduct tech training, create onboarding guides |
| Docker/DevOps complexity | Medium | Use docker-compose templates, create troubleshooting docs |
| CI/CD pipeline delays | Medium | Use GitHub Actions templates, test locally |
| GitHub issues/projects setup | Low | Use templates from organization defaults |

### Tasks

1. **Initialize Repository**
   - [ ] Create GitHub repository (axiom)
   - [ ] Setup .gitignore for Node.js and Python
   - [ ] Create initial commit with README
   - [ ] Setup branch protection: require PRs, 2 reviews
   - [ ] Create GitHub Issues and Projects board

2. **Bootstrap Turborepo Monorepo**
   - [ ] Install pnpm globally (`npm install -g pnpm@9`)
   - [ ] Create `pnpm-workspace.yaml` declaring `apps/*` and `packages/*`
   - [ ] Add `turbo` as root devDependency and create `turbo.json`
   - [ ] Define pipeline tasks: `dev`, `build`, `lint`, `test`, `typecheck`, `clean`, `db:generate`, `db:migrate`
   - [ ] Create root `package.json` scripts delegating to `turbo run`
   - [ ] Verify `pnpm install` resolves all workspaces
   - [ ] Run `pnpm build --dry-run` to validate pipeline graph

3. **Setup Shared Packages**
   - [ ] `packages/config-typescript` — create `base.json`, `nextjs.json`, `node.json` tsconfig presets
   - [ ] `packages/config-eslint` — create shared ESLint config (`axiom/eslint-config`)
   - [ ] `packages/shared-types` — scaffold shared TypeScript interfaces (User, Resume, Job, etc.)
   - [ ] `packages/ui` — initialize with Shadcn CLI, export base components
   - [ ] `packages/database` — init Prisma, write `schema.prisma`, add `db:generate` / `db:migrate` scripts

4. **Setup Frontend App (`apps/web`)**
   - [ ] `pnpm create next-app apps/web --typescript --tailwind`
   - [ ] Extend `packages/config-typescript/nextjs.json` in tsconfig
   - [ ] Add workspace deps: `@axiom/ui`, `@axiom/shared-types`
   - [ ] Install: Redux Toolkit, TanStack Query, Recharts, Framer Motion
   - [ ] Configure `.env.local`
   - [ ] Add `dev`, `build`, `lint`, `typecheck` scripts

5. **Setup Node.js API App (`apps/api`)**
   - [ ] Init npm project in `apps/api`
   - [ ] Install: Express, TypeScript, ts-node, nodemon
   - [ ] Extend `packages/config-typescript/node.json`
   - [ ] Add workspace deps: `@axiom/database`, `@axiom/shared-types`
   - [ ] Create folder structure (`src/routes`, `src/controllers`, `src/middleware`, `src/utils`)
   - [ ] Add `dev`, `build`, `lint`, `typecheck` scripts
   - [ ] Create sample Express health-check route

6. **Setup Python AI/ML App (`apps/ai`)**
   - [ ] Create Python virtual environment (Python 3.11) inside `apps/ai`
   - [ ] Initialize FastAPI project
   - [ ] Install: FastAPI, Uvicorn, core dependencies
   - [ ] Create folder structure (`routes/`, `services/`, `models/`, `utils/`)
   - [ ] Setup `requirements.txt`
   - [ ] Create sample FastAPI `/health` endpoint
   - [ ] Note: Python app is **not** part of Turborepo pipeline — managed via separate Makefile / script

7. **Setup Local Development Environment**
   - [ ] Create `docker/docker-compose.yml` for: PostgreSQL (5432), Redis (6379), Kafka (9092), Elasticsearch (9200)
   - [ ] Create `docker/docker-compose.override.yml` for dev volume mounts
   - [ ] Test all containers start successfully (`docker compose up -d`)

8. **CI/CD Pipeline Setup**
   - [ ] Create `.github/workflows/ci.yml` — uses `turbo run lint test build --filter=...[origin/main]`
   - [ ] Add `TURBO_TOKEN` + `TURBO_TEAM` secrets for Vercel Remote Cache
   - [ ] Setup code coverage reporting
   - [ ] Create `.github/workflows/ai-backend-test.yml` for Python service (separate workflow)
   - [ ] Setup automatic deployment to staging

9. **Documentation**
   - [ ] Create `CONTRIBUTING.md` (monorepo workflow, branch strategy)
   - [ ] Update `TECH_STACK.md` (already done)
   - [ ] Create `docs/Setup.md` (full local setup guide)
   - [ ] Create `docs/API.md` template
   - [ ] Create `docs/Architecture.md`
   - [ ] Update root `README.md` with Turborepo getting-started

### Completion Checklist

- [ ] Turborepo pipeline resolves and `pnpm build` succeeds from root
- [ ] All three apps initialize and run via `pnpm dev`
- [ ] Shared packages resolve correctly in `apps/web` and `apps/api`
- [ ] All team members can bootstrap with `pnpm install && pnpm dev`
- [ ] Docker containers run without errors
- [ ] CI pipeline passes and remote cache is connected
- [ ] GitHub Projects setup with tasks
- [ ] Documentation complete and accessible
- [ ] Code linting working (`pnpm lint`) across all packages

---

## Phase 2: Database Design & Setup

**Estimated Duration:** 4-5 days (1 sprint)  
**Team Size:** 2-3 developers  
**Depends On:** Phase 1 ✓  
**Blocking:** Phase 3, 4, 5, 8, 10, 16, 17  

### Risk Assessment
| Risk | Impact | Mitigation |
|------|--------|-----------|
| Schema refactors after development starts | High | Design review with team, create ERD, plan for easy migrations |
| Database connection pooling issues | Medium | Load test locally, document connection limits, use PgBouncer |
| Backup/restore not working in production | High | Test restoration weekly, document recovery procedures |
| Performance issues with large datasets | Medium | Create indexes proactively, test with 100k+ records |

### Tasks

1. **Database Schema Design**
   - [ ] Design Users table (profile, auth, preferences)
   - [ ] Design Resumes table (metadata, parsed data, versions)
   - [ ] Design Jobs table (metadata, requirements, embeddings)
   - [ ] Design Applications table (status, timeline, notes)
   - [ ] Design Skills table (taxonomy, proficiency)
   - [ ] Design SavedJobs table (bookmarks)
   - [ ] Design CareerRoadmaps table
   - [ ] Design UserChats table (chatbot history)
   - [ ] Create ER diagram (using draw.io or Lucidchart)
   - [ ] Get schema approval from team

2. **Database Setup**
   - [ ] Setup PostgreSQL instance (AWS RDS or Docker locally)
   - [ ] Create database `axiom`
   - [ ] Create database user with limited permissions
   - [ ] Create all tables with proper indexes
   - [ ] Setup foreign key constraints
   - [ ] Add NOT NULL constraints where appropriate
   - [ ] Add unique constraints on email, username
   - [ ] Create initial seed data for testing

3. **Prisma ORM Setup (Node.js)**
   - [ ] `npm install prisma @prisma/client`
   - [ ] `npx prisma init`
   - [ ] Create schema.prisma with all models
   - [ ] Map to existing database: `npx prisma db pull`
   - [ ] Generate Prisma client: `npx prisma generate`
   - [ ] Create and run migrations: `npx prisma migrate dev`
   - [ ] Setup Prisma Studio for data exploration

4. **Redis Setup**
   - [ ] Configure Redis locally/cloud (AWS ElastiCache)
   - [ ] Setup connection pooling (redis client options)
   - [ ] Create utility functions: `get`, `set`, `del`, `expire`
   - [ ] Design cache key naming convention (prefix:namespace:key)
   - [ ] Setup cache expiration policies (TTL values)
   - [ ] Test Redis connection and basic operations

5. **Connection & Configuration**
   - [ ] Add DATABASE_URL to .env
   - [ ] Add REDIS_URL to .env
   - [ ] Configure connection pooling (25-50 connections)
   - [ ] Setup backup strategy (AWS backup service)
   - [ ] Document backup procedures
   - [ ] Setup database monitoring (AWS CloudWatch)

6. **Testing**
   - [ ] Create database seeding script (TypeORM/Prisma)
   - [ ] Setup test database (separate from dev)
   - [ ] Write database connection tests
   - [ ] Test all CRUD operations per model
   - [ ] Test foreign key constraints
   - [ ] Test data integrity checks

### Completion Checklist

- [ ] All database tables created and verified
- [ ] Prisma migrations working correctly
- [ ] Redis connection functional
- [ ] Sample data seeded successfully
- [ ] Backup strategy documented + tested
- [ ] Connection tests passing
- [ ] All team members can access database locally
- [ ] Database schema documented

---

## Phase 3: Authentication System

**Estimated Duration:** 5-6 days (1-2 sprints)  
**Team Size:** 2-3 developers  
**Depends On:** Phase 1 ✓, Phase 2 ✓  
**Blocking:** Phase 4, 10, 16, 17  

### Risk Assessment
| Risk | Impact | Mitigation |
|------|--------|-----------|
| JWT token expiration edge cases | High | Extensive edge case testing, security review |
| OAuth integration failures | Medium | Use sandbox environments, mock providers in tests |
| Password reset tokens compromised | High | Short expiry (15 min), Redis blacklist on logout |
| Account lockout after failed attempts | Medium | Implement exponential backoff, 5 min lock after 5 attempts |

### Tasks

1. **JWT Authentication Setup (Node.js)**
   - [ ] Install: jsonwebtoken, bcryptjs
   - [ ] Create JWT token generation function
   - [ ] Create JWT verification middleware
   - [ ] Implement refresh token mechanism (7-day expiry)
   - [ ] Setup token storage in Redis
   - [ ] Create token blacklist on logout

2. **User Registration**
   - [ ] Create POST /auth/register endpoint
   - [ ] Implement email validation (regex + verification)
   - [ ] Hash password with bcryptjs (10 salt rounds)
   - [ ] Create email verification flow (6-digit code)
   - [ ] Setup email templates (welcome email)
   - [ ] Write registration validation tests

3. **User Login**
   - [ ] Create POST /auth/login endpoint
   - [ ] Implement credentials validation
   - [ ] Generate access token (15 min) + refresh token (7 day)
   - [ ] Create POST /auth/refresh endpoint
   - [ ] Implement rate limiting (5 attempts per 15 min)
   - [ ] Write login tests (happy path + error cases)

4. **Password Management**
   - [ ] Create POST /auth/forgot-password endpoint
   - [ ] Setup password reset email flow (token in email)
   - [ ] Create POST /auth/reset-password endpoint
   - [ ] Implement token expiration (15 min)
   - [ ] Create email templates (password reset)
   - [ ] Write password reset tests

5. **OAuth Integration (Optional Phase 1)**
   - [ ] Setup Google OAuth (or defer to Phase 2)
   - [ ] Create OAuth callback handler
   - [ ] Link OAuth with existing users
   - [ ] Handle OAuth user creation
   - [ ] Write OAuth tests

6. **Frontend Authentication**
   - [ ] Create Login page component
   - [ ] Create Sign Up page component
   - [ ] Setup authentication Redux slice
   - [ ] Implement protected routes middleware
   - [ ] Setup token persistence in localStorage
   - [ ] Create Forgot Password page
   - [ ] Add logout functionality

7. **Security**
   - [ ] Setup CORS (frontend domain only)
   - [ ] Enable CSRF protection (express-csurf)
   - [ ] Add security headers (Helmet.js)
   - [ ] Implement rate limiting (5 req/min per IP)
   - [ ] Add input sanitization (xss-clean)
   - [ ] Setup HTTPS/SSL for all endpoints

### Completion Checklist

- [ ] JWT authentication end-to-end working
- [ ] Registration and login fully functional
- [ ] Email verification working
- [ ] Password reset flow working
- [ ] Protected routes restricting access
- [ ] All authentication tests passing (>90% coverage)
- [ ] Security best practices implemented
- [ ] Frontend login/signup UI polished

---

## Phase 4: User Management System

**Estimated Duration:** 4-5 days (1 sprint)  
**Team Size:** 2 developers  
**Depends On:** Phase 1 ✓, Phase 2 ✓, Phase 3 ✓  
**Blocking:** Phase 5, 10  

### Risk Assessment
| Risk | Impact | Mitigation |
|------|--------|-----------|
| User data privacy concerns (GDPR) | High | GDPR compliance review, data encryption at rest |
| Profile image storage costs explode | Medium | Image optimization (resize), CDN usage, size limits (2MB) |
| Bulk user operations cause timeouts | Medium | Implement background jobs, pagination limits |

### Tasks

1. **User Profile Management**
   - [ ] Create GET /users/:id endpoint
   - [ ] Create PUT /users/:id endpoint
   - [ ] Implement profile picture upload to S3
   - [ ] Create profile completion tracking (%)
   - [ ] Setup profile visibility settings
   - [ ] Add input validation (zod)

2. **User Preferences**
   - [ ] Create preferences table schema
   - [ ] Implement theme preferences (dark/light)
   - [ ] Setup notification preferences
   - [ ] Create job alert subscriptions
   - [ ] Create CRUD endpoints for preferences

3. **Role-Based Access Control**
   - [ ] Define roles: User, Premium, Admin
   - [ ] Create role assignment system
   - [ ] Implement role-based middleware
   - [ ] Setup permission checking for endpoints
   - [ ] Create admin endpoints for role management

4. **User Dashboard**
   - [ ] Create dashboard layout component
   - [ ] Add quick stats widgets
   - [ ] Implement recent activities feed
   - [ ] Create navigation sidebar
   - [ ] Setup responsive design (mobile, tablet, desktop)

5. **Account Settings**
   - [ ] Create account settings page
   - [ ] Implement password change
   - [ ] Setup account deletion (soft delete)
   - [ ] Create data export functionality (JSON)
   - [ ] Optional: Implement 2FA (TOTP)

6. **Frontend Components**
   - [ ] Create Profile page component
   - [ ] Create Settings page component
   - [ ] Create Preferences modal
   - [ ] Create User menu dropdown
   - [ ] Setup profile image uploader (with preview)

### Completion Checklist

- [ ] User profiles fully functional
- [ ] Preferences saving/loading correctly
- [ ] Role-based access working
- [ ] Dashboard displaying correctly
- [ ] Account settings accessible
- [ ] All user management tests passing
- [ ] Responsive design verified

---

## Phase 5: Resume Upload & Storage

**Estimated Duration:** 4-5 days (1 sprint)  
**Team Size:** 2 developers  
**Depends On:** Phase 1 ✓, Phase 2 ✓, Phase 4 ✓  
**Blocking:** Phase 6, 7  

### Risk Assessment
| Risk | Impact | Mitigation |
|------|--------|-----------|
| S3 cost growth from large/duplicate uploads | Medium | 5 MB hard limit, MD5 dedupe per user, lifecycle rule to archive >90 days |
| Presigned URL leakage | High | Short TTL (5 min), per-request signing, never log full URL |
| Multipart upload memory pressure | Medium | Multer memory storage with strict file-size cap; reject early via `fileFilter` |
| Cross-tenant access to S3 objects | High | Path prefix `resumes/{userId}/`, ownership check on every DB read |

### Tasks

1. **Object Storage Setup**
   - [ ] Provision S3 bucket `axiom-resumes` (production) and MinIO container (local)
   - [ ] Configure CORS allowing only the frontend origin
   - [ ] Add IAM role / policy: `s3:PutObject`, `s3:GetObject`, `s3:DeleteObject` scoped to the bucket
   - [ ] Add env vars: `AWS_REGION`, `AWS_S3_BUCKET`, `S3_ENDPOINT`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`

2. **S3 Service Wrapper (Node.js)**
   - [ ] Create `services/s3.service.ts` with `uploadToS3`, `deleteFromS3`, `getPresignedUrl`, `keyFromUrl`
   - [ ] Use `@aws-sdk/client-s3` + `@aws-sdk/s3-request-presigner`
   - [ ] Generate object keys as `resumes/{userId}/{uuid}.{ext}`
   - [ ] Set `ServerSideEncryption: AES256` on every put

3. **Upload Pipeline**
   - [ ] Install `multer` + `@types/multer`
   - [ ] Configure memory storage with 5 MB limit
   - [ ] `fileFilter`: allow only `application/pdf` and `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
   - [ ] Compute version counter per user (`resume.count + 1`)
   - [ ] Persist `Resume` row immediately, fire-and-forget background parse

4. **Resume REST API**
   - [ ] `POST /api/resumes` — multipart upload, returns `201 { resume }`
   - [ ] `GET /api/resumes` — list user's resumes with presigned `downloadUrl`
   - [ ] `GET /api/resumes/:id` — single resume + presigned URL (ownership check)
   - [ ] `DELETE /api/resumes/:id` — remove DB row + S3 object atomically (best-effort)
   - [ ] Wire under `requireAuth` middleware

5. **Frontend Upload UI**
   - [ ] Build drag-and-drop card (Shadcn) with hover state
   - [ ] Show client-side validation messages (size, type) before submit
   - [ ] Progress bar via XHR upload progress event
   - [ ] List uploaded resumes with version, upload date, download link, delete
   - [ ] Create `useResume` hook + Redux slice (`activeResume`, `resumes`, `isUploading`)

6. **Testing**
   - [ ] Vitest: upload happy path, missing file 400, wrong type 415, oversize 413
   - [ ] Vitest: list / get / delete with ownership checks (403 for other users, 404 for missing)
   - [ ] Manual: upload from web UI, verify file appears in MinIO console

### Completion Checklist

- [ ] Resumes upload to S3/MinIO and are retrievable via presigned URLs
- [ ] DB `Resume` row created with `userId`, `fileName`, `fileUrl`, `fileType`, `version`
- [ ] Wrong-type and oversize uploads rejected at multer layer
- [ ] Delete cascades to both DB and S3
- [ ] >90% test coverage on `resume.service.ts` and `resume.routes.ts`
- [ ] Web upload UI works end-to-end against a running API

---

## Phase 6: Resume Parsing & Extraction

**Estimated Duration:** 6-7 days (1-1.5 sprints)  
**Team Size:** 2 developers (1 backend + 1 ML/NLP)  
**Depends On:** Phase 5 ✓  
**Blocking:** Phase 7, 9, 11, 12, 13  

### Risk Assessment
| Risk | Impact | Mitigation |
|------|--------|-----------|
| Garbled extraction from scanned PDFs | High | Document limitation in UI; recommend exporting from editor (no OCR in v1) |
| Heuristic parser drift across resume styles | High | Keep parser pure-function; unit-test against a corpus of 20+ real resumes |
| Section header detection misses non-English resumes | Medium | English-first; add language detection task to v2 |
| Background parse failure leaves `parsedData = null` forever | Medium | Expose a manual "re-parse" endpoint; log failures with traceable IDs |

### Tasks

1. **Text Extraction (Python)**
   - [ ] Install `pdfplumber`, `python-docx`, `httpx`
   - [ ] `download_file(url) -> bytes` — pulls from S3 presigned URL
   - [ ] `extract_text_pdf(bytes) -> str` and `extract_text_docx(bytes) -> str`
   - [ ] Add `utils/logger.py` for structured logs

2. **Section Splitter**
   - [ ] Curated `SECTION_HEADERS` list (summary / experience / skills / education / projects / certifications)
   - [ ] `split_sections(text) -> dict[str, str]` keyed by lowercase header
   - [ ] Treat lines >60 chars as content, not header

3. **Skill Extractor**
   - [ ] Curated `SKILLS` taxonomy (~80 entries across languages / frameworks / DBs / cloud / ML)
   - [ ] Pre-compile per-skill regex with non-alphanumeric boundaries to avoid substring false positives
   - [ ] Drop ambiguous single-character entries (`c`, `r`)
   - [ ] Return list of `{ name, proficiency: null }`

4. **Experience Extractor**
   - [ ] Date regex (`Mon? YYYY - Mon?|Present`) gates per-entry boundaries
   - [ ] `_parse_experience_header` splits `Company — Title (dates)`, `Title at Company`, `Title, Company`
   - [ ] Subsequent lines until next date line accumulate into `description`
   - [ ] Cap at 10 entries

5. **Education Extractor**
   - [ ] `_DEGREE_RE` for BS/MS/PhD/Bachelor/Master/etc
   - [ ] Comma / em-dash splitting for `Degree Field, Institution`
   - [ ] Year regex non-capturing so `findall` returns 4-digit years
   - [ ] Extract optional `gpa` via separate regex

6. **Projects + Certifications + Contact**
   - [ ] `extract_projects` returns list with name / description / url / skills
   - [ ] `extract_certifications` returns trimmed lines (capped at 10)
   - [ ] `extract_email`, `extract_phone` via regex

7. **API Endpoint (Python)**
   - [ ] `POST /api/resume/parse` taking `{ file_url, file_type }`
   - [ ] Guarded by `x-internal-secret` header
   - [ ] Returns `{ success: true, data: ParsedResume }`

8. **Node.js Orchestration**
   - [ ] `ai.service.ts: parseResume(fileUrl, fileType)` calls FastAPI
   - [ ] Upload flow fires `.then` callback to update `Resume.parsedData`
   - [ ] Log + swallow AI failures (non-fatal for upload)

9. **Frontend**
   - [ ] Render parsed sections in dashboard resume page (skills chips, experience list, education list)
   - [ ] Show "parsing..." spinner while `parsedData === null`
   - [ ] Add manual "Re-parse" button

10. **Testing**
    - [ ] Pytest for `extract_skills` (word boundary, special chars, case insensitivity)
    - [ ] Pytest for `_parse_experience_header` (em-dash, "at", comma)
    - [ ] Pytest for `_parse_education_line` (full-line format, year truncation regression)
    - [ ] Pytest for `extract_email` / `extract_phone`
    - [ ] >70% coverage on `services/parser.py`

### Completion Checklist

- [ ] `services/parser.py` produces correct output for the 20-resume corpus
- [ ] Background parse persists `parsedData` within 2s for typical PDFs
- [ ] No substring false positives in skills (manual review of corpus)
- [ ] All pytest cases green; coverage report committed
- [ ] Web UI displays parsed data after upload
- [ ] Failure paths logged with correlation IDs

---

## Phase 7: ATS Resume Analyzer

**Estimated Duration:** 5-6 days (1 sprint)  
**Team Size:** 2 developers (1 backend + 1 frontend)  
**Depends On:** Phase 6 ✓  
**Blocking:** none (parallel feature)  

### Risk Assessment
| Risk | Impact | Mitigation |
|------|--------|-----------|
| Score perceived as arbitrary by users | High | Surface sub-scores + actionable suggestions, not a black box |
| LLM dependency would blow latency budget | High | Pure heuristic scorer (deterministic, <20ms) — see ADR 0001 |
| Stop-word list misses domain jargon | Medium | Keep list in code, document how to extend |
| Score persisted before parse completes | Medium | Service-layer guard returns 422 if `parsedData` is null |

### Tasks

1. **Scoring Algorithm (Python)**
   - [ ] `_extract_keywords(text)` — regex tokenize, drop stop-words + generic-tech noise
   - [ ] `_score_keyword_match(jd_keywords, resume_words)` — set intersection → 0-100
   - [ ] `_score_completeness(parsed)` — penalties for missing sections (skills / exp / edu / contact / summary)
   - [ ] `_score_readability(text)` — word-count buckets
   - [ ] `_score_formatting(parsed)` — structural section presence
   - [ ] Weighted overall: 50% keyword + 25% completeness + 15% readability + 10% formatting

2. **Strengths + Suggestions + Missing Skills**
   - [ ] `_build_strengths(matched, parsed)` returns up to 5 prose strengths
   - [ ] `_build_suggestions(missing, parsed)` returns up to 6 actionable suggestions
   - [ ] `missingSkills` filtered to tokens ≥3 chars, capped at 10

3. **AI Endpoint**
   - [ ] `POST /api/resume/analyze` taking `{ parsed_data, job_description }`
   - [ ] Returns `ATSScore`-shaped dict
   - [ ] Guarded by `x-internal-secret`

4. **API Wiring**
   - [ ] `ai.service.ts: analyzeResumeATS(parsed, jd)` calls AI
   - [ ] `resume.service.ts: analyzeResume(id, userId, jd)` — fetch + ownership + parsed check + AI call + persist
   - [ ] `analyzeResumeHandler` in controller, `POST /api/resumes/:id/analyze` route
   - [ ] Zod `analyzeResumeSchema` (jobDescription 20-10,000 chars)

5. **Web UI**
   - [ ] Add ⚡ button on ResumeCard opening `AnalyzeModal`
   - [ ] Modal: JD textarea + "Run ATS Analysis" button
   - [ ] `ATSPanel` showing overall ring + 4 sub-scores + strengths + missing + suggestions
   - [ ] `useResume.analyzeResume(id, jd)` updates Redux on success
   - [ ] Persist score so panel renders on subsequent visits

6. **Testing**
   - [ ] Pytest: happy path, empty resume, empty JD, score bounds, weighted average, missing-skill cap
   - [ ] Vitest: 8 route cases (200, 422 ×3, 403, 404, 422 unparsed, 503 AI down)
   - [ ] Coverage `ats.py` ≥85%

7. **Docs + Perf**
   - [ ] ADR 0001 — pipeline + alternatives
   - [ ] OpenAPI entry for `/api/resumes/:id/analyze`
   - [ ] Benchmark script — measure p50 / p95 / p99 over ≥80 sequential requests
   - [ ] README section linking docs + bench numbers

### Completion Checklist

- [ ] End-to-end run: upload PDF → parse → analyze → score persisted, verified manually
- [ ] p95 latency <200ms (DoD target)
- [ ] All API + pytest cases green; coverage gates met
- [ ] OpenAPI YAML + ADR + README committed
- [ ] Feature shipped on `feat/phase-7-ats` branch

---

## Phase 8: Job Search Integration

**Estimated Duration:** 8-10 days (2 sprints)  
**Team Size:** 2-3 developers (1 backend + 1 scraping/Python + 1 frontend)  
**Depends On:** Phase 2 ✓  
**Blocking:** Phase 9, 14  

### Source Strategy (locked)

Jobs are ingested via **web scraping** from three India-friendly platforms. No paid APIs, no external SaaS dependencies. LinkedIn and Indeed are explicitly **out of scope** for this phase due to ToS hostility and anti-bot complexity — they may be added later behind a feature flag if/when residential proxies and authenticated sessions are available.

| Source | Difficulty | Approach | Notes |
|---|---|---|---|
| **Internshala** | Easy | `httpx` + BeautifulSoup; JSON-LD parser | Public listings, structured data embedded in HTML |
| **Unstop** | Easy-Medium | `httpx` against discovered internal JSON endpoints | Jobs + internships + hackathons; light anti-bot; India-focused |
| **Naukri** | Medium | Playwright headless (JS-rendered) | Most listing data accessible without login |

Each adapter implements the same `JobSourceAdapter` protocol so a fourth (LinkedIn/Indeed) can be added later without changing the ingestion pipeline.

### Risk Assessment
| Risk | Impact | Mitigation |
|------|--------|-----------|
| Sites change HTML layout → scrapers break silently | High | Per-adapter smoke test on every run; alert if zero results for 2 consecutive runs |
| Aggressive scraping triggers IP ban | High | Hard rate limit (≥3s between requests per host); honor `Retry-After`; exponential backoff on 429/503 |
| ToS violations / cease-and-desist | High | Personal/dev use only; document risk; honor `robots.txt` where ambiguous; do not bypass paywalls or auth |
| Playwright instability in CI | Medium | Pin Playwright + browser version; cache browser binaries; retry once on `TimeoutError` |
| Duplicate jobs across sources | Medium | Dedupe by canonical `sourceUrl`; secondary fuzzy dedupe on (title, company, location) within 7 days |
| Job descriptions contain HTML / XSS | Medium | Sanitize with `bleach` on ingest; render as plain text in UI |
| Memory spikes from full HTML parse | Medium | Stream parse, drop raw HTML after extraction, cap description length to 16 KB |

### Tasks

1. **Scraping Framework (`apps/ai/services/scrapers/`)**
   - [ ] `base.py` — `JobSourceAdapter` ABC with `fetch_listing(query, page) -> list[JobListing]` and `fetch_detail(url) -> JobDetail`
   - [ ] `NormalizedJob` Pydantic model matching the Prisma `Job` shape
   - [ ] `rate_limit.py` — async token-bucket per host (default 1 req / 3 s)
   - [ ] `http.py` — shared `httpx.AsyncClient` with realistic User-Agent rotation + retry/backoff
   - [ ] `playwright_pool.py` — single-instance Playwright browser, contexts per adapter
   - [ ] `skill_extractor.py` — reuse `parser.SKILL_PATTERNS` to populate `requiredSkills` / `niceToHaveSkills`
   - [ ] `bleach` HTML sanitization helper
   - [ ] Each adapter ships with one frozen HTML fixture for unit tests

2. **Site Adapters**
   - [ ] `InternshalaAdapter` — list page parse via JSON-LD; detail page parse for stipend / duration
   - [ ] `UnstopAdapter` — internal `/api/public/opportunity/search-result` JSON endpoint where available; HTML fallback
   - [ ] `NaukriAdapter` — Playwright-rendered listing pages; extract via embedded `__NEXT_DATA__` / JSON-LD
   - [ ] Each maps source → `JobType` and `ExperienceLevel` enums; default to `FULL_TIME` / `ENTRY` when ambiguous

3. **Ingestion Pipeline**
   - [ ] FastAPI endpoint: `POST /api/scrape/run` (internal-secret guarded) accepting `{ source, queries[], pages }`
   - [ ] Node.js Bull queue worker triggers `/api/scrape/run` on schedule (every 6h)
   - [ ] Normalize → upsert by unique `sourceUrl` (already on `Job` model)
   - [ ] Skill extraction populates `requiredSkills` + `niceToHaveSkills`
   - [ ] Per-run summary: `{ source, fetched, inserted, updated, skipped, durationMs }` logged + persisted to Redis for dashboard
   - [ ] Seed dataset (~80 hand-curated jobs) loaded once for tests and local dev when scrapers blocked

4. **Search API (`apps/api/`)**
   - [ ] `GET /api/jobs` with query params: `q`, `location`, `remote`, `jobType`, `experienceLevel`, `salaryMin`, `salaryMax`, `skills[]`, `source`, `page`, `pageSize`
   - [ ] Pagination (default 20, max 50) with `total` count
   - [ ] Postgres `ILIKE` + indexed filters for v1; tsvector + GIN index as v1.1 if needed
   - [ ] Indexed filters via existing `@@index([remote, jobType, experienceLevel])`
   - [ ] Cache popular query keys in Redis (5 min TTL)

5. **Save / Unsave**
   - [ ] `POST /api/jobs/:id/save` — upserts `SavedJob`
   - [ ] `DELETE /api/jobs/:id/save` — removes `SavedJob`
   - [ ] `GET /api/jobs/saved` — list user's saved jobs
   - [ ] Recent-searches stored per user in Redis (capped at 20)

6. **Web UI**
   - [ ] `/dashboard/jobs` search page: search input + filter pills + results table
   - [ ] Source filter chip (Internshala / Unstop / Naukri)
   - [ ] Job detail drawer / page with full description + "Apply on source" outbound link
   - [ ] Save / unsave heart button (optimistic update)
   - [ ] Saved-jobs tab
   - [ ] `useJobs` hook with TanStack Query + URL search params

7. **Testing**
   - [ ] Pytest per adapter against frozen HTML/JSON fixtures (no live network calls)
   - [ ] Pytest: rate limiter respects N req / window
   - [ ] Pytest: skill extraction populated correctly from real descriptions
   - [ ] Vitest: search filters (q, remote, salary range, source), pagination boundaries
   - [ ] Vitest: save / unsave / saved list ownership
   - [ ] Coverage on `job.service.ts` and adapters ≥85%

8. **Operational Guardrails**
   - [ ] Per-source kill switch via env (`SCRAPER_INTERNSHALA_ENABLED=false`)
   - [ ] Global request-count budget per scraper run (e.g. max 200 detail fetches / source / run)
   - [ ] Failure alarm: if a source returns zero results across 2 consecutive runs, log error + Redis flag for ops dashboard
   - [ ] `robots.txt` check helper (advisory; not a hard block)

9. **Docs + Perf**
   - [ ] ADR 0002 — scraping strategy: chosen sources, rate-limit policy, fragility budget, escape hatches
   - [ ] OpenAPI entries for `/api/jobs`, `/api/jobs/saved`, `/api/jobs/:id/save`, `/api/scrape/run`
   - [ ] Document "how to add a new adapter" runbook
   - [ ] Benchmark: search p95 against 10k jobs

### Completion Checklist

- [ ] ≥1,000 real jobs in DB after first multi-source scrape run
- [ ] Each adapter has a passing fixture-based unit test
- [ ] Search returns relevant results in <100ms p95 against 10k jobs
- [ ] Save / unsave reflected immediately in UI
- [ ] Bull worker runs every 6h, persists per-run summary
- [ ] Kill switches and rate limits enforced
- [ ] All tests green; OpenAPI + ADR committed
- [ ] Failure alarm tested by simulating zero-result run

---

## Phase 9: Job Matching Engine ✅

**Estimated Duration:** 7-8 days (1.5 sprints)  
**Team Size:** 2 developers (1 ML + 1 backend)  
**Depends On:** Phase 6 ✓, Phase 8 ✓  
**Blocking:** Phase 11, 14, 15  

### Risk Assessment
| Risk | Impact | Mitigation |
|------|--------|-----------|
| Embedding model download adds startup latency | Medium | Pin model, bake into Docker image, lazy-load on first request |
| FAISS index rebuild blocks ingestion | High | Use pgvector instead — index updates inline with INSERTs |
| Embeddings drift after parser changes | Medium | Version `embeddings` column; trigger reindex on parser version bump |
| Semantic match feels worse than keyword in some cases | High | Blend: 70% cosine similarity + 30% keyword overlap |

### Tasks

1. **Embedding Model Setup**
   - [x] Install `sentence-transformers`, choose `all-MiniLM-L6-v2` (fast, 384-dim)
   - [x] Add `embed_text(text) -> list[float]` helper
   - [x] Warm-up endpoint to preload model

2. **Vector Storage**
   - [x] Enable `pgvector` extension via Prisma migration
   - [x] Add `embedding vector(384)` to `Job` model and `Resume` model
   - [x] Backfill embeddings for existing rows via batch job
   - [x] Index: `CREATE INDEX ON jobs USING ivfflat (embedding vector_cosine_ops)`

3. **Match Endpoint**
   - [x] `POST /api/resume/match` taking `{ resume_id, job_ids? }` (Python)
   - [x] Cosine similarity → 0-100 match score
   - [x] Matched skills = intersection; missing = JD skills not in resume
   - [x] Return ranked list with score, matched, missing

4. **Node.js Wiring**
   - [x] `ai.service.ts: matchJobs(resumeId, jobIds?)`
   - [x] `GET /api/jobs/:id/match` — single job match
   - [x] `GET /api/jobs/recommended` — top-K personalized (defaults to 20)
   - [x] Cache per-resume top-K in Redis (10 min TTL)

5. **Search Integration**
   - [x] Add "Sort by Match" option to search results
   - [x] Show match badge (90+ green, 75+ orange, else gray) per result

6. **Web UI**
   - [x] Match Score gauge on job detail page
   - [x] Matched / missing skills chips
   - [x] "Recommended for you" carousel on dashboard home
   - [x] Trigger re-match after resume update

7. **Testing**
   - [x] Pytest: cosine similarity on synthetic vectors
   - [x] Pytest: matched / missing skills correctness
   - [x] Vitest: match endpoint integration
   - [x] Coverage on matching service ≥85%

8. **Docs + Perf**
   - [x] ADR 0003 — pgvector vs FAISS, blended score rationale
   - [x] OpenAPI: match + recommended endpoints
   - [x] Benchmark: match against 10k jobs <300ms p95

### Completion Checklist

- [x] Resume + job embeddings persisted in pgvector
- [x] `/api/jobs/recommended` returns 20 jobs sorted by match
- [x] Match score visible in UI for every job
- [x] Re-match runs when resume updated
- [x] All tests + bench targets met

---

## Phase 10: Application Tracker

**Estimated Duration:** 5-6 days (1 sprint)  
**Team Size:** 2 developers  
**Depends On:** Phase 3 ✓, Phase 4 ✓  
**Blocking:** Phase 17  

### Risk Assessment
| Risk | Impact | Mitigation |
|------|--------|-----------|
| Status transitions become inconsistent | Medium | Enforce allowed transitions in service layer (state machine) |
| Timeline JSON grows unbounded | Low | Cap timeline entries to 50; archive older to separate table if needed |
| Drag-and-drop Kanban race conditions | Medium | Optimistic UI + last-write-wins with `updatedAt` check |

### Tasks

1. **Application API**
   - [ ] `POST /api/applications` — create from job + status
   - [ ] `GET /api/applications` — list with filters (status, dateRange)
   - [ ] `GET /api/applications/:id` — detail with timeline
   - [ ] `PATCH /api/applications/:id` — update status / notes / coverLetter
   - [ ] `DELETE /api/applications/:id` — soft delete
   - [ ] Zod schemas for each

2. **Status State Machine**
   - [ ] Define allowed transitions (e.g. SAVED → APPLIED → OA_RECEIVED → INTERVIEW_SCHEDULED → OFFER/REJECTED)
   - [ ] Reject illegal transitions with 422
   - [ ] Append `{ status, at, note }` to `timeline` JSON on every change

3. **Analytics Queries**
   - [ ] `GET /api/applications/stats` returns counts per status, success rate, avg time-to-interview
   - [ ] Cache results per user (5 min)

4. **Web UI — Kanban Board**
   - [ ] Columns per `ApplicationStatus`
   - [ ] Card with company logo, role, match score, last update
   - [ ] Drag-and-drop status change (dnd-kit), optimistic update
   - [ ] Filter by date range / company / job type

5. **Web UI — Detail View**
   - [ ] Timeline list (status changes + notes)
   - [ ] Embedded cover letter section
   - [ ] Linked job preview

6. **Testing**
   - [ ] Vitest: legal vs illegal transitions, stats aggregation, ownership checks
   - [ ] Playwright (optional): drag-and-drop flow
   - [ ] Coverage on `application.service.ts` ≥90%

7. **Docs**
   - [ ] OpenAPI entries
   - [ ] ADR 0004 — state machine design

### Completion Checklist

- [ ] CRUD + status transitions work end-to-end
- [ ] Kanban board drag-and-drop persists
- [ ] Stats endpoint feeds analytics dashboard later
- [ ] Tests + docs committed

---

## Phase 11: Skill Gap Detection

**Estimated Duration:** 4-5 days (1 sprint)  
**Team Size:** 2 developers (1 ML + 1 backend)  
**Depends On:** Phase 6 ✓, Phase 9 ✓  
**Blocking:** Phase 15  

### Risk Assessment
| Risk | Impact | Mitigation |
|------|--------|-----------|
| Target-role skill lists go stale | Medium | Refresh quarterly from top JD skill frequencies |
| Recommendations feel generic | Medium | Tier suggestions by user goal (intern / mid / senior) |
| Overlap with ATS suggestions confuses users | Low | Phrase distinctly: ATS = "this resume vs this JD", Gap = "your skills vs role" |

### Tasks

1. **Target Role Definitions**
   - [ ] Curated `target_roles.json` with required + nice-to-have skills per role (10-15 roles)
   - [ ] Derive top skills from Phase 8 job corpus (frequency in `requiredSkills`)
   - [ ] Versioned (`v1`, `v2`) so historical reports remain interpretable

2. **Gap Computation**
   - [ ] `analyze_skill_gap(resume, target_role) -> { matched, missing, recommendations }`
   - [ ] Use parsed resume skills + experience skills (merged set)
   - [ ] Tier suggestions: must-have / should-have / nice-to-have

3. **API**
   - [ ] `POST /api/skills/gap` taking `{ resume_id, target_role }`
   - [ ] `GET /api/skills/target-roles` — list available roles
   - [ ] Persist most-recent gap report on user for dashboard

4. **Web UI**
   - [ ] Skill Gap page: role picker → matched / missing breakdown
   - [ ] Per-skill links to learning resources (curated)
   - [ ] Highlights "X skills away from Senior Backend"
   - [ ] Trigger Phase 15 roadmap generation from gap report

5. **Testing**
   - [ ] Pytest: gap correctness across roles, tier ordering
   - [ ] Vitest: endpoint + ownership
   - [ ] Coverage ≥85%

6. **Docs**
   - [ ] OpenAPI entries
   - [ ] Document how to add a new target role

### Completion Checklist

- [ ] User can request a gap report against any target role
- [ ] Matched / missing skills displayed with tier badges
- [ ] Latest gap report cached on user record
- [ ] Tests + docs committed

---

## Phase 12: AI Career Chatbot

**Estimated Duration:** 8-10 days (2 sprints)  
**Team Size:** 2-3 developers (1 ML + 1 backend + 1 frontend)  
**Depends On:** Phase 6 ✓, Phase 9 ✓, LLM key  
**Blocking:** none  

### Risk Assessment
| Risk | Impact | Mitigation |
|------|--------|-----------|
| LLM costs spiral with heavy use | High | Per-user daily token quota; cache common Q&A in Redis |
| PII leakage to LLM provider | High | Strip email/phone before sending; use OpenAI / Gemini "no train" tier |
| Hallucinated career advice | High | Always cite source (resume section / job ID); refuse if no context match |
| Streaming connection drops mid-response | Medium | SSE with reconnect + token-level resume |

### Tasks

1. **LangChain RAG Setup**
   - [ ] Install `langchain`, `google-generativeai` (or `openai`)
   - [ ] Document loader for: user's resume, saved jobs, application history
   - [ ] Vector store: pgvector (reuse Phase 9 infra)
   - [ ] Embedding: same `all-MiniLM-L6-v2` for consistency
   - [ ] Retriever k=5 with score threshold

2. **Chat Service (Python)**
   - [ ] `POST /api/chat` taking `{ session_id, message, resume_id? }`
   - [ ] Build prompt template (system + retrieved context + history + user message)
   - [ ] LLM call via LangChain `RunnableSequence`
   - [ ] SSE streaming response for token-by-token output

3. **Session Persistence**
   - [ ] `ChatMessage` Prisma model (already in schema)
   - [ ] Store per-session history; cap at 50 messages
   - [ ] Title summarization on first reply (LLM call)

4. **Node.js Bridge**
   - [ ] Proxy `/api/chat` to FastAPI with auth user injected
   - [ ] Stream SSE through to client
   - [ ] Rate limit per user (20 msg/hour for free, 200 for pro)

5. **Web UI**
   - [ ] Chat page with message list, typing indicator, input box, send button
   - [ ] Sidebar: past sessions + "new chat"
   - [ ] Quick-action prompt buttons (rewrite resume, prep interview, find roles)
   - [ ] Streaming render via EventSource

6. **Safety + Cost Controls**
   - [ ] Strip PII before sending to LLM
   - [ ] Refuse off-topic prompts (system prompt instructs to stay on career)
   - [ ] Token usage tracking per user → daily quota enforcement

7. **Testing**
   - [ ] Pytest: prompt builder, retriever filtering, PII stripping
   - [ ] Vitest: rate limit, session ownership
   - [ ] Manual: 20 representative career prompts, capture quality regression set

8. **Docs**
   - [ ] OpenAPI entries (SSE response documented)
   - [ ] ADR 0005 — RAG architecture + cost controls

### Completion Checklist

- [ ] Chatbot answers with context from user's resume + saved jobs
- [ ] Streaming works smoothly in UI
- [ ] PII stripped before LLM call
- [ ] Daily quota enforced
- [ ] Tests + docs committed

---

## Phase 13: Cover Letter Generator

**Estimated Duration:** 5-6 days (1 sprint)  
**Team Size:** 2 developers (1 ML + 1 frontend)  
**Depends On:** Phase 6 ✓, LLM key  
**Blocking:** none  

### Risk Assessment
| Risk | Impact | Mitigation |
|------|--------|-----------|
| Generated letter sounds AI-templated | High | Prompt with user's voice samples (from resume bullets); offer regenerate / edit |
| PDF/DOCX export breaks on unicode | Medium | Use `reportlab` (PDF) + `python-docx` (DOCX); test with multilingual names |
| Same letter regenerated repeatedly drives LLM cost | Medium | Cache per (resume_id, job_id) for 24h |

### Tasks

1. **Prompt Engineering**
   - [ ] System prompt: senior writer voice, no clichés, concrete metrics from resume
   - [ ] Few-shot: 3 high-quality examples
   - [ ] Temperature 0.7

2. **Generation Service**
   - [ ] `POST /api/cover-letter/generate` taking `{ resume_id, job_description, company_name, job_title, tone? }`
   - [ ] LLM call, persist on `Application.coverLetter`
   - [ ] Return draft + a "tone" knob (formal / friendly / direct)

3. **Editing UI**
   - [ ] Rich-text editor (Tiptap)
   - [ ] Regenerate button (with diff highlighting)
   - [ ] Save to application + download as PDF / DOCX

4. **Export**
   - [ ] PDF via `reportlab`
   - [ ] DOCX via `python-docx`
   - [ ] Both endpoints return file stream

5. **Testing**
   - [ ] Pytest: prompt builder, cache hit/miss
   - [ ] Vitest: endpoint integration, export content-type
   - [ ] Manual: 10 letters reviewed for tone + accuracy

6. **Docs**
   - [ ] OpenAPI entries
   - [ ] Prompt + few-shot examples documented

### Completion Checklist

- [ ] User can generate, edit, and export a tailored cover letter
- [ ] Letter cached per (resume, job) for 24h
- [ ] Both PDF and DOCX downloads work
- [ ] Tests + docs committed

---

## Phase 14: Interview Question Generator

**Estimated Duration:** 5-6 days (1 sprint)  
**Team Size:** 2 developers (1 ML + 1 frontend)  
**Depends On:** Phase 8 ✓, Phase 9 ✓, LLM key  
**Blocking:** none  

### Risk Assessment
| Risk | Impact | Mitigation |
|------|--------|-----------|
| Generated questions too generic | Medium | Seed prompts with role-specific topic lists (DSA, SD, behavioral) |
| Difficulty calibration drift | Medium | Curated easy/medium/hard examples per category in prompt |
| LLM returns invalid JSON | Medium | Use `response_format=json_object`; validate with Pydantic, retry once |

### Tasks

1. **Topic Taxonomy**
   - [ ] Categories: `dsa`, `system_design`, `sql`, `behavioral`, `coding`, `language_specific`
   - [ ] Per-role topic weights (FE-heavy roles weight `dsa` lower)

2. **Generation Service**
   - [ ] `POST /api/interview/questions` taking `{ job_description, difficulty, sections, count? }`
   - [ ] LLM call returning structured JSON: `{ category, question, expected_answer_hint, difficulty }`
   - [ ] Persist as `InterviewSession` for revisit

3. **Web UI**
   - [ ] Interview prep page: difficulty + section pickers
   - [ ] Question card with reveal-hint button
   - [ ] Mark "got it" / "needs review" → feeds Phase 15 roadmap

4. **Testing**
   - [ ] Pytest: prompt builder, JSON schema validation, retry on bad JSON
   - [ ] Vitest: endpoint + ownership
   - [ ] Manual: 30 questions reviewed for quality across difficulties

5. **Docs**
   - [ ] OpenAPI entries
   - [ ] Topic taxonomy documented

### Completion Checklist

- [ ] User can generate question sets per JD + difficulty
- [ ] JSON structure validated server-side
- [ ] "Needs review" feedback persisted
- [ ] Tests + docs committed

---

## Phase 15: Career Roadmap Generator

**Estimated Duration:** 5-6 days (1 sprint)  
**Team Size:** 2 developers (1 ML + 1 frontend)  
**Depends On:** Phase 11 ✓, LLM key  
**Blocking:** none  

### Risk Assessment
| Risk | Impact | Mitigation |
|------|--------|-----------|
| Roadmap skills repeat what user already knows | Medium | Subtract Phase 11 matched skills from candidate set |
| Estimated weeks unrealistic | Low | Constrain LLM to skill-difficulty buckets (1w / 2w / 3w) |
| Progress tracking diverges from roadmap | Medium | Versioned roadmap; new version when retaken |

### Tasks

1. **Roadmap Generation**
   - [ ] `POST /api/roadmap/generate` taking `{ resume_id, target_role, weeks }`
   - [ ] Combine Phase 11 gap + LLM ordering into week-by-week plan
   - [ ] Persist as `CareerRoadmap`
   - [ ] Each step: `{ week, skill, resources[], estimated_hours }`

2. **Progress Tracking**
   - [ ] `PATCH /api/roadmap/:id/step/:week` marks step done
   - [ ] Compute % complete + ETA

3. **Web UI**
   - [ ] Timeline visualization (weeks horizontal, skills vertical)
   - [ ] Mark step done with confetti (Framer Motion)
   - [ ] "Generate new roadmap" if target role changes

4. **Testing**
   - [ ] Pytest: gap subtraction, week ordering
   - [ ] Vitest: progress patch + ownership
   - [ ] Coverage on service ≥85%

5. **Docs**
   - [ ] OpenAPI entries
   - [ ] Versioning policy documented

### Completion Checklist

- [ ] User can generate + view + progress through a roadmap
- [ ] Re-generation produces a versioned new roadmap, old preserved
- [ ] Tests + docs committed

---

## Phase 16: Analytics & Dashboard

**Estimated Duration:** 6-7 days (1-1.5 sprints)  
**Team Size:** 2 developers (1 backend + 1 frontend)  
**Depends On:** Phase 3 ✓ (functionally all prior phases)  
**Blocking:** none  

### Risk Assessment
| Risk | Impact | Mitigation |
|------|--------|-----------|
| Aggregation queries slow as data grows | High | Materialized views refreshed nightly; index date columns |
| PII shown in shared / exported analytics | High | Per-user scoping enforced in service layer; admin views separated |
| Charts overwhelm new users with no data | Medium | Empty-state copy + onboarding tasks list |

### Tasks

1. **Aggregation Endpoints**
   - [ ] `GET /api/analytics/overview` — counts (applications, interviews, offers, success rate)
   - [ ] `GET /api/analytics/ats-trend` — ATS score history per resume version
   - [ ] `GET /api/analytics/applications-monthly` — applied/interview/offer per month
   - [ ] `GET /api/analytics/skills-demand` — top 20 skills from saved + applied jobs
   - [ ] `GET /api/analytics/funnel` — saved → applied → interview → offer conversion

2. **Materialized Views (Postgres)**
   - [ ] `mv_user_application_funnel` refreshed nightly
   - [ ] `mv_skill_demand_global` for benchmark comparisons

3. **Web Dashboard**
   - [ ] Recharts panels for each endpoint
   - [ ] Date-range picker (last 30 / 90 / all)
   - [ ] Export as CSV / PNG

4. **Caching**
   - [ ] Per-user overview cached 15 min in Redis
   - [ ] Skill demand cached 1 hour globally

5. **Testing**
   - [ ] Vitest: aggregation correctness on seeded data
   - [ ] Manual: cross-check charts vs raw DB queries

6. **Docs**
   - [ ] OpenAPI entries
   - [ ] ADR 0006 — materialized view refresh strategy

### Completion Checklist

- [ ] Dashboard renders 5 panels with real data
- [ ] Empty states polished
- [ ] Materialized views refreshed nightly via cron
- [ ] Tests + docs committed

---

## Phase 17: Email & Notification System

**Estimated Duration:** 6-7 days (1-1.5 sprints)  
**Team Size:** 2 developers  
**Depends On:** Phase 3 ✓, Phase 10 ✓  
**Blocking:** none  

### Risk Assessment
| Risk | Impact | Mitigation |
|------|--------|-----------|
| Email deliverability tanks (spam) | High | Use SES with verified domain + DKIM + SPF; warm IP gradually |
| Notification queue backs up | High | Bull with concurrency 10 + dead-letter queue; alarm on backlog |
| Users overwhelmed by emails | High | Frequency caps (max 1 digest/day, 3 alerts/day); easy unsubscribe |

### Tasks

1. **Email Service**
   - [ ] Integrate AWS SES (or Resend for simpler DX in dev)
   - [ ] Verify sending domain + DKIM/SPF/DMARC
   - [ ] Templates (MJML → HTML): welcome, verify-email, reset-password, job-alert, weekly-digest
   - [ ] Templating utility `renderTemplate(name, data)`

2. **Job Queue (Bull)**
   - [ ] Queues: `email`, `notification`, `digest`
   - [ ] Workers with retry (3 attempts, exponential backoff)
   - [ ] Dead-letter handling with alerting

3. **In-App Notifications**
   - [ ] `Notification` Prisma model: `userId`, `type`, `payload`, `readAt`
   - [ ] WebSocket gateway (Socket.IO) namespaced per user
   - [ ] `GET /api/notifications` + `POST /api/notifications/:id/read`
   - [ ] Bell icon with badge in topbar

4. **Job Alerts**
   - [ ] `JobAlert` subscription model: filters + frequency (instant / daily / weekly)
   - [ ] Matching ingestion → enqueue email/in-app for subscribers
   - [ ] CRUD endpoints

5. **Weekly Digest**
   - [ ] Cron job (Bull scheduler) every Monday 09:00 local
   - [ ] Aggregate user activity + new matched jobs
   - [ ] Render + send via email queue

6. **Testing**
   - [ ] Vitest: queue happy path, retry, DLQ, frequency cap
   - [ ] Manual: deliver to a real inbox + render check in Litmus
   - [ ] Coverage ≥85%

7. **Docs**
   - [ ] OpenAPI entries (notifications + alerts)
   - [ ] Runbook for email deliverability incidents

### Completion Checklist

- [ ] Welcome / verify / reset emails delivered reliably
- [ ] In-app notifications real-time via WebSocket
- [ ] Job alerts dispatched on schedule
- [ ] Weekly digest sent Monday mornings
- [ ] Unsubscribe + frequency caps enforced

---

## Phase 18: Deployment & Production Ready

**Estimated Duration:** 10-14 days (2-3 sprints)  
**Team Size:** 2-3 developers + 1 DevOps  
**Depends On:** All prior phases ✓  
**Blocking:** none (final phase)  

### Risk Assessment
| Risk | Impact | Mitigation |
|------|--------|-----------|
| First production deploy reveals env-specific bugs | High | Staging env mirroring prod; blue/green deploy; one-click rollback |
| Secrets leak via env files or logs | Critical | AWS Secrets Manager; redact logs; secret scanning in CI |
| Cost overrun in week 1 | High | Budget alarms in CloudWatch; right-size instances; aggressive caching |
| Database migration breaks live traffic | Critical | Backwards-compatible migrations only; expand → migrate → contract pattern |
| Monitoring gaps mask outages | High | Synthetic checks + on-call rotation + paging via PagerDuty/Opsgenie |

### Tasks

1. **Containerization**
   - [ ] Multi-stage Dockerfile per app (web / api / ai)
   - [ ] Distroless / slim runtime images
   - [ ] `.dockerignore` to keep images small
   - [ ] Docker Compose for full local stack

2. **Orchestration**
   - [ ] Choose target: ECS Fargate (simpler) or EKS (Kubernetes)
   - [ ] Helm charts or ECS task definitions per service
   - [ ] Horizontal pod autoscaler (CPU + RPS based)
   - [ ] Service mesh (optional) for mTLS between internal services

3. **Infrastructure as Code**
   - [ ] Terraform modules for: VPC, RDS, ElastiCache, S3, IAM, ECR, ECS/EKS, ALB, CloudFront
   - [ ] Workspaces: `dev`, `staging`, `prod`
   - [ ] State stored in S3 with DynamoDB locking

4. **Secrets + Config**
   - [ ] All secrets in AWS Secrets Manager (rotate quarterly)
   - [ ] Per-env config files committed (non-secret)
   - [ ] App reads secrets via SDK at boot (cache in memory)

5. **CI/CD**
   - [ ] GitHub Actions: PR → lint + test + build + Trivy scan + Turbo cache
   - [ ] Main branch → deploy to staging (auto)
   - [ ] Tagged release → manual approval → prod
   - [ ] One-click rollback via previous task-def revision

6. **Database Operations**
   - [ ] Backwards-compatible Prisma migrations (no destructive ALTERs)
   - [ ] Pre-deploy migration job runs before app rollout
   - [ ] Automated nightly backups (RDS snapshots, 30-day retention)
   - [ ] Quarterly restore drill

7. **Observability**
   - [ ] Logs → CloudWatch Logs + structured JSON
   - [ ] Metrics → CloudWatch + Prometheus (optional)
   - [ ] Tracing → AWS X-Ray or OpenTelemetry → Jaeger
   - [ ] Error tracking → Sentry (web + api + ai)
   - [ ] Dashboards: API latency, error rate, queue depth, LLM cost

8. **Performance + Load Testing**
   - [ ] k6 scripts for: auth, resume upload, ATS analyze, job search, chat
   - [ ] Target: 100 RPS sustained at p95 <500ms
   - [ ] Identify and fix top 5 bottlenecks

9. **Security**
   - [ ] HTTPS-only via ALB + ACM cert
   - [ ] WAF rules (rate limit, OWASP top 10)
   - [ ] Penetration test by external firm before launch
   - [ ] Dependency scanning (Dependabot + Snyk) in CI
   - [ ] Secret rotation playbook documented

10. **Launch Readiness**
    - [ ] Runbooks: deploy / rollback / incident response / data restore
    - [ ] On-call rotation + paging policy
    - [ ] Status page (Statuspage / BetterUptime)
    - [ ] Privacy policy + ToS reviewed by legal
    - [ ] GDPR data-export + deletion endpoints

### Completion Checklist

- [ ] All three apps containerized and deployed via IaC
- [ ] Staging mirrors production; promote → prod via single approval
- [ ] Synthetic monitoring + alerting wired to on-call
- [ ] Load test passes target RPS at p95 latency budget
- [ ] Pen test report addressed (no criticals open)
- [ ] Backup + restore drill executed successfully
- [ ] Runbooks + status page live
- [ ] Launch announcement reviewed and scheduled

---

## 📊 Development Timeline Overview

```
Phase 1-2:   Project Setup + Database        [Days 1-10]   ████
Phase 3-4:   Auth + User Management          [Days 11-20]  ████
Phase 5-7:   Resume Upload + Parsing + ATS   [Days 21-38]  ████████
Phase 8-9:   Job Search + Job Matching       [Days 39-53]  ██████
Phase 10-11: App Tracker + Skill Gaps        [Days 54-66]  ██████
Phase 12-15: AI Features (Chat, Cover Letter, etc)  [Days 67-95]  ███████
Phase 16-17: Analytics + Notifications       [Days 96-118] ███████
Phase 18:    Deployment & ProductionReady    [Days 119-135] ████

Total Estimated Days: 135 (~4.5 months for MVP)
Team Size: 5-8 developers + 1-2 ML engineers

**Parallel Work:** Phases 10-17 can partially overlap to save time
**Critical Path:** Phase 1 → 2 → 3 → 5 → 6 → 8 → 7,9 → 18
```

---

## 🎯 Success Metrics (Per Phase)

### Code Quality Metrics
- ✓ Test coverage >90%
- ✓ Code review approved by 2+ members
- ✓ Zero critical bugs
- ✓ Zero security vulnerabilities
- ✓ SonarQube grade: A

### Performance Metrics (After Phase 18)
- ✓ System uptime >99.5%
- ✓ API response time <200ms (p95)
- ✓ Page load time <2s (lighthouse score >90)
- ✓ Resume parsing accuracy >85%
- ✓ Job matching accuracy >80%
- ✓ User satisfaction score >4.5/5

---

## 🚀 Launch Readiness Checklist

Before going to production (Phase 18 end):

**Development Completeness**
- [ ] All 18 phases completed
- [ ] Full test coverage >90%
- [ ] All critical features working

**Security & Compliance**
- [ ] Security audit passed
- [ ] GDPR compliance verified
- [ ] OWASP top 10 covered
- [ ] SSL/TLS configured
- [ ] API rate limiting active

**Infrastructure & DevOps**
- [ ] Production AWS setup complete
- [ ] Database backups automated
- [ ] Disaster recovery tested
- [ ] Monitoring & logging active
- [ ] CI/CD pipeline prod-ready

**Testing**
- [ ] Unit tests >90% passing
- [ ] Integration tests passing
- [ ] E2E tests passing
- [ ] Load testing: 1000+ concurrent users
- [ ] UAT with beta users completed

**Operations**
- [ ] Runbooks created
- [ ] Incident response documented
- [ ] Team trained
- [ ] Support channels ready
- [ ] Monitoring alerts configured

---

## 📝 Notes & Best Practices

* **Phase Dependencies:** Strictly adhere to dependencies; don't skip phases  
* **Sprint Planning:** Use 2-week sprints, daily standups (15 min)  
* **Code Reviews:** 2+ approvals required before merge  
* **Testing:** TDD approach - write tests before code  
* **Documentation:** Update docs as code changes  
* **Team Communication:** Weekly standups, bi-weekly demos  
* **Version Control:** Feature branches, semantic versioning  
* **Configuration Management:** Use .env files, AWS Secrets Manager in prod  

---

**Document Version:** 1.1  
**Last Updated:** June 2026  
**Status:** Ready to Start Phase 1
