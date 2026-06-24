"use client";

import { useState, useEffect } from "react";
import { Search, Heart, MapPin, Building2, ExternalLink, Loader2, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useJobs, type JobFilters } from "@/hooks/useJobs";
import { useApplications } from "@/hooks/useApplications";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import { api } from "@/lib/api";

const SOURCES = [
  { value: undefined,    label: "All sources" },
  { value: "internshala",label: "Internshala" },
  { value: "unstop",     label: "Unstop"      },
  { value: "naukri",     label: "Naukri"      },
 ] as const;

const JOB_TYPES = [
  { value: undefined,         label: "All types" },
  { value: "FULL_TIME",       label: "Full-time" },
  { value: "INTERNSHIP",      label: "Internship" },
  { value: "PART_TIME",       label: "Part-time" },
  { value: "CONTRACT",        label: "Contract" },
] as const;

const EXPERIENCE = [
  { value: undefined,    label: "Any level" },
  { value: "ENTRY",      label: "Entry" },
  { value: "MID",        label: "Mid" },
  { value: "SENIOR",     label: "Senior" },
  { value: "LEAD",       label: "Lead" },
] as const;

function FilterPill({
  active,
  label,
  onClick,
}: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
        active
          ? "bg-brand text-black border-brand"
          : "bg-bg-card text-text-secondary border-border-subtle hover:border-border-medium hover:text-text-primary"
      }`}
    >
      {label}
    </button>
  );
}

function MatchBadge({ score }: { score?: number | null }) {
  if (score == null) return null;
  let color = "bg-bg-elevated text-text-secondary border-border-subtle";
  if (score >= 90) color = "bg-emerald-500/10 text-emerald-500 border-emerald-500/30";
  else if (score >= 75) color = "bg-amber-500/10 text-amber-500 border-amber-500/30";
  return (
    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border uppercase tracking-wider ${color}`}>
      {score}% Match
    </span>
  );
}

