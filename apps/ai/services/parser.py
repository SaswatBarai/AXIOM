"""Resume text extraction and structured data parsing."""

import io
import re
from typing import Optional

import httpx
import pdfplumber
from docx import Document

from utils.logger import logger

# ── Skill keyword bank ────────────────────────────────────────────────────────

SKILLS = [
    # Languages — note: bare "c" and "r" dropped (cause heavy false positives without strict context)
    "python", "javascript", "typescript", "java", "c++", "c#", "go", "rust", "golang",
    "ruby", "php", "swift", "kotlin", "scala", "matlab", "bash", "shell",
    # Frontend
    "react", "vue", "angular", "next.js", "nuxt", "svelte", "html", "css",
    "tailwindcss", "sass", "webpack", "vite",
    # Backend
    "node.js", "express", "fastapi", "django", "flask", "spring", "rails",
    "laravel", "asp.net", "nestjs",
    # Databases
    "postgresql", "mysql", "mongodb", "redis", "elasticsearch", "sqlite",
    "dynamodb", "cassandra", "neo4j", "prisma", "sqlalchemy",
    # Cloud / DevOps
    "aws", "gcp", "azure", "docker", "kubernetes", "terraform", "ansible",
    "github actions", "ci/cd", "jenkins", "nginx",
    # AI / ML
    "machine learning", "deep learning", "pytorch", "tensorflow", "scikit-learn",
    "pandas", "numpy", "keras", "huggingface", "langchain", "openai",
    # Data
    "spark", "hadoop", "airflow", "dbt", "bigquery", "tableau", "power bi",
    # Tools & Practices
    "git", "linux", "rest api", "graphql", "kafka", "rabbitmq", "grpc",
    "agile", "scrum", "tdd", "microservices",
]

# Pre-compile skill regex: require non-alphanumeric boundaries so "c" doesn't match in "computer",
# "go" doesn't match in "going", etc. Allows skills with special chars (c++, next.js, ci/cd).
_BOUNDARY_BEFORE = r"(?<![a-zA-Z0-9+#./])"
_BOUNDARY_AFTER  = r"(?![a-zA-Z0-9])"
SKILL_PATTERNS: list[tuple[str, re.Pattern[str]]] = [
    (s, re.compile(_BOUNDARY_BEFORE + re.escape(s) + _BOUNDARY_AFTER, re.IGNORECASE))
    for s in SKILLS
]

# Common resume section headings
SECTION_HEADERS = [
    "experience", "work experience", "professional experience", "employment history",
    "education", "academic background",
    "skills", "technical skills", "core competencies",
    "projects", "personal projects", "open source",
    "certifications", "licenses",
    "summary", "professional summary", "profile", "objective", "about",
    "publications", "awards", "volunteer",
]

DATE_RE = re.compile(
    r"(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|"
    r"Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|"
    r"Dec(?:ember)?)?\s*\d{4}"
    r"\s*[-–—]\s*"
    r"(Present|Current|Now|Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|"
    r"Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|"
    r"Dec(?:ember)?)?\s*\d{0,4}",
    re.IGNORECASE,
)

YEAR_RE  = re.compile(r"\b(?:19|20)\d{2}\b")
EMAIL_RE = re.compile(r"[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}")
PHONE_RE = re.compile(r"(\+?1[\s.\-]?)?(\(?\d{3}\)?[\s.\-]?\d{3}[\s.\-]?\d{4})")
GPA_RE   = re.compile(r"GPA[\s:]*([0-4]\.\d{1,2})", re.IGNORECASE)

# ── File download ─────────────────────────────────────────────────────────────

async def download_file(url: str) -> bytes:
    """Download a file from a URL (S3 presigned or MinIO)."""
    async with httpx.AsyncClient(follow_redirects=True, timeout=30) as client:
        resp = await client.get(url)
        resp.raise_for_status()
        return resp.content

# ── Text extraction ───────────────────────────────────────────────────────────

def extract_text_pdf(content: bytes) -> str:
    pages = []
    with pdfplumber.open(io.BytesIO(content)) as pdf:
        for page in pdf.pages:
            t = page.extract_text()
            if t:
                pages.append(t)
    return "\n".join(pages)

def extract_text_docx(content: bytes) -> str:
    doc = Document(io.BytesIO(content))
    return "\n".join(p.text for p in doc.paragraphs if p.text.strip())

# ── Section splitting ─────────────────────────────────────────────────────────

