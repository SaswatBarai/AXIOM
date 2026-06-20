"""Scrape runner — drives one adapter to completion within a budget.

Returns the normalized rows + a summary; persistence is the API's job
(Express owns Prisma, AI service stays stateless w.r.t. Postgres). This
keeps the AI service horizontally scalable and avoids cross-service
schema coupling.
"""
from __future__ import annotations

import asyncio
import time
from typing import Optional

from .base import JobSourceAdapter, NormalizedJob, ScrapeRunSummary
from utils.logger import logger


async def run_scrape(
    adapter: JobSourceAdapter,
    *,
    query: str = "",
    max_pages: int = 3,
    max_jobs: int = 200,
    timeout_s: int = 90,
) -> tuple[list[NormalizedJob], ScrapeRunSummary]:
    """Drain `adapter` up to budget limits and return collected jobs + summary."""
    started = time.monotonic()
    summary = ScrapeRunSummary(source=adapter.name)
    collected: list[NormalizedJob] = []
    deadline = started + timeout_s

    try:
        async for job in adapter.fetch(query=query, max_pages=max_pages):
            if time.monotonic() > deadline:
                logger.warning(f"{adapter.name}: hit {timeout_s}s timeout — stopping")
                break
            summary.fetched += 1
            collected.append(job)
            if len(collected) >= max_jobs:
                logger.info(f"{adapter.name}: hit max_jobs={max_jobs} — stopping")
                break
    except Exception as e:  # noqa: BLE001 — adapters can throw anything
        summary.errors += 1
        logger.error(f"{adapter.name}: scrape aborted — {type(e).__name__}: {e}")

    summary.duration_ms = int((time.monotonic() - started) * 1000)
    logger.info(
        f"{adapter.name}: fetched={summary.fetched} errors={summary.errors} "
        f"duration={summary.duration_ms}ms"
    )
    return collected, summary
