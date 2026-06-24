"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  FileText,
  Briefcase,
  ClipboardList,
  ArrowRight,
  Sparkles,
  ExternalLink,
  ChevronRight,
  AlertCircle,
  MapPin,
  Target,
  MessageSquare,
  BarChart3,
  type LucideIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/hooks/useAuth";
import { useResume } from "@/hooks/useResume";
import { useJobs, type RecommendedJob } from "@/hooks/useJobs";
import { api } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { DashboardOverviewSkeleton, RecommendedJobsSkeleton } from "@/components/dashboard/DashboardOverviewSkeleton";

const CIRC = 2 * Math.PI * 36;

const NAV_LINKS = [
  { href: "/dashboard/jobs", label: "Jobs", icon: Briefcase },
  { href: "/dashboard/applications", label: "Applications", icon: ClipboardList },
  { href: "/dashboard/copilot", label: "Copilot", icon: Sparkles },
  { href: "/dashboard/interview", label: "Interview", icon: MessageSquare },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
] as const;

const PIPELINE = [
  { key: "SAVED" as const, label: "Saved", tone: "text-blue-400", surface: "bg-blue-500/10 border-blue-500/20" },
  { key: "APPLIED" as const, label: "Applied", tone: "text-indigo-400", surface: "bg-indigo-500/10 border-indigo-500/20" },
  { key: "INTERVIEW" as const, label: "Interview", tone: "text-amber-400", surface: "bg-amber-500/10 border-amber-500/20" },
  { key: "OFFER" as const, label: "Offer", tone: "text-emerald-400", surface: "bg-emerald-500/10 border-emerald-500/20" },
];

// ── Primitives ────────────────────────────────────────────────────────────────

function PageBackground() {
  return (
    <>
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(var(--grid-dot-color) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
          maskImage: "radial-gradient(ellipse 85% 45% at 50% 0%, #000 50%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse 85% 45% at 50% 0%, #000 50%, transparent 100%)",
        }}
      />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[520px] h-[200px] bg-brand/[0.06] rounded-full blur-[100px] pointer-events-none" />
    </>
  );
}

function MatchRing({ score, size = "md" }: { score: number; size?: "sm" | "md" | "lg" }) {
  const dim = size === "lg" ? "w-20 h-20" : size === "md" ? "w-14 h-14" : "w-11 h-11";
  const text = size === "lg" ? "text-lg" : size === "md" ? "text-sm" : "text-xs";

  return (
    <div className={cn("relative shrink-0", dim)}>
      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
        <circle cx="50" cy="50" r="36" fill="none" stroke="var(--bg-elevated)" strokeWidth="7" />
        <circle
          cx="50"
          cy="50"
          r="36"
          fill="none"
          stroke="#f97316"
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={CIRC}
          strokeDashoffset={CIRC * (1 - score / 100)}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={cn("font-bold text-text-primary tabular-nums", text)}>{score}%</span>
      </div>
    </div>
  );
}

function Metric({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="px-4 sm:px-6 py-4 text-center sm:text-left min-w-0">
      <p className="text-2xl sm:text-3xl font-extrabold text-text-primary tabular-nums tracking-tight">{value}</p>
      <p className="text-xs font-medium text-text-secondary mt-0.5">{label}</p>
      {hint && <p className="text-[11px] text-text-muted mt-0.5 truncate">{hint}</p>}
    </div>
  );
}

// ── Job cards ─────────────────────────────────────────────────────────────────

function FeaturedJobCard({ job }: { job: RecommendedJob }) {
  return (
    <Card className="border border-border-subtle bg-bg-card/50 backdrop-blur-md rounded-2xl overflow-hidden shadow-lg group hover:border-border-medium transition-colors duration-300">
      <div className="p-5 sm:p-6 flex flex-col sm:flex-row gap-5 sm:gap-6">
        <MatchRing score={job.matchScore} size="lg" />
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <Badge variant="outline" className="text-[10px] border-border-subtle bg-bg-base/60 text-text-muted uppercase tracking-wide">
              Top match
            </Badge>
            <span className="text-[11px] text-text-muted font-medium">{job.source}</span>
          </div>
          <h3 className="text-lg font-bold text-text-primary leading-snug">{job.title}</h3>
          <p className="text-sm text-text-secondary mt-0.5">{job.company}</p>
          {job.location && (
            <p className="text-xs text-text-muted mt-2 flex items-center gap-1">
              <MapPin size={12} />
              {job.location}
            </p>
          )}
          {job.matchedSkills && job.matchedSkills.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {job.matchedSkills.slice(0, 4).map((skill) => (
                <span
                  key={skill}
                  className="text-[11px] font-medium text-text-secondary bg-bg-elevated border border-border-subtle px-2 py-0.5 rounded-md"
                >
                  {skill}
                </span>
              ))}
            </div>
          )}
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <a
              href={job.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand text-black text-sm font-semibold rounded-xl hover:bg-brand-hover transition-colors"
            >
              View role
              <ExternalLink size={14} />
            </a>
            <Link
              href="/dashboard/jobs"
              className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
            >
              See all matches
            </Link>
          </div>
        </div>
      </div>
    </Card>
  );
}

