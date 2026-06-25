/**
 * Phase 7 ATS-analyze latency benchmark.
 *
 * Hits POST /api/resumes/:id/analyze N times (default 100, sequential to measure
 * single-request latency, not throughput) and reports p50 / p95 / p99 / max.
 *
 * Prerequisites:
 *   - API + AI + Postgres + Redis + MinIO running
 *   - A resume already uploaded + parsed
 *   - Access token + resume id passed via env:
 *
 *     ACCESS_TOKEN=... RESUME_ID=... pnpm tsx scripts/bench-ats.ts [--n=100]
 */
import axios from "axios";

const API_URL = process.env.API_URL ?? "http://localhost:4000";
const TOKEN = process.env.ACCESS_TOKEN;
const RESUME_ID = process.env.RESUME_ID;
const N = Number(process.argv.find((a) => a.startsWith("--n="))?.slice(4) ?? 100);

const JD = `We are hiring a Senior Backend Engineer with strong Python and FastAPI experience
to build production-grade APIs. Must have PostgreSQL, Redis, Kafka, and AWS experience.
Bonus: Docker, Kubernetes, and distributed systems background.`;

function quantile(sorted: number[], q: number): number {
  const pos = (sorted.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  const lo = sorted[base] ?? 0;
  const hi = sorted[base + 1] ?? lo;
  return lo + rest * (hi - lo);
}

async function main() {
  if (!TOKEN || !RESUME_ID) {
    console.error("Set ACCESS_TOKEN and RESUME_ID env vars.");
    process.exit(1);
  }

  const client = axios.create({
    baseURL: API_URL,
    headers: { Authorization: `Bearer ${TOKEN}` },
    timeout: 30_000,
  });

  // Warm-up — JIT, Prisma client, AI httpx pool
  for (let i = 0; i < 5; i++) {
    await client.post(`/api/resumes/${RESUME_ID}/analyze`, { jobDescription: JD });
  }

  console.log(`Running ${N} sequential ATS analyses → ${API_URL}…`);
  const samples: number[] = [];
  const start = Date.now();
  for (let i = 0; i < N; i++) {
    const t = performance.now();
    const res = await client.post(`/api/resumes/${RESUME_ID}/analyze`, { jobDescription: JD });
    samples.push(performance.now() - t);
    if (res.status !== 200) {
      console.error(`req ${i}: status ${res.status}`);
    }
  }
  const wall = (Date.now() - start) / 1000;

  samples.sort((a, b) => a - b);
  const fmt = (n: number) => `${n.toFixed(1).padStart(7)} ms`;
  console.log("");
  console.log(`Wall time:     ${wall.toFixed(2)} s  (${(N / wall).toFixed(1)} req/s sequential)`);
  console.log(`Samples:       ${samples.length}`);
  console.log(`min:          ${fmt(samples[0]!)}`);
  console.log(`p50 (median): ${fmt(quantile(samples, 0.5))}`);
  console.log(`p90:          ${fmt(quantile(samples, 0.9))}`);
  console.log(`p95:          ${fmt(quantile(samples, 0.95))}`);
  console.log(`p99:          ${fmt(quantile(samples, 0.99))}`);
  console.log(`max:          ${fmt(samples[samples.length - 1]!)}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
