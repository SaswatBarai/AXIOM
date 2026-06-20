# 🚀 AXIOM - AI Resume Analyzer + Smart Job Search + GenAI Career Assistant

## Overview

AXIOM is an AI-powered career platform that helps users optimize resumes, discover relevant jobs, identify skill gaps, generate personalized cover letters, and receive AI-powered career guidance.

The platform combines Resume ATS analysis, semantic job matching, GenAI assistance, recommendation systems, and notification pipelines into a single SaaS product.

---

# Core Features

## 1. Authentication

- Email/password login
- Google OAuth
- JWT authentication
- Refresh tokens
- Role-based access
- Forgot password
- Email verification

---

## 2. Resume Upload

Supports:

- PDF
- DOCX

Extract:

- Skills
- Education
- Experience
- Projects
- Certifications

Store:

- Original resume in AWS S3
- Parsed data in PostgreSQL

---

## 3. ATS Resume Analyzer

Analyze:

- Formatting
- Keyword density
- Readability
- Grammar
- Missing sections

Generate:

Overall ATS Score

Example:

ATS Score : 84%

Strengths:

✓ React
✓ Node.js
✓ Docker

Missing Skills:

✗ Redis
✗ Kafka
✗ AWS

Formatting Score : 92%
Keyword Match : 78%

---

## 4. Skill Gap Detection

Target Role:

Backend Engineer

Required Skills:

- Node.js
- Docker
- Redis
- Kafka
- AWS

Resume Skills:

- Node.js
- Docker

Missing Skills:

- Redis
- Kafka
- AWS

Generate learning recommendations.

---

## 5. AI Resume Improver

Input:

"Built APIs using Express."

Output:

"Designed and implemented scalable REST APIs using Express.js and MongoDB, improving response time by 30%."

Improve:

- Bullet points
- Grammar
- Impact
- Keywords

---

## 6. Smart Job Search Engine

Search jobs from:

- LinkedIn
- Indeed
- Naukri
- Internshala

Filters:

- Role
- Experience
- Location
- Salary
- Remote
- Skills

Save jobs.

Bookmark jobs.

Recent searches.

---

## 7. Semantic Job Matching Engine

Generate embeddings for:

- Resume
- Job Description

Calculate similarity using:

Cosine Similarity

Example:

Google Backend Intern

Match Score: 92%

Matched:

✓ Node.js
✓ Docker
✓ MongoDB

Missing:

✗ Redis
✗ AWS

---

## 8. Personalized Job Recommendation System

Input:

- Resume
- Skills
- Interests
- Previous Applications

Output:

Recommended roles:

- Backend Engineer
- Data Engineer
- ML Engineer
- DevOps Engineer

Top Companies:

- Google
- Amazon
- Microsoft
- Atlassian

---

## 9. GenAI Cover Letter Generator

Generate customized cover letters.

Input:

Resume + Job Description

Output:

Professional cover letter tailored for the company.

Export:

- PDF
- DOCX

---

## 10. AI Career Chatbot

Ask questions like:

"How do I become a Data Engineer?"

"What skills are missing in my resume?"

"How should I prepare for Amazon SDE?"

Built using:

- LangChain
- Gemini/OpenAI
- RAG

Knowledge Sources:

- Resume
- Job descriptions
- User skills
- Previous applications

---

## 11. AI Roadmap Generator

Detect missing skills.

Generate roadmap:

Week 1

Redis

Week 2

Docker

Week 3

AWS EC2

Week 4

Kafka

Week 5

System Design

---

## 12. Interview Question Generator

Generate questions from Job Description.

Sections:

- DSA
- SQL
- System Design
- Backend
- Behavioral

Difficulty:

- Easy
- Medium
- Hard

---

## 13. Application Tracker

Application Status:

- Applied
- OA Received
- Interview Scheduled
- Rejected
- Selected

Timeline view.

Analytics:

Applications Sent: 120

Interviews: 8

Offers: 2

Success Rate: 6%

---

## 14. Job Alerts

Subscribe:

Backend Engineer

Remote

Experience: 0-2 years

Pipeline:

