import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  getJobMaxAgeDays,
  hasStaleTitleYear,
  isActiveJob,
  isActiveJobPayload,
} from "../utils/jobFreshness";

describe("jobFreshness", () => {
  const NOW = new Date("2026-06-24T12:00:00Z");

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
    process.env.JOB_MAX_AGE_DAYS = "90";
    process.env.JOB_STALE_TITLE_REJECT = "true";
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('test_stale_title_rejected("Developer Internship 2023") -> false', () => {
    const postedAt = new Date(NOW.getTime() - 120 * 86_400_000);
    expect(hasStaleTitleYear("Developer Internship 2023", postedAt)).toBe(true);
    expect(isActiveJob({ title: "Developer Internship 2023", postedAt, expiresAt: null })).toBe(false);
  });

  it("test_expired_job_rejected(expires_at=yesterday) -> false", () => {
    const postedAt = new Date(NOW.getTime() - 10 * 86_400_000);
    const expiresAt = new Date(NOW.getTime() - 1 * 86_400_000);
    expect(isActiveJob({ title: "Backend Intern", postedAt, expiresAt })).toBe(false);
  });

  it("test_recent_job_accepted(posted_at=today) -> true", () => {
    expect(
      isActiveJob({ title: "Backend Intern", postedAt: NOW, expiresAt: null }),
    ).toBe(true);
  });

  it("rejects scrape payloads without posted_at", () => {
    expect(
      isActiveJobPayload({ title: "Backend Intern", posted_at: null }),
    ).toBe(false);
  });

  it("defaults max age to 90 days", () => {
    delete process.env.JOB_MAX_AGE_DAYS;
    expect(getJobMaxAgeDays()).toBe(90);
  });
});
