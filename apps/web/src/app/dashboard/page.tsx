"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { 
  FileText, Briefcase, ClipboardList, TrendingUp, ArrowRight, 
  Sparkles, ExternalLink, ChevronLeft, ChevronRight, AlertCircle, 
  LucideIcon 
} from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/hooks/useAuth";
import { useResume } from "@/hooks/useResume";
import { useJobs } from "@/hooks/useJobs";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DashboardOverviewSkeleton, RecommendedJobsSkeleton } from "@/components/dashboard/DashboardOverviewSkeleton";

const QUICK_ACTIONS = [
  { href: "/dashboard/resume",       label: "Upload Resume",    description: "Add or update your resume",        icon: FileText },
  { href: "/dashboard/jobs",         label: "Find Jobs",        description: "Browse AI-matched opportunities",   icon: Briefcase },
  { href: "/dashboard/applications", label: "My Applications",  description: "Track your job applications",       icon: ClipboardList },
  { href: "/dashboard/copilot",      label: "AI Copilot",       description: "Get personalized career advice",    icon: Sparkles },
];

function StatCard({ 
  label, 
  value, 
  sub, 
  color = "text-white", 
  icon: Icon 
}: { 
  label: string; 
  value: string | number; 
  sub?: string; 
  color?: string; 
  icon: LucideIcon 
}) {
  return (
    <Card className="border border-zinc-800 bg-zinc-950/40 p-5 shadow-lg relative overflow-hidden group hover:border-brand/30 transition-all duration-300">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{label}</p>
          <p className={`text-3xl font-black tracking-tight ${color}`}>{value}</p>
        </div>
        <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-brand transition-colors duration-200">
          <Icon className="w-4 h-4" />
        </div>
      </div>
      {sub && <p className="text-[10px] text-zinc-400 mt-2 font-medium">{sub}</p>}
    </Card>
  );
}

