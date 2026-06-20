"use client";

import { useState } from "react";
import { Search, Heart, MapPin, Building2, ExternalLink, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useJobs, type JobFilters } from "@/hooks/useJobs";

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
      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
        active
          ? "bg-white text-black border-white"
          : "bg-zinc-900 text-zinc-300 border-zinc-800 hover:border-zinc-700 hover:text-white"
      }`}
    >
      {label}
    </button>
  );
}

export default function JobsPage() {
  const { jobs, savedJobIds, total, isLoading, error, filters, search, toggleSave } = useJobs();
  const [q, setQ] = useState("");

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
    <div className="px-6 py-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Jobs</h1>
          <p className="text-sm text-zinc-400 mt-1">
            Search across Internshala, Unstop, and Naukri.
          </p>
        </div>
        <span className="text-xs text-zinc-500">{total.toLocaleString()} jobs</span>
      </div>

      {/* Search row */}
      <div className="flex gap-2 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
          <Input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submitSearch()}
            placeholder="Search by title, company, or description…"
            className="pl-10 h-11 bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500"
          />
        </div>
        <Button
          onClick={submitSearch}
          className="bg-white text-black hover:bg-zinc-200 h-11 px-5 font-medium"
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
        <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-400">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-16 text-zinc-500">
          <Loader2 className="w-5 h-5 animate-spin mr-2" />
          Loading jobs…
        </div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-16 text-zinc-500 text-sm">
          No jobs match your filters. Try broadening your search.
        </div>
      ) : (
        <ul className="space-y-2.5">
          {jobs.map((job) => {
            const saved = savedJobIds.includes(job.id);
            const salary = fmtSalary(job.salaryMin ?? null, job.salaryMax ?? null, job.currency ?? "INR");
            return (
              <li
                key={job.id}
                className="group rounded-xl border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-900 hover:border-zinc-700 transition-colors p-5"
              >
                <div className="flex items-start gap-4">
                  {/* Logo */}
                  <div className="shrink-0 w-11 h-11 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-sm font-semibold text-zinc-300 overflow-hidden">
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
                        <h3 className="text-base font-semibold text-white truncate">{job.title}</h3>
                        <div className="flex items-center flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-zinc-400">
                          <span className="flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5" /> {job.company}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5" /> {job.location}
                          </span>
                          {job.remote && (
                            <span className="text-emerald-400">Remote</span>
                          )}
                          <span className="uppercase tracking-wide text-[10px] text-zinc-500">
                            {job.source}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => toggleSave(job.id)}
                          aria-label={saved ? "Unsave" : "Save"}
                          className={`p-2 rounded-lg transition-colors ${
                            saved
                              ? "text-pink-400 hover:bg-zinc-800"
                              : "text-zinc-500 hover:text-pink-400 hover:bg-zinc-800"
                          }`}
                        >
                          <Heart className={`w-4 h-4 ${saved ? "fill-current" : ""}`} />
                        </button>
                        <a
                          href={job.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-medium px-3 py-1.5 rounded-lg bg-zinc-800 text-white border border-zinc-700 hover:bg-zinc-700 transition-colors flex items-center gap-1"
                        >
                          View <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>

                    <p className="mt-2 text-sm text-zinc-400 line-clamp-2">{job.description}</p>

                    {/* Skill chips */}
                    {job.requiredSkills.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {job.requiredSkills.slice(0, 6).map((s) => (
                          <span
                            key={s}
                            className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded bg-zinc-800/70 text-zinc-400 border border-zinc-800"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Footer */}
                    <div className="mt-3 flex items-center justify-between text-xs text-zinc-500">
                      <span>
                        {job.jobType.replace("_", "-").toLowerCase()} · {job.experienceLevel.toLowerCase()}
                      </span>
                      {salary && (
                        <span className="text-zinc-300 font-medium">{salary}</span>
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