Job Service
↓
Redis Queue
↓
SQS
↓
Consumer
↓
Email Service
↓
Notification

Receive:

- Email
- In-app notifications

---

## 15. Career Analytics Dashboard

Charts:

Applications per month

Most demanded skills

ATS score growth

Interview success rate

Skill coverage %

Salary trends

---

## 16. Admin Dashboard

Manage:

Users

Jobs

Resumes

Reports

Analytics

LLM usage

Subscription plans

---

# AI/ML Features

### Resume Classification

Predict:

- Backend Engineer
- Frontend Engineer
- ML Engineer
- DevOps Engineer
- Data Engineer

Model:

BERT

---

### Embedding Search

Sentence Transformers

FAISS Vector DB

Semantic similarity search

---

### Recommendation Engine

Collaborative Filtering

Content Based Filtering

Hybrid Recommendation

---

### RAG Pipeline

Documents:

- Resume
- Job Description
- Previous chats

Vector Store:

FAISS

LLM:

Gemini/OpenAI

---

# Microservices Architecture

api-gateway

auth-service

user-service

resume-service

job-service

recommendation-service

genai-service

chat-service

notification-service

email-service

analytics-service

search-service

admin-service

---

# Tech Stack

## Frontend

React
TypeScript
Redux Toolkit
TanStack Query
Tailwind CSS
Shadcn UI
Recharts

---

## Backend (Node.js)

Node.js
Express.js
TypeScript
Bull (Job Queue)
Redis
Kafka
Prisma

## AI/ML Backend (Python)

Python
FastAPI
Celery
Redis
Kafka

---

## Database

PostgreSQL
Redis

---

## AI

Transformers
TensorFlow
Sentence Transformers
LangChain
Gemini/OpenAI
FAISS

---

## Search

Elasticsearch

---

## Cloud

AWS EC2
S3
RDS
SQS
SNS
CloudWatch

---

## DevOps

Docker
Docker Compose
GitHub Actions
Nginx

---

# Folder Structure (Turborepo Monorepo)

```
axiom/                          ← Turborepo root
├── turbo.json                  ← Pipeline & task config
├── package.json                ← Root (pnpm workspaces)
├── pnpm-workspace.yaml
│
├── apps/
│   ├── web/                    ← Next.js frontend
│   ├── api/                    ← Node.js Express API
│   └── ai/                     ← Python FastAPI AI/ML (external to turbo)
│
├── packages/
│   ├── ui/                     ← Shared Shadcn/Radix components
│   ├── database/               ← Prisma schema + client
│   ├── shared-types/           ← Shared TypeScript types
│   ├── config-eslint/          ← Shared ESLint config
│   └── config-typescript/      ← Shared tsconfig bases
│
├── docker/
│   ├── docker-compose.yml
│   └── nginx/
│
└── docs/                       ← Documentation
```

---

# Premium Features

✓ Unlimited Resume Analysis

✓ AI Cover Letter Generation

✓ Smart Job Recommendations

✓ Mock Interviews

✓ Interview Question Generator

✓ Career Roadmaps

✓ Application Tracking

✓ Job Alerts

✓ Analytics Dashboard

✓ AI Career Chatbot

---

# Future Enhancements (Post-MVP)

## Phase 2 Features

- **Mock Interview** — Voice + text interview with scoring, technical knowledge/confidence/communication evaluation
- **Interview Question Generator** — Generate DSA, SQL, System Design, Behavioral questions by difficulty
- **AI Roadmap Generator** — Week-by-week skill learning plans based on gaps
- **Chrome Extension for LinkedIn** — Browser integration for job discovery
- **One-click Apply** — Auto-fill applications across platforms
- **AI voice interview coach** — Real-time feedback during practice interviews
- **Salary predictor** — Estimate compensation based on skills/experience/location
- **Company-specific interview preparation** — Tailored prep for target companies
- **Skill trend analysis using Apache Spark** — Industry trend analysis
- **Team collaboration** — Shared applications tracking with team members
- **Referral marketplace** — Connect candidates with referral opportunities
- **Mobile app** — iOS/Android native applications
- **Multi-language support** — Support for multiple languages
