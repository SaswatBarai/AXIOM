"use client";

import { useEffect, useRef, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, Cell, AreaChart, Area,
} from "recharts";
import {
  TrendingUp, Briefcase, Users, Trophy, Star,
  Loader2, AlertCircle, Download, FileImage, Sparkles,
  BarChart3, Target, ChevronRight, ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { useAnalytics, type DateRange } from "@/hooks/useAnalytics";
import { AnalyticsPageSkeleton } from "@/components/dashboard/AnalyticsSkeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { motion, useInView } from "framer-motion";

// ── Constants ─────────────────────────────────────────────────────────────────

const RANGE_OPTIONS: { label: string; value: DateRange }[] = [
  { label: "30 Days", value: 30 },
  { label: "90 Days", value: 90 },
  { label: "All Time", value: 0 },
];

const FUNNEL_LABELS: Record<string, string> = {
  SAVED:               "Saved",
  APPLIED:             "Applied",
  OA_RECEIVED:         "OA",
  INTERVIEW_SCHEDULED: "Interview",
  OFFER_RECEIVED:      "Offer",
  REJECTED:            "Rejected",
  WITHDRAWN:           "Withdrawn",
};

const FUNNEL_COLORS: Record<string, string> = {
  SAVED:               "#3b82f6",
  APPLIED:             "#6366f1",
  OA_RECEIVED:         "#8b5cf6",
  INTERVIEW_SCHEDULED: "#f59e0b",
  OFFER_RECEIVED:      "#10b981",
  REJECTED:            "#ef4444",
  WITHDRAWN:           "#71717a",
};

const PIPELINE_STAGES = [
  { key: "saved",     label: "Saved",     color: "text-blue-400",    bg: "bg-blue-500/10 border-blue-500/20" },
  { key: "applied",   label: "Applied",   color: "text-indigo-400",  bg: "bg-indigo-500/10 border-indigo-500/20" },
  { key: "interview", label: "Interview", color: "text-amber-400",   bg: "bg-amber-500/10 border-amber-500/20" },
  { key: "offer",     label: "Offer",     color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
] as const;

// ── Layout primitives ─────────────────────────────────────────────────────────

function PageBackground() {
  return (
    <>
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(var(--grid-dot-color) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
          maskImage: "radial-gradient(ellipse 80% 55% at 50% 0%, #000 55%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse 80% 55% at 50% 0%, #000 55%, transparent 100%)",
        }}
      />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[260px] bg-brand/[0.07] rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-20 right-0 w-[320px] h-[200px] bg-emerald-500/[0.04] rounded-full blur-[100px] pointer-events-none" />
    </>
  );
}

function SpotlightCard({ children, className }: { children: React.ReactNode; className?: string }) {
  const [pos, setPos] = useState({ x: 0, y: 0 });

  return (
    <div
      className={cn("relative overflow-hidden rounded-2xl group", className)}
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        setPos({ x: e.clientX - r.left, y: e.clientY - r.top });
      }}
    >
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10"
        style={{
          background: `radial-gradient(320px circle at ${pos.x}px ${pos.y}px, var(--spotlight-color), transparent 80%)`,
        }}
      />
      {children}
    </div>
  );
}

function AnimatedValue({ value, suffix = "" }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let raf: number;
    const start = performance.now();
    const duration = 1200;
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setCount(Math.round(ease * value));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value]);

  return (
    <span ref={ref} className="text-3xl sm:text-4xl font-extrabold tracking-tight text-text-primary tabular-nums">
      {count}{suffix}
    </span>
  );
}

// ── Tooltip ───────────────────────────────────────────────────────────────────