def split_sections(text: str) -> dict[str, str]:
    sections: dict[str, str] = {}
    current_key   = "__header__"
    current_lines: list[str] = []

    for raw_line in text.splitlines():
        line = raw_line.strip()
        key  = line.lower()
        if key in SECTION_HEADERS and len(line) < 60:
            sections[current_key] = "\n".join(current_lines).strip()
            current_key   = key
            current_lines = []
        else:
            current_lines.append(raw_line)

    sections[current_key] = "\n".join(current_lines).strip()
    return sections

# ── Field extractors ──────────────────────────────────────────────────────────

def extract_email(text: str) -> Optional[str]:
    m = EMAIL_RE.search(text)
    return m.group(0) if m else None

def extract_phone(text: str) -> Optional[str]:
    m = PHONE_RE.search(text)
    return m.group(0).strip() if m else None

def extract_skills(text: str) -> list[dict]:
    return [
        {"name": name, "proficiency": None}
        for name, pat in SKILL_PATTERNS
        if pat.search(text)
    ]

def _parse_experience_header(line: str) -> tuple[str, str, str, str, bool]:
    """
    Parse a header line like:
      "Stripe — Senior Backend Engineer (2022 - Present)"
      "Senior Backend Engineer, Stripe | 2022 - Present"
      "Backend Engineer at Acme Corp (2019 - 2022)"
    Returns (company, title, startDate, endDate, is_current).
    """
    is_current = bool(re.search(r"\b(present|current|now)\b", line, re.IGNORECASE))

    # Strip parenthetical/pipe date suffix first so the prefix is cleaner.
    head = re.sub(r"\s*[\(\|\[][^\)\]\|]*[\)\]\|]?\s*$", "", line).strip()
    # If the date is plain (no parens), strip it from the end too.
    head = re.sub(r"\s*[—–\-:]\s*\d{4}.*$", "", head).strip()

    # Try "<Company> — <Title>" or "<Title>, <Company>" or "<Title> at <Company>".
    company, title = "", head
    m = re.match(r"^(?P<a>.+?)\s+[—–]\s+(?P<b>.+)$", head)
    if m:
        # Heuristic: shorter side is usually the company; otherwise treat first as company.
        company, title = m.group("a").strip(), m.group("b").strip()
    elif " at " in head.lower():
        parts = re.split(r"\s+at\s+", head, maxsplit=1, flags=re.IGNORECASE)
        title, company = parts[0].strip(), parts[1].strip()
    elif "," in head:
        a, b = (p.strip() for p in head.split(",", 1))
        title, company = a, b

    years = YEAR_RE.findall(line)
    start = years[0] if years else ""
    end = "Present" if is_current else (years[1] if len(years) > 1 else "")
    return company, title, start, end, is_current


def extract_experience(section: str) -> list[dict]:
    lines   = [l.strip() for l in section.splitlines() if l.strip()]
    entries: list[dict] = []
    current: Optional[dict] = None

    for line in lines:
        if DATE_RE.search(line):
            if current:
                entries.append(current)
            company, title, start, end, is_current = _parse_experience_header(line)
            current = {
                "company":     company,
                "title":       title,
                "startDate":   start,
                "endDate":     end,
                "current":     is_current,
                "description": "",
                "skills":      [],
            }
        elif current and not current["company"]:
            current["company"] = line
        elif current:
            current["description"] += (" " if current["description"] else "") + line

    if current:
        entries.append(current)

    return entries[:10]

_DEGREE_RE = re.compile(
    r"\b("
    r"PhD|Ph\.D\.?|Doctorate|"
    r"M\.?Tech|M\.?Sc|M\.?E\.?|M\.?S\.?|MBA|MA|"
    r"Master(?:'s)?(?:\s+of\s+[A-Za-z]+)?|"
    r"B\.?Tech|B\.?Sc|B\.?E\.?|B\.?S\.?|BA|"
    r"Bachelor(?:'s)?(?:\s+of\s+[A-Za-z]+)?|"
    r"Associate(?:'s)?|Diploma"
    r")\b",
    re.IGNORECASE,
)

_INSTITUTION_KEYWORDS = (
    "university", "college", "institute", "school", "academy", "polytechnic",
)


