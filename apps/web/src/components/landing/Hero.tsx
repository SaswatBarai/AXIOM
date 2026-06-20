"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, CheckCircle2, TrendingUp, Sparkles, Terminal, FileText, Briefcase, Bot, Settings, Search } from "lucide-react";
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

  // Perspective 3D rotation and scale linking to scroll
  const rotateX = useTransform(scrollYProgress, [0, 0.45], [12, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.45], [0.92, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.35], [0.6, 1]);

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-start px-6 pt-24 pb-20 overflow-hidden bg-[#09090b]">
      {/* 1. Spotlight Overlay Effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] pointer-events-none z-0">
        {/* Central glowing spotlight */}
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-white/5 rounded-full blur-[120px]" />
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[350px] h-[200px] bg-white/10 rounded-full blur-[80px]" />
      </div>

      {/* 2. Sleek Grid Background */}
      <div className="absolute inset-0 overflow-hidden bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none z-0 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

      {/* 3. Hero Content Block */}
      <div className="relative z-10 max-w-5xl mx-auto text-center space-y-8 flex flex-col items-center pt-8">
        
        {/* Premium Announcement Tag */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2.5 px-3.5 py-1.5 bg-zinc-900/60 border border-zinc-800/80 rounded-full text-xs font-medium text-zinc-300 backdrop-blur-sm shadow-inner group hover:border-zinc-700 transition-colors cursor-pointer"
        >
          <Badge className="bg-white hover:bg-white text-black text-[10px] font-bold px-2 py-0.5 shrink-0">NEW</Badge>
          <span className="flex items-center gap-1.5 text-zinc-300 font-medium">
            AXIOM 1.0 Platform is now live
            <ArrowRight className="w-3 h-3 text-zinc-400 group-hover:translate-x-0.5 transition-transform" />
          </span>
        </motion.div>

        {/* Hero Title */}
        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.45,
            delay: 0.1,
            ease: [0.16, 1, 0.3, 1]
          }}
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.05] text-white"
        >
          Your AI Career{" "}
          <span className="block bg-gradient-to-b from-white via-zinc-100 to-zinc-500 bg-clip-text text-transparent pb-2 font-extrabold">
            Copilot
          </span>
        </motion.h1>

        {/* Hero Description */}
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.45,
            delay: 0.2,
            ease: [0.16, 1, 0.3, 1]
          }}
          className="text-base sm:text-lg md:text-xl text-zinc-400 max-w-3xl mx-auto font-normal leading-relaxed"
        >
          Optimize your resume for ATS, match with thousands of live roles semantically, and generate personalized interview prep plans in a single dashboard.
        </motion.p>

        {/* CTA Actions */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.45,
            delay: 0.3,
            ease: [0.16, 1, 0.3, 1]
          }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 w-full sm:w-auto"
        >
          <Link href="/auth/signup" className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto bg-white hover:bg-zinc-200 text-black font-semibold text-base px-8 h-12 flex items-center gap-2 group shadow-xl transition-all duration-300">
              Get Started Free
              <ArrowRight className="w-4.5 h-4.5 group-hover:translate-x-1 transition-transform duration-300" />
            </Button>
          </Link>
          <Link href="#showcase" className="w-full sm:w-auto">
            <Button size="lg" variant="outline" className="w-full sm:w-auto border-zinc-800 bg-zinc-900/30 backdrop-blur-sm hover:bg-zinc-800 text-white font-medium text-base px-8 h-12 transition-all">
              Watch Demo
            </Button>
          </Link>
        </motion.div>
      </div>

      {/* 4. High-Fidelity Interactive Dashboard Mockup */}
      <div
        ref={containerRef}
        className="relative z-10 max-w-6xl w-full mx-auto mt-20 px-2 group/panel"
        style={{ perspective: "1000px" }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.75,
            delay: 0.4,
            ease: [0.16, 1, 0.3, 1]
          }}
          style={{
            rotateX,
            scale,
            opacity,
            transformStyle: "preserve-3d"
          }}
        >
        {/* Glowing border glow underneath panel */}
        <div className="absolute inset-x-4 -top-px h-px bg-gradient-to-r from-transparent via-white/10 to-transparent blur-sm group-hover/panel:via-white/20 transition-all duration-500" />
        <div className="absolute inset-0 rounded-2xl bg-zinc-950/20 blur-xl -z-10" />

        {/* Main Panel Wrapper */}
        <Card className="border border-zinc-800/80 bg-zinc-950/60 backdrop-blur-md rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row h-[550px] w-full relative">
          
          {/* Inner border mask for premium shine */}
          <div className="absolute inset-0 border border-white/5 pointer-events-none rounded-2xl" />

          {/* A. Collapsed sidebar mock */}
          <div className="w-14 border-r border-zinc-900 flex flex-col items-center py-6 gap-6 bg-zinc-950 shrink-0 hidden sm:flex">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center font-bold text-white text-sm">A</div>
            <div className="flex-1 flex flex-col gap-5 pt-8 text-zinc-500">
              <Briefcase className="w-5 h-5 text-white" />
              <FileText className="w-5 h-5" />
              <Bot className="w-5 h-5" />
              <Settings className="w-5 h-5" />
            </div>
          </div>

          {/* B. Central Workspace Mockup */}
          <div className="flex-1 flex flex-col overflow-hidden bg-zinc-950/30">
            {/* Header toolbar */}
            <div className="h-14 border-b border-zinc-900 flex items-center justify-between px-6 bg-zinc-950/40">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-zinc-800 text-zinc-400 bg-zinc-900/50">Production Workspace</Badge>
              </div>
              <div className="w-48 relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-650" />
                <div className="h-7 w-full border border-zinc-900 bg-zinc-900/40 rounded px-8 text-xs text-zinc-500 flex items-center">
                  Search dashboard...
                </div>
              </div>
            </div>

            {/* Mock content grid */}
            <div className="flex-1 p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-y-auto">
              
              {/* Box 1: Circular Score Tracker */}
              <Card className="border border-zinc-900 bg-zinc-900/10 p-5 flex flex-col justify-between h-fit">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">ATS Score Review</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="flex items-center justify-center py-6">
                  <div className="relative w-28 h-28">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="56" cy="56" r="48" fill="none" stroke="#18181b" strokeWidth="6" />
                      <circle
                        cx="56"
                        cy="56"
                        r="48"
                        fill="none"
                        stroke="#ffffff"
                        strokeWidth="6"
                        strokeDasharray={`${301 * 0.87} 301`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl font-bold text-white">87%</span>
                      <span className="text-[9px] text-zinc-500 uppercase tracking-wider mt-0.5">Score</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="text-xs text-zinc-300 font-semibold">Ready for submission</div>
                  <p className="text-[10px] text-zinc-500 leading-normal">Formatting checks, skills checklist, and metadata indexes passed AA status.</p>
                </div>
              </Card>

              {/* Box 2: Matches Listing */}
              <div className="lg:col-span-2 space-y-4 flex flex-col justify-start">
                <div className="flex justify-between items-center px-1">
                  <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Top Job Matches</span>
                  <span className="text-xs text-zinc-400 hover:text-white cursor-pointer transition-colors flex items-center gap-1">
                    View all <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>

                {/* Match 1 */}
                <Card className="border border-zinc-900 bg-zinc-900/10 p-4 hover:border-zinc-800 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-zinc-900 border border-zinc-800 flex items-center justify-center text-xs font-bold">V</div>
                      <div>
                        <div className="text-xs font-semibold text-white">Senior Frontend Engineer</div>
                        <div className="text-[10px] text-zinc-500">Vercel • Remote</div>
                      </div>
                    </div>
                    <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] px-2 py-0.5">94% Match</Badge>
                  </div>
                </Card>

                {/* Match 2 */}
                <Card className="border border-zinc-900 bg-zinc-900/10 p-4 hover:border-zinc-800 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-zinc-900 border border-zinc-800 flex items-center justify-center text-xs font-bold">S</div>
                      <div>
                        <div className="text-xs font-semibold text-white">Software Engineer (API Platform)</div>
                        <div className="text-[10px] text-zinc-500">Stripe • Hybrid</div>
                      </div>
                    </div>
                    <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] px-2 py-0.5">89% Match</Badge>
                  </div>
                </Card>
              </div>

            </div>
          </div>

          {/* C. Terminal Logs / Copilot Processing (Right column sidebar mockup) */}
          <div className="w-full md:w-80 border-t md:border-t-0 md:border-l border-zinc-900 bg-zinc-950 flex flex-col overflow-hidden shrink-0">
            <div className="h-14 border-b border-zinc-900 flex items-center gap-2 px-6">
              <Terminal className="w-4 h-4 text-zinc-400" />
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">AI Copilot Core Logs</span>
            </div>
            
            {/* Terminal log contents */}
            <div className="flex-1 p-6 font-mono text-[11px] text-zinc-400 space-y-4 overflow-y-auto bg-black/40">
              <div className="space-y-1">
                <span className="text-zinc-600">[10:04:12]</span> <span className="text-white font-medium">[INFO]</span> Initializing resume analysis...
              </div>
              <div className="space-y-1">
                <span className="text-zinc-600">[10:04:13]</span> <span className="text-white font-medium">[INFO]</span> Parsed contact metadata: John Doe
              </div>
              <div className="space-y-1">
                <span className="text-zinc-600">[10:04:14]</span> <span className="text-emerald-400">[SKILLS]</span> Found: React, TypeScript, Tailwind
              </div>
              <div className="space-y-1">
                <span className="text-zinc-600">[10:04:14]</span> <span className="text-amber-400">[WARNING]</span> Missing Docker, GraphQL references
              </div>
              <div className="space-y-1 animate-pulse">
                <span className="text-zinc-600">[10:04:15]</span> <span className="text-white font-medium">[INFO]</span> Vector db query completed successfully.
              </div>
              <div className="pt-2 text-[10px] text-zinc-500 border-t border-zinc-900">
                &gt; AXIOM is waiting for candidate upload...
              </div>
            </div>
          </div>

        </Card>
      </motion.div>
      </div>
    </section>
  );
}
