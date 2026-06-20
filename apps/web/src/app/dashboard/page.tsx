"use client";

import { FileText, Briefcase, ClipboardList, TrendingUp, ArrowRight, Sparkles } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/hooks/useAuth";
import { useResume } from "@/hooks/useResume";
import Link from "next/link";
import { motion } from "framer-motion";

const QUICK_ACTIONS = [
  { href: "/dashboard/resume",       label: "Upload Resume",    description: "Add or update your resume",        icon: FileText },
  { href: "/dashboard/jobs",         label: "Find Jobs",        description: "Browse AI-matched opportunities",   icon: Briefcase },
  { href: "/dashboard/applications", label: "My Applications",  description: "Track your job applications",       icon: ClipboardList },
  { href: "/dashboard/copilot",      label: "AI Copilot",       description: "Get personalized career advice",    icon: Sparkles },
];

function StatCard({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color: string }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 flex flex-col gap-1">
      <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">{label}</p>
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
      {sub && <p className="text-xs text-zinc-500 mt-1">{sub}</p>}
    </div>
  );
}

export default function DashboardOverviewPage() {
  const { user }                        = useAuth();
  const { profile, isLoading }          = useProfile();
  const { resumes, isLoading: resumeLoading } = useResume();

  const completionPct = profile?.profileCompletionPct ?? 0;
  const greeting      = new Date().getHours() < 12 ? "Good morning" : new Date().getHours() < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="p-6 md:p-8 max-w-5xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <p className="text-zinc-500 text-sm mb-1">{greeting}</p>
        <h1 className="text-2xl md:text-3xl font-bold text-white">
          {isLoading ? "Welcome back" : `Welcome back, ${user?.name?.split(" ")[0] ?? "there"}`}
        </h1>
        <p className="text-zinc-400 text-sm mt-1">Here's a snapshot of your career progress.</p>
      </motion.div>

      {/* Profile completion banner */}
      {!isLoading && completionPct < 100 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 rounded-xl border border-zinc-700 bg-zinc-900 p-4 flex items-center justify-between gap-4"
        >
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white mb-2">
              Complete your profile — <span className="text-zinc-400">{completionPct}% done</span>
            </p>
            <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-white transition-all duration-500"
                style={{ width: `${completionPct}%` }}
              />
            </div>
          </div>
          <Link
            href="/dashboard/settings"
            className="shrink-0 flex items-center gap-1.5 text-xs font-medium text-white bg-zinc-800 hover:bg-zinc-700 px-3 py-2 rounded-lg transition-colors"
          >
            Complete <ArrowRight size={13} />
          </Link>
        </motion.div>
      )}

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8"
      >
        <StatCard label="Resumes" value={resumeLoading ? "…" : resumes.length} sub={resumes.length === 0 ? "Upload to get started" : `${resumes.length} uploaded`} color="text-white" />
        <StatCard label="Applications"   value="—"   sub="Track your pipeline"     color="text-white" />
        <StatCard label="Job Matches"    value="—"   sub="Connect to see matches"  color="text-white" />
        <StatCard label="Profile"        value={`${completionPct}%`} sub="Complete" color={completionPct === 100 ? "text-green-400" : "text-white"} />
      </motion.div>

      {/* Quick actions */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">Quick actions</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {QUICK_ACTIONS.map(({ href, label, description, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="group flex items-start gap-4 p-4 rounded-xl border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-800/60 hover:border-zinc-700 transition-all"
            >
              <div className="w-9 h-9 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0 group-hover:bg-zinc-700 transition-colors">
                <Icon size={17} className="text-zinc-300" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-white">{label}</p>
                <p className="text-xs text-zinc-500 mt-0.5">{description}</p>
              </div>
              <ArrowRight size={15} className="ml-auto mt-0.5 text-zinc-600 group-hover:text-zinc-400 shrink-0 transition-colors" />
            </Link>
          ))}
        </div>
      </motion.div>

      {/* Coming soon placeholder */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-8 rounded-xl border border-dashed border-zinc-800 p-8 text-center"
      >
        <TrendingUp size={28} className="mx-auto text-zinc-700 mb-3" />
        <p className="text-sm font-medium text-zinc-500">Analytics & insights</p>
        <p className="text-xs text-zinc-600 mt-1">Available after you upload a resume and apply to jobs</p>
      </motion.div>
    </div>
  );
}
