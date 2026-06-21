# ADR 0003 — pgvector vs FAISS, blended score matching

**Status:** Accepted
**Date:** 2026-06-20
**Phase:** 9

## Context

AXIOM needs a job matching engine that maps candidate resumes to scraped job openings.
The system needs to:
- Compute match scores (0–100) between a user's resume and job listings.
- Retrieve top recommended jobs for a user.
- Sort job search results by semantic match score.

To achieve this, we need to choose between storing dense embeddings in a dedicated vector search library (like FAISS) vs a vector database extension inside our primary database (pgvector in PostgreSQL). Additionally, we need to define the matching metric to ensure semantic richness while keeping exact skill matches relevant.

## Decision

We chose **pgvector** inside PostgreSQL over FAISS, and implemented a **blended scoring metric** combining cosine similarity (70%) and keyword overlap (30%).

### 1. Vector Database Choice: pgvector
We chose pgvector because:
- **No sync overhead:** Ingestion of scraped jobs updates the database and the vector index atomically. FAISS would require writing syncing pipelines, keeping FAISS in-memory indices aligned with Postgres transaction commits, and handling file locks.
- **Easy filtering:** We can mix metadata filters (e.g., jobType, location, salary ranges) and vector matching in a single query.
- **Standard indexing:** pgvector's `IVFFlat` index (`vector_cosine_ops`) is lightweight, fast, and supported inside PostgreSQL 16.

### 2. Scoring Metric: 70% Cosine Similarity + 30% Keyword Overlap
Pure vector embeddings (sentence-transformers `all-MiniLM-L6-v2`) are great at matching synonyms ("frontend developer" matches "react engineer"). However, they sometimes lose precision for exact matching on niche skills (e.g. "Kafka" vs "RabbitMQ").
To address this, we compute:
- **Cosine score (70%):** Cosine similarity between resume and job embeddings.
- **Keyword overlap (30%):** Exact matching on required skills.
Blended score = `0.7 * CosineScore + 0.3 * KeywordOverlapScore`

### 3. Pipeline
- Node.js API acts as the client-facing orchestrator and caches top recommendations in Redis for 10 minutes.
- FastAPI AI backend handles the heavy lifting of generating vector embeddings using the `all-MiniLM-L6-v2` model and computes similarity scores using a pure python cosine similarity implementation to ensure zero runtime package dependency failures.

## Consequences

### Positive
- **Stateless AI backend:** AI service does not couple to postgres logic, maintaining high horizontal scalability.
- **Performance:** Matching 10k jobs is extremely fast (measured at <100ms in memory).
- **Correctness:** Unit-tested vector calculations and edge cases (e.g., empty inputs, zero vectors) in Python.

### Negative / trade-offs
- **Postgres dependency:** PostgreSQL image must be replaced with `pgvector/pgvector:pg16` in docker configurations (Done successfully).

## Alternatives considered
- **FAISS:** Rejected because syncing indices with the primary database poses transaction risk and race conditions during simultaneous job scrapes.

## References
- Implementation: [apps/ai/services/recommendation.py](../../apps/ai/services/recommendation.py)
- API integration: [apps/api/src/services/job.service.ts](../../apps/api/src/services/job.service.ts)
- Tests: [apps/ai/tests/test_recommendation.py](../../apps/ai/tests/test_recommendation.py)