export default function JobsPage() {
  const { jobs, savedJobIds, total, isLoading, error, filters, search, toggleSave, discoveryStatus } = useJobs();
  const [isDiscovering, setIsDiscovering] = useState(false);
  const activeResumeId = useSelector((s: RootState) => s.resume.activeResumeId);
  const resumes = useSelector((s: RootState) => s.resume.resumes);
  const activeResumeName = activeResumeId
    ? resumes.find((r) => r.id === activeResumeId)?.fileName ?? null
    : null;

  async function runDiscovery() {
    if (!activeResumeId) return;
    setIsDiscovering(true);
    try {
      await api.post(`/resumes/${activeResumeId}/discover`);
      await search();
    } catch {
      // ignore
    } finally {
      setIsDiscovering(false);
    }
  }
  const { applications, createApplication, fetchApplications } = useApplications();
  const [q, setQ] = useState("");
  const [trackingLoadingId, setTrackingLoadingId] = useState<string | null>(null);

  useEffect(() => {
    void fetchApplications();
  }, [fetchApplications]);

  async function handleTrackJob(jobId: string) {
    setTrackingLoadingId(jobId);
    try {
      await createApplication(jobId, "SAVED");
    } catch (err: any) {
      alert(err.message || "Failed to track job");
    } finally {
      setTrackingLoadingId(null);
    }
  }

  async function submitSearch() {
    await search({ q, page: 1 });
  }

  async function applyFilter(patch: Partial<JobFilters>) {
    await search({ ...patch, page: 1 });
  }

  function fmtSalary(min?: number | null, max?: number | null, currency?: string) {
    if (!min && !max) return null;
    const sym = currency === "INR" ? "₹" : "$";
    const fmt = (n: number) => (n >= 1_00_000 ? `${(n / 1_00_000).toFixed(1)}L` : n.toLocaleString());
    if (min && max && min !== max) return `${sym}${fmt(min)} – ${sym}${fmt(max)}`;
    return `${sym}${fmt((min ?? max) as number)}`;
  }

  return (
    <div className="px-4 sm:px-6 py-6 sm:py-8 max-w-6xl mx-auto bg-bg-base min-h-full">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-6 sm:mb-8">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight">Jobs</h1>
          <p className="text-sm text-text-secondary mt-1">
            Search across Internshala, Unstop, and Naukri.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          <span className="text-xs text-text-muted">{total.toLocaleString()} jobs</span>
          <select
            value={filters.sortBy || "match"}
            onChange={(e) => applyFilter({ sortBy: e.target.value as "date" | "match" })}
            className="bg-bg-card border border-border-subtle rounded px-2.5 py-1 text-xs text-text-secondary focus:outline-none focus:border-border-medium font-medium cursor-pointer"
          >
            <option value="match">Sort by Match</option>
            <option value="date">Sort by Date</option>
          </select>
          <button
            onClick={runDiscovery}
            disabled={isDiscovering}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-bg-card border border-border-subtle text-xs text-text-secondary hover:border-border-medium hover:text-text-primary transition-colors disabled:opacity-50 cursor-pointer"
            title="Re-scan all jobs against active resume"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isDiscovering ? "animate-spin" : ""}`} />
            {isDiscovering ? "Scanning…" : "Refresh"}
          </button>
        </div>
      </div>

      {/* Discovery status banner — shown atop existing jobs, never erases them */}
      {(discoveryStatus === "PENDING" || discoveryStatus === "SCRAPING") && (
        <div className="mb-4 px-4 py-3 rounded-lg border border-amber-500/30 bg-amber-500/10 flex items-center gap-2 text-sm text-amber-500">
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
          {discoveryStatus === "PENDING"
            ? `Generating recommendations for "${activeResumeName ?? "your resume"}" — showing previous results.`
            : `AI job matching in progress for "${activeResumeName ?? "your resume"}" — recommendations will appear once complete.`}
        </div>
      )}
      {discoveryStatus === "FAILED" && (
        <div className="mb-4 px-4 py-3 rounded-lg border border-red-500/30 bg-red-500/10 text-sm text-red-500">
          <div className="flex items-center gap-2">
            <span>Unable to generate recommendations for "{activeResumeName ?? "your resume"}". {jobs.length > 0 ? "Showing previous results." : "Try refreshing to retry."}</span>
            <button
              onClick={() => runDiscovery()}
              className="ml-auto px-3 py-1 rounded-lg border border-red-500/40 text-xs font-medium hover:bg-red-500/10 transition-colors cursor-pointer shrink-0"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Search row */}
      <div className="flex gap-2 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
          <Input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submitSearch()}
            placeholder="Search by title, company, or description…"
            className="pl-10 h-11 bg-bg-card border-border-subtle text-text-primary placeholder:text-text-muted focus:ring-1 focus:ring-brand/20 focus:border-border-medium"
          />
        </div>
        <Button
          onClick={submitSearch}
          className="bg-brand text-black hover:bg-brand-hover h-11 px-5 font-medium cursor-pointer"
        >
          Search
        </Button>
      </div>

      {/* Filter chips */}
      <div className="space-y-2.5 mb-6">
        <div className="flex flex-wrap gap-1.5">
          {SOURCES.map((opt) => (
            <FilterPill
              key={opt.label}
              active={filters.source === opt.value}
              label={opt.label}
              onClick={() => applyFilter({ source: opt.value })}
            />
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {JOB_TYPES.map((opt) => (
            <FilterPill
              key={opt.label}
              active={filters.jobType === opt.value}
              label={opt.label}
              onClick={() => applyFilter({ jobType: opt.value })}
            />
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {EXPERIENCE.map((opt) => (
            <FilterPill
              key={opt.label}
              active={filters.experienceLevel === opt.value}
              label={opt.label}
              onClick={() => applyFilter({ experienceLevel: opt.value })}
            />
          ))}
          <FilterPill
            active={filters.remote === true}
            label="Remote only"
            onClick={() => applyFilter({ remote: filters.remote === true ? undefined : true })}
          />
        </div>
      </div>

      {/* Results */}
      {error && (
        <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-500">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-16 text-text-secondary">
          <Loader2 className="w-5 h-5 animate-spin mr-2" />
          Loading jobs…
        </div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-16 text-text-secondary text-sm">
          No jobs match your filters. Try broadening your search.
        </div>
      ) : (
        <ul className="space-y-2.5">
          {jobs.map((job) => {
            const saved = savedJobIds.includes(job.id);
            const isTracked = applications.some((app) => app.jobId === job.id);
            const salary = fmtSalary(job.salaryMin ?? null, job.salaryMax ?? null, job.currency ?? "INR");
            return (
              <li
                key={job.id}
                className="group rounded-xl border border-border-subtle bg-bg-card/40 hover:bg-bg-hover/20 hover:border-border-medium transition-colors p-5 animate-none"
              >
                <div className="flex items-start gap-4">
                  {/* Logo */}
                  <div className="shrink-0 w-11 h-11 rounded-lg bg-bg-elevated border border-border-subtle flex items-center justify-center text-sm font-semibold text-text-secondary overflow-hidden">
                    {job.companyLogoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={job.companyLogoUrl}
                        alt={job.company}
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                      />
                    ) : (
                      job.company.charAt(0)
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-semibold text-text-primary truncate">{job.title}</h3>
                          <MatchBadge score={(job as any).matchScore} />
                        </div>
                        <div className="flex items-center flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-text-secondary">
                          <span className="flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5" /> {job.company}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5" /> {job.location}
                          </span>
                          {job.remote && (
                            <span className="text-emerald-500">Remote</span>
                          )}
                          <span className="uppercase tracking-wide text-[10px] text-text-muted">
                            {job.source}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => toggleSave(job.id)}
                          aria-label={saved ? "Unsave" : "Save"}
                          className={`p-2 rounded-lg transition-colors cursor-pointer ${
                            saved
                              ? "text-pink-500 hover:bg-bg-hover"
                              : "text-text-muted hover:text-pink-500 hover:bg-bg-hover"
                          }`}
                        >
                          <Heart className={`w-4 h-4 ${saved ? "fill-current" : ""}`} />
                        </button>
                        
                        {/* Track button */}
                        <Button
                          disabled={isTracked || trackingLoadingId === job.id}
                          onClick={() => handleTrackJob(job.id)}
                          className={`text-xs font-medium px-3 py-1.5 h-auto transition-colors cursor-pointer ${
                            isTracked
                              ? "bg-bg-elevated text-text-muted hover:bg-bg-elevated border-border-subtle cursor-not-allowed"
                              : "bg-brand text-black hover:bg-brand-hover"
                          }`}
                        >
                          {trackingLoadingId === job.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : isTracked ? (
                            "Tracked"
                          ) : (
                            "Track"
                          )}
                        </Button>

                        <a
                          href={job.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-medium px-3 py-1.5 rounded-lg bg-bg-elevated text-text-primary border border-border-subtle hover:bg-bg-hover transition-colors flex items-center gap-1"
                        >
                          View <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>

                    <p className="mt-2 text-sm text-text-secondary line-clamp-2">{job.description}</p>

                    {/* Skill chips */}
                    {job.requiredSkills.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {job.requiredSkills.slice(0, 6).map((s) => (
                          <span
                            key={s}
                            className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded bg-bg-elevated/70 text-text-secondary border border-border-subtle"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Footer */}
                    <div className="mt-3 flex items-center justify-between text-xs text-text-muted">
                      <span>
                        {job.jobType.replace("_", "-").toLowerCase()} · {job.experienceLevel.toLowerCase()}
                      </span>
                      {salary && (
                        <span className="text-text-secondary font-medium">{salary}</span>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
