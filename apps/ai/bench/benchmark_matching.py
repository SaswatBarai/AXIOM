"""
Benchmark: job matching engine against 10k synthetic jobs.

Measures pure-Python match computation (cosine similarity + keyword overlap)
without network or DB I/O, to isolate the algorithm's latency.

Run from apps/ai/:
    python bench/benchmark_matching.py

Target: p95 < 300ms for 10k jobs (Phase 9 DoD).
"""
import random
import statistics
import time

# Mock sentence_transformers so import works without the heavy package
import sys
from unittest.mock import MagicMock
sys.modules.setdefault("sentence_transformers", MagicMock())
sys.modules.setdefault("psycopg2", MagicMock())
sys.modules.setdefault("psycopg2.extras", MagicMock())

import sys as _sys
import os as _os
_sys.path.insert(0, _os.path.join(_os.path.dirname(__file__), ".."))

from services.recommendation import compute_match_score, _batch_match  # noqa: E402

_RNG = random.Random(42)
_DIM = 384

SKILL_POOL = [
    "python", "fastapi", "django", "flask", "typescript", "react", "nextjs",
    "postgresql", "mysql", "redis", "kafka", "docker", "kubernetes", "aws",
    "gcp", "azure", "terraform", "ci/cd", "golang", "rust", "java", "spring",
    "nodejs", "express", "graphql", "rest", "microservices", "rabbitmq",
]


def _rand_vec() -> list[float]:
    return [_RNG.gauss(0, 1) for _ in range(_DIM)]


def _rand_skills(k: int = 5) -> list[str]:
    return _RNG.sample(SKILL_POOL, min(k, len(SKILL_POOL)))


def _build_jobs(n: int) -> list[dict]:
    return [
        {
            "id": f"job-{i}",
            "embedding": _rand_vec(),
            "required_skills": _rand_skills(_RNG.randint(3, 10)),
        }
        for i in range(n)
    ]


def run_bench(n_jobs: int = 10_000, n_trials: int = 5) -> None:
    print(f"\nBuilding {n_jobs:,} synthetic jobs ...")
    jobs = _build_jobs(n_jobs)

    resume_emb = _rand_vec()
    resume_skills = set(_rand_skills(8))

    trial_ms: list[float] = []
    for trial in range(1, n_trials + 1):
        t0 = time.perf_counter()
        _batch_match(resume_emb, resume_skills, jobs)
        elapsed_ms = (time.perf_counter() - t0) * 1000
        trial_ms.append(elapsed_ms)
        print(f"  Trial {trial}: {elapsed_ms:.1f} ms  ({elapsed_ms / n_jobs * 1000:.2f} µs/job)")

    p50 = statistics.median(trial_ms)
    p95 = sorted(trial_ms)[int(len(trial_ms) * 0.95)]
    p99 = sorted(trial_ms)[int(len(trial_ms) * 0.99)]

    print(f"\nResults for {n_jobs:,} jobs ({n_trials} trials):")
    print(f"  p50 : {p50:.1f} ms")
    print(f"  p95 : {p95:.1f} ms  (target < 300 ms)")
    print(f"  p99 : {p99:.1f} ms")
    print(f"  pass: {'✅' if p95 < 300 else '❌'} p95 {'<' if p95 < 300 else '>='} 300 ms")


if __name__ == "__main__":
    run_bench()