const CustomTooltip = ({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color?: string; fill?: string; payload?: { stage?: string } }>;
  label?: string;
}) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-xl border border-border-subtle bg-bg-card/95 backdrop-blur-md p-3 shadow-2xl select-none text-left">
      <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2">{label}</p>
      <div className="space-y-1.5">
        {payload.map((item, i) => {
          let val: string | number = item.value;
          let displayName = item.name;
          if (item.name === "score") {
            val = `${item.value}%`;
            displayName = "ATS Score";
          } else if (item.name === "count") {
            displayName = item.payload?.stage ? (FUNNEL_LABELS[item.payload.stage] ?? "Count") : "Jobs";
          } else {
            displayName = item.name.charAt(0).toUpperCase() + item.name.slice(1);
          }
          return (
            <div key={i} className="flex items-center gap-2 text-xs">
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.color || item.fill }} />
              <span className="text-text-secondary font-medium">{displayName}:</span>
              <span className="text-text-primary font-bold">{val}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ── KPI card ──────────────────────────────────────────────────────────────────

function KpiCard({
  label, value, numericValue, suffix = "", sub, icon: Icon, glowClass, iconClass, delay = 0,
}: {
  label: string;
  value: string | number;
  numericValue?: number;
  suffix?: string;
  sub?: string;
  icon: React.ElementType;
  glowClass: string;
  iconClass: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      <Card className="relative border border-border-subtle bg-bg-card/40 backdrop-blur-md rounded-2xl p-5 sm:p-6 shadow-lg overflow-hidden group hover:border-border-medium transition-all duration-300 h-full">
        <div className={cn("absolute -top-8 -right-8 w-24 h-24 rounded-full blur-2xl opacity-20 group-hover:opacity-35 transition-opacity", glowClass)} />
        <div className="relative z-10 flex flex-col h-full">
          <div className="w-9 h-9 rounded-xl bg-bg-elevated border border-border-subtle flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
            <Icon size={16} className={iconClass} />
          </div>
          {numericValue !== undefined ? (
            <AnimatedValue value={numericValue} suffix={suffix} />
          ) : (
            <p className="text-3xl sm:text-4xl font-extrabold tracking-tight text-text-primary">{value}</p>
          )}
          <p className="text-sm font-semibold text-text-secondary mt-1.5">{label}</p>
          {sub && <p className="text-[11px] text-text-muted mt-0.5 leading-snug">{sub}</p>}
        </div>
      </Card>
    </motion.div>
  );
}

// ── Chart panel ───────────────────────────────────────────────────────────────

function ChartPanel({
  title, subtitle, icon: Icon, children, empty, emptyMsg, badge,
}: {
  title: string;
  subtitle?: string;
  icon: React.ElementType;
  children: React.ReactNode;
  empty?: boolean;
  emptyMsg?: string;
  badge?: string;
}) {
  return (
    <SpotlightCard>
      <Card className="border border-border-subtle bg-bg-card/40 backdrop-blur-md rounded-2xl shadow-lg relative z-[1] h-full flex flex-col overflow-hidden hover:border-border-medium transition-colors duration-300">
        <div className="p-5 sm:p-6 border-b border-border-subtle/80">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-bg-elevated border border-border-subtle flex items-center justify-center shrink-0 mt-0.5">
                <Icon size={14} className="text-text-secondary" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold text-text-muted uppercase tracking-widest">{title}</p>
                {subtitle && <p className="text-xs text-text-secondary mt-1 leading-relaxed">{subtitle}</p>}
              </div>
            </div>
            {badge && (
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 rounded-full px-2.5 py-0.5 shrink-0">
                {badge}
              </span>
            )}
          </div>
        </div>
        <div className="p-5 sm:p-6 flex-1 flex flex-col">
          {empty ? (
            <div className="flex flex-col items-center justify-center flex-1 min-h-[220px] text-center">
              <div className="w-10 h-10 rounded-xl bg-bg-elevated border border-border-subtle flex items-center justify-center mb-3">
                <AlertCircle size={18} className="text-text-muted" />
              </div>
              <p className="text-xs text-text-muted max-w-[200px]">{emptyMsg ?? "No data available yet"}</p>
            </div>
          ) : (
            <div className="flex-1 w-full min-h-[220px]">{children}</div>
          )}
        </div>
      </Card>
    </SpotlightCard>
  );
}

// ── CSV export ────────────────────────────────────────────────────────────────

function exportCsv(filename: string, rows: Record<string, unknown>[]) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0] ?? {});
  const lines = [
    headers.join(","),
    ...rows.map((r) => headers.map((h) => JSON.stringify(r[h] ?? "")).join(",")),
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const { data, loading, error, range, fetchAll, changeRange } = useAnalytics();
  const { overview, atsTrend, monthly, skills, funnel } = data;
  const exportRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  async function exportPng() {
    if (!exportRef.current || exporting) return;
    setExporting(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(exportRef.current, {
        backgroundColor: "var(--bg-base)",
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

  if (loading) {
    return <AnalyticsPageSkeleton />;
  }

  const pipelineCounts = {
    saved: overview?.savedJobs ?? 0,
    applied: overview?.totalApplications ?? 0,
    interview: overview?.interviews ?? 0,
    offer: overview?.offers ?? 0,
  };

  const latestAts = atsTrend.length > 0 ? atsTrend[atsTrend.length - 1]?.score : null;

  return (
    <div className="relative min-h-full overflow-hidden">
      <PageBackground />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-8 pb-12" ref={exportRef}>
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="mb-8"
        >
          <Badge
            variant="outline"
            className="mb-4 border-border-subtle bg-bg-card/60 text-text-secondary backdrop-blur-sm gap-1.5 px-3 py-1"
          >
            <Sparkles size={12} className="text-brand" />
            Career intelligence
          </Badge>
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-text-primary">
                Search{" "}
                <span className="text-brand" style={{ textShadow: "0 0 60px rgba(249,115,22,0.25)" }}>
                  Analytics
                </span>
              </h1>
              <p className="text-sm text-text-secondary mt-2 max-w-lg">
                Real-time metrics on applications, interviews, and resume performance — powered by your activity.
              </p>
            </div>

            {overview && overview.successRate > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 rounded-full px-3 py-1">
                  <TrendingUp size={12} />
                  {overview.successRate}% success rate
                </span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Toolbar */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.06 }}
          className="mb-8"
        >
          <Card className="border border-border-subtle bg-bg-card/40 backdrop-blur-md rounded-2xl p-4 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-text-muted">
                <BarChart3 size={14} className="text-brand" />
                <span className="font-medium">Time range</span>
              </div>
              <div className="flex items-center flex-wrap gap-2">
                <div className="flex rounded-xl border border-border-subtle bg-bg-base/50 p-1">
                  {RANGE_OPTIONS.map((o) => (
                    <button
                      key={o.value}
                      type="button"
                      onClick={() => changeRange(o.value)}
                      className={cn(
                        "px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                        range === o.value
                          ? "bg-brand text-black shadow-sm shadow-brand/20"
                          : "text-text-secondary hover:text-text-primary hover:bg-bg-hover",
                      )}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => exportCsv("applications-monthly.csv", monthly as unknown as Record<string, unknown>[])}
                  className="border-border-subtle bg-bg-base/50 text-text-secondary hover:text-text-primary rounded-xl text-xs h-9"
                >
                  <Download size={12} className="mr-1.5" />
                  CSV
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={exportPng}
                  disabled={exporting}
                  className="border-border-subtle bg-bg-base/50 text-text-secondary hover:text-text-primary rounded-xl text-xs h-9 disabled:opacity-50"
                >
                  {exporting ? <Loader2 size={12} className="mr-1.5 animate-spin" /> : <FileImage size={12} className="mr-1.5" />}
                  {exporting ? "Saving…" : "PNG"}
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>

        {error && (
          <div className="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6">
            <AlertCircle size={14} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {overview && (
          <div className="space-y-8">
            {/* KPI row — landing Stats inspired */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <KpiCard
                label="Total Applications"
                value={overview.totalApplications}
                numericValue={overview.totalApplications}
                sub={`${overview.savedJobs} saved jobs`}
                icon={Briefcase}
                glowClass="bg-brand"
                iconClass="text-brand"
                delay={0}
              />
              <KpiCard
                label="Interviews"
                value={overview.interviews}
                numericValue={overview.interviews}
                sub={`${overview.totalApplications > 0 ? Math.round((overview.interviews / overview.totalApplications) * 100) : 0}% interview rate`}
                icon={Users}
                glowClass="bg-blue-500"
                iconClass="text-blue-400"
                delay={0.05}
              />
              <KpiCard
                label="Offers"
                value={overview.offers}
                numericValue={overview.offers}
                sub={`${overview.successRate}% success rate`}
                icon={Trophy}
                glowClass="bg-emerald-500"
                iconClass="text-emerald-400"
                delay={0.1}
              />
              <KpiCard
                label="Avg ATS Score"
                value={overview.avgAtsScore !== null ? `${overview.avgAtsScore}%` : "—"}
                numericValue={overview.avgAtsScore ?? undefined}
                suffix={overview.avgAtsScore !== null ? "%" : ""}
                sub={`${overview.roadmaps} career roadmap${overview.roadmaps !== 1 ? "s" : ""}`}
                icon={Star}
                glowClass="bg-amber-500"
                iconClass="text-amber-400"
                delay={0.15}
              />
            </div>

            {/* Pipeline strip — landing Features inspired */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.12 }}
            >
              <Card className="border border-border-subtle bg-bg-card/40 backdrop-blur-md rounded-2xl p-5 sm:p-6 shadow-lg overflow-hidden">
                <div className="flex items-center justify-between mb-5">
                  <p className="text-[10px] font-semibold text-text-muted uppercase tracking-widest">Application Pipeline</p>
                  <p className="text-[10px] text-text-muted">
                    {overview.totalApplications > 0
                      ? `${Math.round((overview.interviews / overview.totalApplications) * 100)}% reach interview`
                      : "Start applying to populate"}
                  </p>
                </div>
                <div className="flex items-center justify-between gap-1 sm:gap-2 overflow-x-auto scrollbar-none pb-1">
                  {PIPELINE_STAGES.map((stage, i) => {
                    const count = pipelineCounts[stage.key];
                    return (
                      <div key={stage.key} className="flex items-center gap-1 sm:gap-2 shrink-0">
                        <div className={cn("flex flex-col items-center justify-center rounded-xl border px-3 sm:px-5 py-3 min-w-[72px] sm:min-w-[88px]", stage.bg)}>
                          <span className={cn("text-xl sm:text-2xl font-extrabold tabular-nums leading-none", stage.color)}>{count}</span>
                          <span className={cn("text-[9px] font-semibold uppercase tracking-wider mt-1 opacity-85", stage.color)}>{stage.label}</span>
                        </div>
                        {i < PIPELINE_STAGES.length - 1 && (
                          <ChevronRight className="w-3.5 h-3.5 text-border-medium shrink-0 hidden sm:block" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </Card>
            </motion.div>

            {/* Charts row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ChartPanel
                title="ATS Score Trend"
                subtitle="Resume matching history across versions"
                icon={Star}
                empty={atsTrend.length === 0}
                emptyMsg="Upload resumes to see ATS score history"
                badge={latestAts !== null ? `${latestAts}% latest` : undefined}
              >
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={atsTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="atsGlow" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="4 4" stroke="var(--border-subtle)" vertical={false} />
                    <XAxis dataKey="version" tickLine={false} axisLine={false} tick={{ fill: "var(--text-muted)", fontSize: 10, fontWeight: 500 }} dy={8} />
                    <YAxis domain={[0, 100]} tickLine={false} axisLine={false} tick={{ fill: "var(--text-muted)", fontSize: 10, fontWeight: 500 }} dx={-8} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="score"
                      name="score"
                      stroke="#f97316"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#atsGlow)"
                      dot={{ fill: "#f97316", stroke: "var(--bg-base)", strokeWidth: 2, r: 4 }}
                      activeDot={{ fill: "#fff", stroke: "#f97316", strokeWidth: 2, r: 5 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartPanel>

              <ChartPanel
                title="Applications Over Time"
                subtitle="Monthly breakdown of your application flow"
                icon={BarChart3}
                empty={monthly.length === 0}
                emptyMsg="No applications recorded yet"
              >
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={monthly} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="4 4" stroke="var(--border-subtle)" vertical={false} />
                    <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: "var(--text-muted)", fontSize: 10, fontWeight: 500 }} dy={8} />
                    <YAxis tickLine={false} axisLine={false} tick={{ fill: "var(--text-muted)", fontSize: 10, fontWeight: 500 }} dx={-8} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend verticalAlign="top" height={36} iconType="circle" iconSize={6} wrapperStyle={{ fontSize: 10, color: "var(--text-secondary)", fontWeight: 500 }} />
                    <Bar dataKey="applied" fill="#3b82f6" name="Applied" radius={[4, 4, 0, 0]} maxBarSize={16} />
                    <Bar dataKey="interviewed" fill="#f59e0b" name="Interviewed" radius={[4, 4, 0, 0]} maxBarSize={16} />
                    <Bar dataKey="offered" fill="#10b981" name="Offered" radius={[4, 4, 0, 0]} maxBarSize={16} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartPanel>
            </div>

            {/* Charts row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ChartPanel
                title="Top Skills in Your Jobs"
                subtitle="Keywords demanded in your target positions"
                icon={Target}
                empty={skills.length === 0}
                emptyMsg="Save or apply to jobs to see skill demand"
              >
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={skills.slice(0, 10)} layout="vertical" margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="4 4" stroke="var(--border-subtle)" horizontal={false} />
                    <XAxis type="number" tickLine={false} axisLine={false} tick={{ fill: "var(--text-muted)", fontSize: 10, fontWeight: 500 }} />
                    <YAxis type="category" dataKey="skill" width={90} tickLine={false} axisLine={false} tick={{ fill: "var(--text-muted)", fontSize: 10, fontWeight: 500 }} dx={-6} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" name="Jobs" radius={[0, 4, 4, 0]} maxBarSize={14}>
                      {skills.slice(0, 10).map((_, i) => (
                        <Cell key={i} fill={`hsl(24, 90%, ${58 - i * 2}%)`} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartPanel>

              <ChartPanel
                title="Application Funnel"
                subtitle="Conversion at each pipeline stage"
                icon={TrendingUp}
                empty={funnel.length === 0}
                emptyMsg="No applications tracked yet"
              >
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={funnel.map((f) => ({ ...f, label: FUNNEL_LABELS[f.stage] ?? f.stage }))} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="4 4" stroke="var(--border-subtle)" vertical={false} />
                    <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: "var(--text-muted)", fontSize: 10, fontWeight: 500 }} dy={8} />
                    <YAxis tickLine={false} axisLine={false} tick={{ fill: "var(--text-muted)", fontSize: 10, fontWeight: 500 }} dx={-8} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" name="Applications" radius={[4, 4, 0, 0]} maxBarSize={30}>
                      {funnel.map((f, i) => (
                        <Cell key={i} fill={FUNNEL_COLORS[f.stage] ?? "#3b82f6"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartPanel>
            </div>

            {/* Summary footer */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.2 }}
            >
              <SpotlightCard>
                <Card className="border border-border-subtle bg-bg-card/40 backdrop-blur-md rounded-2xl p-5 sm:p-6 shadow-lg relative z-[1] overflow-hidden">
                  <div className="absolute -right-10 -bottom-10 w-40 h-40 rounded-full blur-3xl opacity-15 bg-emerald-500 pointer-events-none" />
                  <p className="text-[10px] font-semibold text-text-muted uppercase tracking-widest mb-5 relative z-10">Pipeline Summary</p>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
                    {[
                      { label: "Saved Jobs", value: overview.savedJobs, accent: false },
                      { label: "Career Roadmaps", value: overview.roadmaps, accent: false },
                      { label: "Scheduled Interviews", value: overview.interviews, accent: false },
                      { label: "Success Rate", value: `${overview.successRate}%`, accent: true },
                    ].map((item) => (
                      <div key={item.label} className="p-4 rounded-xl border border-border-subtle bg-bg-base/50 backdrop-blur-sm">
                        <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">{item.label}</p>
                        <p className={cn("text-xl font-extrabold mt-1.5 tabular-nums", item.accent ? "text-emerald-400" : "text-text-primary")}>
                          {item.value}
                        </p>
                      </div>
                    ))}
                  </div>
                </Card>
              </SpotlightCard>
            </motion.div>
          </div>
        )}

        {/* Empty state */}
        {!overview && !error && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            <Card className="border border-border-subtle bg-bg-card/40 backdrop-blur-md rounded-2xl p-10 sm:p-14 text-center shadow-lg max-w-lg mx-auto">
              <div className="w-14 h-14 rounded-2xl bg-brand/10 border border-brand/20 flex items-center justify-center mx-auto mb-5">
                <TrendingUp size={24} className="text-brand" />
              </div>
              <h2 className="text-lg font-bold text-text-primary">No metrics yet</h2>
              <p className="text-sm text-text-secondary mt-2 leading-relaxed max-w-sm mx-auto">
                Apply to jobs, upload resumes, and use interview prep. Your analytics dashboard will populate automatically.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
                <Link
                  href="/dashboard/jobs"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand text-black text-sm font-semibold rounded-xl hover:bg-brand-hover transition-colors shadow-lg shadow-brand/10"
                >
                  Browse Jobs
                  <ArrowRight size={14} />
                </Link>
                <Link
                  href="/dashboard/applications"
                  className="inline-flex items-center gap-2 px-5 py-2.5 border border-border-subtle bg-bg-base/50 text-text-primary text-sm font-medium rounded-xl hover:bg-bg-hover transition-colors"
                >
                  View Applications
                </Link>
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
