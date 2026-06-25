#!/usr/bin/env bash
set -euo pipefail

# ──────────────────────────────────────────────────────────────────────────────
# End-to-End Pipeline Test
# ──────────────────────────────────────────────────────────────────────────────
# Tests the complete recommendation pipeline with the actual resume:
#   /home/saswatbarai/Downloads/SASWAT RESUME.pdf
#
# Stages:
#   1. Authentication
#   2. Upload resume
#   3. Poll parsing status
#   4. Activate resume (triggers discovery)
#   5. Poll discovery status
#   6. Fetch recommendations
#   7. Inspect explanations
#   8. Validate relevance
# ──────────────────────────────────────────────────────────────────────────────

API="http://localhost:4000/api"
RESUME_FILE="/home/saswatbarai/Downloads/SASWAT RESUME.pdf"
EMAIL="test-$(date +%s)@example.com"
PASSWORD="TestPass123!"

echo "═══ STAGE 1: Authentication ═══"

# Register a new user
echo "→ Registering user..."
REG_RESP=$(curl -s -X POST "$API/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\",\"name\":\"Test User\"}")
echo "  Response: $REG_RESP" | head -c 200
echo ""

# Login
echo "→ Logging in..."
LOGIN_RESP=$(curl -s -c /tmp/cookies.txt -X POST "$API/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")
ACCESS_TOKEN=$(echo "$LOGIN_RESP" | python3 -c "import sys,json; print(json.load(sys.stdin).get('accessToken',''))" 2>/dev/null || echo "")
if [ -z "$ACCESS_TOKEN" ]; then
  # Try getting from cookies
  ACCESS_TOKEN=$(grep accessToken /tmp/cookies.txt 2>/dev/null | awk '{print $NF}' || echo "")
fi
echo "  Token: ${ACCESS_TOKEN:0:20}..."

if [ -z "$ACCESS_TOKEN" ]; then
  echo "FAILED: No access token received"
  echo "  Login response: $LOGIN_RESP"
  exit 1
fi

AUTH="Authorization: Bearer $ACCESS_TOKEN"

echo ""
echo "═══ STAGE 2: Upload Resume ═══"

echo "→ Uploading $RESUME_FILE..."
UPLOAD_RESP=$(curl -s -X POST "$API/resumes" \
  -H "$AUTH" \
  -F "resume=@$RESUME_FILE")
echo "  Response: $UPLOAD_RESP"
RESUME_ID=$(echo "$UPLOAD_RESP" | python3 -c "import sys,json; print(json.load(sys.stdin)['resume']['id'])" 2>/dev/null || echo "")
echo "  Resume ID: $RESUME_ID"

if [ -z "$RESUME_ID" ]; then
  echo "FAILED: No resume ID received"
  exit 1
fi

echo ""
echo "═══ STAGE 3: Poll Parsing Status ═══"

