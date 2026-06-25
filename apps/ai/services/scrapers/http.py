"""Shared HTTP client + retry policy for scrapers.

Every adapter goes through `fetch_text`/`fetch_json` so we get consistent:
  - User-Agent rotation (3 realistic desktop browsers)
  - Per-host rate limiting (via `AsyncRateLimiter`)
  - Retry with exponential backoff on 429 / 5xx / network errors
  - Honor `Retry-After` header on 429/503
"""
from __future__ import annotations

import asyncio
import random
from typing import Any, Optional
from urllib.parse import urlparse

import httpx
from tenacity import (
    AsyncRetrying,
    retry_if_exception,
    stop_after_attempt,
    wait_exponential,
)

from .rate_limit import AsyncRateLimiter

UA_POOL = [
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
]


def _should_retry(exc: BaseException) -> bool:
    if isinstance(exc, httpx.HTTPStatusError):
        return exc.response.status_code in (429, 500, 502, 503, 504)
    return isinstance(exc, (httpx.TransportError, httpx.TimeoutException))


class ScraperHttpClient:
    """Thin wrapper around `httpx.AsyncClient` with rate-limit + retry."""

    def __init__(
        self,
        *,
        rate_limiter: Optional[AsyncRateLimiter] = None,
        timeout: float = 20.0,
    ):
        self._rl = rate_limiter or AsyncRateLimiter()
        self._client = httpx.AsyncClient(
            timeout=timeout,
            follow_redirects=True,
            headers={"Accept-Language": "en-US,en;q=0.9"},
        )

    async def __aenter__(self) -> "ScraperHttpClient":
        return self

    async def __aexit__(self, *_exc) -> None:
        await self._client.aclose()

    async def close(self) -> None:
        await self._client.aclose()

    @property
    def rate_limiter(self) -> AsyncRateLimiter:
        return self._rl

    async def fetch_text(self, url: str, *, headers: Optional[dict[str, str]] = None) -> str:
        resp = await self._request("GET", url, headers=headers)
        return resp.text

    async def fetch_json(self, url: str, *, headers: Optional[dict[str, str]] = None) -> Any:
        resp = await self._request("GET", url, headers=headers)
        return resp.json()

    async def post_json(self, url: str, *, json: Any, headers: Optional[dict[str, str]] = None) -> Any:
        resp = await self._request("POST", url, headers=headers, json=json)
        return resp.json()

    async def _request(
        self,
        method: str,
        url: str,
        *,
        headers: Optional[dict[str, str]] = None,
        json: Any = None,
    ) -> httpx.Response:
        host = urlparse(url).netloc
        merged = {"User-Agent": random.choice(UA_POOL), **(headers or {})}

        async for attempt in AsyncRetrying(
            stop=stop_after_attempt(3),
            wait=wait_exponential(multiplier=1, min=1, max=10),
            retry=retry_if_exception(_should_retry),
            reraise=True,
        ):
            with attempt:
                await self._rl.acquire(host)
                resp = await self._client.request(method, url, headers=merged, json=json)
                if resp.status_code in (429, 503):
                    retry_after = resp.headers.get("Retry-After")
                    if retry_after and retry_after.isdigit():
                        await asyncio.sleep(min(int(retry_after), 30))
                resp.raise_for_status()
                return resp
        # Unreachable — `reraise=True` ensures the last exception propagates.
        raise RuntimeError("unreachable")  # pragma: no cover
