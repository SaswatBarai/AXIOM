#!/usr/bin/env bash
set -euo pipefail

API="http://localhost:4000/api"
RESUME_FILE="/home/saswatbarai/Downloads/SASWAT RESUME.pdf"
EMAIL="test-1782308319@example.com"
PASSWORD="TestPass123!"

echo "═══ 1. Login ═══"
LOGIN_RESP=$(curl -s -X POST "$API/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")
ACCESS_TOKEN=$(echo "$LOGIN_RESP" | python3 -c "import sys,json; print(json.load(sys.stdin)['accessToken'])" 2>/dev/null)
AUTH="Authorization: Bearer $ACCESS_TOKEN"
echo "  Token: ${ACCESS_TOKEN:0:20}..."

echo ""
echo "═══ 2. Upload Resume ═══"
UPLOAD_RESP=$(curl -s -X POST "$API/resumes" \
  -H "$AUTH" \
  -F "resume=@$RESUME_FILE")
RESUME_ID=$(echo "$UPLOAD_RESP" | python3 -c "import sys,json; print(json.load(sys.stdin)['resume']['id'])" 2>/dev/null)
echo "  Resume ID: $RESUME_ID"

echo ""
echo "═══ 3. Poll Parsing ═══"
for i in $(seq 1 30); do
  sleep 2
  PARSE_RESP=$(curl -s "$API/resumes" -H "$AUTH")
  STATUS=$(echo "$PARSE_RESP" | python3 -c "
import sys, json
for r in json.load(sys.stdin).get('resumes',[]):
    if r['id']=='$RESUME_ID': print(r['status']); break
" 2>/dev/null || echo "PENDING")
  echo "  [$i] status = $STATUS"
  if [ "$STATUS" = "COMPLETED" ]; then echo "  ✅ Parsed!"; break; fi
  if [ "$STATUS" = "FAILED" ]; then echo "  ❌ Failed"; exit 1; fi
done

echo ""
echo "═══ 4. Activate Resume (triggers discovery) ═══"
curl -s -X PUT "$API/resumes/$RESUME_ID/activate" -H "$AUTH" | python3 -c "import sys,json; print(json.load(sys.stdin))"

echo ""
echo "═══ 5. Poll Discovery ═══"
for i in $(seq 1 30); do
  sleep 3
  DISC_RESP=$(curl -s "$API/resumes/$RESUME_ID/discovery" -H "$AUTH")
  STATUS=$(echo "$DISC_RESP" | python3 -c "
import sys,json
d = json.load(sys.stdin).get('discovery',{})
print(d.get('status','not_found'))
" 2>/dev/null)
  echo "  [$i] discovery = $STATUS"
  if [ "$STATUS" = "COMPLETED" ]; then echo "  ✅ Discovery done!"; break; fi
  if [ "$STATUS" = "FAILED" ]; then echo "  ❌ Failed: $(echo $DISC_RESP | python3 -c 'import sys,json; print(json.load(sys.stdin))')"; exit 1; fi
done

echo ""
echo "═══ 6. Recommended Jobs ═══"
REC_RESP=$(curl -s "$API/jobs/recommended?limit=20" -H "$AUTH")
echo "$REC_RESP" | python3 -c "
import sys, json
data = json.load(sys.stdin)
if isinstance(data, list):
    jobs = data
elif isinstance(data, dict):
    jobs = data.get('jobs') or data.get('data') or []
else:
    jobs = []
print(f'Total: {len(jobs)}')
for i, j in enumerate(jobs[:8]):
    t = j.get('title','?')
    c = j.get('company','?')
    s = j.get('matchScore','?')
    m = j.get('matchedSkills',[])[:3]
    print(f'{i+1}. [{s}%] {t} @ {c}  matched={m}')
"

echo ""
echo "═══ 7. Profile Analysis ═══"
python3 -c "
import sys, json, urllib.request
sys.path.insert(0, 'apps/ai')
from services.recommendation import understand_profile, infer_career_directions

req = urllib.request.Request('http://localhost:4000/api/resumes/$RESUME_ID')
resp = json.loads(urllib.request.urlopen(req).read())
parsed = resp.get('resume',{}).get('parsedData') or {}

print(f'Parsed keys: {list(parsed.keys())}')
if 'skills' in parsed:
    print(f'SKILLS: {parsed[\"skills\"][:10]}')
if 'experience' in parsed:
    exps = parsed['experience']
    print(f'EXPERIENCES: {len(exps)} entries')
    for e in exps[:2]: print(f'  - {e.get(\"title\",\"?\")} @ {e.get(\"company\",\"?\")}')
if 'education' in parsed:
    print(f'EDUCATION: {parsed[\"education\"]}')

insight = understand_profile(parsed)
print(f'')
print(f'Seniority: {insight.seniority} ({insight.seniority_confidence:.2f})')
print(f'Domains: {insight.domains[:5]}')
print(f'Tech Stack: {insight.tech_stack[:8]}')
print(f'Years Exp: {insight.years_of_experience}')
print(f'Career Stage: {insight.career_stage}')
print()
directions = infer_career_directions(parsed, insight)
for d in directions:
    print(f'  Direction: {d.name} ({d.role_family}) conf={d.confidence:.2f}')
    print(f'  Rationale: {d.rationale}')
" 2>&1

echo ""
echo "═══ DONE ═══"
