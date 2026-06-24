"""Internshala adapter.

Internshala embeds full job data as JSON-LD on listing and detail pages, so we
don't need a headless browser. Strategy:

1. Hit listing pages (`/internships/<query>/page-N`).
2. Extract all JSON-LD JobPosting blocks from the listing HTML.
3. Parse each card from listing HTML (title, company, location) — skip detail fetch when sufficient.
4. Fall back to parallel detail fetches (capped concurrency) for cards still missing data.
"""
from __future__ import annotations

import asyncio
import json
import re
from datetime import datetime, timedelta, timezone
from typing import AsyncIterator, Optional
from urllib.parse import urljoin, urlparse

from bs4 import BeautifulSoup, Tag

from .base import (
    ExperienceLevel,
    JobSourceAdapter,
    JobType,
    NormalizedJob,
    sanitize_description,
)
from .http import ScraperHttpClient
from .skill_extractor import split_required_vs_nice
from utils.logger import logger

BASE_URL = "https://internshala.com"
LIST_PATH = "/internships"  # /internships/<query>/page-N
_DETAIL_CONCURRENCY = 6
_MAX_DETAIL_FETCHES = 12


class InternshalaAdapter(JobSourceAdapter):
    name = "internshala"

    def __init__(self, http: ScraperHttpClient):
        self._http = http

    async def fetch(
        self,
        *,
        query: str = "",
        max_pages: int = 3,
    ) -> AsyncIterator[NormalizedJob]:
        for page in range(1, max_pages + 1):
            url = self._listing_url(query, page)
            try:
                html = await self._http.fetch_text(url)
            except Exception as e:  # noqa: BLE001
                logger.warning(f"internshala: listing fetch failed {url}: {e}")
                break

            soup = BeautifulSoup(html, "lxml")
            cards = soup.select("div.individual_internship")
            if not cards:
                logger.info(f"internshala: no cards on page {page} — stopping")
                break

            listing_jsonld = _index_jsonld_by_url(soup)
            pending_details: list[str] = []

            for card in cards:
                href = self._card_href(card)
                if not href:
                    continue
                detail_url = urljoin(BASE_URL, href)

                jsonld = listing_jsonld.get(_url_path(detail_url))
                if jsonld:
                    job = _job_from_jsonld(jsonld, url=detail_url, soup=None)
                    if job is not None and job.posted_at is not None:
                        yield job
                        continue

                card_job = _parse_card(card, detail_url)
                if card_job is not None and card_job.posted_at is not None:
                    yield card_job
                    continue

                pending_details.append(detail_url)

            if pending_details:
                batch = pending_details[:_MAX_DETAIL_FETCHES]
                async for job in self._fetch_details_parallel(batch):
                    if job is not None:
                        yield job

    # ── Internals ─────────────────────────────────────────────────────────────

    def _listing_url(self, query: str, page: int) -> str:
        slug = re.sub(r"\s+", "-", query.strip().lower()) or "computer-science"
        if not slug.endswith("-internship") and not slug.endswith("-internships"):
            slug = f"{slug}-internship"
        suffix = f"/page-{page}" if page > 1 else ""
        return f"{BASE_URL}{LIST_PATH}/{slug}{suffix}"

    @staticmethod
    def _card_href(card: Tag) -> Optional[str]:
        a = card.select_one("a.job-title-href, a.view_detail_button, a")
        if a and a.get("href"):
            return a.get("href")
        return None

    async def _fetch_detail(self, url: str) -> Optional[NormalizedJob]:
        html = await self._http.fetch_text(url)
        return parse_detail(html, url=url)

    async def _fetch_details_parallel(self, urls: list[str]) -> AsyncIterator[NormalizedJob]:
        sem = asyncio.Semaphore(_DETAIL_CONCURRENCY)

        async def fetch_one(url: str) -> Optional[NormalizedJob]:
            async with sem:
                try:
                    return await self._fetch_detail(url)
                except Exception as e:  # noqa: BLE001
                    logger.warning(f"internshala: detail fetch failed {url}: {e}")
                    return None

        results = await asyncio.gather(*(fetch_one(u) for u in urls))
        for job in results:
            if job is not None:
                yield job


def parse_detail(html: str, *, url: str) -> Optional[NormalizedJob]:
    """Pure parser — accepts raw HTML, returns a `NormalizedJob` or None.

    Split out so we can unit-test against frozen fixtures without any network.
    """
    soup = BeautifulSoup(html, "lxml")
    job_dict = _find_jsonld_job(soup)
    if job_dict:
        return _job_from_jsonld(job_dict, url=url, soup=soup)
    return _job_from_html_fallback(soup, url=url)


