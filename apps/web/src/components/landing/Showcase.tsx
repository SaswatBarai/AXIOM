"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { ScrollReveal } from "@/components/ScrollReveal";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Upload,
  CheckCircle,
  AlertCircle,
  Search,
  MapPin,
  DollarSign,
  Briefcase,
  Heart,
  Eye,
  CheckCircle2,
  Sparkles,
  ArrowRight
} from "lucide-react";

interface Job {
  id: number;
  company: string;
  title: string;
  matchScore: number;
  location: string;
  salary: string;
  type: string;
  skills: string[];
}

const mockJobs: Job[] = [
  {
    id: 1,
    company: "Vercel",
    title: "Senior Frontend Engineer",
    matchScore: 94,
    location: "Remote, US",
    salary: "$160k - $190k",
    type: "Full-time",
    skills: ["React", "Next.js", "TypeScript"]
  },
  {
    id: 2,
    company: "Stripe",
    title: "Software Engineer (API Platforms)",
    matchScore: 89,
    location: "Hybrid, SF",
    salary: "$175k - $210k",
    type: "Full-time",
    skills: ["Ruby", "Go", "REST APIs"]
  },
  {
    id: 3,
    company: "Linear",
    title: "Product Engineer",
    matchScore: 85,
    location: "Remote, EU/US",
    salary: "$140k - $170k",
    type: "Full-time",
    skills: ["React", "Node.js", "PostgreSQL"]
  }
];

// Smooth ATS score counting animation
function ScoreCounter({ targetScore, isInView }: { targetScore: number; isInView: boolean }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;

    let start = 0;
    const end = targetScore;
    const duration = 1200; // ms
    const increment = end / (duration / 16); // ~60fps

    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [isInView, targetScore]);

  return <span className="text-5xl font-bold tracking-tighter text-white">{count}%</span>;
}

