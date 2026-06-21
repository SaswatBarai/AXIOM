#!/usr/bin/env bash
set -e

echo "=== AXIOM E2E FLOW TEST ==="

# Define endpoints
API_URL="http://localhost:4000/api"

# Generate a unique email
EMAIL="e2e_$(date +%s)@example.com"
PASSWORD="Password123!"
NAME="E2E Test User"

echo "Using Email: $EMAIL"
echo "Using Password: $PASSWORD"

# Step 1: Register User
echo -e "\n[Step 1] Registering User..."
REG_RESP=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"$NAME\",\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

REG_STATUS=$(echo "$REG_RESP" | tail -n 1)
REG_BODY=$(echo "$REG_RESP" | head -n -1)

echo "Status: $REG_STATUS"
echo "Body: $REG_BODY"

if [ "$REG_STATUS" -ne 201 ]; then
  echo "Registration failed!"
  exit 1
fi

# Step 2: Fetch OTP from Redis
echo -e "\n[Step 2] Fetching OTP from Redis..."
OTP=$(docker exec -i axiom-redis redis-cli get "auth:otp:$EMAIL" || true)
OTP=$(echo "$OTP" | tr -d '\r\n')

if [ -z "$OTP" ]; then
  echo "Failed to retrieve OTP from Redis. Checking docker exec error..."
  exit 1
fi
echo "Retrieved OTP: $OTP"

# Step 3: Verify Email
echo -e "\n[Step 3] Verifying Email..."
VER_RESP=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/auth/verify-email" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"otp\":\"$OTP\"}")

VER_STATUS=$(echo "$VER_RESP" | tail -n 1)
VER_BODY=$(echo "$VER_RESP" | head -n -1)

echo "Status: $VER_STATUS"
echo "Body: $VER_BODY"

if [ "$VER_STATUS" -ne 200 ]; then
  echo "Email verification failed!"
  exit 1
fi

# Step 4: Login User
echo -e "\n[Step 4] Logging in..."
LOGIN_RESP=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

LOGIN_STATUS=$(echo "$LOGIN_RESP" | tail -n 1)
LOGIN_BODY=$(echo "$LOGIN_RESP" | head -n -1)

echo "Status: $LOGIN_STATUS"

if [ "$LOGIN_STATUS" -ne 200 ]; then
  echo "Login failed!"
  exit 1
fi

# Parse access token using node (since jq might not be installed)
ACCESS_TOKEN=$(node -e "console.log(JSON.parse(process.argv[1]).accessToken)" "$LOGIN_BODY")
echo "Access Token acquired: ${ACCESS_TOKEN:0:20}..."

# Step 5: Upload Resume
echo -e "\n[Step 5] Uploading Resume..."
echo "This is some dummy resume text for E2E testing of Node and Python backend." > dummy_resume.txt

UPLOAD_RESP=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/resumes" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -F "resume=@dummy_resume.txt;type=application/pdf;filename=resume.pdf")

UPLOAD_STATUS=$(echo "$UPLOAD_RESP" | tail -n 1)
UPLOAD_BODY=$(echo "$UPLOAD_RESP" | head -n -1)

echo "Status: $UPLOAD_STATUS"
echo "Body: $UPLOAD_BODY"

# Clean up local dummy file
rm dummy_resume.txt

if [ "$UPLOAD_STATUS" -ne 201 ]; then
  echo "Resume upload failed!"
  exit 1
fi

# Step 6: Log in as Admin to Scrape some Jobs
echo -e "\n[Step 6] Logging in as Admin to seed jobs..."
ADMIN_RESP=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@axiom.dev\",\"password\":\"Admin@123\"}")

ADMIN_STATUS=$(echo "$ADMIN_RESP" | tail -n 1)
ADMIN_BODY=$(echo "$ADMIN_RESP" | head -n -1)

if [ "$ADMIN_STATUS" -ne 200 ]; then
  echo "Admin login failed! Make sure seed script was run."
  exit 1