def _parse_card(card: Tag, detail_url: str) -> Optional[NormalizedJob]:
    """Build a job from listing-card HTML when title + company are visible."""
    title = _text(card.select_one("a.job-title-href, h3 a, .profile, .heading_4_5"))
    company = _text(card.select_one(".company_name, .company, .heading_6, .company-name"))
    if not title or not company:
        return None

    location = _text(card.select_one(".location_link, .locations, .location"))
    remote = "work from home" in (location or "").lower()
    description = _text(
        card.select_one(".internship_details, .job-description, .item_body, .about_internship")
    )
    description = sanitize_description(description or f"{title} at {company}", max_len=16_384)
    required, nice = split_required_vs_nice(description)

    salary_min, salary_max = _extract_stipend(card)
    posted_at = _posted_at_from_card(card)

    return NormalizedJob(
        title=title,
        company=company,
        location=location or "India",
        remote=remote,
        job_type=JobType.INTERNSHIP,
        experience_level=ExperienceLevel.ENTRY,
        salary_min=salary_min,
        salary_max=salary_max,
        currency="INR",
        description=description,
        required_skills=required,
        nice_to_have_skills=nice,
        source="internshala",
        source_url=detail_url,
        posted_at=posted_at,
        expires_at=None,
    )


def _job_from_jsonld(job_dict: dict, *, url: str, soup: Optional[BeautifulSoup]) -> Optional[NormalizedJob]:
    title = (job_dict.get("title") or "").strip()
    company = (
        (job_dict.get("hiringOrganization") or {}).get("name")
        or job_dict.get("hiringOrganization")
        or ""
    ).strip() if isinstance(job_dict.get("hiringOrganization"), dict) else (job_dict.get("hiringOrganization") or "").strip()
    description_html = job_dict.get("description") or ""
    date_posted_raw = job_dict.get("datePosted") or ""
    valid_through_raw = job_dict.get("validThrough") or ""
    emp_type = (job_dict.get("employmentType") or "").upper()
    location_obj = job_dict.get("jobLocation") or {}
    location = _location_from_jsonld(location_obj)
    loc_type = str(job_dict.get("jobLocationType") or "").upper()
    remote = "TELECOMMUTE" in loc_type or "REMOTE" in loc_type

    if not title or not company:
        return None

    description = sanitize_description(description_html, max_len=16_384)
    required, nice = split_required_vs_nice(description)

    posted_at = _parse_dt(date_posted_raw)
    expires_at = _parse_dt(valid_through_raw)

    salary_min, salary_max = (None, None)
    if soup is not None:
        salary_min, salary_max = _extract_stipend(soup)

    return NormalizedJob(
        title=title,
        company=company,
        location=location or "India",
        remote=remote,
        job_type=_map_employment_type(emp_type),
        experience_level=ExperienceLevel.ENTRY,
        salary_min=salary_min,
        salary_max=salary_max,
        currency="INR",
        description=description,
        required_skills=required,
        nice_to_have_skills=nice,
        source="internshala",
        source_url=url,
        posted_at=posted_at,
        expires_at=expires_at,
    )


def _job_from_html_fallback(soup: BeautifulSoup, *, url: str) -> Optional[NormalizedJob]:
    title = _text(soup.select_one("h1.profile, h1, .heading_4_5"))
    company = _text(soup.select_one(".company_name, .company"))
    description_html = _text(soup.select_one(".internship_details, .text-container, .job_description"))
    location = _text(soup.select_one(".location_link, .locations, .location"))
    remote = "work from home" in (location or "").lower()

    if not title or not company:
        return None

    description = sanitize_description(description_html, max_len=16_384)
    required, nice = split_required_vs_nice(description)
    salary_min, salary_max = _extract_stipend(soup)

    return NormalizedJob(
        title=title,
        company=company,
        location=location or "India",
        remote=remote,
        job_type=JobType.INTERNSHIP,
        experience_level=ExperienceLevel.ENTRY,
        salary_min=salary_min,
        salary_max=salary_max,
        currency="INR",
        description=description,
        required_skills=required,
        nice_to_have_skills=nice,
        source="internshala",
        source_url=url,
        posted_at=None,
        expires_at=None,
    )


