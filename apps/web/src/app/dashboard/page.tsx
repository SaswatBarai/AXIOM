"use client";

import { useState, useEffect, useRef } from "react";
import { 
  FileText, Briefcase, ClipboardList, TrendingUp, ArrowRight, 
  Sparkles, ExternalLink, ChevronLeft, ChevronRight, AlertCircle, 
  RefreshCw, LucideIcon 
} from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/hooks/useAuth";
import { useResume } from "@/hooks/useResume";
import { useJobs } from "@/hooks/useJobs";
import Link from "next/link";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Job } from "@axiom/shared-types";

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
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">{label}</p>
          <p className={`text-3xl font-black tracking-tight ${color}`}>{value}</p>
        </div>
        <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-brand transition-colors duration-200">
          <Icon className="w-4 h-4" />
        </div>
      </div>
      {sub && <p className="text-[10px] text-zinc-500 mt-2 font-medium">{sub}</p>}
    </Card>
  );
}

export default function DashboardOverviewPage() {
  const { user } = useAuth();
  const { profile, isLoading } = useProfile();
  const { resumes, isLoading: resumeLoading } = useResume();
  const { recommendedJobs, isLoadingRecommended, fetchRecommended } = useJobs();

  const [appsCount, setAppsCount] = useState<number | string>("—");
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
    async function loadAppsCount() {
      try {
        const { data } = await api.get("/applications");
        if (data.applications) setAppsCount(data.applications.length);
      } catch (err) {
        console.error("Failed to load applications count", err);
      }
    }
    void loadAppsCount();
  }, []);

  const completionPct = profile?.profileCompletionPct ?? 0;
  const greeting = new Date().getHours() < 12 
    ? "Good morning" 
    : new Date().getHours() < 17 
      ? "Good afternoon" 
      : "Good evening";

  return (
    <div className="p-6 md:p-8 max-w-5xl space-y-8">
      
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-1"
      >
        <p className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">{greeting}</p>
        <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
          {isLoading ? "Welcome back" : `Welcome back, ${user?.name?.split(" ")[0] ?? "there"}`}
        </h1>
        <p className="text-zinc-400 text-sm">Here's a snapshot of your career progress.</p>
      </motion.div>

      {/* Profile completion banner */}
      {!isLoading && completionPct < 100 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border border-zinc-800 bg-zinc-950/40 p-4.5 flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white mb-2.5">
                Complete your profile — <span className="text-zinc-400">{completionPct}% done</span>
              </p>
              <div className="h-1.5 rounded-full bg-zinc-900 overflow-hidden">
                <div
                  className="h-full rounded-full bg-brand transition-all duration-500"
                  style={{ width: `${completionPct}%` }}
                />
              </div>
            </div>
            <Link
              href="/dashboard/settings"
              className="shrink-0 flex items-center gap-1.5 text-xs font-bold text-black bg-brand hover:bg-brand-hover px-3.5 py-2.5 rounded-xl transition-colors"
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
          value={resumeLoading ? "…" : resumes.length} 
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
          value={resumes.length > 0 ? "94%" : "—"}   
          sub={resumes.length > 0 ? "Strong match scores" : "Upload resume to score"}  
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
                <p className="text-xs text-zinc-500 mt-0.5 leading-normal">{description}</p>
              </div>
              <ArrowRight size={15} className="ml-auto mt-0.5 text-zinc-700 group-hover:text-zinc-400 shrink-0 transition-colors" />
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

        {resumeLoading ? (
          <div className="text-zinc-500 text-xs py-4">Checking document references...</div>
        ) : resumes.length === 0 ? (
          /* Empty state resume upload invitation card */
          <Card className="border border-dashed border-zinc-800 bg-zinc-950/20 p-8 text-center max-w-xl mx-auto rounded-2xl space-y-4">
            <FileText size={32} className="mx-auto text-brand" />
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white">Unlock personalized recommendations</h3>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto leading-relaxed">
                Upload your resume now to run our semantic job matcher and discover roles that align with your skill profile.
              </p>
            </div>
            <Link href="/dashboard/resume" className="inline-flex items-center gap-1.5 text-xs font-bold text-black bg-brand hover:bg-brand-hover px-4 py-2 rounded-xl transition-colors">
              Upload Resume <ArrowRight size={13} />
            </Link>
          </Card>
        ) : isLoadingRecommended ? (
          <div className="text-zinc-550 text-xs py-4 flex items-center gap-2">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-brand" /> Loading recommendations...
          </div>
        ) : recommendedJobs.length === 0 ? (
          <div className="text-zinc-500 text-xs py-4 flex items-center gap-1.5">
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
                  <p className="text-xs text-zinc-500 mt-2 line-clamp-2 leading-relaxed">{job.description}</p>
                </div>
                <div className="mt-4.5 pt-3.5 border-t border-zinc-900 flex items-center justify-between text-xs">
                  <span className="text-[10px] text-zinc-500 font-medium">{job.location}</span>
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

      {/* Analytics placeholder */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35 }}
        className="rounded-xl border border-dashed border-zinc-800 p-8 text-center"
      >
        <TrendingUp size={28} className="mx-auto text-zinc-700 mb-3" />
        <p className="text-sm font-semibold text-zinc-500">Analytics & Insights</p>
        <p className="text-xs text-zinc-600 mt-1">Available after you upload a resume and apply to jobs</p>
      </motion.div>
    </div>
  );
}
