"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { ScrollReveal } from "@/components/ScrollReveal";
import {
  FileText, Briefcase, MessagesSquare, HelpCircle,
  BarChart3, PenTool, Trello, Zap, ArrowRight,
  CheckCircle, Play, Sliders
} from "lucide-react";

export function Features() {
  return (
    <section id="features" className="py-32 px-6 bg-[#09090b] relative overflow-hidden">
      <div className="max-w-7xl mx-auto space-y-20">

        {/* Header — left-aligned */}
        <ScrollReveal>
          <div className="space-y-4 max-w-2xl">
            <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-[0.15em]">
              Platform Core
            </span>
            <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-[1.06]">
              Everything you need,<br />in one workspace
            </h2>
            <p className="text-base text-zinc-400 leading-relaxed">
              Eight AI engines, unified into a single bento dashboard built for the modern job search.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 auto-rows-[260px]">

          {/* Card 1: Resume Analyzer — 2×2 */}
          <ScrollReveal className="md:col-span-2 md:row-span-2 group">
            <Card className="border border-zinc-800/70 bg-zinc-900/10 rounded-2xl p-8 h-full flex flex-col justify-between hover:border-zinc-700/80 hover:bg-zinc-900/20 transition-all duration-300 overflow-hidden relative">
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 h-full">
                <div className="lg:col-span-2 flex flex-col justify-between h-full">
                  <div className="space-y-5">
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] font-bold text-zinc-600 uppercase tracking-widest tabular-nums">01</span>
                      <FileText className="w-4 h-4 text-zinc-400" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold text-white">Resume Analyzer</h3>
                      <p className="text-sm text-zinc-400 leading-relaxed">
                        Checks layout compliance, extracts skills semantically, and calculates ATS scoring with actionable recommendations.
                      </p>
                    </div>
                  </div>
                  <span className="flex items-center gap-1.5 text-xs text-zinc-600 group-hover:text-zinc-200 transition-colors duration-300 font-medium cursor-pointer">
                    Analyze Resume
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>

                <div className="lg:col-span-3 h-full bg-zinc-950/50 rounded-xl border border-zinc-900 p-5 flex flex-col justify-between font-mono text-[9px] text-zinc-600 overflow-hidden relative">
                  <motion.div
                    className="absolute left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/30 to-transparent z-10"
                    animate={{ top: ["8%", "92%", "8%"] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  />
                  <div className="space-y-4">
                    <div className="flex justify-between border-b border-zinc-900 pb-3 text-[10px] font-semibold text-zinc-500">
                      <span>CV_PARSED_2026.pdf</span>
                      <span className="text-emerald-400 font-bold">READY</span>
                    </div>
                    <div className="font-sans space-y-2 text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[10px] text-white font-bold">JD</div>
                        <div>
                          <p className="font-bold text-white text-[11px] leading-none">John Doe</p>
                          <p className="text-[9px] text-zinc-500 mt-0.5">Senior Data Engineer</p>
                        </div>
                      </div>
                      <p className="text-zinc-500 text-[10px] pt-1">
                        <span className="font-mono text-zinc-700">Skills:</span> Python, SQL, Kafka, Kubernetes, Spark
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2 border-t border-zinc-900 pt-3">
                    <div className="flex justify-between text-[10px] font-sans font-medium">
                      <span className="text-zinc-600">Overall Matching Score</span>
                      <span className="text-white font-bold">87%</span>
                    </div>
                    <Progress value={87} className="h-1 bg-zinc-900" />
                  </div>
                </div>
              </div>
            </Card>
          </ScrollReveal>

          {/* Card 2: Semantic Job Match */}
          <ScrollReveal className="md:col-span-1 md:row-span-1 group">
            <Card className="border border-zinc-800/70 bg-zinc-900/10 rounded-2xl p-6 h-full flex flex-col justify-between hover:border-zinc-700/80 hover:bg-zinc-900/20 transition-all duration-300">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-bold text-zinc-600 uppercase tracking-widest">02</span>
                  <Briefcase className="w-4 h-4 text-zinc-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Semantic Job Match</h3>
                  <p className="text-xs text-zinc-500 leading-relaxed mt-1">Vector matching instead of loose keyword tags.</p>
                </div>
              </div>
              <div className="flex justify-between items-center bg-zinc-950/50 border border-zinc-900 rounded-lg p-2.5 px-3 text-[10px]">
                <span className="text-zinc-500 font-medium">Match Accuracy</span>
                <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-bold">92% MATCH</Badge>
              </div>
            </Card>
          </ScrollReveal>

          {/* Card 3: Skill Gap */}
          <ScrollReveal className="md:col-span-1 md:row-span-1 group">
            <Card className="border border-zinc-800/70 bg-zinc-900/10 rounded-2xl p-6 h-full flex flex-col justify-between hover:border-zinc-700/80 hover:bg-zinc-900/20 transition-all duration-300">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-bold text-zinc-600 uppercase tracking-widest">03</span>
                  <Zap className="w-4 h-4 text-zinc-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Skill Gap Detection</h3>
                  <p className="text-xs text-zinc-500 leading-relaxed mt-1">Audit discrepancies between your profile and live listings.</p>
                </div>
              </div>
              <div className="flex justify-between items-center bg-zinc-950/50 border border-zinc-900 rounded-lg p-2.5 px-4 text-[10px] text-zinc-500">
                <span className="flex items-center gap-1.5"><CheckCircle className="w-3 h-3 text-emerald-400" /> React</span>
                <span className="flex items-center gap-1.5 text-zinc-700"><CheckCircle className="w-3 h-3" /> Docker</span>
              </div>
            </Card>
          </ScrollReveal>

          {/* Card 4: AI Copilot — tall */}
          <ScrollReveal className="md:col-span-1 md:row-span-2 group">
            <Card className="border border-zinc-800/70 bg-zinc-900/10 rounded-2xl p-6 h-full flex flex-col justify-between hover:border-zinc-700/80 hover:bg-zinc-900/20 transition-all duration-300">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-bold text-zinc-600 uppercase tracking-widest">04</span>
                  <MessagesSquare className="w-4 h-4 text-zinc-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">AI Career Copilot</h3>
                  <p className="text-xs text-zinc-500 leading-relaxed mt-1">
                    Draft emails, negotiate compensation, and strategize your job search with a dedicated model.
                  </p>
                </div>
              </div>
              <div className="flex-1 bg-zinc-950/50 rounded-xl border border-zinc-900 p-4 mt-4 space-y-4 text-[10px] flex flex-col justify-end min-h-[200px]">
                <div className="space-y-1 flex flex-col items-start">
                  <span className="text-[8px] text-zinc-700 font-semibold uppercase tracking-wider pl-1">You</span>
                  <div className="bg-zinc-900/80 text-zinc-300 rounded-2xl rounded-tl-none p-3 border border-zinc-800/40 text-xs leading-snug">
                    How should I pitch my remote schedule?
                  </div>
                </div>
                <div className="space-y-1 flex flex-col items-end">
                  <span className="text-[8px] text-zinc-700 font-semibold uppercase tracking-wider pr-1">Copilot</span>
                  <div className="bg-white text-black rounded-2xl rounded-tr-none p-3 text-xs leading-snug">
                    Lead with delivery metrics and propose a trial tied to milestones.
                  </div>
                </div>
              </div>
            </Card>
          </ScrollReveal>

          {/* Card 5: Application Tracker */}
          <ScrollReveal className="md:col-span-2 md:row-span-1 group">
            <Card className="border border-zinc-800/70 bg-zinc-900/10 rounded-2xl p-6 h-full flex flex-col md:flex-row justify-between gap-6 hover:border-zinc-700/80 hover:bg-zinc-900/20 transition-all duration-300 overflow-hidden">
              <div className="flex flex-col justify-between flex-1 space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-bold text-zinc-600 uppercase tracking-widest">05</span>
                    <Trello className="w-4 h-4 text-zinc-400" />
                  </div>
                  <h3 className="text-base font-bold text-white">Application Tracker</h3>
                  <p className="text-xs text-zinc-500 leading-relaxed max-w-xs">
                    Auto-organize files, interview calls, and salary parameters in a Kanban board.
                  </p>
                </div>
                <span className="flex items-center gap-1.5 text-xs text-zinc-600 group-hover:text-zinc-200 transition-colors font-medium cursor-pointer">
                  Open Kanban <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </div>
              <div className="w-full md:w-56 bg-zinc-950/50 rounded-xl border border-zinc-900 p-3.5 flex gap-2.5 shrink-0 overflow-hidden">
                {[
                  { label: "Applied (2)", item: "Stripe", sub: "API Engineer", accent: false },
                  { label: "Interviews (1)", item: "Vercel", sub: "Frontend role", accent: true },
                ].map((col) => (
                  <div key={col.label} className="flex-1 flex flex-col gap-1.5">
                    <span className="text-[7px] font-bold text-zinc-600 uppercase tracking-wider border-b border-zinc-900 pb-1">{col.label}</span>
                    <div className={`bg-zinc-900/60 border rounded p-1.5 space-y-1 ${col.accent ? "border-zinc-700 border-l-2 border-l-white/60" : "border-zinc-800"}`}>
                      <div className="text-[7px] font-bold text-white leading-none">{col.item}</div>
                      <div className="text-[6px] text-zinc-600">{col.sub}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </ScrollReveal>

          {/* Card 6: Analytics */}
          <ScrollReveal className="md:col-span-2 md:row-span-1 group">
            <Card className="border border-zinc-800/70 bg-zinc-900/10 rounded-2xl p-6 h-full flex flex-col md:flex-row justify-between gap-6 hover:border-zinc-700/80 hover:bg-zinc-900/20 transition-all duration-300 overflow-hidden">
              <div className="flex flex-col justify-between flex-1 space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-bold text-zinc-600 uppercase tracking-widest">06</span>
                    <BarChart3 className="w-4 h-4 text-zinc-400" />
                  </div>
                  <h3 className="text-base font-bold text-white">Analytics Dashboard</h3>
                  <p className="text-xs text-zinc-500 leading-relaxed max-w-xs">
                    Track response rates, pipeline conversion, and match trend breakdowns.
                  </p>
                </div>
                <span className="flex items-center gap-1.5 text-xs text-zinc-600 group-hover:text-zinc-200 transition-colors font-medium cursor-pointer">
                  View Dashboard <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </div>
              <div className="w-full md:w-60 bg-zinc-950/50 rounded-xl border border-zinc-900 p-4 flex flex-col justify-between shrink-0 overflow-hidden">
                <div className="flex justify-between items-center text-[8px] font-semibold text-zinc-600 uppercase tracking-wider border-b border-zinc-900 pb-1.5">
                  <span>Conversion</span>
                  <span className="text-emerald-400">+18%</span>
                </div>
                <div className="flex items-end justify-between gap-1 h-14 pt-2">
                  {[25, 45, 30, 65, 55, 70, 95, 80].map((val, i) => (
                    <motion.div
                      key={i}
                      className="bg-zinc-400 rounded-sm w-full"
                      initial={{ height: 0 }}
                      whileInView={{ height: `${val}%` }}
                      transition={{ duration: 0.5, delay: i * 0.04 }}
                    />
                  ))}
                </div>
              </div>
            </Card>
          </ScrollReveal>

          {/* Card 7: Interview Prep */}
          <ScrollReveal className="md:col-span-1 md:row-span-1 group">
            <Card className="border border-zinc-800/70 bg-zinc-900/10 rounded-2xl p-6 h-full flex flex-col justify-between hover:border-zinc-700/80 hover:bg-zinc-900/20 transition-all duration-300">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-bold text-zinc-600 uppercase tracking-widest">07</span>
                  <HelpCircle className="w-4 h-4 text-zinc-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Interview Prep</h3>
                  <p className="text-xs text-zinc-500 leading-relaxed mt-1">Mock questions tailored to each parsed target role.</p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-zinc-950/50 border border-zinc-900 rounded-lg p-2.5 text-[10px] text-zinc-500">
                <Play className="w-3 h-3 text-white fill-white shrink-0" />
                <span className="truncate">Simulating: Behavioral Panel</span>
              </div>
            </Card>
          </ScrollReveal>

          {/* Card 8: Cover Letter */}
          <ScrollReveal className="md:col-span-2 md:row-span-1 group">
            <Card className="border border-zinc-800/70 bg-zinc-900/10 rounded-2xl p-6 h-full flex flex-col md:flex-row justify-between gap-6 hover:border-zinc-700/80 hover:bg-zinc-900/20 transition-all duration-300 overflow-hidden">
              <div className="flex flex-col justify-between flex-1 space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-bold text-zinc-600 uppercase tracking-widest">08</span>
                    <PenTool className="w-4 h-4 text-zinc-400" />
                  </div>
                  <h3 className="text-base font-bold text-white">Cover Letter Builder</h3>
                  <p className="text-xs text-zinc-500 leading-relaxed max-w-xs">Personalized, job-matched cover letters in under a minute.</p>
                </div>
                <span className="flex items-center gap-1.5 text-xs text-zinc-600 group-hover:text-zinc-200 transition-colors font-medium cursor-pointer">
                  Build Cover Letter <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </div>
              <div className="w-full md:w-52 bg-zinc-950/50 rounded-xl border border-zinc-900 p-4 shrink-0 flex flex-col justify-between space-y-2 overflow-hidden">
                <div className="text-[7px] font-bold text-zinc-600 uppercase tracking-widest border-b border-zinc-900 pb-1 flex justify-between">
                  <span>Autofill settings</span>
                  <Sliders className="w-2.5 h-2.5 text-zinc-700" />
                </div>
                <div className="space-y-1.5 pt-1">
                  {[["Target:", "Vercel"], ["Length:", "Concise"], ["Tone:", "Professional"]].map(([k, v]) => (
                    <div key={k} className="flex justify-between items-center text-[7px] text-zinc-500">
                      <span>{k}</span><span className="font-mono text-zinc-300">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </ScrollReveal>

        </div>
      </div>
    </section>
  );
}