def _index_jsonld_by_url(soup: BeautifulSoup) -> dict[str, dict]:
    """Map normalized URL path → JobPosting JSON-LD from a listing page."""
    indexed: dict[str, dict] = {}
    for job_dict in _iter_jsonld_jobs(soup):
        raw_url = job_dict.get("url") or job_dict.get("@id") or ""
        if raw_url:
            indexed[_url_path(str(raw_url))] = job_dict
    return indexed


def _url_path(url: str) -> str:
    return urlparse(url).path.rstrip("/")


def _iter_jsonld_jobs(soup: BeautifulSoup) -> list[dict]:
    jobs: list[dict] = []
    for tag in soup.find_all("script", attrs={"type": "application/ld+json"}):
        raw = tag.string or tag.get_text() or ""
        if not raw.strip():
            continue
        try:
            data = json.loads(raw)
        except json.JSONDecodeError:
            continue

        candidates: list[dict] = []
        if isinstance(data, dict):
            if "@graph" in data and isinstance(data["@graph"], list):
                candidates.extend(d for d in data["@graph"] if isinstance(d, dict))
            else:
                candidates.append(data)
        elif isinstance(data, list):
            candidates.extend(d for d in data if isinstance(d, dict))

        for c in candidates:
            ctype = c.get("@type")
            if ctype == "JobPosting" or (isinstance(ctype, list) and "JobPosting" in ctype):
                jobs.append(c)
    return jobs


def _find_jsonld_job(soup: BeautifulSoup) -> Optional[dict]:
    jobs = _iter_jsonld_jobs(soup)
    return jobs[0] if jobs else None


def _location_from_jsonld(loc: dict | list) -> str:
    if isinstance(loc, list):
        loc = loc[0] if loc else {}
    if not isinstance(loc, dict):
        return ""
    addr = loc.get("address") or {}
    if isinstance(addr, dict):
        parts = [addr.get("addressLocality"), addr.get("addressRegion"), addr.get("addressCountry")]
        return ", ".join(p for p in parts if p)
    return ""


def _parse_dt(raw: str) -> Optional[datetime]:
    if not raw:
        return None
    try:
        dt = datetime.fromisoformat(raw.replace("Z", "+00:00"))
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt
    except ValueError:
        return None


def _map_employment_type(emp: str) -> JobType:
    if not emp:
        return JobType.INTERNSHIP
    emp = emp.upper()
    if "INTERN" in emp:
        return JobType.INTERNSHIP
    if "PART" in emp:
        return JobType.PART_TIME
    if "CONTRACT" in emp:
        return JobType.CONTRACT
    if "FREELANCE" in emp or "TEMP" in emp:
        return JobType.FREELANCE
    return JobType.FULL_TIME


_STIPEND_RE = re.compile(r"₹\s?(\d{1,3}(?:,\d{3})*)")
_RELATIVE_POSTED = re.compile(
    r"(?i)(?:posted\s+)?(?:(\d+)\s+(day|week|month)s?\s+ago|just\s+now|today|yesterday)"
)


def _posted_at_from_card(card: Tag) -> Optional[datetime]:
    """Parse relative posted dates from listing cards (e.g. 'Posted 3 days ago')."""
    parts = [
        _text(card.select_one(".posted_by, .posted_by_label, .status-in-text")),
        card.get_text(" ", strip=True),
    ]
    blob = " ".join(p for p in parts if p).lower()
    now = datetime.now(timezone.utc)
    if "just now" in blob or "today" in blob:
        return now
    if "yesterday" in blob:
        return now - timedelta(days=1)
    m = _RELATIVE_POSTED.search(blob)
    if not m:
        return None
    if m.lastindex is None or m.lastindex < 2:
        return now
    qty = int(m.group(1))
    unit = m.group(2).lower()
    if unit.startswith("day"):
        return now - timedelta(days=qty)
    if unit.startswith("week"):
        return now - timedelta(weeks=qty)
    if unit.startswith("month"):
        return now - timedelta(days=qty * 30)
    return None


def _extract_stipend(node: BeautifulSoup | Tag) -> tuple[Optional[int], Optional[int]]:
    """Return (min, max) monthly stipend in rupees if findable."""
    text = " ".join(t.get_text(" ", strip=True) for t in node.select(".stipend, .salary, .stipend_container"))
    if not text:
        return None, None
    numbers = [int(m.replace(",", "")) for m in _STIPEND_RE.findall(text)]
    if not numbers:
        return None, None
    if len(numbers) == 1:
        return numbers[0], numbers[0]
    return min(numbers), max(numbers)


def _text(tag: Optional[Tag]) -> str:
    if tag is None:
        return ""
    return tag.get_text(" ", strip=True)
