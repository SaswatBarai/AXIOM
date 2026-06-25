"""
ATS (Applicant Tracking System) resume analyzer.
No external AI dependency — pure keyword + heuristic scoring.
"""
from __future__ import annotations

import re
from typing import Any

# Common stop words to ignore when extracting JD keywords
_STOP_WORDS = {
    "a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for",
    "of", "with", "is", "are", "was", "were", "be", "been", "have", "has",
    "had", "do", "does", "did", "will", "would", "could", "should", "may",
    "might", "shall", "must", "we", "you", "he", "she", "they", "it", "i",
    "this", "that", "these", "those", "as", "if", "by", "from", "up", "about",
    "into", "through", "during", "including", "until", "while", "per", "than",
    "then", "so", "yet", "both", "each", "more", "most", "other", "some",
    "such", "no", "not", "only", "same", "very", "just", "also", "well",
    "our", "your", "their", "its", "my", "his", "her", "any", "all", "one",
    "new", "strong", "good", "ability", "experience", "work", "team", "role",
    "following", "required", "preferred", "responsibilities", "requirements",
    "minimum", "years", "plus", "candidate", "position", "job", "company",
    "opportunity", "looking", "seeking", "ideal",
}


# Technical noun stop-words — too generic to score
_GENERIC_TECH = {
    "software", "development", "system", "systems", "services", "service",
    "solutions", "solution", "platform", "platforms", "application",
    "applications", "program", "programming", "code", "coding", "build",
    "building", "design", "designing", "implement", "implementing",
    "develop", "developing", "manage", "managing", "support", "maintain",
    "maintenance", "product", "products", "data", "technical", "technology",
    "technologies", "tools", "tool", "framework", "frameworks",
}


def _extract_keywords(text: str, min_len: int = 3) -> set[str]:
    """Extract meaningful lowercase tokens from free text."""
    tokens = re.findall(r"\b[a-zA-Z][a-zA-Z0-9+#./-]{1,}\b", text)
    result: set[str] = set()
    for t in tokens:
        lower = t.lower()
        if lower in _STOP_WORDS or lower in _GENERIC_TECH:
            continue
        if len(lower) < min_len:
            continue
        # Keep multi-char tokens; normalize JS/TS abbreviations
        result.add(lower)
    return result


def _resume_text(parsed: dict[str, Any]) -> str:
    """Flatten all resume text into one string for broad matching."""
    parts: list[str] = []
    for skill in parsed.get("skills", []):
        if isinstance(skill, dict):
            parts.append(skill.get("name", ""))
        else:
            parts.append(str(skill))
    for exp in parsed.get("experience", []):
        parts.append(exp.get("title", ""))
        parts.append(exp.get("company", ""))
        parts.append(exp.get("description", ""))
        parts.extend(exp.get("skills", []))
    for edu in parsed.get("education", []):
        parts.append(edu.get("field", ""))
        parts.append(edu.get("degree", ""))
    for proj in parsed.get("projects", []):
        parts.append(proj.get("description", ""))
        parts.extend(proj.get("skills", []))
    parts.extend(parsed.get("certifications", []))
    if parsed.get("summary"):
        parts.append(parsed["summary"])
    return " ".join(parts)


def _skill_names(parsed: dict[str, Any]) -> set[str]:
    skills_raw = parsed.get("skills", [])
    result: set[str] = set()
    for s in skills_raw:
        if isinstance(s, dict):
            result.add(s.get("name", "").lower())
        else:
            result.add(str(s).lower())
    return result


def _score_keyword_match(jd_keywords: set[str], resume_words: set[str]) -> tuple[int, list[str], list[str]]:
    """Return (score 0-100, matched, missing)."""
    if not jd_keywords:
        return 75, [], []
    matched = [k for k in jd_keywords if k in resume_words]
    missing = [k for k in jd_keywords if k not in resume_words]
    score = round(len(matched) / len(jd_keywords) * 100)
    return score, matched, missing