for i in $(seq 1 20); do
  sleep 2
  PARSE_RESP=$(curl -s "$API/resumes" -H "$AUTH")
  STATUS=$(echo "$PARSE_RESP" | python3 -c "
import sys, json
data = json.load(sys.stdin)
for r in data.get('resumes', []):
    if r['id'] == '$RESUME_ID':
        print(r['status'])
        break
" 2>/dev/null || echo "PENDING")
  echo "  Attempt $i: status = $STATUS"
  if [ "$STATUS" = "COMPLETED" ]; then
    echo "  ✅ Parsing completed!"
    break
  fi
  if [ "$STATUS" = "FAILED" ]; then
    echo "  ❌ Parsing failed!"
    exit 1
  fi
done

echo ""
echo "═══ STAGE 4: Activate Resume ═══"

echo "→ Activating resume $RESUME_ID..."
ACTIVATE_RESP=$(curl -s -X PUT "$API/resumes/$RESUME_ID/activate" -H "$AUTH")
echo "  Response: $ACTIVATE_RESP"
DISCOVERY_STATUS=$(echo "$ACTIVATE_RESP" | python3 -c "import sys,json; print(json.load(sys.stdin).get('discoveryStatus',''))" 2>/dev/null)
echo "  Discovery Status: $DISCOVERY_STATUS"

echo ""
echo "═══ STAGE 5: Poll Discovery Status ═══"

for i in $(seq 1 30); do
  sleep 3
  DISC_RESP=$(curl -s "$API/resumes/$RESUME_ID/discovery" -H "$AUTH")
  STATUS=$(echo "$DISC_RESP" | python3 -c "
import sys, json
data = json.load(sys.stdin)
d = data.get('discovery')
if d: print(d.get('status', 'unknown'))
else: print('not_found')
" 2>/dev/null || echo "error")
  echo "  Attempt $i: discovery status = $STATUS"
  if [ "$STATUS" = "COMPLETED" ]; then
    echo "  ✅ Discovery completed!"
    break
  fi
  if [ "$STATUS" = "FAILED" ]; then
    echo "  Response: $DISC_RESP"
    echo "  ❌ Discovery failed!"
    exit 1
  fi
done

echo ""
echo "═══ STAGE 6: Fetch Recommendations ═══"

echo "→ Fetching recommended jobs..."
REC_JOBS=$(curl -s "$API/jobs/recommended?limit=20" -H "$AUTH")
echo "  Full response length: $(echo "$REC_JOBS" | wc -c) bytes"
echo ""

echo "═══ Recommendations (top 10): ═══"
echo "$REC_JOBS" | python3 -c "
import sys, json
data = json.load(sys.stdin)
if isinstance(data, list):
    jobs = data
elif isinstance(data, dict):
    jobs = data.get('jobs') or data.get('data') or []
else:
    jobs = []
print(f'Total recommendations: {len(jobs)}')
print()
for i, j in enumerate(jobs[:10]):
    title = j.get('title', 'N/A')
    company = j.get('company', 'N/A')
    score = j.get('matchScore', 'N/A')
    matched = j.get('matchedSkills', [])
    missing = j.get('missingSkills', [])
    print(f'{i+1}. [{score}%] {title} @ {company}')
    print(f'   Matched skills: {matched[:5]}')
    print(f'   Missing skills: {missing[:5]}')
    print()
" 2>&1

echo ""
echo "═══ STAGE 7: Inspect Explanations ═══"

echo "→ Fetching job search with match sorting..."
SEARCH_RESP=$(curl -s "$API/jobs?sortBy=match&pageSize=5" -H "$AUTH")
echo "$SEARCH_RESP" | python3 -c "
import sys, json
data = json.load(sys.stdin)
jobs = data.get('jobs', [])
print(f'Jobs with discovery status: {data.get(\"discoveryStatus\", \"N/A\")}')
print()
for j in jobs[:5]:
    title = j.get('title', 'N/A')
    company = j.get('company', 'N/A')
    score = j.get('matchScore', 'N/A')
    matched = j.get('matchedSkills', [])[:3]
    missing = j.get('missingSkills', [])[:3]
    print(f'• {title} @ {company} (Match: {score}%)')
    if matched: print(f'  ✅ Fits: {matched}')
    if missing: print(f'  ❌ Gaps: {missing}')
    print()
" 2>&1

echo ""
echo "═══ STAGE 8: Profile Understanding (Direct Python Test) ═══"

echo "→ Running profile analysis on the parsed resume..."
python3 -c "
import sys, json
sys.path.insert(0, 'apps/ai')
from services.recommendation import understand_profile, infer_career_directions, generate_search_intents

# Fetch the parsed resume data from the API
import urllib.request
resp = urllib.request.urlopen('http://localhost:4000/api/resumes/$RESUME_ID')
raw = json.loads(resp.read())
parsed = raw.get('resume', {}).get('parsedData') or {}

print('═══ PROFILE ANALYSIS ═══')
print()

insight = understand_profile(parsed)
print(f'Seniority: {insight.seniority} (confidence: {insight.seniority_confidence:.2f})')
print(f'Domains: {insight.domains}')
print(f'Tech Stack: {insight.tech_stack[:8]}')
print(f'Years of Experience: {insight.years_of_experience:.1f}')
print(f'Leadership: {insight.has_leadership}')
print(f'Career Stage: {insight.career_stage}')
print()

directions = infer_career_directions(parsed, insight)
print('Career Directions:')
for d in directions:
    print(f'  • {d.name} ({d.role_family})')
    print(f'    Confidence: {d.confidence:.2f}')
    print(f'    Rationale: {d.rationale}')
print()

intents = generate_search_intents(directions, insight)
print('Search Intents:')
for q in intents:
    print(f'  • {q}')
print()
print('═══ QUALITY CHECK ═══')
print()
print('Q: Would a human reviewing this resume apply to these opportunities?')
print('A: (Validate manually from the recommendations above)')
" 2>&1

echo ""
echo "═══ DONE ═══"
