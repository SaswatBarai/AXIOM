"use client";

import { useEffect, useRef, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, Cell, AreaChart, Area,
} from "recharts";
import {
  TrendingUp, Briefcase, Users, Trophy, Star,
  Map, Loader2, AlertCircle, Download, FileImage,
} from "lucide-react";
import { useAnalytics, type DateRange } from "@/hooks/useAnalytics";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

// ── Helpers ───────────────────────────────────────────────────────────────────

const RANGE_OPTIONS: { label: string; value: DateRange }[] = [
  { label: "30 Days", value: 30 },
  { label: "90 Days", value: 90 },
  { label: "All Time", value: 0  },
];

const FUNNEL_LABELS: Record<string, string> = {
  SAVED:               "Saved",
  APPLIED:             "Applied",
  OA_RECEIVED:         "OA Received",
  INTERVIEW_SCHEDULED: "Interview",
  OFFER_RECEIVED:      "Offer",
  REJECTED:            "Rejected",
  WITHDRAWN:           "Withdrawn",
};

const FUNNEL_COLORS: Record<string, string> = {
  SAVED:               "#3b82f6", // Blue
  APPLIED:             "#6366f1", // Indigo
  OA_RECEIVED:         "#8b5cf6", // Purple
  INTERVIEW_SCHEDULED: "#f59e0b", // Amber
  OFFER_RECEIVED:      "#10b981", // Emerald
  REJECTED:            "#ef4444", // Red
  WITHDRAWN:           "#71717a", // Zinc-500
};