// Left Side: UploadCV Panel Component with cursor Spotlight effect
function UploadCVCard() {
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(cardRef, { once: true, margin: "-80px" });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setCoords({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 12 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col justify-between space-y-8 h-full"
    >
      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 text-zinc-500 font-semibold text-xs uppercase tracking-wider">
          <Sparkles className="w-4 h-4 text-white" />
          <span>CV Parser Engine</span>
        </div>
        <h3 className="text-3xl font-bold text-white tracking-tight leading-tight">
          Analyze your ATS compatibility in seconds
        </h3>
        <p className="text-zinc-400 leading-relaxed text-sm font-normal">
          Our system performs full structural validation, parses formatting anomalies, checks keyword concentrations, and provides actionable metrics to elevate submission scores.
        </p>
      </div>

      {/* Dropzone with grid pattern inside */}
      <div
        onMouseMove={handleMouseMove}
        className="relative overflow-hidden group border border-zinc-800 bg-zinc-900/10 hover:border-zinc-700/80 rounded-2xl p-12 transition-all duration-300 cursor-pointer flex flex-col items-center justify-center min-h-[260px]"
      >
        {/* Dynamic Cursor Spotlight Overlay */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-0"
          style={{
            background: `radial-gradient(300px circle at ${coords.x}px ${coords.y}px, rgba(255,255,255,0.03), transparent 80%)`
          }}
        />
        
        {/* Inner subtle glow and border */}
        <div className="absolute inset-0 border border-transparent group-hover:border-white/5 transition-colors duration-300 rounded-2xl pointer-events-none" />
        
        <div className="flex flex-col items-center text-center space-y-4 z-10 pointer-events-none">
          <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-850 flex items-center justify-center text-zinc-400 group-hover:text-white group-hover:border-zinc-700 group-hover:scale-110 transition-all duration-300 shadow">
            <Upload className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-zinc-200 group-hover:text-white transition-colors duration-300">Drag & drop your resume</p>
            <p className="text-xs text-zinc-500">or click to browse local folders</p>
          </div>
          <Badge variant="outline" className="border-zinc-800 text-[10px] text-zinc-400 font-semibold uppercase tracking-wider bg-zinc-950 px-2.5 py-1">
            PDF, DOCX (MAX 5MB)
          </Badge>
        </div>
      </div>

      <div className="space-y-3 pt-2">
        <div className="flex items-center gap-3 text-sm text-zinc-300">
          <CheckCircle2 className="w-4 h-4 text-white" />
          <span>Instant layout compliance assessments</span>
        </div>
        <div className="flex items-center gap-3 text-sm text-zinc-300">
          <CheckCircle2 className="w-4 h-4 text-white" />
          <span>Advanced semantic skill categorization</span>
        </div>
      </div>
    </motion.div>
  );
}

// Right Side: Score Card Showcase Component
function ScoreShowcaseCard() {
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(cardRef, { once: true, margin: "-80px" });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setCoords({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const strengths = ["React", "Next.js", "TypeScript"];
  const missing = ["Docker", "GraphQL"];

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.08 } }
  };

  const badgeVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 4 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } }
  };

  return (
    <div ref={cardRef} className="flex flex-col gap-6 justify-between h-full">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
        onMouseMove={handleMouseMove}
        className="relative overflow-hidden group border border-zinc-800/80 bg-zinc-900/20 backdrop-blur-md rounded-2xl p-8 shadow-2xl flex-1 flex flex-col justify-center min-h-[300px]"
      >
        {/* Dynamic Cursor Spotlight Overlay */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-0"
          style={{
            background: `radial-gradient(350px circle at ${coords.x}px ${coords.y}px, rgba(255,255,255,0.035), transparent 80%)`
          }}
        />

        <div className="relative z-10 flex items-center justify-between mb-8">
          <span className="text-xs font-semibold text-zinc-400 tracking-widest uppercase">Analysis Overview</span>
          <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold px-2.5 py-1">
            EXCELLENT COMPLIANCE
          </Badge>
        </div>

        {/* Circular Score Instrument */}
        <div className="relative z-10 flex items-center justify-center py-6">
          <div className="relative w-40 h-40">
            <div className="absolute inset-0 bg-white/[0.01] rounded-full blur-sm" />
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="80" cy="80" r="70" fill="none" stroke="#18181b" strokeWidth="4" />
              <motion.circle
                cx="80"
                cy="80"
                r="70"
                fill="none"
                stroke="#ffffff"
                strokeWidth="5"
                initial={{ strokeDasharray: "0 440" }}
                animate={isInView ? { strokeDasharray: `${440 * 0.87} 440` } : { strokeDasharray: "0 440" }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
                strokeLinecap="round"
                className="drop-shadow-[0_0_8px_rgba(255,255,255,0.25)]"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <ScoreCounter targetScore={87} isInView={isInView} />
              <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold mt-1">ATS Score</span>
            </div>
          </div>
        </div>

        {/* Metrics bar */}
        <div className="relative z-10 space-y-2 mt-4">
          <div className="flex justify-between text-xs font-medium">
            <span className="text-zinc-500">Industry benchmark comparison</span>
            <span className="text-zinc-300">Top 10%</span>
          </div>
          <Progress value={isInView ? 87 : 0} className="h-1.5 bg-zinc-800 transition-all duration-1000" />
        </div>
      </motion.div>

      {/* Badges Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Strengths Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1], delay: 0.25 }}
          className="border border-emerald-950/30 bg-emerald-500/[0.02] rounded-2xl p-5 space-y-4"
        >
          <div className="flex items-center gap-2.5 text-emerald-400 font-semibold text-xs uppercase tracking-wider">
            <CheckCircle className="w-4 h-4" />
            <span>Key Strengths</span>
          </div>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className="flex flex-wrap gap-1.5"
          >
            {strengths.map(skill => (
              <motion.span key={skill} variants={badgeVariants}>
                <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/15 transition-colors">
                  {skill}
                </Badge>
              </motion.span>
            ))}
          </motion.div>
        </motion.div>

        {/* Missing Skills Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1], delay: 0.35 }}
          className="border border-amber-950/30 bg-amber-500/[0.02] rounded-2xl p-5 space-y-4"
        >
          <div className="flex items-center gap-2.5 text-amber-400 font-semibold text-xs uppercase tracking-wider">
            <AlertCircle className="w-4 h-4" />
            <span>Missing Skills</span>
          </div>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className="flex flex-wrap gap-1.5"
          >
            {missing.map(skill => (
              <motion.span key={skill} variants={badgeVariants}>
                <Badge className="bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/15 transition-colors">
                  {skill}
                </Badge>
              </motion.span>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

// Smart Search control wrapper with cursor spotlight
function SearchControlWrapper() {
  const cardRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(cardRef, { once: true, margin: "-80px" });
  const [coords, setCoords] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setCoords({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 12 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      onMouseMove={handleMouseMove}
      className="relative overflow-hidden group flex flex-col sm:flex-row items-center gap-4 bg-zinc-900/10 border border-zinc-800/80 hover:border-zinc-700/50 p-3 rounded-2xl transition-all duration-300"
    >
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-0"
        style={{
          background: `radial-gradient(350px circle at ${coords.x}px ${coords.y}px, rgba(255,255,255,0.02), transparent 80%)`
        }}
      />
      
      <div className="relative flex-1 w-full z-10">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-500" />
        <Input
          type="text"
          placeholder="Search jobs, skills, locations..."
          className="w-full pl-11 bg-zinc-950 border-zinc-850 h-11 text-zinc-200 focus:border-zinc-700 transition-colors duration-300"
          defaultValue="Frontend Engineer"
          readOnly
        />
      </div>
      <Button className="w-full sm:w-auto bg-white hover:bg-zinc-200 hover:scale-[1.02] text-black px-6 h-11 font-semibold flex items-center gap-1.5 transition-all duration-300 z-10 shadow">
        <Search className="w-4 h-4" />
        <span>Search</span>
      </Button>
    </motion.div>
  );
}

// Single Job Search Card with scroll-reveal and mouse spotlight
function JobCard({ job, delay, saved, onToggleSave }: { job: Job; delay: number; saved: boolean; onToggleSave: (id: number) => void }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(cardRef, { once: true, margin: "-80px" });
  const [coords, setCoords] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setCoords({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 12 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1], delay }}
      onMouseMove={handleMouseMove}
      className="relative overflow-hidden group border border-zinc-850 bg-zinc-900/10 hover:border-zinc-700/80 hover:-translate-y-1 rounded-2xl p-6 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-2xl"
    >
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-0"
        style={{
          background: `radial-gradient(350px circle at ${coords.x}px ${coords.y}px, rgba(255,255,255,0.035), transparent 80%)`
        }}
      />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 bg-zinc-950 border border-zinc-850 text-white font-bold flex items-center justify-center rounded-xl text-sm tracking-wider group-hover:border-zinc-700 group-hover:bg-zinc-900 transition-all duration-300">
              {job.company[0]}
            </div>
            <div>
              <h4 className="text-base sm:text-lg font-bold text-white group-hover:text-zinc-200 transition-colors">
                {job.title}
              </h4>
              <p className="text-sm text-zinc-400 font-medium">{job.company}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-zinc-400">
            <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold px-2 py-0.5 text-[10px] animate-pulse">
              {job.matchScore}% Match
            </Badge>
            <span className="flex items-center gap-1.5 font-medium">
              <MapPin className="w-3.5 h-3.5 text-zinc-500" /> {job.location}
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <DollarSign className="w-3.5 h-3.5 text-zinc-500" /> {job.salary}
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <Briefcase className="w-3.5 h-3.5 text-zinc-500" /> {job.type}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onToggleSave(job.id);
            }}
            className="border border-zinc-850 hover:bg-zinc-800 text-zinc-400 hover:text-white w-10 h-10 shrink-0 hover:scale-105 active:scale-95 transition-all duration-300"
          >
            <Heart className={`w-4.5 h-4.5 transition-transform duration-350 ${saved ? "fill-white text-white scale-110" : ""}`} />
          </Button>
          <Button variant="secondary" className="bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 text-zinc-100 font-semibold px-5 h-10 flex items-center gap-1.5 hover:scale-102 transition-all duration-300">
            <Eye className="w-4 h-4" />
            <span>Details</span>
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

export function Showcase() {
  const [selectedTab, setSelectedTab] = useState<"resume" | "jobs">("resume");
  const [savedJobs, setSavedJobs] = useState<Record<number, boolean>>({});

  const toggleSaveJob = (id: number) => {
    setSavedJobs(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <section id="showcase" className="py-28 px-6 bg-[#09090b] relative">
      {/* Background radial spotlight grid */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.015)_0%,transparent_60%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-20">
        
        {/* Section Header */}
        <ScrollReveal>
          <div className="text-center space-y-5 max-w-3xl mx-auto">
            <Badge variant="outline" className="border-zinc-800 text-zinc-400 px-3.5 py-1.5 font-medium bg-zinc-900/40 tracking-wide uppercase text-[10px]">
              Interactive Showcase
            </Badge>
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
              See the AXIOM platform in action
            </h2>
            <p className="text-base sm:text-lg text-zinc-400 font-normal leading-relaxed max-w-2xl mx-auto">
              Experience our twin engines: upload your CV to calculate ATS compatibility or query job pools with high-fidelity matching indexes.
            </p>

            {/* Interactive Sliding Switch (Vercel Style) */}
            <div className="inline-flex p-1 bg-zinc-950 border border-zinc-850 rounded-xl mt-8 relative shadow-inner">
              <button
                onClick={() => setSelectedTab("resume")}
                className={`relative z-10 px-8 py-3 text-xs font-semibold tracking-wider uppercase rounded-lg transition-all duration-300 ${
                  selectedTab === "resume" ? "text-black" : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                Resume Analyzer
                {selectedTab === "resume" && (
                  <motion.div
                    layoutId="activeTabControl"
                    className="absolute inset-0 bg-white rounded-lg -z-10 shadow"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
              <button
                onClick={() => setSelectedTab("jobs")}
                className={`relative z-10 px-8 py-3 text-xs font-semibold tracking-wider uppercase rounded-lg transition-all duration-300 ${
                  selectedTab === "jobs" ? "text-black" : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                Smart Job Search
                {selectedTab === "jobs" && (
                  <motion.div
                    layoutId="activeTabControl"
                    className="absolute inset-0 bg-white rounded-lg -z-10 shadow"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            </div>
          </div>
        </ScrollReveal>

        {/* Content Tabs Area */}
        <div className="min-h-[500px] flex items-center justify-center">
          <AnimatePresence mode="wait">
            {selectedTab === "resume" ? (
              /* A. RESUME ANALYZER SHOWCASE */
              <motion.div
                key="resume-showcase"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.4 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-12 w-full items-stretch"
              >
                {/* Left Side: UploadCV Panel */}
                <UploadCVCard />

                {/* Right Side: Score Card Showcase */}
                <ScoreShowcaseCard />
              </motion.div>
            ) : (
              /* B. SMART JOB SEARCH SHOWCASE */
              <motion.div
                key="jobs-showcase"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.4 }}
                className="w-full space-y-6"
              >
                {/* Search control wrapper */}
                <SearchControlWrapper />

                {/* Job Cards */}
                <div className="space-y-4">
                  {mockJobs.map((job, idx) => (
                    <JobCard
                      key={job.id}
                      job={job}
                      delay={idx * 0.1}
                      saved={!!savedJobs[job.id]}
                      onToggleSave={toggleSaveJob}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </section>
  );
}
