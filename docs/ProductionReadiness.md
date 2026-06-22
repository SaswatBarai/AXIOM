What's Blocking 🔴
1. Deprecated Google AI SDK — Will Break in Production
The AI service uses google.generativeai which printed this during the test run:


All support for the `google.generativeai` package has ended.
It will no longer be receiving updates or bug fixes.
Please switch to the `google.genai` package as soon as possible.
This is the package powering roadmap generation, cover letters, and the chatbot. It works today but has no bug fixes or security patches going forward. One Google-side change could silently break all AI features.

Fix: Migrate apps/ai/services/ from import google.generativeai as genai → import google.genai as genai. The new API has a different client interface.

2. Zero Tests on the Node.js API

No test directory found  (apps/api/src/tests)
Python has 184 tests. The Express API — which handles auth, resume upload, job search, applications, payments — has zero tests. Every API endpoint is completely untested. A regression in auth or resume upload would be invisible until a user reports it.

3. No Infrastructure Provisioned
Resource	Status
PostgreSQL + pgvector	❌ Not provisioned
Redis	❌ Not provisioned
S3 bucket axiom-resumes	❌ Not created
Resend email domain verified	❌ Not set up
Railway / Vercel project	❌ Not deployed
No actual services exist to connect to yet.

Honest Assessment

Code completeness:     ████████████░░  ~87%
Test coverage:         ████░░░░░░░░░░  ~30% (Python only, API zero)
Infrastructure:        ░░░░░░░░░░░░░░  0% (nothing provisioned)
Production-readiness:  ██████░░░░░░░░  ~45%
What would get you to prod in the shortest path:

Fix the deprecated SDK (1–2 hours) — migrate to google.genai
Provision infra (1 day) — Supabase + Upstash + S3 + Resend + Railway + Vercel
At minimum, test the auth service (half day) — the rest can be tested post-launch iteratively