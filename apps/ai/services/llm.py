"""Shared DeepSeek V4 Flash client (OpenAI-compatible API)."""
from __future__ import annotations

import os
import time
from typing import AsyncGenerator

from openai import AsyncOpenAI, OpenAI, RateLimitError

from utils.logger import logger

_API_KEY = os.getenv("DEEPSEEK_API_KEY", os.getenv("GEMINI_API_KEY", ""))
_MODEL = os.getenv("DEEPSEEK_MODEL", "deepseek-v4-flash")
_BASE_URL = os.getenv("DEEPSEEK_BASE_URL", "https://api.deepseek.com/v1")

_SYNC_CLIENT: OpenAI | None = None
_ASYNC_CLIENT: AsyncOpenAI | None = None


def model_name() -> str:
    return _MODEL


def _extra_body() -> dict:
    return {"thinking": {"type": "disabled"}}


def _get_sync_client() -> OpenAI:
    global _SYNC_CLIENT
    if _SYNC_CLIENT is None:
        _SYNC_CLIENT = OpenAI(api_key=_API_KEY, base_url=_BASE_URL)
    return _SYNC_CLIENT


def _get_async_client() -> AsyncOpenAI:
    global _ASYNC_CLIENT
    if _ASYNC_CLIENT is None:
        _ASYNC_CLIENT = AsyncOpenAI(api_key=_API_KEY, base_url=_BASE_URL)
    return _ASYNC_CLIENT


def ask_llm(
    prompt: str,
    *,
    system: str | None = None,
    temperature: float = 0.3,
    max_tokens: int = 4096,
    retries: int = 3,
) -> str:
    """Non-streaming chat completion with retry on rate limits."""
    messages: list[dict[str, str]] = []
    if system:
        messages.append({"role": "system", "content": system})
    messages.append({"role": "user", "content": prompt})

    last_err: Exception | None = None
    for attempt in range(retries):
        try:
            resp = _get_sync_client().chat.completions.create(
                model=_MODEL,
                messages=messages,
                temperature=temperature,
                max_tokens=max_tokens,
                extra_body=_extra_body(),
            )
            content = resp.choices[0].message.content
            return (content or "").strip()
        except RateLimitError as e:
            last_err = e
            if attempt < retries - 1:
                wait = min(10 * (attempt + 1), 60)
                logger.warning(f"[llm] rate limited, retrying in {wait}s (attempt {attempt + 1})")
                time.sleep(wait)
            else:
                logger.error(f"[llm] rate limited after {retries} retries")
                raise
        except Exception as e:
            logger.error(f"[llm] call failed: {e}")
            raise
    raise last_err or RuntimeError("LLM call failed")


async def stream_llm(
    prompt: str,
    *,
    system: str | None = None,
    temperature: float = 0.7,
    max_tokens: int = 4096,
) -> AsyncGenerator[str, None]:
    """Streaming chat completion — yields text chunks as they arrive."""
    messages: list[dict[str, str]] = []
    if system:
        messages.append({"role": "system", "content": system})
    messages.append({"role": "user", "content": prompt})

    stream = await _get_async_client().chat.completions.create(
        model=_MODEL,
        messages=messages,
        temperature=temperature,
        max_tokens=max_tokens,
        stream=True,
        extra_body=_extra_body(),
    )
    async for chunk in stream:
        delta = chunk.choices[0].delta.content
        if delta:
            yield delta