def _parse_education_line(line: str) -> tuple[str, str, str]:
    """
    Parse a single education line into (degree, field, institution).
    Examples handled:
      "BS Computer Science, UC Berkeley (2015 - 2019)"
      "Bachelor of Science in CS, MIT"
      "UC Berkeley — BS Computer Science"
      "Stanford University"
    """
    # Strip trailing parenthetical (years/GPA)
    cleaned = re.sub(r"\s*\([^\)]*\)\s*$", "", line).strip()

    degree_match = _DEGREE_RE.search(cleaned)
    degree = degree_match.group(1).strip() if degree_match else ""

    # Remove the degree from the line so we can split the rest into field + institution.
    rest = (cleaned[:degree_match.start()] + cleaned[degree_match.end():]).strip() if degree_match else cleaned
    rest = re.sub(r"^\s*(?:in|of)\s+", "", rest, flags=re.IGNORECASE).strip()
    rest = rest.strip(" ,—–-")

    # If rest contains a comma, left side is field, right is institution.
    field, institution = "", rest
    if "," in rest:
        a, b = (p.strip() for p in rest.split(",", 1))
        # The piece with the institution keyword is the institution.
        if any(k in b.lower() for k in _INSTITUTION_KEYWORDS):
            field, institution = a, b
        elif any(k in a.lower() for k in _INSTITUTION_KEYWORDS):
            institution, field = a, b
        else:
            field, institution = a, b
    elif " — " in rest or " – " in rest:
        a, b = re.split(r"\s+[—–]\s+", rest, maxsplit=1)
        a, b = a.strip(), b.strip()
        if any(k in a.lower() for k in _INSTITUTION_KEYWORDS):
            institution, field = a, b
        else:
            field, institution = a, b

    return degree, field, institution


def extract_education(section: str) -> list[dict]:
    lines   = [l.strip() for l in section.splitlines() if l.strip()]
    entries: list[dict] = []

    for line in lines:
        lower = line.lower()
        years = YEAR_RE.findall(line)
        gpa_m = GPA_RE.search(line)
        if not (years or _DEGREE_RE.search(line) or any(kw in lower for kw in _INSTITUTION_KEYWORDS)):
            continue

        degree, field, institution = _parse_education_line(line)
        entries.append({
            "institution": institution or line,
            "degree":      degree,
            "field":       field,
            "startYear":   int(years[0]) if years else 0,
            "endYear":     int(years[1]) if len(years) > 1 else None,
            "gpa":         float(gpa_m.group(1)) if gpa_m else None,
        })

    return entries[:5]

def extract_projects(section: str) -> list[dict]:
    lines   = [l.strip() for l in section.splitlines() if l.strip()]
    projects: list[dict] = []
    current: Optional[dict] = None

    for line in lines:
        url_m = re.search(r"https?://\S+", line)
        if url_m or (current and not current.get("description")):
            if current and current.get("name"):
                projects.append(current)
            current = {
                "name":        line if not url_m else (current or {}).get("name", ""),
                "description": "",
                "url":         url_m.group(0) if url_m else None,
                "skills":      [],
            }
        elif current:
            if not current["name"]:
                current["name"] = line
            else:
                current["description"] += (" " if current["description"] else "") + line
        else:
            current = {"name": line, "description": "", "url": None, "skills": []}

    if current and current.get("name"):
        projects.append(current)

    return projects[:10]

def extract_certifications(section: str) -> list[str]:
    return [l.strip() for l in section.splitlines() if l.strip()][:10]

# ── Main entrypoint ───────────────────────────────────────────────────────────

async def parse_resume(file_url: str, file_type: str) -> dict:
    logger.info(f"Parsing resume: type={file_type} url={file_url}")

    content = await download_file(file_url)

    if file_type == "pdf":
        text = extract_text_pdf(content)
    elif file_type == "docx":
        text = extract_text_docx(content)
    else:
        raise ValueError(f"Unsupported file type: {file_type}")

    sections = split_sections(text)

    # Resolve section aliases
    def sec(*keys: str) -> str:
        for k in keys:
            if k in sections:
                return sections[k]
        return ""

    parsed = {
        "skills":          extract_skills(text),
        "experience":      extract_experience(
                               sec("experience", "work experience",
                                   "professional experience", "employment history")
                           ),
        "education":       extract_education(sec("education", "academic background")),
        "projects":        extract_projects(sec("projects", "personal projects", "open source")),
        "certifications":  extract_certifications(sec("certifications", "licenses")),
        "summary":         sec("summary", "professional summary", "profile", "objective", "about")[:500] or None,
        "email":           extract_email(text),
        "phone":           extract_phone(text),
        "location":        None,
    }

    logger.info(f"Parsed: {len(parsed['skills'])} skills, {len(parsed['experience'])} exp, {len(parsed['education'])} edu")
    return parsed
