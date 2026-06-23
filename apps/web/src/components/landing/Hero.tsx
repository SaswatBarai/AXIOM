"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import {
  ArrowRight, CheckCircle2, Terminal, FileText,
  Briefcase, Bot, Settings, Search, Play,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

// ── Avatar stack for social proof ─────────────────────────────────────────────
const AVATARS = [
  { initials: "SJ", color: "#3B82F6" },
  { initials: "MK", color: "#8B5CF6" },
  { initials: "AR", color: "#10B981" },
  { initials: "TC", color: "#F59E0B" },
  { initials: "LS", color: "#EF4444" },
];

// ── Animated counter for ATS score ────────────────────────────────────────────
function AtsCounter({ target, isInView }: { target: number; isInView: boolean }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    let raf: number;
    const start = performance.now();
    const duration = 1400;
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setCount(Math.round(ease * target));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [isInView, target]);

  return <span className="text-xl font-bold text-text-primary tabular-nums">{count}%</span>;
}

// ── Component ──────────────────────────────────────────────────────────────────
export function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mockupRef    = useRef<HTMLDivElement>(null);
  const mockupInView = useInView(mockupRef, { once: true, margin: "-60px" });

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const rotateX = useTransform(scrollYProgress, [0, 0.45], [10, 0]);
  const scale   = useTransform(scrollYProgress, [0, 0.45], [0.93, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.35], [0.55, 1]);

  // Circumference for the 40-radius ATS ring: 2π × 40 ≈ 251
  const CIRC = 251;
  const TARGET = 87;

  return (
    <section id="hero" className="relative min-h-screen flex flex-col items-center justify-start px-6 pt-24 pb-20 overflow-hidden bg-bg-base">

      {/* Dot-grid background */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: "radial-gradient(var(--grid-dot-color) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
          maskImage: "radial-gradient(ellipse 70% 55% at 50% 0%, #000 60%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse 70% 55% at 50% 0%, #000 60%, transparent 100%)",
        }}
      />
      {/* Top radial glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[280px] bg-brand/[0.07] rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[140px] bg-brand/[0.03] rounded-full blur-[80px] pointer-events-none z-0" />

      {/* Hero Content */}
      <div className="relative z-10 max-w-4xl mx-auto text-center flex flex-col items-center gap-6 pt-6">

        {/* Announcement pill */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <Link href="/signup">
            <span className="inline-flex items-center gap-2.5 px-3.5 py-1.5 bg-bg-card/75 border border-border-subtle/80 rounded-full text-xs font-medium text-text-secondary backdrop-blur-sm hover:border-border-medium hover:bg-bg-hover/60 transition-all duration-200 cursor-pointer group">
              <span className="bg-brand text-black text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 leading-none">
                NEW
              </span>
              AXIOM 1.0 is now live
              <ArrowRight className="w-3 h-3 text-text-muted group-hover:translate-x-0.5 group-hover:text-text-secondary transition-all duration-200" />
            </span>
          </Link>
        </motion.div>

        {/* Hero Title — "AI" in brand orange */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
          className="text-5xl sm:text-6xl md:text-[5.5rem] font-extrabold tracking-[-0.03em] leading-[1.02] text-text-primary"
        >
          Your{" "}
          <span className="text-brand" style={{ textShadow: "0 0 80px rgba(249,115,22,0.35)" }}>
            AI
          </span>{" "}
          Career
          <br />
          <span className="relative inline-block">
            Copilot
            <motion.span
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.6, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
              className="absolute -bottom-1 left-0 right-0 h-[3px] bg-gradient-to-r from-brand/60 via-brand/30 to-transparent rounded-full origin-left"
            />
          </span>
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
          className="text-base sm:text-lg text-text-secondary max-w-xl mx-auto font-normal leading-relaxed"
        >
          Optimize your resume for ATS, match with thousands of live roles semantically,
          and generate personalized interview prep — all in one dashboard.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.26, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-1 w-full sm:w-auto"
        >
          <Link href="/signup" className="w-full sm:w-auto">
            <Button
              size="lg"
              className="w-full sm:w-auto bg-brand hover:bg-brand-hover text-black font-semibold text-sm px-7 h-11 flex items-center gap-2 group shadow-[0_0_24px_rgba(249,115,22,0.25)] hover:shadow-[0_0_32px_rgba(249,115,22,0.4)] transition-all duration-200"
            >
              Get Started Free
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200" />
            </Button>
          </Link>
          <Link href="#showcase" className="w-full sm:w-auto">
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto border-border-medium bg-bg-card/40 hover:bg-bg-hover/60 hover:border-border-strong text-text-secondary font-medium text-sm px-7 h-11 flex items-center gap-2 transition-all duration-200"
            >
              <Play className="w-3.5 h-3.5 fill-text-muted text-text-muted" />
              See it in action
            </Button>
          </Link>
        </motion.div>

        {/* Trust signals — visible contrast */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.38 }}
          className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-text-muted"
        >
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            No credit card required
          </span>
          <span className="text-border-medium">·</span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            Free tier forever
          </span>
          <span className="text-border-medium">·</span>
          <span className="font-medium text-text-secondary">89% saw interview callbacks</span>
        </motion.div>

        {/* Social proof bar */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center gap-4 px-5 py-3 bg-bg-card/50 border border-border-subtle/60 rounded-2xl backdrop-blur-sm"
        >
          {/* Avatar stack */}
          <div className="flex -space-x-2 shrink-0">
            {AVATARS.map((av) => (
              <div
                key={av.initials}
                className="w-7 h-7 rounded-full border-2 border-bg-base flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                style={{ backgroundColor: av.color }}
              >
                {av.initials}
              </div>
            ))}
          </div>
          {/* Text */}
          <div className="text-xs leading-snug">
            <span className="font-semibold text-text-primary">14,000+</span>
            <span className="text-text-tertiary"> job seekers already onboard</span>
          </div>
          {/* Divider */}
          <div className="h-4 w-px bg-border-subtle shrink-0" />
          {/* Stars */}
          <div className="flex items-center gap-1 shrink-0">
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <svg key={i} className="w-3 h-3" viewBox="0 0 12 12" fill="#f97316">
                  <path d="M6 1l1.24 2.51 2.76.4-2 1.95.47 2.75L6 7.5 3.53 8.61l.47-2.75-2-1.95 2.76-.4z" />
                </svg>
              ))}
            </div>
            <span className="text-xs text-text-muted ml-0.5">4.9</span>
          </div>
        </motion.div>
      </div>

      {/* Dashboard Mockup — animated ATS ring */}
      <div
        ref={containerRef}
        className="relative z-10 max-w-6xl w-full mx-auto mt-12 px-2 group/panel"
        style={{ perspective: "1200px" }}
      >
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
          style={{ rotateX, scale, opacity, transformStyle: "preserve-3d" }}
        >
          {/* Top edge shimmer */}
          <div className="absolute inset-x-8 -top-px h-px bg-gradient-to-r from-transparent via-brand/30 to-transparent group-hover/panel:via-brand/50 transition-all duration-500" />

          <Card
            ref={mockupRef}
            className="border border-border-subtle bg-bg-card/75 backdrop-blur-md rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row h-[550px] w-full relative"
          >
            <div className="absolute inset-0 border border-border-subtle/30 pointer-events-none rounded-2xl" />

            {/* Sidebar */}
            <div className="w-14 border-r border-border-subtle flex flex-col items-center py-6 gap-6 bg-bg-base/40 shrink-0 hidden sm:flex">
              <div className="w-8 h-8 rounded-md bg-brand flex items-center justify-center font-bold text-black text-sm">A</div>
              <div className="flex-1 flex flex-col gap-5 pt-8 text-text-muted">
                <Briefcase className="w-4 h-4 text-text-primary" />
                <FileText className="w-4 h-4" />
                <Bot className="w-4 h-4" />
                <Settings className="w-4 h-4" />
              </div>
            </div>

            {/* Main workspace */}
            <div className="flex-1 flex flex-col overflow-hidden bg-bg-base/20">
              <div className="h-12 border-b border-border-subtle flex items-center justify-between px-5 bg-bg-card/50">
                <Badge variant="outline" className="border-border-subtle text-text-muted bg-bg-elevated/60 text-[10px] font-medium">
                  Production Workspace
                </Badge>
                <div className="w-44 relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-text-muted" />
                  <div className="h-7 w-full border border-border-subtle bg-bg-elevated/40 rounded-md px-8 text-[11px] text-text-muted flex items-center">
                    Search dashboard...
                  </div>
                </div>
              </div>

              <div className="flex-1 p-5 grid grid-cols-1 lg:grid-cols-3 gap-5 overflow-y-auto">
                {/* ATS Score — animated ring */}
                <Card className="border border-border-subtle bg-bg-card/30 p-5 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">ATS Score</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <div className="flex items-center justify-center py-5">
                    <div className="relative w-24 h-24">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 96 96">
                        <circle cx="48" cy="48" r="40" fill="none" stroke="var(--bg-elevated)" strokeWidth="5" />
                        <motion.circle
                          cx="48" cy="48" r="40"
                          fill="none" stroke="#f97316" strokeWidth="5" strokeLinecap="round"
                          strokeDasharray={CIRC}
                          initial={{ strokeDashoffset: CIRC }}
                          animate={mockupInView
                            ? { strokeDashoffset: Math.round(CIRC * (1 - TARGET / 100)) }
                            : { strokeDashoffset: CIRC }
                          }
                          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1], delay: 0.6 }}
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <AtsCounter target={TARGET} isInView={mockupInView} />
                        <span className="text-[8px] text-text-muted uppercase tracking-wider mt-0.5">Score</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-text-secondary font-semibold">Ready for submission</div>
                    <p className="text-[10px] text-text-muted leading-normal">Formatting, skills, and metadata passed AA status.</p>
                  </div>
                </Card>

                {/* Job Matches */}
                <div className="lg:col-span-2 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">Top Job Matches</span>
                    <span className="text-[10px] text-text-muted hover:text-text-primary cursor-pointer transition-colors flex items-center gap-1">
                      View all <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                  {[
                    { company: "Vercel", role: "Senior Frontend Engineer", location: "Remote", match: 94 },
                    { company: "Stripe", role: "Software Engineer (API Platform)", location: "Hybrid", match: 89 },
                  ].map((job) => (
                    <Card key={job.company} className="border border-border-subtle bg-bg-card/20 hover:border-border-medium/80 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-md bg-bg-elevated border border-border-subtle flex items-center justify-center text-[10px] font-bold text-text-primary shrink-0">
                            {job.company[0]}
                          </div>
                          <div>
                            <div className="text-xs font-semibold text-text-primary leading-tight">{job.role}</div>
                            <div className="text-[10px] text-text-muted mt-0.5">{job.company} · {job.location}</div>
                          </div>
                        </div>
                        <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] px-2 py-0.5 shrink-0">
                          {job.match}%
                        </Badge>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>

            {/* Terminal / Copilot Logs */}
            <div className="w-full md:w-72 border-t md:border-t-0 md:border-l border-border-subtle bg-bg-card/90 flex flex-col overflow-hidden shrink-0">
              <div className="h-12 border-b border-border-subtle flex items-center gap-2 px-5">
                <Terminal className="w-3.5 h-3.5 text-text-muted" />
                <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">Copilot Logs</span>
              </div>
              <div className="flex-1 p-5 font-mono text-[10px] text-text-secondary space-y-3 overflow-y-auto bg-bg-base/30">
                {[
                  { time: "10:04:12", level: "INFO",   color: "text-text-muted",   msg: "Initializing resume analysis..." },
                  { time: "10:04:13", level: "INFO",   color: "text-text-muted",   msg: "Parsed metadata: John Doe" },
                  { time: "10:04:14", level: "SKILLS", color: "text-emerald-500", msg: "Found: React, TypeScript, Tailwind" },
                  { time: "10:04:14", level: "WARN",   color: "text-brand", msg: "Missing Docker, GraphQL refs" },
                  { time: "10:04:15", level: "INFO",   color: "text-text-muted",   msg: "Vector db query complete." },
                ].map((log, i) => (
                  <div key={i}>
                    <span className="text-text-muted">[{log.time}]</span>{" "}
                    <span className={`font-medium ${log.color}`}>[{log.level}]</span>{" "}
                    {log.msg}
                  </div>
                ))}
                <div className="pt-2 text-[9px] text-text-muted border-t border-border-subtle/60">
                  &gt; AXIOM waiting for upload...
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
