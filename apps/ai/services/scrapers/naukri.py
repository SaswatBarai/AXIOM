"""Naukri adapter.

Naukri's listing pages are React/Next.js-rendered, but every page embeds the
full data graph inside `<script id="__NEXT_DATA__">`. That makes the parser
pure: we extract the JSON blob and walk it. No Playwright needed for v1.

If Naukri ever moves to client-only rendering, swap the fetch step to a
Playwright pool — the parser is decoupled.
"""
from __future__ import annotations

import json
import re
from datetime import datetime, timezone
from typing import Any, AsyncIterator, Optional

from bs4 import BeautifulSoup

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

BASE_URL = "https://www.naukri.com"
LIST_PATH = "/{slug}-jobs"  # e.g. /backend-engineer-jobs


class NaukriAdapter(JobSourceAdapter):
    name = "naukri"

    def __init__(self, http: ScraperHttpClient):
        self._http = http

    async def fetch(
        self,
        *,
        query: str = "",
        max_pages: int = 3,
    ) -> AsyncIterator[NormalizedJob]:
        slug = _slugify(query) or "software-engineer"
        for page in range(1, max_pages + 1):
            url = self._listing_url(slug, page)
            try:
                html = await self._http.fetch_text(url)
            except Exception as e:  # noqa: BLE001
                logger.warning(f"naukri: listing fetch failed {url}: {e}")
                break

            jobs = list(parse_listing_html(html))
            if not jobs:
                logger.info(f"naukri: empty results on page {page} — stopping")
                break
            for job in jobs:
                yield job

    def _listing_url(self, slug: str, page: int) -> str:
        suffix = f"-{page}" if page > 1 else ""
        return f"{BASE_URL}/{slug}-jobs{suffix}"


# ── Pure parser layer ────────────────────────────────────────────────────────


def parse_listing_html(html: str) -> list[NormalizedJob]:
    """Extract jobs from a Naukri listing page's `__NEXT_DATA__` blob."""
    soup = BeautifulSoup(html, "lxml")
    tag = soup.find("script", id="__NEXT_DATA__")
    if not tag or not tag.string:
        return []

    try:
        data = json.loads(tag.string)
    except json.JSONDecodeError:
        return []

    jobs_raw = _walk_for_job_list(data)
    out: list[NormalizedJob] = []
    for raw in jobs_raw:
        job = parse_listing_entry(raw)
        if job is not None:
            out.append(job)
    return out


def _walk_for_job_list(data: Any) -> list[dict]:
    """Naukri nests the list under different keys per page generation.

    We breadth-first walk and return the first list whose elements look
    like job objects (have `title`/`jobTitle` and `companyName`).
    """
    queue: list[Any] = [data]
    while queue:
        node = queue.pop(0)
        if isinstance(node, list):
            if node and isinstance(node[0], dict) and _looks_like_job(node[0]):
                return [n for n in node if isinstance(n, dict)]
            queue.extend(node)
        elif isinstance(node, dict):
            queue.extend(node.values())
    return []


_JOB_TITLE_KEYS = ("jobTitle", "title", "jobName")
_COMPANY_KEYS = ("companyName", "company", "employerName")


def _looks_like_job(d: dict) -> bool:
    return any(k in d for k in _JOB_TITLE_KEYS) and any(k in d for k in _COMPANY_KEYS)