def _score_completeness(parsed: dict[str, Any]) -> int:
    """Penalise missing profile sections."""
    score = 100
    if not parsed.get("skills"):
        score -= 20
    if not parsed.get("experience"):
        score -= 20
    if not parsed.get("education"):
        score -= 10
    if not parsed.get("email"):
        score -= 10
    if not parsed.get("phone"):
        score -= 5
    if not parsed.get("summary"):
        score -= 5
    return max(score, 30)


def _score_readability(resume_text: str) -> int:
    """Rough readability: penalise very short or very long text."""
    words = len(resume_text.split())
    if words < 100:
        return 40
    if words < 200:
        return 65
    if words > 1500:
        return 75   # potentially too verbose
    return 90


def _score_formatting(parsed: dict[str, Any]) -> int:
    """Heuristic formatting check based on structural presence."""
    score = 100
    if not parsed.get("skills"):
        score -= 15
    if not parsed.get("experience"):
        score -= 25
    if not parsed.get("education"):
        score -= 10
    return max(score, 30)


def _build_strengths(matched: list[str], parsed: dict[str, Any]) -> list[str]:
    strengths: list[str] = []
    if len(matched) >= 5:
        strengths.append(f"Strong keyword alignment ({len(matched)} matched terms)")
    elif len(matched) >= 2:
        strengths.append(f"Keyword alignment ({len(matched)} matched terms)")
    if len(parsed.get("experience", [])) >= 2:
        strengths.append("Multiple experience entries show career progression")
    if parsed.get("education"):
        strengths.append("Education section is present")
    if parsed.get("certifications"):
        strengths.append(f"{len(parsed['certifications'])} certification(s) listed")
    if parsed.get("skills") and len(parsed["skills"]) >= 5:
        strengths.append(f"Well-defined skills section ({len(parsed['skills'])} skills)")
    return strengths[:5]


def _build_suggestions(missing: list[str], parsed: dict[str, Any]) -> list[str]:
    suggestions: list[str] = []
    if missing:
        top_missing = ", ".join(f'"{m}"' for m in missing[:5])
        suggestions.append(f"Add missing keywords from the job description: {top_missing}")
    if not parsed.get("summary"):
        suggestions.append("Add a professional summary at the top of your resume")
    if not parsed.get("email"):
        suggestions.append("Ensure your email address is clearly visible")
    if len(parsed.get("skills", [])) < 5:
        suggestions.append("Expand your skills section with more relevant technologies")
    if not parsed.get("projects"):
        suggestions.append("Add a projects section to showcase practical experience")
    for exp in parsed.get("experience", []):
        if not exp.get("description"):
            suggestions.append("Add bullet-point descriptions to your work experience entries")
            break
    return suggestions[:6]


def analyze_resume(parsed: dict[str, Any], job_description: str) -> dict[str, Any]:
    """
    Score a parsed resume against a job description.
    Returns an ATSScore-compatible dict.
    """
    jd_keywords = _extract_keywords(job_description)
    resume_full_text = _resume_text(parsed)
    resume_words = _extract_keywords(resume_full_text)

    kw_score, matched, missing = _score_keyword_match(jd_keywords, resume_words)
    completeness = _score_completeness(parsed)
    readability  = _score_readability(resume_full_text)
    formatting   = _score_formatting(parsed)

    # Weighted overall: keyword match 50%, completeness 25%, readability 15%, formatting 10%
    overall = round(
        kw_score      * 0.50 +
        completeness  * 0.25 +
        readability   * 0.15 +
        formatting    * 0.10
    )

    strengths   = _build_strengths(matched, parsed)
    suggestions = _build_suggestions(missing, parsed)

    # Return only top missing skills that look like real tech terms (≥3 chars)
    missing_skills = [m for m in missing if len(m) >= 3][:10]

    return {
        "overall":      overall,
        "keywordMatch": kw_score,
        "completeness": completeness,
        "readability":  readability,
        "formatting":   formatting,
        "strengths":    strengths,
        "missingSkills": missing_skills,
        "suggestions":  suggestions,
    }
