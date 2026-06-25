"""Per-host async token-bucket rate limiter.

Each adapter shares a single `AsyncRateLimiter` instance keyed by host. The
default is conservative (1 request per 3 seconds) — adapters can override per
endpoint where the host explicitly allows higher rates.
"""
from __future__ import annotations

import asyncio
import time
from collections import defaultdict


class AsyncRateLimiter:
    """Token-bucket style limiter, one bucket per host.

    Not perfectly accurate under high parallelism, but more than precise enough
    for the kind of polite scraping we're doing here. Designed to be cheap to
    construct and safe to share across tasks within a single event loop.
    """

    def __init__(self, *, min_interval_s: float = 3.0):
        self._min_interval = min_interval_s
        self._last_request: dict[str, float] = defaultdict(float)
        self._locks: dict[str, asyncio.Lock] = defaultdict(asyncio.Lock)

    async def acquire(self, host: str) -> None:
        """Block until it's safe to issue another request to `host`."""
        async with self._locks[host]:
            elapsed = time.monotonic() - self._last_request[host]
            wait = self._min_interval - elapsed
            if wait > 0:
                await asyncio.sleep(wait)
            self._last_request[host] = time.monotonic()

    def reset(self, host: str | None = None) -> None:
        if host is None:
            self._last_request.clear()
        else:
            self._last_request.pop(host, None)
