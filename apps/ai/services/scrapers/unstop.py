"""Unstop adapter.

Unstop powers its listing pages from a public JSON endpoint
(`/api/public/opportunity/search-result`) that returns a structured opportunity
list — no HTML parsing required for the listing stage. Detail pages can be
fetched via `/api/public/opportunity/{slug}` for the description body.

Categories: jobs + internships + hackathons. We coerce all to `Job` rows but
keep `experience_level` ENTRY for non-job categories so they sort sensibly.
"""
from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, AsyncIterator, Optional

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

SEARCH_URL = "https://unstop.com/api/public/opportunity/search-result"
DETAIL_URL = "https://unstop.com/api/public/opportunity/{slug}"
PUBLIC_URL = "https://unstop.com/{type}/{slug}"


class UnstopAdapter(JobSourceAdapter):
    name = "unstop"

    def __init__(self, http: ScraperHttpClient):
        self._http = http

    async def fetch(
        self,
        *,
        query: str = "",
        max_pages: int = 3,
    ) -> AsyncIterator[NormalizedJob]:
        for page in range(1, max_pages + 1):
            params = [
                ("opportunity", "jobs"),
                ("opportunity", "internships"),
                ("searchTerm", query or "engineer"),
                ("page", str(page)),
                ("per_page", "20"),
            ]
            qs = "&".join(f"{k}={v}" for k, v in params)
            url = f"{SEARCH_URL}?{qs}"
            try:
                payload = await self._http.fetch_json(url)
            except Exception as e:  # noqa: BLE001
                logger.warning(f"unstop: listing fetch failed {url}: {e}")
                break

            results = _extract_results(payload)
            if not results:
                logger.info(f"unstop: empty results on page {page} — stopping")
                break

            for entry in results:
                job = parse_listing_entry(entry)
                if job is not None:
                    yield job


# ── Pure parser — fixture-friendly ────────────────────────────────────────────


def _extract_results(payload: Any) -> list[dict]:
    """Defensive extraction — Unstop wraps results several different ways."""
    if not isinstance(payload, dict):
        return []
    for key in ("data", "results", "opportunities"):
        sub = payload.get(key)
        if isinstance(sub, dict):
            inner = sub.get("data") or sub.get("results") or sub.get("opportunities")
            if isinstance(inner, list):
                return [r for r in inner if isinstance(r, dict)]
            if isinstance(sub.get("rows"), list):
                return [r for r in sub["rows"] if isinstance(r, dict)]
        if isinstance(sub, list):
            return [r for r in sub if isinstance(r, dict)]
    return []


def parse_listing_entry(entry: dict) -> Optional[NormalizedJob]:
    """Build a NormalizedJob from a single Unstop listing entry."""
    title = (entry.get("title") or entry.get("name") or "").strip()
    org = entry.get("organisation") or entry.get("organization") or {}
    if isinstance(org, dict):
        company = (org.get("name") or org.get("title") or "").strip()
        logo = org.get("logo") or org.get("logoUrl")
    else:
        company = str(org).strip()
        logo = None

    if not title or not company:
        return None

    slug = entry.get("public_url") or entry.get("slug") or entry.get("seo_slug") or ""
    opp_type = (entry.get("type") or entry.get("opportunity_type") or "internships").lower()
    url = entry.get("share_url") or entry.get("url") or PUBLIC_URL.format(type=opp_type, slug=slug)

    description_html = entry.get("description") or entry.get("about") or entry.get("summary") or title
    description = sanitize_description(description_html)
    required, nice = split_required_vs_nice(description)

    location = _location_from_entry(entry)
    remote = _remote_from_entry(entry, location)

    job_type = _map_opportunity_type(opp_type, entry)
    experience_level = _map_experience(entry.get("experience"))

    salary_min, salary_max = _stipend_band(entry)

    posted_at = _parse_dt(entry.get("created_at") or entry.get("startDate") or entry.get("posted_at"))
    expires_at = _parse_dt(entry.get("end_date") or entry.get("endDate") or entry.get("expiry"))

    return NormalizedJob(
        title=title,
        company=company,
        company_logo_url=logo if isinstance(logo, str) and logo.startswith("http") else None,
        location=location,
        remote=remote,
        job_type=job_type,
        experience_level=experience_level,
        salary_min=salary_min,
        salary_max=salary_max,
        currency=(entry.get("currency") or "INR")[:3].upper(),
        description=description or title,
        required_skills=required,
        nice_to_have_skills=nice,
        source="unstop",
        source_url=url,
        posted_at=posted_at or datetime.now(timezone.utc),
        expires_at=expires_at,
    )


def _location_from_entry(entry: dict) -> str:
    loc = entry.get("location") or entry.get("city") or entry.get("region") or ""
    if isinstance(loc, list):
        return ", ".join(str(x) for x in loc if x)
    return str(loc).strip() or "India"


def _remote_from_entry(entry: dict, location: str) -> bool:
    if entry.get("is_remote") is True or entry.get("remote") is True:
        return True
    work_type = (entry.get("work_type") or entry.get("location_type") or "").lower()
    if "remote" in work_type or "work from home" in work_type:
        return True
    return "remote" in location.lower() or "work from home" in location.lower()


def _map_opportunity_type(opp_type: str, entry: dict) -> JobType:
    opp_type = (opp_type or "").lower()
    if "intern" in opp_type:
        return JobType.INTERNSHIP
    job_type_raw = (entry.get("job_type") or entry.get("employment_type") or "").lower()
    if "part" in job_type_raw:
        return JobType.PART_TIME
    if "contract" in job_type_raw:
        return JobType.CONTRACT
    if "freelance" in job_type_raw:
        return JobType.FREELANCE
    return JobType.FULL_TIME


def _map_experience(raw: Any) -> ExperienceLevel:
    if not raw:
        return ExperienceLevel.ENTRY
    text = str(raw).lower()
    if "executive" in text or "vp" in text:
        return ExperienceLevel.EXECUTIVE
    if "lead" in text or "principal" in text or "staff" in text:
        return ExperienceLevel.LEAD
    if "senior" in text:
        return ExperienceLevel.SENIOR
    if "mid" in text or "3" in text or "4" in text or "5" in text:
        return ExperienceLevel.MID
    return ExperienceLevel.ENTRY


def _stipend_band(entry: dict) -> tuple[Optional[int], Optional[int]]:
    salary = entry.get("salary") or entry.get("stipend") or entry.get("compensation") or {}
    if isinstance(salary, dict):
        lo = salary.get("min") or salary.get("from")
        hi = salary.get("max") or salary.get("to")
        return _to_int(lo), _to_int(hi)
    if isinstance(salary, (int, float)):
        v = int(salary)
        return v, v
    return None, None


def _to_int(v: Any) -> Optional[int]:
    if v is None or v == "":
        return None
    try:
        return int(float(v))
    except (TypeError, ValueError):
        return None


def _parse_dt(raw: Any) -> Optional[datetime]:
    if not raw:
        return None
    try:
        dt = datetime.fromisoformat(str(raw).replace("Z", "+00:00"))
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt
    except ValueError:
        return None
