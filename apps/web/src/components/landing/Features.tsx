"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { ScrollReveal } from "@/components/ScrollReveal";
import {
  FileText,
  Briefcase,
  MessagesSquare,
  HelpCircle,
  BarChart3,
  PenTool,
  Trello,
  Zap,
  ArrowRight,
  TrendingUp,
  Terminal,
  CheckCircle,
  Play,
  User,
  Sliders,
  Sparkles
} from "lucide-react";

// Animation Variants
const fadeInUp = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } }
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.04
    }
  }
};

export function Features() {
  return (
    <section id="features" className="py-32 px-6 bg-[#09090b] relative overflow-hidden">
      {/* Decorative ambient lights */}
      <div className="absolute top-1/4 left-[-15%] w-[400px] h-[400px] bg-zinc-900/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-[-15%] w-[400px] h-[400px] bg-white/[0.01] rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-20">
        
        {/* Header */}
        <ScrollReveal>
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <Badge variant="outline" className="border-zinc-800 text-zinc-400 px-3.5 py-1.5 font-medium bg-zinc-900/30 tracking-wide uppercase text-[10px]">
              Platform Core
            </Badge>
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
              Designed for the modern professional
            </h2>
            <p className="text-base sm:text-lg text-zinc-400 leading-relaxed max-w-2xl mx-auto">
              Discover a comprehensive suite of AI engines integrated into a unified bento workspace.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[250px]">
          
          {/* Card 1: Resume Analyzer (Col Span: 2, Row Span: 2) */}
          <ScrollReveal className="md:col-span-2 md:row-span-2 group">
            <Card className="border border-zinc-800/80 bg-zinc-900/10 rounded-2xl p-8 h-full flex flex-col justify-between hover:border-zinc-700 hover:bg-zinc-900/25 transition-all duration-300 overflow-hidden relative">
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 h-full">
                
                {/* Left side details */}
                <div className="lg:col-span-2 flex flex-col justify-between h-full space-y-6">
                  <div className="space-y-4">
                    <div className="w-12 h-12 rounded-xl bg-zinc-800/80 flex items-center justify-center text-white">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold text-white">Resume Analyzer</h3>
                      <p className="text-sm text-zinc-400 leading-relaxed font-normal">
                        Checks layout compliance, extracts technical skills semantically, and calculates instantaneous ATS scoring recommendations.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1.5 text-xs text-zinc-500 group-hover:text-white transition-colors duration-300 font-semibold cursor-pointer">
                    <span>Analyze Resume</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>

                {/* Right side high-fidelity resume scanner mockup */}
                <div className="lg:col-span-3 h-full bg-zinc-950/40 rounded-xl border border-zinc-900 p-5 flex flex-col justify-between font-mono text-[9px] text-zinc-500 overflow-hidden relative">
                  {/* Scanner neon line */}
                  <motion.div 
                    className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-white/40 to-transparent z-10"
                    animate={{ top: ["10%", "90%", "10%"] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  />

                  {/* Header sheet mock */}
                  <div className="space-y-4">
                    <div className="flex justify-between border-b border-zinc-900 pb-3 text-[10px] font-semibold text-zinc-400">
                      <span>CV_PARSED_2026.pdf</span>
                      <span className="text-emerald-400 font-bold">READY</span>
                    </div>

                    <div className="space-y-2 font-sans text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] text-white">JD</div>
                        <div>
                          <p className="font-bold text-white text-[11px] leading-none">John Doe</p>
                          <p className="text-[9px] text-zinc-500 leading-none mt-1">Senior Data Engineer</p>
                        </div>
                      </div>
                      
                      <div className="space-y-1.5 pt-2 text-[10px]">
                        <p className="text-zinc-400"><span className="text-zinc-650 font-mono">Summary:</span> Experienced database architect specializing in large-scale pipelines...</p>
                        <p className="text-zinc-400"><span className="text-zinc-650 font-mono">Skills:</span> Python, SQL, Kafka, Kubernetes, Spark</p>
                      </div>
                    </div>
                  </div>

                  {/* Metrics bar */}
                  <div className="space-y-2 border-t border-zinc-900 pt-3">
                    <div className="flex justify-between text-[10px] font-sans font-medium">
                      <span className="text-zinc-500">Overall Matching Score</span>
                      <span className="text-white font-bold">87%</span>
                    </div>
                    <Progress value={87} className="h-1 bg-zinc-850" />
                  </div>
                </div>

              </div>
            </Card>
          </ScrollReveal>

          {/* Card 2: Semantic Job Match (Col Span: 1, Row Span: 1) */}
          <ScrollReveal className="md:col-span-1 md:row-span-1 group">
            <Card className="border border-zinc-800/80 bg-zinc-900/10 rounded-2xl p-6 h-full flex flex-col justify-between hover:border-zinc-700 hover:bg-zinc-900/25 transition-all duration-300 relative overflow-hidden">
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-lg bg-zinc-800/80 flex items-center justify-center text-white">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-base font-bold text-white">Semantic Job Match</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed font-normal">
                    Queries databases with vector matching indices instead of loose tag strings.
                  </p>
                </div>
              </div>
              
              {/* Graphic Match tag */}
              <div className="flex justify-between items-center bg-zinc-950/40 border border-zinc-900 rounded-lg p-2.5 px-3 text-[10px]">
                <span className="text-zinc-400 font-medium">Match Accuracy</span>
                <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-bold">92% MATCH</Badge>
              </div>
            </Card>
          </ScrollReveal>

          {/* Card 3: Skill Gap Detection (Col Span: 1, Row Span: 1) */}
          <ScrollReveal className="md:col-span-1 md:row-span-1 group">
            <Card className="border border-zinc-800/80 bg-zinc-900/10 rounded-2xl p-6 h-full flex flex-col justify-between hover:border-zinc-700 hover:bg-zinc-900/25 transition-all duration-300 relative overflow-hidden">
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-lg bg-zinc-800/80 flex items-center justify-center text-white">
                  <Zap className="w-5 h-5" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-base font-bold text-white">Skill Gap Detection</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed font-normal">
                    Audit skill discrepancies between profile descriptions and live listing markets.
                  </p>
                </div>
              </div>

              {/* Checked/unchecked rows */}
              <div className="flex justify-between items-center bg-zinc-950/40 border border-zinc-900 rounded-lg p-2.5 px-4 text-[10px] text-zinc-400">
                <span className="flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> React</span>
                <span className="flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5 text-zinc-650" /> Docker</span>
              </div>
            </Card>
          </ScrollReveal>

          {/* Card 4: AI Career Copilot (Col Span: 1, Row Span: 2) */}
          <ScrollReveal className="md:col-span-1 md:row-span-2 group">
            <Card className="border border-zinc-800/80 bg-zinc-900/10 rounded-2xl p-6 h-full flex flex-col justify-between hover:border-zinc-700 hover:bg-zinc-900/25 transition-all duration-300 relative overflow-hidden">
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-lg bg-zinc-800/80 flex items-center justify-center text-white">
                  <MessagesSquare className="w-5 h-5" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-lg font-bold text-white">AI Career Copilot</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed font-normal">
                    Draft response emails, request adjustments, and strategize compensation parameters with a dedicated language model.
                  </p>
                </div>
              </div>

              {/* Taller Chat Bubbles Graphic Mockup */}
              <div className="flex-1 bg-zinc-950/40 rounded-xl border border-zinc-900 p-4 mt-6 space-y-4 font-normal text-[10px] flex flex-col justify-end min-h-[220px]">
                <div className="space-y-1 flex flex-col items-start">
                  <span className="text-[8px] text-zinc-600 font-semibold uppercase tracking-wider pl-1">John Doe</span>
                  <div className="bg-zinc-900/80 text-zinc-300 rounded-2xl rounded-tl-none p-3 border border-zinc-800/40">
                    How should I pitch my remote schedule proposal?
                  </div>
                </div>
                
                <div className="space-y-1 flex flex-col items-end">
                  <span className="text-[8px] text-zinc-600 font-semibold uppercase tracking-wider pr-1">Copilot</span>
                  <div className="bg-white text-black rounded-2xl rounded-tr-none p-3">
                    Focus on delivery metrics. Pitch a trial schedule linked to milestone reviews to reduce friction.
                  </div>
                </div>
              </div>
            </Card>
          </ScrollReveal>

          {/* Card 5: Application Tracker (Col Span: 2, Row Span: 1) */}
          <ScrollReveal className="md:col-span-2 md:row-span-1 group">
            <Card className="border border-zinc-800/80 bg-zinc-900/10 rounded-2xl p-6 h-full flex flex-col md:flex-row justify-between gap-6 hover:border-zinc-700 hover:bg-zinc-900/25 transition-all duration-300 overflow-hidden relative">
              <div className="flex flex-col justify-between flex-1 space-y-4">
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-lg bg-zinc-800/80 flex items-center justify-center text-white mb-2">
                    <Trello className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-white">Application Tracker</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed font-normal max-w-sm">
                    Auto-organize application files, interview calls, and salary parameters in an interactive board layout.
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-zinc-500 group-hover:text-white transition-colors duration-300 font-semibold cursor-pointer">
                  <span>Open Kanban Board</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>

              {/* Graphic Kanban mockup */}
              <div className="w-full md:w-60 h-32 md:h-full bg-zinc-950/40 rounded-xl border border-zinc-900 p-3.5 flex gap-2.5 shrink-0 overflow-hidden">
                {/* Column 1 */}
                <div className="flex-1 flex flex-col gap-1.5">
                  <span className="text-[7px] font-bold text-zinc-500 uppercase tracking-wider border-b border-zinc-900 pb-1">Applied (2)</span>
                  <div className="bg-zinc-900/60 border border-zinc-800 rounded p-1.5 space-y-1">
                    <div className="text-[7px] font-bold text-white leading-none">Stripe</div>
                    <div className="text-[6px] text-zinc-500">API Engineer</div>
                  </div>
                </div>
                {/* Column 2 */}
                <div className="flex-1 flex flex-col gap-1.5">
                  <span className="text-[7px] font-bold text-zinc-500 uppercase tracking-wider border-b border-zinc-900 pb-1">Interviews (1)</span>
                  <div className="bg-zinc-900/60 border border-zinc-800 rounded p-1.5 space-y-1 border-l-2 border-l-white">
                    <div className="text-[7px] font-bold text-white leading-none">Vercel</div>
                    <div className="text-[6px] text-zinc-500">Frontend role</div>
                  </div>
                </div>
              </div>
            </Card>
          </ScrollReveal>

          {/* Card 6: Analytics Dashboard (Col Span: 2, Row Span: 1) */}
          <ScrollReveal className="md:col-span-2 md:row-span-1 group">
            <Card className="border border-zinc-800/80 bg-zinc-900/10 rounded-2xl p-6 h-full flex flex-col md:flex-row justify-between gap-6 hover:border-zinc-700 hover:bg-zinc-900/25 transition-all duration-300 overflow-hidden relative">
              <div className="flex flex-col justify-between flex-1 space-y-4">
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-lg bg-zinc-800/80 flex items-center justify-center text-white mb-2">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-white">Analytics Dashboard</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed font-normal max-w-sm">
                    Assess response rates, track pipeline conversion levels, and analyze average match trends.
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-zinc-500 group-hover:text-white transition-colors duration-300 font-semibold cursor-pointer">
                  <span>View Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>

              {/* Sparkline graphics & Mini stats side-by-side */}
              <div className="w-full md:w-64 h-32 md:h-full bg-zinc-950/40 rounded-xl border border-zinc-900 p-4 flex flex-col justify-between shrink-0 overflow-hidden">
                <div className="flex justify-between items-center text-[8px] font-bold text-zinc-500 uppercase tracking-wider border-b border-zinc-900 pb-1.5">
                  <span>Conversion Curve</span>
                  <span className="text-emerald-400 font-bold">+18%</span>
                </div>
                
                {/* Horizontal bars chart preview */}
                <div className="flex items-end justify-between gap-1.5 h-16 pt-2">
                  {[25, 45, 30, 65, 55, 70, 95, 80].map((val, i) => (
                    <motion.div
                      key={i}
                      className="bg-white/80 rounded-sm w-full"
                      initial={{ height: 0 }}
                      whileInView={{ height: `${val}%` }}
                      transition={{ duration: 0.6, delay: i * 0.05 }}
                    />
                  ))}
                </div>
              </div>
            </Card>
          </ScrollReveal>

          {/* Card 7: Interview Prep (Col Span: 1, Row Span: 1) */}
          <ScrollReveal className="md:col-span-1 md:row-span-1 group">
            <Card className="border border-zinc-800/80 bg-zinc-900/10 rounded-2xl p-6 h-full flex flex-col justify-between hover:border-zinc-700 hover:bg-zinc-900/25 transition-all duration-300 relative overflow-hidden">
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-lg bg-zinc-800/80 flex items-center justify-center text-white">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-base font-bold text-white">Interview Prep</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed font-normal">
                    Review generated mock questions tailored specifically to each parsed target role.
                  </p>
                </div>
              </div>

              {/* Prep graphic */}
              <div className="flex items-center gap-2 bg-zinc-950/40 border border-zinc-900 rounded-lg p-2.5 text-[10px] text-zinc-400">
                <Play className="w-3.5 h-3.5 text-white fill-white shrink-0" />
                <span className="truncate">Simulating: Behavioral Panel</span>
              </div>
            </Card>
          </ScrollReveal>

          {/* Card 8: Cover Letter Builder (Col Span: 2, Row Span: 1) */}
          <ScrollReveal className="md:col-span-2 md:row-span-1 group">
            <Card className="border border-zinc-800/80 bg-zinc-900/10 rounded-2xl p-6 h-full flex flex-col md:flex-row justify-between gap-6 hover:border-zinc-700 hover:bg-zinc-900/25 transition-all duration-300 overflow-hidden relative">
              <div className="flex flex-col justify-between flex-1 space-y-4">
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-lg bg-zinc-800/80 flex items-center justify-center text-white mb-2">
                    <PenTool className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-white">Cover Letter Builder</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed font-normal max-w-sm">
                    Generate targeted, persuasive cover letters matching job descriptions in under a minute.
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-zinc-500 group-hover:text-white transition-colors duration-300 font-semibold cursor-pointer">
                  <span>Build Cover Letter</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>

              {/* Graphic Mockup: side settings + document page preview */}
              <div className="w-full md:w-56 h-32 md:h-full bg-zinc-950/40 rounded-xl border border-zinc-900 p-4 shrink-0 flex flex-col justify-between space-y-2 overflow-hidden">
                <div className="text-[7px] font-bold text-zinc-500 uppercase tracking-widest border-b border-zinc-900 pb-1 flex justify-between">
                  <span>Autofill settings</span>
                  <Sliders className="w-2.5 h-2.5 text-zinc-650" />
                </div>
                
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between items-center text-[7px] text-zinc-400">
                    <span>Target:</span> <span className="font-mono text-white">Vercel</span>
                  </div>
                  <div className="flex justify-between items-center text-[7px] text-zinc-400">
                    <span>Length:</span> <span className="font-mono text-white">Concise</span>
                  </div>
                  <div className="flex justify-between items-center text-[7px] text-zinc-400">
                    <span>Tone:</span> <span className="font-mono text-white">Professional</span>
                  </div>
                </div>
              </div>
            </Card>
          </ScrollReveal>

        </div>
      </div>
    </section>
  );
}