export default function DashboardOverviewPage() {
  const { user } = useAuth();
  const { profile, isLoading } = useProfile();
  const { resumes, isLoading: resumeLoading } = useResume();
  const { recommendedJobs, isLoadingRecommended, fetchRecommended } = useJobs();

  const [applications, setApplications] = useState<any[]>([]);
  const [appsCount, setAppsCount] = useState<number | string>("—");
  const [appsLoading, setAppsLoading] = useState(true);
  const [showMissingTip, setShowMissingTip] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Horizontal scroller navigation handler
  const handleScroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const offset = direction === "left" ? -clientWidth * 0.75 : clientWidth * 0.75;
      scrollRef.current.scrollTo({ left: scrollLeft + offset, behavior: "smooth" });
    }
  };

  useEffect(() => {
    if (resumes.length > 0) {
      void fetchRecommended(5);
    }
  }, [resumes, fetchRecommended]);

  useEffect(() => {
    async function loadApplications() {
      try {
        const { data } = await api.get("/applications");
        if (data.applications) {
          setApplications(data.applications);
          setAppsCount(data.applications.length);
        }
      } catch (err) {
        console.error("Failed to load applications list", err);
      } finally {
        setAppsLoading(false);
      }
    }
    void loadApplications();
  }, []);

  const completionPct = profile?.profileCompletionPct ?? 0;
  const greeting = new Date().getHours() < 12 
    ? "Good morning" 
    : new Date().getHours() < 17 
      ? "Good afternoon" 
      : "Good evening";

  // Dynamic missing fields logic
  const missingProfileFields = useMemo(() => {
    if (!profile) return [];
    const list: { label: string; pct: number }[] = [];
    if (!profile.name) list.push({ label: "Display Name", pct: 15 });
    if (!profile.currentTitle) list.push({ label: "Professional Title", pct: 15 });
    if (!profile.bio) list.push({ label: "Short Bio", pct: 15 });
    if (!profile.location) list.push({ label: "Location", pct: 10 });
    if (!profile.yearsOfExperience && profile.yearsOfExperience !== 0) list.push({ label: "Years of Experience", pct: 10 });
    if (!profile.linkedinUrl) list.push({ label: "LinkedIn URL", pct: 15 });
    if (!profile.githubUrl) list.push({ label: "GitHub URL", pct: 10 });
    if (!profile.portfolioUrl) list.push({ label: "Portfolio URL", pct: 10 });
    return list;
  }, [profile]);

  // Dynamic maximum match score calculation
  const maxMatchScore = useMemo(() => {
    if (recommendedJobs.length === 0) return "—";
    const scores = recommendedJobs.map(j => j.matchScore).filter(s => typeof s === "number");
    if (scores.length === 0) return "—";
    return `${Math.max(...scores)}%`;
  }, [recommendedJobs]);

  const matchSub = useMemo(() => {
    if (resumes.length === 0) return "Upload resume to score";
    if (recommendedJobs.length === 0) return "No matches calculated yet";
    return "Highest compatibility score";
  }, [resumes, recommendedJobs]);

  // Dynamic contextual subtext logic
  const contextualSubtext = useMemo(() => {
    if (resumes.length === 0) {
      return "Upload your resume to scan your skill profile and unlock matching jobs.";
    }
    if (recommendedJobs.length > 0) {
      return `We found ${recommendedJobs.length} top job matches based on your profile today.`;
    }
    if (typeof appsCount === "number" && appsCount > 0) {
      return `You have ${appsCount} active application${appsCount > 1 ? "s" : ""} in your pipeline.`;
    }
    return "Here's a snapshot of your career progress.";
  }, [resumes, recommendedJobs, appsCount]);

  // Dynamic funnel aggregator
  const funnelData = useMemo(() => {
    const counts = { SAVED: 0, APPLIED: 0, INTERVIEW: 0, OFFER: 0 };
    applications.forEach((app) => {
      if (app.status === "SAVED") counts.SAVED++;
      else if (app.status === "APPLIED" || app.status === "OA_RECEIVED") counts.APPLIED++;
      else if (app.status === "INTERVIEW_SCHEDULED") counts.INTERVIEW++;
      else if (app.status === "OFFER_RECEIVED") counts.OFFER++;
    });
    return counts;
  }, [applications]);

  if (isLoading || resumeLoading || appsLoading) {
    return <DashboardOverviewSkeleton />;
  }

  return (
    <div className="h-full overflow-y-auto">
    <div className="p-6 md:p-8 max-w-5xl space-y-8">
      
      {/* Header greeting & contextual subtext */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-1"
      >
        <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
          {`${greeting}, ${user?.name?.split(" ")[0] ?? "there"}`}
        </h1>
        <p className="text-zinc-400 text-sm">{contextualSubtext}</p>
      </motion.div>

      {/* Actionable profile completion banner */}
      {!isLoading && completionPct < 100 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative"
        >
          <Card className="border border-zinc-800 bg-zinc-950/40 p-4.5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-bold text-white">
                  Complete your profile — <span className="text-brand">{completionPct}% done</span>
                </p>
                {missingProfileFields.length > 0 && (
                  <button 
                    onClick={() => setShowMissingTip(!showMissingTip)}
                    className="text-[10px] text-zinc-400 hover:text-brand font-bold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    {showMissingTip ? "Hide tips" : "What is missing?"}
                  </button>
                )}
              </div>
              <div className="h-1.5 rounded-full bg-zinc-900 overflow-hidden">
                <div
                  className="h-full rounded-full bg-brand transition-all duration-500"
                  style={{ width: `${completionPct}%` }}
                />
              </div>

              <AnimatePresence>
                {showMissingTip && missingProfileFields.length > 0 && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-2.5 border-t border-zinc-900/60 mt-2.5 flex flex-wrap gap-2 animate-in fade-in duration-200">
                      <span className="text-[9px] text-zinc-500 font-bold w-full uppercase tracking-wider">Pending Tasks:</span>
                      {missingProfileFields.map((field) => (
                        <span key={field.label} className="text-[9px] font-bold text-zinc-400 bg-zinc-900 border border-zinc-850 px-2 py-0.5 rounded-md">
                          + {field.label} (+{field.pct}%)
                        </span>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <Link
              href="/dashboard/settings"
              className="shrink-0 flex items-center justify-center gap-1.5 text-xs font-bold text-black bg-brand hover:bg-brand-hover px-3.5 py-2.5 rounded-xl transition-colors w-full md:w-auto"
            >
              Complete <ArrowRight size={13} />
            </Link>
          </Card>
        </motion.div>
      )}

      {/* Stats Cards Dashboard */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        <StatCard 
          label="Resumes" 
          value={resumes.length} 
          sub={resumes.length === 0 ? "Upload to get started" : `${resumes.length} uploaded`} 
          icon={FileText} 
        />
        <StatCard 
          label="Applications"   
          value={appsCount}   
          sub={appsCount === 0 ? "No active applications" : `${appsCount} tracking pipeline`}     
          icon={ClipboardList} 
        />
        <StatCard 
          label="Job Matches"    
          value={maxMatchScore}   
          sub={matchSub}  
          icon={Briefcase} 
        />
        <StatCard 
          label="Profile"        
          value={`${completionPct}%`} 
          sub="Integrity score" 
          color={completionPct === 100 ? "text-emerald-400" : "text-white"} 
          icon={TrendingUp} 
        />
      </motion.div>

      {/* Quick actions */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-3.5"
      >
        <h2 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {QUICK_ACTIONS.map(({ href, label, description, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="group flex items-start gap-4 p-4.5 rounded-xl border border-zinc-800 bg-zinc-950/20 hover:bg-zinc-900/10 hover:border-zinc-700 transition-all duration-300"
            >
              <div className="w-9 h-9 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0 group-hover:bg-zinc-800 group-hover:text-brand transition-colors">
                <Icon size={17} className="text-zinc-400 group-hover:text-brand" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white group-hover:text-brand transition-colors">{label}</p>
                <p className="text-xs text-zinc-400 mt-0.5 leading-normal">{description}</p>
              </div>
              <ArrowRight size={15} className="ml-auto mt-0.5 text-zinc-750 group-hover:text-zinc-400 shrink-0 transition-colors" />
            </Link>
          ))}
        </div>
      </motion.div>

      {/* Recommended Jobs */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Recommended for you</h2>
          {resumes.length > 0 && (
            <div className="flex items-center gap-3">
              <Link href="/dashboard/jobs?sortBy=match" className="text-xs font-bold text-brand hover:text-brand-hover transition-colors flex items-center gap-1">
                View all <ArrowRight size={12} />
              </Link>
              <div className="flex items-center gap-1.5">
                <button 
                  onClick={() => handleScroll("left")}
                  className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white transition-all cursor-pointer"
                  title="Scroll left"
                >
                  <ChevronLeft size={14} />
                </button>
                <button 
                  onClick={() => handleScroll("right")}
                  className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white transition-all cursor-pointer"
                  title="Scroll right"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>

        {resumes.length === 0 ? (
          /* Empty state resume upload invitation card */
          <Card className="border border-dashed border-zinc-800 bg-zinc-950/20 p-8 text-center max-w-xl mx-auto rounded-2xl space-y-4">
            <FileText size={32} className="mx-auto text-brand" />
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white">Unlock personalized recommendations</h3>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed">
                Upload your resume now to run our semantic job matcher and discover roles that align with your skill profile.
              </p>
            </div>
            <Link href="/dashboard/resume" className="inline-flex items-center gap-1.5 text-xs font-bold text-black bg-brand hover:bg-brand-hover px-4 py-2 rounded-xl transition-colors">
              Upload Resume <ArrowRight size={13} />
            </Link>
          </Card>
        ) : isLoadingRecommended ? (
          <RecommendedJobsSkeleton />
        ) : recommendedJobs.length === 0 ? (
          <div className="text-zinc-450 text-xs py-4 flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-zinc-500" />
            No recommendations found yet. Try completing your resume parsing first.
          </div>
        ) : (
          <div 
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto pb-4 scrollbar-none scroll-smooth snap-x snap-mandatory"
          >
            {recommendedJobs.map((job) => (
              <div
                key={job.id}
                className="shrink-0 w-72 rounded-xl border border-zinc-800 bg-zinc-950/20 p-4.5 flex flex-col justify-between hover:border-zinc-700 transition-colors duration-200 snap-start"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-brand bg-brand/10 px-2 py-0.5 rounded border border-brand/20">
                      {job.matchScore}% Match
                    </span>
                    <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">{job.source}</span>
                  </div>
                  <h3 className="text-xs font-bold text-white truncate">{job.title}</h3>
                  <p className="text-xs text-zinc-450 truncate mt-0.5">{job.company}</p>
                  
                  {/* Top matching skills display (Explainable AI Score) */}
                  {job.matchedSkills && job.matchedSkills.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {job.matchedSkills.slice(0, 3).map((skill) => (
                        <span 
                          key={skill} 
                          className="text-[8px] font-extrabold text-zinc-400 bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded-md"
                        >
                          ✓ {skill}
                        </span>
                      ))}
                      {job.matchedSkills.length > 3 && (
                        <span className="text-[8px] font-bold text-zinc-500 px-0.5 pt-0.5">
                          +{job.matchedSkills.length - 3} more
                        </span>
                      )}
                    </div>
                  )}

                  {/* Missing skills highlight */}
                  {job.missingSkills && job.missingSkills.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {job.missingSkills.slice(0, 2).map((skill) => (
                        <span 
                          key={skill} 
                          className="text-[8px] font-bold text-zinc-550 bg-zinc-950/40 border border-zinc-900/50 px-1.5 py-0.5 rounded-md"
                          title={`Missing skill: ${skill}`}
                        >
                          ⚠ {skill}
                        </span>
                      ))}
                    </div>
                  )}

                  <p className="text-xs text-zinc-400 mt-3.5 line-clamp-2 leading-relaxed">{job.description}</p>
                </div>
                <div className="mt-4.5 pt-3.5 border-t border-zinc-900 flex items-center justify-between text-xs">
                  <span className="text-[10px] text-zinc-400 font-medium">{job.location}</span>
                  <a
                    href={job.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] font-bold text-white hover:text-brand hover:underline flex items-center gap-0.5 transition-colors"
                  >
                    Apply <ExternalLink size={10} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Interactive Application Funnel Widget (Replaces static Analytics placeholder) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35 }}
        className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-6 space-y-4"
      >
        <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-brand" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Application Funnel</h3>
          </div>
          <Link href="/dashboard/applications" className="text-[10px] font-bold text-brand hover:underline flex items-center gap-0.5">
            Manage pipeline <ArrowRight size={10} />
          </Link>
        </div>

        {applications.length === 0 ? (
          <div className="text-center py-6 space-y-1">
            <p className="text-xs font-bold text-zinc-400">No applications tracked yet</p>
            <p className="text-[10px] text-zinc-500 max-w-xs mx-auto leading-normal">
              When you save jobs or update application statuses, your active pipeline funnel will be visualised here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: "Saved Roles", count: funnelData.SAVED, color: "bg-zinc-900/50 text-zinc-400 border-zinc-800/80 hover:border-zinc-700" },
              { label: "Applied", count: funnelData.APPLIED, color: "bg-brand/10 text-brand border-brand/20 hover:border-brand/40" },
              { label: "Interviewing", count: funnelData.INTERVIEW, color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20 hover:border-yellow-500/40" },
              { label: "Offers", count: funnelData.OFFER, color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:border-emerald-500/40" },
            ].map((step) => (
              <div 
                key={step.label} 
                className={`p-4 rounded-xl border flex flex-col items-center justify-center text-center space-y-1 transition-all duration-250 cursor-pointer ${step.color}`}
              >
                <span className="text-2xl font-black tracking-tight">{step.count}</span>
                <span className="text-[9px] font-extrabold uppercase tracking-wider opacity-90">{step.label}</span>
              </div>
            ))}
          </div>
        )}
      </motion.div>

    </div>
    </div>
  );
}
