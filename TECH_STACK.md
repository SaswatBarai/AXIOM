# 🛠️ AXIOM - Complete Tech Stack Documentation

## Overview
AXIOM is a modern, full-stack AI-powered career platform. This document outlines all technologies, versions, and setup instructions.

---

## 📋 Table of Contents
1. [Monorepo (Turborepo)](#monorepo-turborepo)
2. [Frontend Stack](#frontend-stack)
3. [Backend Stack](#backend-stack)
4. [Database](#database)
5. [AI/ML Stack](#aiml-stack)
6. [Search & Analytics](#search--analytics)
7. [Cloud Infrastructure](#cloud-infrastructure)
8. [DevOps & Deployment](#devops--deployment)
9. [Development Tools](#development-tools)
10. [Dependencies & Versions](#dependencies--versions)
11. [Installation & Configuration](#installation--configuration)

---

## 🏗️ Monorepo (Turborepo)

### Build System
- **Turborepo** (v2.x)
  - High-performance monorepo build system by Vercel
  - Intelligent caching — only rebuilds what changed
  - Parallel task execution across all packages/apps
  - Remote caching (Vercel Remote Cache or self-hosted)
  - Pipeline-based task orchestration (`turbo.json`)

### Workspace Structure

```
axiom/                          ← Turborepo root
├── turbo.json                  ← Pipeline config
├── package.json                ← Root workspace (pnpm workspaces)
├── pnpm-workspace.yaml         ← Workspace globs
├── .env                        ← Shared env (gitignored)
│
├── apps/                       ← Deployable applications
│   ├── web/                    ← Next.js frontend
│   ├── api/                    ← Node.js / Express API gateway + services
│   └── ai/                     ← Python FastAPI AI/ML backend (non-JS, external)
│
├── packages/                   ← Shared internal packages
│   ├── ui/                     ← Shared Shadcn/Radix components
│   ├── config-eslint/          ← Shared ESLint config
│   ├── config-typescript/      ← Shared tsconfig bases
│   ├── database/               ← Prisma schema + generated client
│   └── shared-types/           ← Shared TypeScript types/interfaces
│
└── docker/                     ← Docker & infra config
    ├── docker-compose.yml
    └── nginx/
```

### Root `package.json` (pnpm workspaces)

```json
{
  "name": "axiom",
  "private": true,
  "packageManager": "pnpm@9.x",
  "scripts": {
    "dev":     "turbo run dev",
    "build":   "turbo run build",
    "lint":    "turbo run lint",
    "test":    "turbo run test",
    "clean":   "turbo run clean",
    "typecheck": "turbo run typecheck",
    "db:generate": "turbo run db:generate",
    "db:migrate":  "turbo run db:migrate"
  },
  "devDependencies": {
    "turbo": "^2.0.0"
  }
}
```

### `turbo.json` Pipeline

```json
{
  "$schema": "https://turbo.build/schema.json",
  "ui": "tui",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "inputs": ["$TURBO_DEFAULT$", ".env*"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^lint"]
    },
    "typecheck": {
      "dependsOn": ["^typecheck"]
    },
    "test": {
      "dependsOn": ["^build"],
      "inputs": ["$TURBO_DEFAULT$"],
      "outputs": ["coverage/**"]
    },
    "clean": {
      "cache": false
    },
    "db:generate": {
      "cache": false
    },
    "db:migrate": {
      "cache": false
    }
  }
}
```

### Package Manager
- **pnpm** (v9.x) — fast, disk-efficient, native workspace support
  - Hoisting via `pnpm-workspace.yaml`
  - Strict phantom-dependency prevention

### Why Turborepo?
| Benefit | Detail |
|---------|--------|
| **Speed** | Remote + local caching skips redundant builds |
| **DX** | Single `pnpm dev` starts all apps in parallel |
| **Shared code** | `packages/ui`, `packages/shared-types` eliminate duplication |
| **CI savings** | Only re-run pipelines for affected workspaces |
| **Vercel native** | First-class support for Next.js + Vercel deploys |

---

## 🎨 Frontend Stack

### Core Framework
- **Next.js** (v16.2.x)
  - React framework with server-side rendering (SSR)
  - Static site generation (SSG)
  - File-based routing system
  - Built-in API routes
  - Automatic code splitting and optimization
  - App Router (modern routing)

- **TypeScript** (v5.x)
  - Static type checking
  - Better IDE support and error detection

### State Management
- **Redux Toolkit** (v2.x)
  - Application state management
  - Simplified Redux with less boilerplate

### Data Fetching & Caching
- **TanStack Query** (v5.x)
  - Server state management
  - Automatic caching and synchronization
  - API request handling and deduplication

### Styling
- **Tailwind CSS** (v3.x)
  - Utility-first CSS framework
  - Responsive design
  - Custom component styling

- **Shadcn UI** (v2.x)
  - Pre-built accessible React components
  - Based on Radix UI primitives
  - Customizable component library

### Data Visualization
- **Recharts** (v2.x)
  - React charting library
  - Dashboard analytics visualization
  - Career progress tracking charts

### Build Tools
- **Turborepo** — monorepo task orchestration (root level)
- **Next.js Built-in bundler** (Turbopack in dev, SWC for compilation)
  - Fast build tool and dev server
  - Automatic optimization
  - Zero-config setup
- **pnpm** — workspace-aware package manager

### Linting & Formatting
- **ESLint** - Code quality (Next.js integrated)
- **Prettier** - Code formatting

---

## � Backend Stack (Node.js)

### Framework
- **Express.js** (v4.18.x)
  - Lightweight web framework
  - Perfect for microservices
  - Simple and flexible routing
  - Excellent middleware ecosystem

- **Node.js** (v20.x LTS)
  - JavaScript runtime
  - Built-in async/await support
  - Excellent concurrency handling

- **TypeScript** (v5.x)
  - Static type checking for Node.js
  - Better IDE support
  - Type-safe backend code

### Task Queue & Async Processing
- **Bull** (v4.x)
  - Job queue built on Redis
  - Distributed task processing
  - Email, notifications, background jobs
  - Scheduled tasks support

### Message Broker
- **Kafka** (v3.x)
  - Event streaming platform
  - Job notifications pipeline
  - Application tracking events
  - Scalable event-driven architecture

### Caching & Session
- **Redis** (v7.x)
  - In-memory data store
  - Session management
  - Job search caching
  - Rate limiting

### Database ORM
- **Prisma** (v5.x) or **TypeORM** (v0.3.x)
  - Type-safe database client
  - Auto-generated migrations
  - Support for PostgreSQL

### Additional Libraries
- **jsonwebtoken** - JWT authentication
- **bcryptjs** - Password hashing
- **zod** - Data validation
- **axios** - HTTP client
- **dotenv** - Environment variable management
- **cors** - Cross-Origin Resource Sharing
- **helmet** - Security headers

### Services Using Node.js
- API Gateway
- Auth Service
- User Service
- Resume Upload Service
- Job Search Service
- Application Tracker
- Notification Service (WebSockets)

---

## 🐍 AI/ML Backend Stack (FastAPI)

### Framework
- **FastAPI** (v0.104.x)
  - Modern async Python web framework
  - Built-in API documentation (Swagger/OpenAPI)
  - High performance async processing

- **Python** (v3.11+)
  - Programming language for ML/AI

### Task Queue & Async Processing
- **Celery** (v5.x)
  - Distributed task queue
  - Heavy ML computations
  - Background job processing
  - Scheduled tasks

### Message Broker (Shared)
- **Kafka** (v3.x)
  - Cross-service communication
  - Event streaming

### Caching (Shared)
- **Redis** (v7.x)
  - Cache embeddings and results
  - Session sharing with Node.js services

### Additional Libraries
- **Pydantic** (v2.x)
  - Data validation using Python type hints
  - Request/response serialization

- **SQLAlchemy** (v2.x)
  - ORM for database queries

- **Uvicorn** (v0.24.x)
  - ASGI server for running FastAPI

- **python-jose** - JWT authentication (shared with Node.js)
- **passlib** - Password hashing
- **python-multipart** - Form data handling

### Services Using FastAPI
- Resume Parser Service
- ATS Analysis Service
- Job Matching Engine
- Skill Gap Detection
- AI/GenAI Service (LLM integration)
- Interview Question Generator
- Career Roadmap Generator
- Cover Letter Generator

---

## 🗄️ Database

### SQL Database
- **PostgreSQL** (v15.x)
  - Primary relational database
  - User accounts, resumes, applications, job postings
  - JSONB support for flexible schema

### In-Memory Database
- **Redis** (v7.x)
  - Session storage
  - Caching layer
  - Real-time notifications
  - Rate limiting

### Schemas
```
Users
├── profile
├── authentication
└── preferences

Resumes
├── metadata
├── parsed_data
├── skill_tags
└── ats_scores

Jobs
├── job_metadata
├── requirements
└── embeddings

Applications
├── application_status
└── timeline

Skills
├── skill_name
└── proficiency_level
```

---

## 🤖 AI/ML Stack

### NLP & Transformers
- **Transformers** (v4.36.x - Hugging Face)
  - Pre-trained models
  - Resume classification
  - Text understanding

- **Sentence Transformers** (v2.x)
  - Sentence embeddings
  - Semantic similarity for job matching
  - Resume-Job matching

### Machine Learning
- **TensorFlow** (v2.14.x)
  - Deep learning framework
  - Model training and inference

- **Scikit-learn** (v1.3.x)
  - Traditional ML algorithms
  - Recommendation engine
  - Classification tasks

### Vector Search
- **FAISS** (Facebook AI Similarity Search)
  - Efficient similarity search
  - Vector embeddings storage
  - Fast K-nearest neighbor search

### LLM Integration
- **LangChain** (v0.1.x)
  - LLM orchestration framework
  - RAG (Retrieval Augmented Generation)
  - Chain and agent management

- **Gemini API** (Google)
  - Cover letter generation
  - Career advice chatbot
  - Interview question generation

- **OpenAI API** (Alternative)
  - GPT-4 / GPT-3.5-turbo
  - Backup LLM provider

### Document Processing
- **PyPDF2** / **pdfplumber**
  - PDF resume parsing

- **python-docx**
  - DOCX resume parsing

- **spaCy** (v3.x)
  - NLP for entity extraction
  - Skill and experience extraction

---

## 🔍 Search & Analytics

### Search Engine
- **Elasticsearch** (v8.x)
  - Full-text search
  - Job search functionality
  - Complex filtering and aggregations

### Analytics
- **Apache Spark** (v3.x) - (For Phase 2)
  - Distributed data processing
  - Skill trend analysis
  - Large-scale analytics

---

## ☁️ Cloud Infrastructure

### Hosting & Compute
- **AWS EC2** (Elastic Compute Cloud)
  - Application servers
  - Backend service instances
  - t3.medium or t3.large for starter

### Storage
- **AWS S3** (Simple Storage Service)
  - Resume file storage (PDFs, DOCX)
  - Pre-signed URLs for secure access

### Database
- **AWS RDS** (Relational Database Service)
  - Managed PostgreSQL instance
  - Automated backups
  - Multi-AZ deployment for HA

### Messaging
- **AWS SQS** (Simple Queue Service)
  - Alternative message queue
  - Email job queue

- **AWS SNS** (Simple Notification Service)
  - Push notifications
  - Email delivery

### Monitoring
- **AWS CloudWatch**
  - Logs and metrics
  - Performance monitoring
  - Alerts and dashboards

### CDN
- **AWS CloudFront** - (Recommended)
  - Content delivery network
  - Static asset caching

### Additional Services
- **AWS Lambda** - Serverless functions
- **AWS Secrets Manager** - Secret storage
- **AWS IAM** - Access control

---

## 🐳 DevOps & Deployment

### Monorepo Build
- **Turborepo** (v2.x)
  - `turbo run build --filter=web` — build only the web app
  - `turbo run test --filter=...[origin/main]` — test only changed packages
  - Remote caching via Vercel Remote Cache in CI

### Containerization
- **Docker** (v24.x)
  - Container images
  - Consistent environments
  - Multi-stage builds

- **Docker Compose** (v2.x)
  - Local development orchestration
  - Multi-container setup

### CI/CD
- **GitHub Actions**
  - Automated testing
  - Automated deployment
  - Code quality checks
  - Turborepo remote cache enabled via `TURBO_TOKEN` secret

### Web Server
- **Nginx** (v1.25.x)
  - Reverse proxy
  - Load balancing
  - Static file serving

### Orchestration
- **Kubernetes** (v1.28.x) - (Phase 2)
  - Container orchestration
  - Auto-scaling
  - Service management

---

## 🛠️ Development Tools

### Version Control
- **Git**
- **GitHub**

### API Testing
- **Postman** / **Insomnia**
- **Thunder Client** (VS Code extension)

### Debugging
- **Node.js Debugger** (Chrome DevTools, VSCode)
- **Python Debugger** (Debugpy for FastAPI)
- **Chrome DevTools** (Frontend)
- **Redux DevTools**

### Development Environment
- **VS Code** - Recommended IDE
- **PyCharm Professional** - Python IDE (optional)

### Documentation
- **Swagger/OpenAPI** - FastAPI AI/ML service documentation
- **Postman Collections** - Node.js API documentation
- **markdown** - General documentation

---

## 📦 Dependencies & Versions

### Root / Monorepo
```json
{
  "packageManager": "pnpm@9.x",
  "devDependencies": {
    "turbo": "^2.0.0"
  }
}
```

### Shared Packages (`packages/`)
```json
{
  "packages/ui": "shared Shadcn/Radix components",
  "packages/database": "Prisma schema + @prisma/client",
  "packages/shared-types": "TypeScript interfaces shared across apps",
  "packages/config-eslint": "eslint-config-axiom",
  "packages/config-typescript": "tsconfig base presets"
}
```

### Frontend Dependencies (`apps/web`)
```json
{
  "next": "^16.2.9",
  "react": "^19.0.0",
  "react-dom": "^19.0.0",
  "typescript": "^5.2.0",
  "@reduxjs/toolkit": "^2.0.0",
  "@tanstack/react-query": "^5.0.0",
  "axios": "^1.5.0",
  "tailwindcss": "^3.3.0",
  "@radix-ui/react-*": "latest",
  "recharts": "^2.10.0"
}
```

### Backend Dependencies (Node.js)
```json
{
  "express": "^4.18.2",
  "typescript": "^5.2.0",
  "@types/node": "^20.0.0",
  "@types/express": "^4.17.17",
  "ts-node": "^10.9.1",
  "dotenv": "^16.3.1",
  "cors": "^2.8.5",
  "helmet": "^7.0.0",
  "prisma": "^5.0.0",
  "@prisma/client": "^5.0.0",
  "redis": "^4.6.8",
  "bull": "^4.11.3",
  "jsonwebtoken": "^9.0.2",
  "bcryptjs": "^2.4.3",
  "zod": "^3.22.2",
  "axios": "^1.5.0",
  "kafka-node": "^5.0.0"
}
```

### AI/ML Backend Dependencies (Python)
```
fastapi==0.104.1
uvicorn==0.24.0
python==3.11
sqlalchemy==2.0.23
psycopg2-binary==2.9.9
redis==5.0.0
celery==5.3.4
kafka-python==2.0.2
pydantic==2.5.0
python-jose==3.3.0
passlib==1.7.4
transformers==4.36.0
sentence-transformers==2.2.2
tensorflow==2.14.0
torch==2.1.0
faiss-cpu==1.7.4
langchain==0.1.0
openai==1.3.0
google-generativeai==0.3.0
spacy==3.7.2
pydantic-settings==2.0.3
pdfplumber==0.10.0
python-docx==0.8.11
```

---

## 🚀 Installation & Configuration

### 1. Bootstrap Monorepo (One-Time Setup)
```bash
# Clone repo
git clone https://github.com/your-org/axiom.git
cd axiom

# Install pnpm globally (if needed)
npm install -g pnpm@9

# Install all workspace dependencies from root
pnpm install

# Generate Prisma client (packages/database)
pnpm db:generate
```

### 2. Environment Variables
Create `.env` files at each app level:

```bash
# apps/web/.env.local
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_GEMINI_API_KEY=your_key_here

# apps/api/.env
DATABASE_URL=postgresql://user:password@localhost:5432/axiom
REDIS_URL=redis://localhost:6379/0
KAFKA_BROKERS=localhost:9092
JWT_SECRET_KEY=your_secret_key
JWT_EXPIRY=7d
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_key
AWS_REGION=us-east-1
NODE_ENV=development
API_PORT=4000

# apps/ai/.env  (Python service — managed separately)
DATABASE_URL=postgresql://user:password@localhost:5432/axiom
REDIS_URL=redis://localhost:6379/0
KAFKA_BROKERS=localhost:9092
GEMINI_API_KEY=your_key_here
OPENAI_API_KEY=your_key_here
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_key
JWT_SECRET_KEY=your_secret_key
AI_SERVICE_PORT=8000
```

### 3. Start All Apps (Turborepo parallel dev)
```bash
# Start web + api in parallel (Turborepo handles order)
pnpm dev

# Start only the frontend
pnpm dev --filter=web

# Start only the Node.js API
pnpm dev --filter=api

# Build everything
pnpm build

# Build only affected packages (great for CI)
pnpm build --filter=...[origin/main]
```

### 4. Python AI/ML Service (separate process)
```bash
# Navigate to AI app
cd apps/ai

# Create virtual environment
python -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
alembic upgrade head

# Start FastAPI
uvicorn main:app --reload --port 8000
```

### 5. Database & Infrastructure
```bash
# All infra via Docker Compose from root
docker compose -f docker/docker-compose.yml up -d

# Run Prisma migrations (from packages/database or root)
pnpm db:migrate

# Access services
Frontend:     http://localhost:3000
Node.js API:  http://localhost:4000
AI/ML API:    http://localhost:8000 (Swagger: /docs)
Redis:        localhost:6379
PostgreSQL:   localhost:5432
Kafka:        localhost:9092
```

### 6. Useful Turborepo Commands
```bash
# Run lint across all packages
pnpm lint

# Type-check all TS packages in parallel
pnpm typecheck

# Run tests only for changed packages
pnpm test --filter=...[HEAD^1]

# Clean all build outputs
pnpm clean

# Show task graph (dry run)
pnpm build --dry-run

# Enable remote caching (Vercel)
npx turbo login
npx turbo link
```

---

## 📊 Architecture Diagram

```
┌─────────────────┐
│   Frontend      │
│   (Next.js)     │
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│   Nginx (Reverse Proxy) │
└──┬──────────────────┬───┘
   │                  │
   ▼                  ▼
┌────────────────┐  ┌──────────────────┐
│ Node.js Backend│  │ Python AI/ML     │
│  (Express)     │  │  (FastAPI)       │
│  Services:     │  │  Services:       │
│ - API Gateway  │  │ - Resume Parser  │
│ - Auth Service │  │ - ATS Analyzer   │
│ - User Service │  │ - Job Matcher    │
│ - Job Service  │  │ - GenAI Service  │
│ - Resume Svc   │  │ - Skill Gap Det. │
│ - Tracker      │  │ - Interview QGen │
└────────┬───────┘  └────────┬─────────┘
         │                   │
         └───────┬───────────┘
                 ▼
         ┌──────────────────────────┐
         │    PostgreSQL DB         │
         │  (Shared Database)       │
         └──────────────────────────┘

         ┌──────────────────────────┐
         │  Kafka (Event Streaming) │
         │  (Inter-service comms)   │
         └──────────────────────────┘

         ┌──────────────────────────┐
         │  Redis                   │
         │  (Cache, Queue, Sessions)│
         └──────────────────────────┘

         ┌──────────────────────────┐
         │  Elasticsearch           │
         │  (Job Search)            │
         └──────────────────────────┘

         ┌──────────────────────────┐
         │  FAISS Vector DB + LLM   │
         │  (AI/ML Features)        │
         └──────────────────────────┘

         ┌──────────────────────────┐
         │  AWS Services            │
         │  (S3, EC2, RDS, SQS)     │
         └──────────────────────────┘
```

---

## 🔐 Security Considerations

1. **Authentication**: JWT with refresh tokens
2. **Encryption**: All sensitive data encrypted at rest
3. **API Rate Limiting**: Redis-based rate limiter
4. **CORS**: Configured for frontend domain only
5. **Environment Variables**: Secrets managed via AWS Secrets Manager
6. **SSL/TLS**: HTTPS only in production
7. **SQL Injection**: SQLAlchemy ORM + Pydantic validation
8. **CSRF**: FastAPI built-in CSRF protection

---

## 📈 Performance Optimization

1. **Caching Strategy**:
   - Redis for frequently accessed data
   - CDN for static assets

2. **Database**:
   - Proper indexing on frequently queried columns
   - Connection pooling

3. **Frontend**:
   - Code splitting with React.lazy()
   - Lazy loading of routes
   - Image optimization

4. **Backend**:
   - Async/await for I/O operations
   - Background jobs via Celery
   - API response compression

5. **Search**:
   - Elasticsearch indexing
   - Full-text search optimization

---

## 📚 Additional Resources

- **Express.js Documentation**: https://expressjs.com/
- **Next.js Documentation**: https://nextjs.org/docs
- **TypeScript Documentation**: https://www.typescriptlang.org/
- **Prisma Documentation**: https://www.prisma.io/docs/
- **FastAPI Documentation**: https://fastapi.tiangolo.com/
- **PostgreSQL Documentation**: https://www.postgresql.org/docs/
- **AWS Documentation**: https://docs.aws.amazon.com/
- **LangChain Documentation**: https://python.langchain.com/
- **Kafka Documentation**: https://kafka.apache.org/documentation/
- **Docker Documentation**: https://docs.docker.com/

---

## 🚦 Next Steps

1. Setup local development environment
2. Configure environment variables
3. Initialize git repository
4. Create project folder structure
5. Setup CI/CD pipeline
6. Begin microservices development
7. Implement authentication system first
8. Build resume upload and parsing
9. Integrate AI/ML components
10. Deploy to AWS

---

**Last Updated**: June 2026
**Project Name**: AXIOM
**Version**: 1.0