fi

ADMIN_TOKEN=$(node -e "console.log(JSON.parse(process.argv[1]).accessToken)" "$ADMIN_BODY")

echo "Admin Token acquired. Triggering scraper..."
SCRAPE_RESP=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/jobs/scrape" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"source\":\"internshala\",\"query\":\"software engineer\",\"maxPages\":1,\"maxJobs\":5}")

SCRAPE_STATUS=$(echo "$SCRAPE_RESP" | tail -n 1)
SCRAPE_BODY=$(echo "$SCRAPE_RESP" | head -n -1)

echo "Scrape Status: $SCRAPE_STATUS"
echo "Scrape Body: $SCRAPE_BODY"

# Step 7: Search Jobs
echo -e "\n[Step 7] Searching Jobs..."
SEARCH_RESP=$(curl -s -w "\n%{http_code}" -X GET "$API_URL/jobs?q=software&page=1&pageSize=5" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

SEARCH_STATUS=$(echo "$SEARCH_RESP" | tail -n 1)
SEARCH_BODY=$(echo "$SEARCH_RESP" | head -n -1)

echo "Search Status: $SEARCH_STATUS"
echo "Search Body: $SEARCH_BODY"

if [ "$SEARCH_STATUS" -ne 200 ]; then
  echo "Job search failed!"
  exit 1
fi

# Step 8: Test Job Recommendations
echo -e "\n[Step 8] Fetching Recommended Jobs..."
REC_RESP=$(curl -s -w "\n%{http_code}" -X GET "$API_URL/jobs/recommended?limit=2" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

REC_STATUS=$(echo "$REC_RESP" | tail -n 1)
REC_BODY=$(echo "$REC_RESP" | head -n -1)

echo "Recommended Status: $REC_STATUS"
echo "Recommended Body: $REC_BODY"

if [ "$REC_STATUS" -ne 200 ]; then
  echo "Recommended jobs fetching failed!"
  exit 1
fi

# Extract first job ID from search results
JOB_ID=$(node -e "const body = JSON.parse(process.argv[1]); console.log(body.jobs && body.jobs.length > 0 ? body.jobs[0].id : '')" "$SEARCH_BODY")

if [ -n "$JOB_ID" ]; then
  # Step 9: Test Match Single Job
  echo -e "\n[Step 9] Matching Single Job ($JOB_ID)..."
  MATCH_RESP=$(curl -s -w "\n%{http_code}" -X GET "$API_URL/jobs/$JOB_ID/match" \
    -H "Authorization: Bearer $ACCESS_TOKEN")

  MATCH_STATUS=$(echo "$MATCH_RESP" | tail -n 1)
  MATCH_BODY=$(echo "$MATCH_RESP" | head -n -1)

  echo "Match Status: $MATCH_STATUS"
  echo "Match Body: $MATCH_BODY"

  if [ "$MATCH_STATUS" -ne 200 ]; then
    echo "Match single job failed!"
    exit 1
  fi
  
  # Step 10: Search Jobs sorted by Match Score
  echo -e "\n[Step 10] Searching Jobs Sorted by Match..."
  SORT_RESP=$(curl -s -w "\n%{http_code}" -X GET "$API_URL/jobs?q=software&sortBy=match&page=1&pageSize=5" \
    -H "Authorization: Bearer $ACCESS_TOKEN")

  SORT_STATUS=$(echo "$SORT_RESP" | tail -n 1)
  SORT_BODY=$(echo "$SORT_RESP" | head -n -1)

  echo "Sort Match Status: $SORT_STATUS"
  echo "Sort Match Body: $SORT_BODY"

  if [ "$SORT_STATUS" -ne 200 ]; then
    echo "Sort by match failed!"
    exit 1
  fi
else
  echo "No jobs found, skipping single job match tests."
fi

echo -e "\n=== E2E FLOW COMPLETED SUCCESSFULLY ==="
