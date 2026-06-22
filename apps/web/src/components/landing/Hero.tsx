"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  ArrowRight, CheckCircle2, Terminal, FileText,
  Briefcase, Bot, Settings, Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const rotateX = useTransform(scrollYProgress, [0, 0.45], [10, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.45], [0.93, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.35], [0.55, 1]);

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-start px-6 pt-24 pb-20 overflow-hidden bg-[#09090b]">

      {/* Dot-grid background */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: "radial-gradient(rgba(255,255,255,0.035) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
          maskImage: "radial-gradient(ellipse 70% 55% at 50% 0%, #000 60%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse 70% 55% at 50% 0%, #000 60%, transparent 100%)",
        }}
      />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[480px] h-[200px] bg-white/[0.04] rounded-full blur-[100px] pointer-events-none z-0" />

      {/* Hero Content */}
      <div className="relative z-10 max-w-4xl mx-auto text-center flex flex-col items-center gap-7 pt-6">

        {/* Announcement pill */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <Link href="/signup">
            <span className="inline-flex items-center gap-2.5 px-3.5 py-1.5 bg-zinc-900/70 border border-zinc-800/80 rounded-full text-xs font-medium text-zinc-300 backdrop-blur-sm hover:border-zinc-700 hover:bg-zinc-800/60 transition-all duration-200 cursor-pointer group">
              <span className="bg-white text-black text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 leading-none">
                NEW
              </span>
              AXIOM 1.0 is now live
              <ArrowRight className="w-3 h-3 text-zinc-500 group-hover:translate-x-0.5 group-hover:text-zinc-300 transition-all duration-200" />
            </span>
          </Link>
        </motion.div>

        {/* Hero Title */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
          className="text-5xl sm:text-6xl md:text-[5.5rem] font-extrabold tracking-[-0.03em] leading-[1.02] text-white"
        >
          Your AI Career
          <br />
          <span className="relative inline-block">
            Copilot
            <motion.span
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.6, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
              className="absolute -bottom-1 left-0 right-0 h-[3px] bg-white/30 rounded-full origin-left"
            />
          </span>
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
          className="text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto font-normal leading-relaxed"
        >
          Optimize your resume for ATS, match with thousands of live roles semantically,
          and generate personalized interview prep plans — in a single dashboard.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.26, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 w-full sm:w-auto"
        >
          <Link href="/signup" className="w-full sm:w-auto">
            <Button
              size="lg"
              className="w-full sm:w-auto bg-white hover:bg-zinc-100 text-black font-semibold text-sm px-7 h-11 flex items-center gap-2 group shadow-lg transition-all duration-200"
            >
              Get Started Free
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200" />
            </Button>
          </Link>
          <Link href="#showcase" className="w-full sm:w-auto">
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto border-zinc-800 bg-transparent hover:bg-zinc-800/50 hover:border-zinc-700 text-zinc-300 font-medium text-sm px-7 h-11 transition-all duration-200"
            >
              See it in action
            </Button>
          </Link>
        </motion.div>

        {/* Trust signals */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.45 }}
          className="flex items-center gap-2 text-xs text-zinc-600"
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          No credit card required
          <span className="mx-1 text-zinc-800">·</span>
          <CheckCircle2 className="w-3.5 h-3.5" />
          Free tier forever
        </motion.div>
      </div>

      {/* Dashboard Mockup */}
      <div
        ref={containerRef}
        className="relative z-10 max-w-6xl w-full mx-auto mt-16 px-2 group/panel"
        style={{ perspective: "1200px" }}
      >
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
          style={{ rotateX, scale, opacity, transformStyle: "preserve-3d" }}
        >
          <div className="absolute inset-x-8 -top-px h-px bg-gradient-to-r from-transparent via-white/12 to-transparent group-hover/panel:via-white/22 transition-all duration-500" />

          <Card className="border border-zinc-800/80 bg-zinc-950/70 backdrop-blur-md rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row h-[550px] w-full relative">
            <div className="absolute inset-0 border border-white/[0.04] pointer-events-none rounded-2xl" />

            {/* Sidebar */}
            <div className="w-14 border-r border-zinc-900 flex flex-col items-center py-6 gap-6 bg-zinc-950 shrink-0 hidden sm:flex">
              <div className="w-8 h-8 rounded-md bg-white flex items-center justify-center font-bold text-black text-sm">A</div>
              <div className="flex-1 flex flex-col gap-5 pt-8 text-zinc-600">
                <Briefcase className="w-4 h-4 text-zinc-300" />
                <FileText className="w-4 h-4" />
                <Bot className="w-4 h-4" />
                <Settings className="w-4 h-4" />
              </div>
            </div>

            {/* Main workspace */}
            <div className="flex-1 flex flex-col overflow-hidden bg-zinc-950/20">
              <div className="h-12 border-b border-zinc-900/80 flex items-center justify-between px-5 bg-zinc-950/50">
                <Badge variant="outline" className="border-zinc-800 text-zinc-500 bg-zinc-900/60 text-[10px] font-medium">
                  Production Workspace
                </Badge>
                <div className="w-44 relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-600" />
                  <div className="h-7 w-full border border-zinc-900 bg-zinc-900/40 rounded-md px-8 text-[11px] text-zinc-600 flex items-center">
                    Search dashboard...
                  </div>
                </div>
              </div>

              <div className="flex-1 p-5 grid grid-cols-1 lg:grid-cols-3 gap-5 overflow-y-auto">
                <Card className="border border-zinc-900 bg-zinc-900/15 p-5 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">ATS Score</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <div className="flex items-center justify-center py-5">
                    <div className="relative w-24 h-24">
                      <svg className="w-full h-full -rotate-90">
                        <circle cx="48" cy="48" r="40" fill="none" stroke="#18181b" strokeWidth="5" />
                        <circle cx="48" cy="48" r="40" fill="none" stroke="#ffffff"
                          strokeWidth="5" strokeDasharray={`${251 * 0.87} 251`} strokeLinecap="round" />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-xl font-bold text-white">87%</span>
                        <span className="text-[8px] text-zinc-600 uppercase tracking-wider mt-0.5">Score</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-zinc-300 font-semibold">Ready for submission</div>
                    <p className="text-[10px] text-zinc-500 leading-normal">Formatting, skills, and metadata passed AA status.</p>
                  </div>
                </Card>

                <div className="lg:col-span-2 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Top Job Matches</span>
                    <span className="text-[10px] text-zinc-500 hover:text-white cursor-pointer transition-colors flex items-center gap-1">
                      View all <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                  {[
                    { company: "Vercel", role: "Senior Frontend Engineer", location: "Remote", match: 94 },
                    { company: "Stripe", role: "Software Engineer (API Platform)", location: "Hybrid", match: 89 },
                  ].map((job) => (
                    <Card key={job.company} className="border border-zinc-900 bg-zinc-900/10 p-3.5 hover:border-zinc-800/80 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-md bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                            {job.company[0]}
                          </div>
                          <div>
                            <div className="text-xs font-semibold text-white leading-tight">{job.role}</div>
                            <div className="text-[10px] text-zinc-500 mt-0.5">{job.company} · {job.location}</div>
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

            {/* Terminal */}
            <div className="w-full md:w-72 border-t md:border-t-0 md:border-l border-zinc-900 bg-zinc-950 flex flex-col overflow-hidden shrink-0">
              <div className="h-12 border-b border-zinc-900 flex items-center gap-2 px-5">
                <Terminal className="w-3.5 h-3.5 text-zinc-500" />
                <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Copilot Logs</span>
              </div>
              <div className="flex-1 p-5 font-mono text-[10px] text-zinc-500 space-y-3 overflow-y-auto bg-black/30">
                {[
                  { time: "10:04:12", level: "INFO",   color: "text-zinc-400",  msg: "Initializing resume analysis..." },
                  { time: "10:04:13", level: "INFO",   color: "text-zinc-400",  msg: "Parsed metadata: John Doe" },
                  { time: "10:04:14", level: "SKILLS", color: "text-emerald-400", msg: "Found: React, TypeScript, Tailwind" },
                  { time: "10:04:14", level: "WARN",   color: "text-amber-400", msg: "Missing Docker, GraphQL refs" },
                  { time: "10:04:15", level: "INFO",   color: "text-zinc-400",  msg: "Vector db query complete." },
                ].map((log, i) => (
                  <div key={i}>
                    <span className="text-zinc-700">[{log.time}]</span>{" "}
                    <span className={`font-medium ${log.color}`}>[{log.level}]</span>{" "}
                    {log.msg}
                  </div>
                ))}
                <div className="pt-2 text-[9px] text-zinc-700 border-t border-zinc-900/60">
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