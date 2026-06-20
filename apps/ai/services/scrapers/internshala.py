"""Internshala adapter.

Internshala embeds full job data as JSON-LD on every listing page, so we
don't need a headless browser. Strategy:

1. Hit listing pages (`/internships/<query>/page-N`).
2. Walk each `<div class="individual_internship">` card for href + meta.
3. Parse `<script type="application/ld+json">` for canonical fields.
4. Fall back to per-card HTML scraping if JSON-LD missing.
"""
from __future__ import annotations

import json
import re
from datetime import datetime, timezone
from typing import AsyncIterator, Optional
from urllib.parse import urljoin

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

            for card in cards:
                href = self._card_href(card)
                if not href:
                    continue
                detail_url = urljoin(BASE_URL, href)
                try:
                    job = await self._fetch_detail(detail_url)
                except Exception as e:  # noqa: BLE001
                    logger.warning(f"internshala: detail fetch failed {detail_url}: {e}")
                    continue
                if job is not None:
                    yield job

    # ── Internals ─────────────────────────────────────────────────────────────

    def _listing_url(self, query: str, page: int) -> str:
        slug = re.sub(r"\s+", "-", query.strip().lower()) or "computer-science"
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


def parse_detail(html: str, *, url: str) -> Optional[NormalizedJob]:
    """Pure parser — accepts raw HTML, returns a `NormalizedJob` or None.

    Split out so we can unit-test against frozen fixtures without any network.
    """
    soup = BeautifulSoup(html, "lxml")

    # 1. Try JSON-LD first (canonical, machine-readable).
    job_dict = _find_jsonld_job(soup)

    if job_dict:
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
    else:
        # 2. Fallback: HTML scrape.
        title = _text(soup.select_one("h1.profile, h1, .heading_4_5"))
        company = _text(soup.select_one(".company_name, .company"))
        description_html = _text(soup.select_one(".internship_details, .text-container, .job_description"))
        date_posted_raw = ""
        valid_through_raw = ""
        emp_type = "INTERN"
        location = _text(soup.select_one(".location_link, .locations, .location"))
        remote = "work from home" in (location or "").lower()

    if not title or not company:
        return None

    description = sanitize_description(description_html, max_len=16_384)
    required, nice = split_required_vs_nice(description)

    posted_at = _parse_dt(date_posted_raw) or datetime.now(timezone.utc)
    expires_at = _parse_dt(valid_through_raw)

    salary_min, salary_max = _extract_stipend(soup)

    return NormalizedJob(
        title=title,
        company=company,
        location=location or "India",
        remote=remote,
        job_type=_map_employment_type(emp_type),
        experience_level=ExperienceLevel.ENTRY,  # Internshala is intern-heavy
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


def _find_jsonld_job(soup: BeautifulSoup) -> Optional[dict]:
    for tag in soup.find_all("script", attrs={"type": "application/ld+json"}):
        raw = tag.string or tag.get_text() or ""
        if not raw.strip():
            continue
        try:
            data = json.loads(raw)
        except json.JSONDecodeError:
            continue

        # JSON-LD can be a single dict, a list, or an @graph container.
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
                return c
    return None


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
        # Accept ISO with or without TZ
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


def _extract_stipend(soup: BeautifulSoup) -> tuple[Optional[int], Optional[int]]:
    """Return (min, max) monthly stipend in rupees if findable."""
    text = " ".join(t.get_text(" ", strip=True) for t in soup.select(".stipend, .salary, .stipend_container"))
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