def parse_listing_entry(entry: dict) -> Optional[NormalizedJob]:
    title = _first(entry, _JOB_TITLE_KEYS, default="").strip()
    company = _first(entry, _COMPANY_KEYS, default="").strip()
    if not title or not company:
        return None

    seo_jd = entry.get("seoJD") or ""
    job_id  = entry.get("jobId") or entry.get("id") or ""
    # Prefer jdURL (already a full path), then construct from seoJD, then numeric jobId
    if entry.get("jdURL") or entry.get("url"):
        url = entry.get("jdURL") or entry.get("url")
    elif seo_jd:
        url = f"{BASE_URL}/job-listings-{seo_jd}"
    elif job_id:
        url = f"{BASE_URL}/job-listings-{job_id}"
    else:
        return None  # no valid URL — skip entry

    description_html = (
        entry.get("jobDescription")
        or entry.get("description")
        or entry.get("seoDescription")
        or title
    )
    description = sanitize_description(description_html)
    required, nice = split_required_vs_nice(description)

    # Naukri sometimes has explicit `tagsAndSkills` — prefer that
    tags = entry.get("tagsAndSkills") or entry.get("skills") or ""
    if tags:
        explicit = [s.strip().lower() for s in re.split(r"[,;]", str(tags)) if s.strip()]
        # Merge taking explicit first, dedupe
        seen: set[str] = set()
        merged: list[str] = []
        for s in explicit + required:
            if s and s not in seen:
                seen.add(s)
                merged.append(s)
        required = merged

    location = entry.get("placeholders", {}).get("location") if isinstance(entry.get("placeholders"), dict) else None
    location = location or entry.get("location") or "India"
    if isinstance(location, list):
        location = ", ".join(str(x) for x in location if x)

    work_from_home = bool(entry.get("workFromHomeType") or entry.get("isRemote"))
    remote = work_from_home or "remote" in str(location).lower() or "work from home" in str(location).lower()

    sal_min, sal_max = _salary_band(entry)

    posted_at = _parse_dt(entry.get("createdDate") or entry.get("postedDate") or entry.get("footerPlaceholderLabel"))
    expires_at = _parse_dt(entry.get("expiryDate"))

    experience_raw = (
        (entry.get("placeholders", {}) or {}).get("experience")
        if isinstance(entry.get("placeholders"), dict)
        else None
    ) or entry.get("minExperience") or entry.get("experience")

    return NormalizedJob(
        title=title,
        company=company,
        company_logo_url=_logo(entry),
        location=str(location),
        remote=remote,
        job_type=_map_job_type(entry),
        experience_level=_map_experience(experience_raw),
        salary_min=sal_min,
        salary_max=sal_max,
        currency="INR",
        description=description or title,
        required_skills=required,
        nice_to_have_skills=nice,
        source="naukri",
        source_url=url if url.startswith("http") else BASE_URL + url,
        posted_at=posted_at,
        expires_at=expires_at,
    )


def _first(d: dict, keys: tuple[str, ...], *, default: str = "") -> str:
    for k in keys:
        v = d.get(k)
        if isinstance(v, str) and v.strip():
            return v
    return default


def _logo(entry: dict) -> Optional[str]:
    for k in ("logoPath", "companyLogo", "logo", "companyLogoUrl"):
        v = entry.get(k)
        if isinstance(v, str) and v.startswith("http"):
            return v
    return None


def _salary_band(entry: dict) -> tuple[Optional[int], Optional[int]]:
    pl = entry.get("placeholders") if isinstance(entry.get("placeholders"), dict) else {}
    raw = (pl or {}).get("salary") or entry.get("salary") or entry.get("ctcRange") or ""
    if not raw:
        return None, None
    # Examples: "₹ 8-15 LPA", "Not disclosed", "5-9 LPA"
    if "not disclosed" in str(raw).lower():
        return None, None
    m = re.search(r"(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)", str(raw))
    if not m:
        return None, None
    lo = float(m.group(1))
    hi = float(m.group(2))
    # Naukri usually reports in lakhs per annum — convert to rupees
    if "lpa" in str(raw).lower() or "lakh" in str(raw).lower():
        return int(lo * 100_000), int(hi * 100_000)
    return int(lo), int(hi)


def _map_job_type(entry: dict) -> JobType:
    et = (entry.get("employmentType") or entry.get("jobType") or "").lower()
    if "intern" in et:
        return JobType.INTERNSHIP
    if "part" in et:
        return JobType.PART_TIME
    if "contract" in et:
        return JobType.CONTRACT
    if "freelance" in et or "temp" in et:
        return JobType.FREELANCE
    return JobType.FULL_TIME


def _map_experience(raw: Any) -> ExperienceLevel:
    if raw is None or raw == "":
        return ExperienceLevel.MID
    text = str(raw).lower()
    if "executive" in text or "director" in text or "vp" in text:
        return ExperienceLevel.EXECUTIVE
    if "lead" in text or "principal" in text or "staff" in text:
        return ExperienceLevel.LEAD
    if "senior" in text:
        return ExperienceLevel.SENIOR
    # Parse leading number for year-ranges like "5-9 years"
    m = re.match(r"\s*(\d+)", text)
    if m:
        years = int(m.group(1))
        if years <= 1:
            return ExperienceLevel.ENTRY
        if years <= 4:
            return ExperienceLevel.MID
        if years <= 8:
            return ExperienceLevel.SENIOR
        if years <= 12:
            return ExperienceLevel.LEAD
        return ExperienceLevel.EXECUTIVE
    return ExperienceLevel.MID


def _parse_dt(raw: Any) -> Optional[datetime]:
    if not raw:
        return None
    s = str(raw).strip()
    # Naukri sometimes shows "5 days ago" / "Just now" / ISO timestamps.
    try:
        dt = datetime.fromisoformat(s.replace("Z", "+00:00"))
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt
    except ValueError:
        return None


def _slugify(query: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", query.strip().lower()).strip("-")