// ── Custom Tooltip ────────────────────────────────────────────────────────────

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-950/90 backdrop-blur-md p-3 shadow-2xl select-none text-left">
        <p className="text-[10px] font-bold text-zinc-550 uppercase tracking-widest mb-2">{label}</p>
        <div className="space-y-1.5">
          {payload.map((item: any, i: number) => {
            let val = item.value;
            let displayName = item.name;
            if (item.name === "score") {
              val = `${item.value}%`;
              displayName = "ATS Score";
            } else if (item.name === "count") {
              displayName = item.payload.stage ? (FUNNEL_LABELS[item.payload.stage] ?? "Count") : "Jobs";
            } else {
              displayName = item.name.charAt(0).toUpperCase() + item.name.slice(1);
            }
            return (
              <div key={i} className="flex items-center gap-2 text-xs">
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.color || item.fill }} />
                <span className="text-zinc-400 font-medium">{displayName}:</span>
                <span className="text-white font-bold">{val}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  return null;
};

// ── KPI Card ──────────────────────────────────────────────────────────────────

function KpiCard({ label, value, sub, icon: Icon, colorClass, borderGlowClass }: {
  label: string; value: string | number; sub?: string;
  icon: React.ElementType; colorClass: string; borderGlowClass?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative rounded-2xl border border-zinc-800 bg-zinc-900/25 backdrop-blur-md p-5 flex flex-col justify-between shadow-xl overflow-hidden group hover:border-zinc-700/60 transition-all duration-300"
    >
      {/* Decorative background glow */}
      <div className={cn("absolute -top-6 -right-6 w-20 h-20 rounded-full blur-2xl opacity-20 transition-all duration-300 group-hover:scale-125 group-hover:opacity-30", borderGlowClass || "bg-zinc-500")} />

      <div className="flex justify-between items-start mb-4 relative z-10">
        <div>
          <p className="text-[10px] font-bold text-zinc-550 uppercase tracking-widest select-none">{label}</p>
          <h3 className="text-2xl font-extrabold text-white tracking-tight mt-1">{value}</h3>
        </div>
        <div className={cn("p-2 rounded-xl border border-zinc-850 bg-zinc-950/60 text-zinc-400 group-hover:text-white transition-all duration-300", colorClass)}>
          <Icon size={18} />
        </div>
      </div>
      {sub && (
        <p className="text-[11px] text-zinc-450 font-medium select-none flex items-center gap-1 mt-auto relative z-10">
          {sub}
        </p>
      )}
    </motion.div>
  );
}

// ── Panel wrapper ─────────────────────────────────────────────────────────────

function Panel({ title, children, empty, emptyMsg, subtitle }: {
  title: string; children: React.ReactNode; empty?: boolean; emptyMsg?: string; subtitle?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-zinc-800 bg-zinc-900/25 backdrop-blur-md p-5 flex flex-col shadow-xl"
    >
      <div className="mb-5 select-none">
        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{title}</h3>
        {subtitle && <p className="text-[11px] text-zinc-550 mt-0.5 leading-normal">{subtitle}</p>}
      </div>
      {empty ? (
        <div className="flex flex-col items-center justify-center h-48 text-center select-none">
          <AlertCircle size={20} className="text-zinc-650 mb-2" />
          <p className="text-xs text-zinc-550">{emptyMsg ?? "No data available yet"}</p>
        </div>
      ) : (
        <div className="flex-1 w-full min-h-[220px]">
          {children}
        </div>
      )}
    </motion.div>
  );
}

// ── CSV export ────────────────────────────────────────────────────────────────

function exportCsv(filename: string, rows: Record<string, unknown>[]) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0] ?? {});
  const lines   = [
    headers.join(","),
    ...rows.map((r) =>
      headers.map((h) => JSON.stringify(r[h] ?? "")).join(","),
    ),
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/csv" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const { data, loading, error, range, fetchAll, changeRange } = useAnalytics();
  const { overview, atsTrend, monthly, skills, funnel } = data;
  const exportRef   = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  async function exportPng() {
    if (!exportRef.current || exporting) return;
    setExporting(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(exportRef.current, {
        backgroundColor: "#09090b",
        scale: 2,
        useCORS: true,
        logging: false,
      });
      const a = document.createElement("a");
      a.download = "analytics.png";
      a.href = canvas.toDataURL("image/png");
      a.click();
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="relative min-h-[calc(100vh)] bg-bg-base bg-grid-dots overflow-hidden">
      {/* Background glow effects */}
      <div className="ambient-glow-orb w-[600px] h-[600px] -top-40 -left-20 animate-float-1" />
      <div className="ambient-glow-orb w-[500px] h-[500px] bottom-5 right-5 animate-float-2" />

      <div className="relative z-10 mx-auto max-w-4xl py-8 px-6 space-y-6" ref={exportRef}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 select-none">
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              Search Analytics
              <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-500 uppercase tracking-wider">AI</span>
            </h1>
            <p className="text-xs text-zinc-400 mt-1">Real-time tracking and metrics of your job applications</p>
          </div>

          <div className="flex items-center flex-wrap gap-2">
            {/* Date range picker */}
            <div className="flex rounded-xl border border-zinc-800 bg-zinc-900/20 p-1 select-none">
              {RANGE_OPTIONS.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => changeRange(o.value)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                    range === o.value
                      ? "bg-white text-zinc-950 shadow-sm"
                      : "text-zinc-455 hover:text-white hover:bg-white/5"
                  )}
                >
                  {o.label}
                </button>
              ))}
            </div>

            {/* CSV export */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportCsv("applications-monthly.csv", monthly as unknown as Record<string, unknown>[])}
              className="border-zinc-800 hover:border-zinc-700 bg-zinc-900/20 text-zinc-400 hover:text-white rounded-xl text-xs cursor-pointer select-none"
            >
              <Download size={12} className="mr-1" /> Export CSV
            </Button>

            {/* PNG export */}
            <Button
              variant="outline"
              size="sm"
              onClick={exportPng}
              disabled={exporting}
              className="border-zinc-800 hover:border-zinc-700 bg-zinc-900/20 text-zinc-400 hover:text-white rounded-xl text-xs cursor-pointer select-none disabled:opacity-50"
            >
              {exporting ? <Loader2 size={12} className="mr-1 animate-spin" /> : <FileImage size={12} className="mr-1" />}
              {exporting ? "Saving…" : "Export PNG"}
            </Button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 text-xs text-red-400 bg-red-950/10 border border-red-900/20 rounded-xl p-3">
            <AlertCircle size={14} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 size={32} className="animate-spin text-zinc-500" />
            <p className="text-xs text-zinc-500 mt-3 font-medium select-none">Aggregating search metrics…</p>
          </div>
        )}

        {!loading && overview && (
          <>
            {/* KPI row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <KpiCard
                label="Total Applications"
                value={overview.totalApplications}
                sub={`${overview.savedJobs} saved jobs`}
                icon={Briefcase}
                colorClass="group-hover:border-violet-500/20 group-hover:bg-violet-950/10"
                borderGlowClass="bg-violet-500"
              />
              <KpiCard
                label="Interviews"
                value={overview.interviews}
                sub={`${overview.totalApplications > 0 ? Math.round((overview.interviews / overview.totalApplications) * 100) : 0}% interview rate`}
                icon={Users}
                colorClass="group-hover:border-blue-500/20 group-hover:bg-blue-950/10"
                borderGlowClass="bg-blue-500"
              />
              <KpiCard
                label="Offers"
                value={overview.offers}
                sub={`${overview.successRate}% success rate`}
                icon={Trophy}
                colorClass="group-hover:border-emerald-500/20 group-hover:bg-emerald-950/10"
                borderGlowClass="bg-emerald-500"
              />
              <KpiCard
                label="Avg ATS Score"
                value={overview.avgAtsScore !== null ? `${overview.avgAtsScore}%` : "—"}
                sub={`${overview.roadmaps} career roadmap${overview.roadmaps !== 1 ? "s" : ""}`}
                icon={Star}
                colorClass="group-hover:border-amber-500/20 group-hover:bg-amber-950/10"
                borderGlowClass="bg-amber-500"
              />
            </div>

            {/* Row 1: ATS trend + Monthly bar */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Panel
                title="ATS Score Trend"
                subtitle="Resume matching history over versions"
                empty={atsTrend.length === 0}
                emptyMsg="Upload resumes to see ATS score history"
              >
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={atsTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="atsGlow" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#a855f7" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="4 4" stroke="#18181b" vertical={false} />
                    <XAxis
                      dataKey="version"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: "#71717a", fontSize: 10, fontWeight: 500 }}
                      dy={8}
                    />
                    <YAxis
                      domain={[0, 100]}
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: "#71717a", fontSize: 10, fontWeight: 500 }}
                      dx={-8}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="score"
                      name="score"
                      stroke="#a855f7"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#atsGlow)"
                      dot={{ fill: "#a855f7", stroke: "#18181b", strokeWidth: 2, r: 4 }}
                      activeDot={{ fill: "#fff", stroke: "#a855f7", strokeWidth: 2, r: 5 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Panel>

              <Panel
                title="Applications Over Time"
                subtitle="Monthly breakdown of application flow"
                empty={monthly.length === 0}
                emptyMsg="No applications recorded yet"
              >
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={monthly} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="4 4" stroke="#18181b" vertical={false} />
                    <XAxis
                      dataKey="month"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: "#71717a", fontSize: 10, fontWeight: 500 }}
                      dy={8}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: "#71717a", fontSize: 10, fontWeight: 500 }}
                      dx={-8}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                      verticalAlign="top"
                      height={36}
                      iconType="circle"
                      iconSize={6}
                      wrapperStyle={{ fontSize: 10, color: "#71717a", fontWeight: 500 }}
                    />
                    <Bar dataKey="applied"     fill="#3b82f6" name="Applied"     radius={[4, 4, 0, 0]} maxBarSize={16} />
                    <Bar dataKey="interviewed" fill="#f59e0b" name="Interviewed" radius={[4, 4, 0, 0]} maxBarSize={16} />
                    <Bar dataKey="offered"     fill="#10b981" name="Offered"     radius={[4, 4, 0, 0]} maxBarSize={16} />
                  </BarChart>
                </ResponsiveContainer>
              </Panel>
            </div>

            {/* Row 2: Skills demand + Funnel */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Panel
                title="Top Skills in Your Jobs"
                subtitle="Keywords demanded in your target positions"
                empty={skills.length === 0}
                emptyMsg="Save or apply to jobs to see skill demand"
              >
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={skills.slice(0, 10)} layout="vertical" margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="4 4" stroke="#18181b" horizontal={false} />
                    <XAxis
                      type="number"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: "#71717a", fontSize: 10, fontWeight: 500 }}
                      dy={8}
                    />
                    <YAxis
                      type="category"
                      dataKey="skill"
                      width={90}
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: "#71717a", fontSize: 10, fontWeight: 500 }}
                      dx={-6}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" name="Jobs" radius={[0, 4, 4, 0]} maxBarSize={14}>
                      {skills.slice(0, 10).map((_, i) => (
                        <Cell key={i} fill={`hsl(260, 60%, ${65 - i * 3}%)`} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Panel>

              <Panel
                title="Application Funnel"
                subtitle="Conversion rates at each pipeline stage"
                empty={funnel.length === 0}
                emptyMsg="No applications tracked yet"
              >
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={funnel.map((f) => ({ ...f, label: FUNNEL_LABELS[f.stage] ?? f.stage }))} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="4 4" stroke="#18181b" vertical={false} />
                    <XAxis
                      dataKey="label"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: "#71717a", fontSize: 10, fontWeight: 500 }}
                      dy={8}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: "#71717a", fontSize: 10, fontWeight: 500 }}
                      dx={-8}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" name="Applications" radius={[4, 4, 0, 0]} maxBarSize={30}>
                      {funnel.map((f, i) => (
                        <Cell key={i} fill={FUNNEL_COLORS[f.stage] ?? "#3b82f6"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Panel>
            </div>

            {/* Quick stats footer */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-zinc-800 bg-zinc-900/25 backdrop-blur-md p-5 shadow-xl relative overflow-hidden select-none"
            >
              <div className="absolute -right-10 -bottom-10 w-32 h-32 rounded-full blur-3xl opacity-10 bg-emerald-500" />
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4">Pipeline Summary</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl border border-zinc-900 bg-zinc-950/20">
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Saved Jobs</p>
                  <p className="text-lg font-bold text-white mt-1">{overview.savedJobs}</p>
                </div>
                <div className="p-4 rounded-xl border border-zinc-900 bg-zinc-950/20">
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Career Roadmaps</p>
                  <p className="text-lg font-bold text-white mt-1">{overview.roadmaps}</p>
                </div>
                <div className="p-4 rounded-xl border border-zinc-900 bg-zinc-950/20">
                  <p className="text-[10px] font-bold text-zinc-550 uppercase tracking-wider">Scheduled Interviews</p>
                  <p className="text-lg font-bold text-white mt-1">{overview.interviews}</p>
                </div>
                <div className="p-4 rounded-xl border border-zinc-900 bg-zinc-950/20">
                  <p className="text-[10px] font-bold text-zinc-550 uppercase tracking-wider">Success Rate</p>
                  <p className="text-lg font-bold text-emerald-400 mt-1">{overview.successRate}%</p>
                </div>
              </div>
            </motion.div>
          </>
        )}

        {/* New-user empty state */}
        {!loading && !overview && !error && (
          <div className="flex flex-col items-center justify-center py-24 text-center select-none">
            <TrendingUp size={36} className="text-zinc-700 mb-4" />
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">No metrics generated yet</p>
            <p className="text-xs text-zinc-500 mt-2 max-w-xs leading-relaxed">
              Start applying to jobs, generating roadmaps, and scheduling mock sessions. Your metrics will automatically populate here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