function JobCard({ job }: { job: RecommendedJob }) {
  return (
    <Card className="border border-border-subtle bg-bg-card/40 backdrop-blur-sm rounded-xl p-4 h-full flex flex-col hover:border-border-medium transition-colors duration-200">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-text-primary truncate">{job.title}</h3>
          <p className="text-xs text-text-secondary truncate">{job.company}</p>
        </div>
        <MatchRing score={job.matchScore} size="sm" />
      </div>
      {job.matchedSkills && job.matchedSkills.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {job.matchedSkills.slice(0, 2).map((skill) => (
            <span key={skill} className="text-[10px] text-text-muted bg-bg-elevated px-1.5 py-0.5 rounded">
              {skill}
            </span>
          ))}
        </div>
      )}
      <div className="mt-auto pt-3 border-t border-border-subtle/80 flex items-center justify-between">
        <span className="text-[11px] text-text-muted truncate">{job.location}</span>
        <a
          href={job.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[11px] font-semibold text-brand hover:underline flex items-center gap-0.5 shrink-0"
        >
          Open <ExternalLink size={10} />
        </a>
      </div>
    </Card>
  );
}

function NavLink({ href, label, icon: Icon }: { href: string; label: string; icon: LucideIcon }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-text-secondary hover:text-text-primary hover:bg-bg-hover/50 transition-colors group"
    >
      <div className="w-8 h-8 rounded-lg bg-bg-elevated border border-border-subtle flex items-center justify-center group-hover:border-border-medium transition-colors">
        <Icon size={15} className="text-text-muted group-hover:text-brand transition-colors" />
      </div>
      <span className="font-medium flex-1">{label}</span>
      <ChevronRight size={14} className="text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
    </Link>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function DashboardOverviewPage() {
  const { user } = useAuth();
  const { profile, isLoading } = useProfile();
  const { resumes, isLoading: resumeLoading } = useResume();
  const { recommendedJobs, isLoadingRecommended, fetchRecommended } = useJobs();

  const [applications, setApplications] = useState<{ status: string }[]>([]);
  const [appsCount, setAppsCount] = useState(0);
  const [appsLoading, setAppsLoading] = useState(true);
  const [showProfileTasks, setShowProfileTasks] = useState(false);

  useEffect(() => {
    if (resumes.length > 0) void fetchRecommended(6);
  }, [resumes, fetchRecommended]);

  useEffect(() => {
    api
      .get("/applications")
      .then(({ data }) => {
        setApplications(data.applications ?? []);
        setAppsCount(data.applications?.length ?? 0);
      })
      .catch(() => {})
      .finally(() => setAppsLoading(false));
  }, []);

  const completionPct = profile?.profileCompletionPct ?? 0;
  const firstName = user?.name?.split(" ")[0] ?? "there";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const missingFields = useMemo(() => {
    if (!profile) return [];
    const items: string[] = [];
    if (!profile.name) items.push("Display name");
    if (!profile.currentTitle) items.push("Job title");
    if (!profile.bio) items.push("Bio");
    if (!profile.location) items.push("Location");
    if (!profile.linkedinUrl) items.push("LinkedIn");
    return items;
  }, [profile]);

  const maxMatch = useMemo(() => {
    const scores = recommendedJobs.map((j) => j.matchScore).filter((s) => typeof s === "number");
    return scores.length ? Math.max(...scores) : null;
  }, [recommendedJobs]);

  const funnel = useMemo(() => {
    const counts = { SAVED: 0, APPLIED: 0, INTERVIEW: 0, OFFER: 0 };
    applications.forEach((app) => {
      if (app.status === "SAVED") counts.SAVED++;
      else if (app.status === "APPLIED" || app.status === "OA_RECEIVED") counts.APPLIED++;
      else if (app.status === "INTERVIEW_SCHEDULED") counts.INTERVIEW++;
      else if (app.status === "OFFER_RECEIVED") counts.OFFER++;
    });
    return counts;
  }, [applications]);

  const headline = useMemo(() => {
    if (resumes.length === 0) return "Let's get your profile ready.";
    if (recommendedJobs.length > 0) {
      return `${recommendedJobs.length} role${recommendedJobs.length > 1 ? "s" : ""} match your profile today.`;
    }
    if (appsCount > 0) return `${appsCount} application${appsCount > 1 ? "s" : ""} in your pipeline.`;
    return "Your career command center.";
  }, [resumes.length, recommendedJobs.length, appsCount]);

  const primaryCta = useMemo(() => {
    if (resumes.length === 0) {
      return { href: "/dashboard/resume", label: "Upload resume", icon: FileText };
    }
    if (recommendedJobs.length > 0) {
      return { href: "/dashboard/jobs?sortBy=match", label: "Explore matches", icon: Target };
    }
    return { href: "/dashboard/jobs", label: "Find jobs", icon: Briefcase };
  }, [resumes.length, recommendedJobs.length]);

  const [featured, ...restJobs] = recommendedJobs;
  const PrimaryCtaIcon = primaryCta.icon;

  if (isLoading || resumeLoading || appsLoading) {
    return <DashboardOverviewSkeleton />;
  }

  return (
    <div className="relative min-h-full overflow-hidden">
      <PageBackground />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-8 pb-12">
        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <header className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6"
          >
            <div className="min-w-0 flex-1">
              <p className="text-sm text-text-muted font-medium">{greeting}, {firstName}</p>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight mt-1 leading-tight">
                {headline}
              </h1>
              <p className="text-sm text-text-secondary mt-2 max-w-xl leading-relaxed">
                {resumes.length === 0
                  ? "Upload a resume and we'll surface roles that fit your skills — not generic listings."
                  : "Track applications, prep interviews, and let the copilot help you move faster."}
              </p>
              <Link
                href={primaryCta.href}
                className="inline-flex items-center gap-2 mt-5 px-5 py-2.5 bg-brand text-black text-sm font-semibold rounded-xl hover:bg-brand-hover transition-colors shadow-lg shadow-brand/10"
              >
                <PrimaryCtaIcon size={16} />
                {primaryCta.label}
                <ArrowRight size={14} />
              </Link>
            </div>

            {completionPct < 100 && (
              <Card className="shrink-0 w-full lg:w-72 border border-border-subtle bg-bg-card/50 backdrop-blur-md rounded-2xl p-4 shadow-lg">
                <div className="flex items-center gap-4">
                  <MatchRing score={completionPct} size="md" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-text-primary">Profile {completionPct}%</p>
                    <p className="text-xs text-text-muted mt-0.5">Better profiles get sharper matches</p>
                  </div>
                </div>
                {missingFields.length > 0 && (
                  <>
                    <button
                      type="button"
                      onClick={() => setShowProfileTasks((v) => !v)}
                      className="mt-3 text-xs font-medium text-text-secondary hover:text-brand transition-colors"
                    >
                      {showProfileTasks ? "Hide" : "What's missing?"}
                    </button>
                    <AnimatePresence>
                      {showProfileTasks && (
                        <motion.ul
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <li className="pt-2 mt-2 border-t border-border-subtle space-y-1">
                            {missingFields.map((f) => (
                              <span key={f} className="block text-[11px] text-text-muted">· {f}</span>
                            ))}
                            <Link href="/dashboard/settings" className="inline-flex items-center gap-1 text-xs font-semibold text-brand mt-2">
                              Complete profile <ArrowRight size={12} />
                            </Link>
                          </li>
                        </motion.ul>
                      )}
                    </AnimatePresence>
                  </>
                )}
              </Card>
            )}
          </motion.div>
        </header>

        {/* ── Metrics strip ────────────────────────────────────────────── */}
        <Card className="mb-8 border border-border-subtle bg-bg-card/40 backdrop-blur-md rounded-2xl overflow-hidden shadow-lg">
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-border-subtle/80">
            <Metric
              label="Resumes"
              value={resumes.length}
              hint={resumes.length ? "Active on profile" : "None uploaded"}
            />
            <Metric
              label="Applications"
              value={appsCount}
              hint={appsCount ? "In pipeline" : "None yet"}
            />
            <Metric
              label="Best match"
              value={maxMatch !== null ? `${maxMatch}%` : "—"}
              hint={resumes.length ? "Highest score" : "Needs resume"}
            />
            <Metric
              label="Profile"
              value={`${completionPct}%`}
              hint={completionPct === 100 ? "Complete" : "Room to improve"}
            />
          </div>
        </Card>

        {/* ── Main grid ────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_280px] gap-8">
          {/* Left: recommendations */}
          <section className="min-w-0 space-y-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-text-primary">Recommended for you</h2>
                <p className="text-xs text-text-muted mt-0.5">Ranked by skill overlap with your resume</p>
              </div>
              {resumes.length > 0 && (
                <Link
                  href="/dashboard/jobs?sortBy=match"
                  className="text-xs font-semibold text-brand hover:text-brand-hover flex items-center gap-1 shrink-0"
                >
                  All jobs <ArrowRight size={12} />
                </Link>
              )}
            </div>

            {resumes.length === 0 ? (
              <Card className="border border-dashed border-border-subtle bg-bg-card/30 rounded-2xl p-8 sm:p-10 text-center">
                <div className="w-12 h-12 rounded-2xl bg-brand/10 border border-brand/20 flex items-center justify-center mx-auto mb-4">
                  <FileText size={22} className="text-brand" />
                </div>
                <h3 className="text-base font-semibold text-text-primary">Recommendations unlock after upload</h3>
                <p className="text-sm text-text-secondary mt-2 max-w-sm mx-auto leading-relaxed">
                  We parse your resume and score real openings from Internshala, Naukri, and Unstop.
                </p>
                <Link
                  href="/dashboard/resume"
                  className="inline-flex items-center gap-2 mt-5 px-4 py-2.5 bg-brand text-black text-sm font-semibold rounded-xl hover:bg-brand-hover transition-colors"
                >
                  Upload resume <ArrowRight size={14} />
                </Link>
              </Card>
            ) : isLoadingRecommended ? (
              <RecommendedJobsSkeleton />
            ) : recommendedJobs.length === 0 ? (
              <div className="flex items-start gap-3 rounded-xl border border-border-subtle bg-bg-card/30 p-4 text-sm text-text-secondary">
                <AlertCircle size={16} className="text-text-muted shrink-0 mt-0.5" />
                <p>No matches yet. Try re-uploading your resume or check back after the next discovery run.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {featured && <FeaturedJobCard job={featured} />}
                {restJobs.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {restJobs.map((job) => (
                      <JobCard key={job.id} job={job} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </section>

          {/* Right: pipeline + nav */}
          <aside className="space-y-5">
            <Card className="border border-border-subtle bg-bg-card/40 backdrop-blur-md rounded-2xl p-5 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-text-primary">Pipeline</h2>
                <Link href="/dashboard/applications" className="text-[11px] font-semibold text-brand hover:underline">
                  Open
                </Link>
              </div>

              {applications.length === 0 ? (
                <p className="text-xs text-text-muted leading-relaxed">
                  Save or apply to roles and your funnel will show up here.
                </p>
              ) : (
                <div className="space-y-2">
                  {PIPELINE.map((stage) => (
                    <div
                      key={stage.key}
                      className={cn(
                        "flex items-center justify-between px-3 py-2.5 rounded-xl border",
                        stage.surface,
                      )}
                    >
                      <span className={cn("text-xs font-medium", stage.tone)}>{stage.label}</span>
                      <span className={cn("text-lg font-bold tabular-nums", stage.tone)}>{funnel[stage.key]}</span>
                    </div>
                  ))}
                </div>
              )}

              {applications.length > 0 && funnel.APPLIED > 0 && (
                <p className="text-[11px] text-text-muted mt-4 pt-3 border-t border-border-subtle/80">
                  {funnel.INTERVIEW > 0
                    ? `${Math.round((funnel.INTERVIEW / funnel.APPLIED) * 100)}% of applications reached interview`
                    : "Move saved roles to applied to track conversion"}
                </p>
              )}
            </Card>

            <Card className="border border-border-subtle bg-bg-card/40 backdrop-blur-md rounded-2xl p-3 shadow-lg">
              <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider px-3 pt-2 pb-1">
                Go to
              </p>
              <nav className="space-y-0.5">
                {NAV_LINKS.map((link) => (
                  <NavLink key={link.href} {...link} />
                ))}
              </nav>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
}
