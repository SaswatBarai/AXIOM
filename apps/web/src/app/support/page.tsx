"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { SmoothScroll } from "@/components/SmoothScroll";
import { 
  HelpCircle, ShieldCheck, ArrowRight, CheckCircle2, 
  Sparkles, User, Mail, AlertTriangle,
  ChevronDown, ChevronUp, Search, RefreshCw, Clock,
  Check, AlertCircle, FileText, Briefcase, GraduationCap,
  MessageSquare, DollarSign, Settings, Eye, Info
} from "lucide-react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Help Categories for quick reference
const HELP_CATEGORIES = [
  {
    icon: FileText,
    title: "Resume Parsing",
    desc: "Having issues scanning your CV or extracting skills? Learn file requirements.",
  },
  {
    icon: Briefcase,
    title: "Compatibility Scores",
    desc: "Understand how our AI calculates job matches and how to improve your scores.",
  },
  {
    icon: DollarSign,
    title: "Billing & Axiom Pro",
    desc: "Manage subscriptions, update payment methods, or request invoice trace records.",
  },
  {
    icon: Settings,
    title: "Account Settings",
    desc: "Update your profile, change passwords, delete account data, or check security.",
  },
];

// User FAQs
interface FaqItem {
  category: string;
  q: string;
  a: string;
}

const FAQ_DATA: FaqItem[] = [
  {
    category: "parsing",
    q: "Why is my PDF resume returning a parsing error or missing skills?",
    a: "This usually occurs if your PDF file is a flattened image (like a scan or a photo of your resume) rather than a text document. Our AI parser requires readable text blocks to parse. To resolve this, save your resume directly as a text-based PDF from Microsoft Word, Canva, or Google Docs, and try uploading it again."
  },
  {
    category: "matching",
    q: "How does the AI calculate my Job Compatibility Score?",
    a: "Axiom compares your resume against job listings using a semantic neural network. Instead of simply counting keywords, it checks for skill adjacencies, project scope, and overall career path alignment. This gives you a realistic view of how a hiring manager's screening filter will evaluate your profile."
  },
  {
    category: "billing",
    q: "Is there a free trial and how do I upgrade to Axiom Pro?",
    a: "Yes! Every account starts with free credits to scan and match up to 5 jobs. To unlock unlimited scans, deep semantic matching for up to 100 jobs at a time, interactive mock interview practice, and personalized career roadmaps, click the 'Upgrade' button in your dashboard settings."
  },
  {
    category: "security",
    q: "Is my personal data and resume history kept confidential?",
    a: "Absolutely. We encrypt all uploaded resumes at rest using AES-256 and in transit via TLS 1.3. Your documents are strictly private to your account and are never shared with third-party advertisers. You can permanently delete any uploaded resume or close your account at any time from your settings panel."
  },
  {
    category: "parsing",
    q: "What formatting layout should I use for the best ATS compatibility?",
    a: "We recommend a clean, single-column layout with standard headings (e.g., 'Work Experience', 'Skills', 'Education'). Avoid putting critical details inside complex layouts, headers, footers, or floating text boxes, as some screening parsers might miss them."
  },
  {
    category: "matching",
    q: "Why are my recommended jobs not updating after updating my CV?",
    a: "Recommended jobs are re-indexed based on your active resume. If you just uploaded a new CV, the recommendations dashboard should refresh within a few seconds. If it doesn't, try reloading your dashboard page or verify that your new resume is selected as the primary document."
  }
];

export default function SupportPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const inView = useInView(containerRef, { once: true, margin: "-60px" });

  const [activeTab, setActiveTab] = useState<"faq" | "wizard" | "ticket" | "status">("faq");

  // FAQ Tab Search state
  const [faqSearch, setFaqSearch] = useState("");
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  // Ticket Form States
  const [ticketTopic, setTicketTopic] = useState("parsing");
  const [ticketState, setTicketState] = useState<"form" | "submitting" | "success">("form");
  const [ticketNum, setTicketNum] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  // Resume Troubleshooter Wizard States
  const [wizardStep, setWizardStep] = useState(1); // 1: Issue, 2: Document Check, 3: Analysis, 4: Solution
  const [troubleIssue, setTroubleIssue] = useState<"parse_error" | "missing_skills" | "low_score" | "billing" | null>(null);
  const [docFormat, setDocFormat] = useState<"text_pdf" | "scanned_pdf" | "docx" | "image" | null>(null);
  const [columnLayout, setColumnLayout] = useState<"single" | "multi" | null>(null);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisLogs, setAnalysisLogs] = useState<string[]>([]);

  // Simulated analysis logic for Troubleshooter
  const startTroubleshooterAnalysis = () => {
    setWizardStep(3);
    setAnalysisProgress(0);
    setAnalysisLogs([]);

    const logs = [
      "Reading document encoding tags...",
      "Analyzing layout vectors and font packages...",
      "Detecting selectable text layers...",
      "Checking for nested tables and custom graphics...",
      "Testing semantic matching parsing rules...",
      "Analysis complete. Processing solution..."
    ];

    let currentLogIndex = 0;
    const interval = setInterval(() => {
      if (currentLogIndex < logs.length) {
        setAnalysisLogs((prev) => [...prev, logs[currentLogIndex] as string]);
        setAnalysisProgress((prev) => Math.min(100, prev + 18));
        currentLogIndex++;
      } else {
        clearInterval(interval);
        setAnalysisProgress(100);
        setTimeout(() => {
          setWizardStep(4);
        }, 500);
      }
    }, 400);
  };

  const resetTroubleshooter = () => {
    setWizardStep(1);
    setTroubleIssue(null);
    setDocFormat(null);
    setColumnLayout(null);
    setAnalysisProgress(0);
    setAnalysisLogs([]);
  };

  // Filter FAQs
  const filteredFaqs = useMemo(() => {
    if (!faqSearch.trim()) return FAQ_DATA;
    const query = faqSearch.toLowerCase();
    return FAQ_DATA.filter(
      (item) =>
        item.q.toLowerCase().includes(query) || 
        item.a.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query)
    );
  }, [faqSearch]);

  // Handle support request submit
  const handleTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;

    setTicketState("submitting");

    setTimeout(() => {
      setTicketNum(`AXM-${Math.floor(100000 + Math.random() * 900000)}`);
      setTicketState("success");
    }, 1500);
  };

  // Dynamic ticket routing metadata
  const routingMeta = useMemo(() => {
    switch (ticketTopic) {
      case "billing":
        return {
          queue: "Priority Billing Queue",
          time: "< 3 Hours",
          icon: Clock,
          color: "text-brand bg-brand/10 border-brand/20",
          desc: "Billing & transaction inquiries are routed directly to our accounting desk.",
        };
      case "parsing":
      case "matching":
        return {
          queue: "Resume AI Technical Queue",
          time: "< 12 Hours",
          icon: ShieldCheck,
          color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
          desc: "Document parsing or AI scoring issues are sent directly to engineering supervisors.",
        };
      default:
        return {
          queue: "General Help Desk",
          time: "< 24 Hours",
          icon: MessageSquare,
          color: "text-zinc-400 bg-zinc-900/60 border-zinc-800",
          desc: "General inquiries are responded to chronologically by our support staff.",
        };
    }
  }, [ticketTopic]);

  const tabItems = [
    { id: "faq", label: "Help Center FAQs", icon: HelpCircle },
    { id: "wizard", label: "Troubleshooter", icon: Sparkles },
    { id: "ticket", label: "Submit Request", icon: MessageSquare },
    { id: "status", label: "System Status", icon: ShieldCheck },
  ] as const;

  return (
    <SmoothScroll>
      <main className="min-h-screen bg-black text-white relative">
        <Navbar />

        {/* Ambient background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[10%] left-[10%] w-[450px] h-[450px] bg-brand/5 rounded-full blur-[120px] opacity-40" />
          <div className="absolute bottom-[20%] right-[10%] w-[550px] h-[550px] bg-yellow-500/5 rounded-full blur-[140px] opacity-35" />
        </div>

        {/* Layout Separator */}
        <div className="absolute top-16 inset-x-0 h-px bg-gradient-to-r from-transparent via-zinc-800/60 to-transparent" />

        <div className="max-w-6xl mx-auto px-6 py-20 relative z-10" ref={containerRef}>
          
          {/* Header Hero */}
          <div className="max-w-3xl mb-12 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand/10 border border-brand/20 rounded-full text-xs font-semibold text-brand">
              <GraduationCap className="w-3.5 h-3.5" />
              Axiom Customer Desk
            </div>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white leading-tight">
              How can we help you today?
            </h1>
            <p className="text-sm text-zinc-400 leading-relaxed max-w-xl">
              Find answers instantly, solve file parsing issues with our interactive Troubleshooter, or contact our support team directly.
            </p>
          </div>

          {/* Quick Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
            {HELP_CATEGORIES.map((cat, idx) => (
              <Card 
                key={idx} 
                className="bg-zinc-950/40 border-zinc-800/80 hover:border-brand/20 transition-all duration-300 p-5 space-y-3 group"
              >
                <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-brand group-hover:border-brand/10 transition-colors duration-200">
                  <cat.icon className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xs font-bold text-white group-hover:text-brand transition-colors duration-200">
                    {cat.title}
                  </h3>
                  <p className="text-[11px] text-zinc-500 leading-relaxed">
                    {cat.desc}
                  </p>
                </div>
              </Card>
            ))}
          </div>

          {/* Main Layout Card */}
          <Card className="border-zinc-800/80 bg-zinc-950/35 backdrop-blur-md rounded-2xl overflow-hidden shadow-2xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[550px]">
              
              {/* Tab Navigation Sidebar */}
              <div className="lg:col-span-3 border-b lg:border-b-0 lg:border-r border-zinc-900 bg-zinc-950/60 p-6 space-y-6">
                <div className="space-y-1 hidden lg:block">
                  <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest block">Navigation</span>
                  <p className="text-[11px] text-zinc-500">Select a tool to get assistance.</p>
                </div>

                <div className="flex lg:flex-col overflow-x-auto lg:overflow-x-visible gap-1.5 pb-2 lg:pb-0 scrollbar-none">
                  {tabItems.map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => {
                          setActiveTab(tab.id);
                          if (tab.id === "wizard") resetTroubleshooter();
                        }}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer transition-all duration-200 relative w-full ${
                          isActive 
                            ? "text-black bg-brand" 
                            : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/30"
                        }`}
                      >
                        {isActive && (
                          <motion.div 
                            layoutId="active_support_tab"
                            className="absolute inset-0 rounded-xl bg-brand z-0"
                            transition={{ type: "spring", stiffness: 350, damping: 28 }}
                          />
                        )}
                        <tab.icon className="w-4 h-4 relative z-10 shrink-0" />
                        <span className="relative z-10">{tab.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Central Details Pane */}
              <div className="lg:col-span-9 p-6 md:p-8 flex flex-col justify-between">
                <AnimatePresence mode="wait">
                  
                  {/* TAB 1: Searchable FAQ */}
                  {activeTab === "faq" && (
                    <motion.div
                      key="faq"
                      initial={{ opacity: 0, x: 6 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -6 }}
                      className="space-y-6"
                    >
                      <div className="border-b border-zinc-900 pb-4">
                        <CardTitle className="text-xl font-bold text-white">Frequently Asked Questions</CardTitle>
                        <CardDescription className="text-xs text-zinc-500 mt-1">
                          Browse general questions about CV formatting, matches, and account billing.
                        </CardDescription>
                      </div>

                      {/* FAQ Search */}
                      <div className="relative">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                        <Input
                          placeholder="Search parsing errors, scores, subscription upgrades..."
                          value={faqSearch}
                          onChange={(e) => setFaqSearch(e.target.value)}
                          className="bg-zinc-950 border-zinc-900 hover:border-zinc-800 text-xs rounded-xl h-10 pl-10 text-white placeholder:text-zinc-600 focus:border-brand/40"
                        />
                      </div>

                      {/* FAQ Items */}
                      <div className="space-y-3">
                        {filteredFaqs.length > 0 ? (
                          filteredFaqs.map((faq, idx) => {
                            const isFaqExpanded = expandedFaq === idx;
                            return (
                              <div
                                key={faq.q}
                                className={`rounded-xl border transition-all duration-300 ${
                                  isFaqExpanded
                                    ? "border-brand bg-brand/[0.01]"
                                    : "border-zinc-900 bg-zinc-900/5 hover:border-zinc-850"
                                }`}
                              >
                                <button
                                  onClick={() => setExpandedFaq(isFaqExpanded ? null : idx)}
                                  className="w-full p-4.5 text-left flex items-start justify-between gap-4 cursor-pointer"
                                >
                                  <span className="text-xs font-bold text-zinc-200 hover:text-white transition-colors">
                                    {faq.q}
                                  </span>
                                  <span className="p-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 shrink-0">
                                    {isFaqExpanded ? (
                                      <ChevronUp className="w-3.5 h-3.5 text-brand" />
                                    ) : (
                                      <ChevronDown className="w-3.5 h-3.5" />
                                    )}
                                  </span>
                                </button>

                                <AnimatePresence initial={false}>
                                  {isFaqExpanded && (
                                    <motion.div
                                      initial={{ height: 0, opacity: 0 }}
                                      animate={{ height: "auto", opacity: 1 }}
                                      exit={{ height: 0, opacity: 0 }}
                                      transition={{ duration: 0.2 }}
                                      className="overflow-hidden border-t border-zinc-900/60"
                                    >
                                      <p className="p-4.5 text-xs text-zinc-450 leading-relaxed font-medium">
                                        {faq.a}
                                      </p>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            );
                          })
                        ) : (
                          <div className="p-10 text-center border border-dashed border-zinc-900 rounded-xl text-xs text-zinc-550">
                            No FAQ matches found for "{faqSearch}". Try searching for another topic.
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {/* TAB 2: Troubleshooter Wizard */}
                  {activeTab === "wizard" && (
                    <motion.div
                      key="wizard"
                      initial={{ opacity: 0, x: 6 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -6 }}
                      className="space-y-6"
                    >
                      <div className="border-b border-zinc-900 pb-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                              <Sparkles className="w-5 h-5 text-brand" />
                              Interactive Resume Troubleshooter
                            </CardTitle>
                            <CardDescription className="text-xs text-zinc-500 mt-1">
                              Diagnose document parsing errors and improve your match scores step-by-step.
                            </CardDescription>
                          </div>
                          {wizardStep > 1 && (
                            <button
                              onClick={resetTroubleshooter}
                              className="text-[10px] text-zinc-500 hover:text-brand hover:underline font-bold transition-colors cursor-pointer"
                            >
                              Restart Scanner
                            </button>
                          )}
                        </div>
                      </div>

                      {/* STEP 1: Select the main issue */}
                      {wizardStep === 1 && (
                        <div className="space-y-4">
                          <Label className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-500">
                            Step 1: Choose the issue you are experiencing
                          </Label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <button
                              onClick={() => {
                                setTroubleIssue("parse_error");
                                setWizardStep(2);
                              }}
                              className="p-4 rounded-xl border border-zinc-900 bg-zinc-900/10 hover:border-brand/40 text-left transition-all duration-300 group cursor-pointer"
                            >
                              <span className="block text-xs font-bold text-white group-hover:text-brand transition-colors">
                                Resume Parsing Failure
                              </span>
                              <span className="block text-[10px] text-zinc-500 mt-1 leading-normal">
                                The parser throws an error during upload or extracts empty/jumbled values.
                              </span>
                            </button>

                            <button
                              onClick={() => {
                                setTroubleIssue("missing_skills");
                                setWizardStep(2);
                              }}
                              className="p-4 rounded-xl border border-zinc-900 bg-zinc-900/10 hover:border-brand/40 text-left transition-all duration-300 group cursor-pointer"
                            >
                              <span className="block text-xs font-bold text-white group-hover:text-brand transition-colors">
                                Missing Skills & Core History
                              </span>
                              <span className="block text-[10px] text-zinc-500 mt-1 leading-normal">
                                Upload succeeds, but key skills or work history are omitted from your profile.
                              </span>
                            </button>

                            <button
                              onClick={() => {
                                setTroubleIssue("low_score");
                                setWizardStep(2);
                              }}
                              className="p-4 rounded-xl border border-zinc-900 bg-zinc-900/10 hover:border-brand/40 text-left transition-all duration-300 group cursor-pointer"
                            >
                              <span className="block text-xs font-bold text-white group-hover:text-brand transition-colors">
                                Lower compatibility scores than expected
                              </span>
                              <span className="block text-[10px] text-zinc-500 mt-1 leading-normal">
                                You are highly qualified, but the semantic matcher scores the job match low.
                              </span>
                            </button>

                            <button
                              onClick={() => {
                                setTroubleIssue("billing");
                                setWizardStep(2);
                              }}
                              className="p-4 rounded-xl border border-zinc-900 bg-zinc-900/10 hover:border-brand/40 text-left transition-all duration-300 group cursor-pointer"
                            >
                              <span className="block text-xs font-bold text-white group-hover:text-brand transition-colors">
                                Pro billing or plan issues
                              </span>
                              <span className="block text-[10px] text-zinc-500 mt-1 leading-normal">
                                Account credits did not update, payment decline, or invoice trace requests.
                              </span>
                            </button>
                          </div>
                        </div>
                      )}

                      {/* STEP 2: Choose File format / layout Details */}
                      {wizardStep === 2 && (
                        <div className="space-y-5">
                          {troubleIssue !== "billing" ? (
                            <>
                              <div className="space-y-3.5">
                                <Label className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-500">
                                  Step 2: Tell us about your resume file format
                                </Label>
                                <div className="grid grid-cols-2 gap-3">
                                  <button
                                    onClick={() => setDocFormat("text_pdf")}
                                    className={`p-3 rounded-xl border text-center text-xs font-bold cursor-pointer transition-all ${
                                      docFormat === "text_pdf" 
                                        ? "border-brand bg-brand/5 text-brand" 
                                        : "border-zinc-900 bg-zinc-900/20 hover:border-zinc-800 text-white"
                                    }`}
                                  >
                                    Text-based PDF
                                  </button>
                                  <button
                                    onClick={() => setDocFormat("scanned_pdf")}
                                    className={`p-3 rounded-xl border text-center text-xs font-bold cursor-pointer transition-all ${
                                      docFormat === "scanned_pdf" 
                                        ? "border-brand bg-brand/5 text-brand" 
                                        : "border-zinc-900 bg-zinc-900/20 hover:border-zinc-805 text-white"
                                    }`}
                                  >
                                    Scanned PDF / Image PDF
                                  </button>
                                  <button
                                    onClick={() => setDocFormat("docx")}
                                    className={`p-3 rounded-xl border text-center text-xs font-bold cursor-pointer transition-all ${
                                      docFormat === "docx" 
                                        ? "border-brand bg-brand/5 text-brand" 
                                        : "border-zinc-900 bg-zinc-900/20 hover:border-zinc-805 text-white"
                                    }`}
                                  >
                                    Word Document (.docx)
                                  </button>
                                  <button
                                    onClick={() => setDocFormat("image")}
                                    className={`p-3 rounded-xl border text-center text-xs font-bold cursor-pointer transition-all ${
                                      docFormat === "image" 
                                        ? "border-brand bg-brand/5 text-brand" 
                                        : "border-zinc-900 bg-zinc-900/20 hover:border-zinc-805 text-white"
                                    }`}
                                  >
                                    JPG / PNG Image
                                  </button>
                                </div>
                              </div>

                              <div className="space-y-3.5">
                                <Label className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-500">
                                  How is your resume page laid out?
                                </Label>
                                <div className="grid grid-cols-2 gap-3">
                                  <button
                                    onClick={() => setColumnLayout("single")}
                                    className={`p-3 rounded-xl border text-center text-xs font-bold cursor-pointer transition-all ${
                                      columnLayout === "single" 
                                        ? "border-brand bg-brand/5 text-brand" 
                                        : "border-zinc-900 bg-zinc-900/20 hover:border-zinc-800 text-white"
                                    }`}
                                  >
                                    Single-Column Layout
                                  </button>
                                  <button
                                    onClick={() => setColumnLayout("multi")}
                                    className={`p-3 rounded-xl border text-center text-xs font-bold cursor-pointer transition-all ${
                                      columnLayout === "multi" 
                                        ? "border-brand bg-brand/5 text-brand" 
                                        : "border-zinc-900 bg-zinc-900/20 hover:border-zinc-800 text-white"
                                    }`}
                                  >
                                    Multi-Column / Design Tables
                                  </button>
                                </div>
                              </div>

                              <Button
                                disabled={!docFormat || !columnLayout}
                                onClick={startTroubleshooterAnalysis}
                                className="w-full bg-brand hover:bg-brand-hover text-black font-bold rounded-xl h-10 mt-3"
                              >
                                Run File Layout Audit
                                <ArrowRight className="w-4 h-4 ml-1.5" />
                              </Button>
                            </>
                          ) : (
                            <div className="space-y-4">
                              <div className="p-4 bg-zinc-900/20 border border-zinc-900 rounded-xl space-y-2 text-xs">
                                <p className="font-bold text-white flex items-center gap-1.5">
                                  <Info className="w-4 h-4 text-brand" /> Billing & Payment Help
                                </p>
                                <p className="text-zinc-400 leading-relaxed font-medium">
                                  Billing queries are immediately directed to our priority customer queue. If your payment failed, or your credits haven't updated, please submit a ticket directly.
                                </p>
                              </div>
                              <Button
                                onClick={() => setActiveTab("ticket")}
                                className="w-full bg-brand hover:bg-brand-hover text-black font-bold rounded-xl h-10"
                              >
                                Go to Ticket Submission Form
                              </Button>
                            </div>
                          )}
                        </div>
                      )}

                      {/* STEP 3: Simulated scanner audit */}
                      {wizardStep === 3 && (
                        <div className="space-y-5 py-6">
                          <div className="space-y-2 text-center">
                            <RefreshCw className="w-8 h-8 text-brand animate-spin mx-auto mb-2" />
                            <h3 className="text-xs font-bold text-white">Auditing Resume Variables</h3>
                            <p className="text-[11px] text-zinc-500 max-w-xs mx-auto">Analyzing structure, extraction markers, and OCR layer alignment.</p>
                          </div>
                          
                          <div className="space-y-1">
                            <Progress value={analysisProgress} className="h-1 bg-zinc-900" />
                            <div className="flex justify-between text-[9px] text-zinc-500 font-mono">
                              <span>Sweeping document layers</span>
                              <span>{Math.round(analysisProgress)}%</span>
                            </div>
                          </div>

                          <div className="font-mono text-[9px] bg-zinc-950 p-4 rounded-xl border border-zinc-900 text-zinc-550 space-y-1.5 max-h-[150px] overflow-y-auto">
                            {analysisLogs.map((log, idx) => (
                              <div key={idx} className={idx === analysisLogs.length - 1 ? "text-brand font-semibold" : "text-zinc-500"}>
                                {log}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* STEP 4: Solutions and Recommendations */}
                      {wizardStep === 4 && (
                        <div className="space-y-5">
                          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4.5 rounded-xl flex items-start gap-3 text-xs leading-normal">
                            <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                            <div>
                              <p className="font-bold text-white">Diagnostics Completed Successfully</p>
                              <p className="mt-1 text-zinc-400 font-medium">We analyzed your document options. Here is a custom action plan to resolve your issue.</p>
                            </div>
                          </div>

                          {/* Specific Solutions based on wizard inputs */}
                          <div className="space-y-3">
                            <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-500">Your Action Plan</h4>
                            
                            {docFormat === "scanned_pdf" || docFormat === "image" ? (
                              <Card className="border-zinc-900 bg-zinc-900/10 p-4 text-xs leading-normal space-y-2">
                                <p className="font-bold text-white flex items-center gap-1.5">
                                  <AlertCircle className="w-4 h-4 text-yellow-500" /> Convert Scanned Resume to Text PDF
                                </p>
                                <p className="text-zinc-400 font-medium leading-relaxed">
                                  Your resume was uploaded as a flat image or scanned photocopy. The AI parser is unable to extract words cleanly from flat image files.
                                </p>
                                <ul className="list-disc pl-5 text-zinc-500 space-y-1 font-semibold text-[11px] mt-1.5 animate-in fade-in duration-300">
                                  <li>Go back to your CV editor (Microsoft Word, Canva, Google Docs).</li>
                                  <li>Click <b>File &gt; Save As / Export</b> and choose <b>PDF Document</b> (do not print to scan).</li>
                                  <li>Upload the new text PDF file into your resume page.</li>
                                </ul>
                              </Card>
                            ) : null}

                            {columnLayout === "multi" ? (
                              <Card className="border-zinc-900 bg-zinc-900/10 p-4 text-xs leading-normal space-y-2">
                                <p className="font-bold text-white flex items-center gap-1.5">
                                  <Info className="w-4 h-4 text-brand" /> Multi-Column Table Warning
                                </p>
                                <p className="text-zinc-400 font-medium leading-relaxed">
                                  Multi-column layouts with tables or graphics often read out of order. This leads to critical skills or experience blocks getting parsed incorrectly or excluded.
                                </p>
                                <ul className="list-disc pl-5 text-zinc-500 space-y-1 font-semibold text-[11px] mt-1.5">
                                  <li>Try to structure your document in a clean, top-to-bottom single-column flow.</li>
                                  <li>Label sections clearly: "Skills", "Professional History", "Education".</li>
                                  <li>Ensure critical tools/frameworks are listed directly on the page text, rather than inside stylized graphics or shapes.</li>
                                </ul>
                              </Card>
                            ) : null}

                            {troubleIssue === "low_score" ? (
                              <Card className="border-zinc-900 bg-zinc-900/10 p-4 text-xs leading-normal space-y-2">
                                <p className="font-bold text-white flex items-center gap-1.5">
                                  <Sparkles className="w-4 h-4 text-brand" /> How to Improve AI Semantic Scores
                                </p>
                                <p className="text-zinc-400 font-medium leading-relaxed">
                                  Semantic compatibility checking analyzes content relationships. If your score is low:
                                </p>
                                <ul className="list-disc pl-5 text-zinc-500 space-y-1 font-semibold text-[11px] mt-1.5">
                                  <li>Make sure your resume lists the exact core tools, frameworks, and methodologies referenced in the job posting description.</li>
                                  <li>Provide clear metrics for achievements (e.g., "Led team of 4", "Optimized queries by 40%").</li>
                                  <li>Use our <b>AI Copilot</b> chat panel to ask: <i>"Review my resume for [Job Title] and list what gaps I need to address."</i></li>
                                </ul>
                              </Card>
                            ) : null}

                            {troubleIssue === "missing_skills" && docFormat === "text_pdf" && columnLayout === "single" ? (
                              <Card className="border-zinc-900 bg-zinc-900/10 p-4 text-xs leading-normal space-y-2">
                                <p className="font-bold text-white flex items-center gap-1.5">
                                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Layout Looks Good - Add Explicit Headers
                                </p>
                                <p className="text-zinc-400 font-medium leading-relaxed">
                                  Your layout is ideal. If skills are missing, the parsing tags may need simple classification.
                                </p>
                                <ul className="list-disc pl-5 text-zinc-500 space-y-1 font-semibold text-[11px] mt-1.5">
                                  <li>Ensure you have a dedicated section labeled explicitly <b>"Skills"</b> or <b>"Technical Skills"</b>.</li>
                                  <li>Separate your skills with commas or bullets so the scanner groups them as individual parameters.</li>
                                </ul>
                              </Card>
                            ) : null}
                          </div>

                          <div className="flex flex-col sm:flex-row gap-3 pt-3">
                            <Button 
                              onClick={resetTroubleshooter} 
                              className="flex-1 bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-800 rounded-xl text-xs h-10 cursor-pointer"
                            >
                              Troubleshoot Another Issue
                            </Button>
                            <Button 
                              onClick={() => {
                                setMessage(`Troubleshooter details:\nIssue: ${troubleIssue}\nFormat: ${docFormat}\nLayout: ${columnLayout}\n\n[Describe what's still not working]`);
                                setActiveTab("ticket");
                              }} 
                              className="flex-1 bg-brand hover:bg-brand-hover text-black font-bold rounded-xl text-xs h-10 cursor-pointer"
                            >
                              Still Stuck? Submit a Request
                            </Button>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* TAB 3: Contact Form */}
                  {activeTab === "ticket" && (
                    <motion.div
                      key="ticket"
                      initial={{ opacity: 0, x: 6 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -6 }}
                      className="space-y-6"
                    >
                      <div className="border-b border-zinc-900 pb-4">
                        <CardTitle className="text-xl font-bold text-white">Submit Support Request</CardTitle>
                        <CardDescription className="text-xs text-zinc-500 mt-1">
                          Provide your details and we will dispatch a support ticket to our customer care team.
                        </CardDescription>
                      </div>

                      <AnimatePresence mode="wait">
                        {ticketState === "form" && (
                          <form onSubmit={handleTicketSubmit} className="space-y-5">
                            
                            {/* Topic Cards */}
                            <div className="space-y-2.5">
                              <Label className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-500">What do you need help with?</Label>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {[
                                  { id: "parsing", title: "Resume Parser", description: "PDF scanning issues, missing extraction data, upload bugs." },
                                  { id: "matching", title: "Job Matching & Scores", description: "AI score accuracy, job compatibility analysis, results refresh." },
                                  { id: "billing", title: "Billing & Axiom Pro", description: "Pro credits not updated, invoice query, payment declined." },
                                  { id: "other", title: "General Support", description: "Account settings, feature suggestion, or usage queries." }
                                ].map((t) => {
                                  const isSelected = ticketTopic === t.id;
                                  return (
                                    <div
                                      key={t.id}
                                      onClick={() => setTicketTopic(t.id)}
                                      className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all duration-200 ${
                                        isSelected
                                          ? "border-brand bg-brand/[0.02]"
                                          : "border-zinc-900 bg-zinc-900/10 hover:border-zinc-800"
                                      }`}
                                    >
                                      <span className={`block text-xs font-bold transition-colors ${isSelected ? "text-brand" : "text-white"}`}>
                                        {t.title}
                                      </span>
                                      <span className="block text-[10px] text-zinc-500 mt-1 leading-normal">
                                        {t.description}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>

                            {/* User details */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="name" className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-500">Your Full Name</Label>
                                <div className="relative">
                                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                                  <Input
                                    id="name"
                                    required
                                    placeholder="Jane Doe"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="bg-zinc-950/80 border-zinc-900 hover:border-zinc-800 text-xs rounded-xl h-10 pl-10 text-white placeholder:text-zinc-650 focus:border-brand/40"
                                  />
                                </div>
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="email" className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-500">Your Email Address</Label>
                                <div className="relative">
                                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                                  <Input
                                    id="email"
                                    required
                                    type="email"
                                    placeholder="jane@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="bg-zinc-950/80 border-zinc-900 hover:border-zinc-850 text-xs rounded-xl h-10 pl-10 text-white placeholder:text-zinc-650 focus:border-brand/40"
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Issue description */}
                            <div className="space-y-2">
                              <Label htmlFor="issue" className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-500">How can we help you?</Label>
                              <textarea
                                id="issue"
                                required
                                rows={4}
                                placeholder="Please describe the issue in detail. If you got an error, copy and paste it here."
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                className="w-full bg-zinc-950/80 border border-zinc-900 hover:border-zinc-850 focus:border-brand/40 text-zinc-200 text-xs rounded-xl p-4 outline-none transition-colors resize-none font-medium"
                              />
                            </div>

                            {/* Live Support Expectation Info Box */}
                            <div className="bg-zinc-900/10 border border-zinc-900 rounded-xl p-4 space-y-2 text-xs">
                              <div className="flex items-start justify-between gap-4">
                                <div className="space-y-0.5">
                                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-500">Expectation Window</span>
                                  <p className="text-[10px] text-zinc-500 leading-normal max-w-sm">{routingMeta.desc}</p>
                                </div>
                                <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-[9px] font-bold uppercase tracking-wide shrink-0 ${routingMeta.color}`}>
                                  <routingMeta.icon className="w-3.5 h-3.5" />
                                  {routingMeta.queue}
                                </span>
                              </div>
                              <div className="pt-2 border-t border-zinc-900/50 flex justify-between text-[10px] text-zinc-500">
                                <span>Estimated Response Timeline</span>
                                <span className="font-bold text-zinc-400">{routingMeta.time}</span>
                              </div>
                            </div>

                            {/* Submit Button */}
                            <Button 
                              type="submit" 
                              className="w-full bg-brand hover:bg-brand-hover text-black font-extrabold rounded-xl h-11"
                            >
                              Submit Support Request
                              <ArrowRight className="w-4 h-4 ml-1.5" />
                            </Button>
                          </form>
                        )}

                        {ticketState === "submitting" && (
                          <motion.div
                            key="submitting"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="h-[300px] flex flex-col items-center justify-center gap-4 text-center"
                          >
                            <RefreshCw className="w-9 h-9 text-brand animate-spin" />
                            <div>
                              <h3 className="text-xs font-bold text-white">Transmitting ticket logs</h3>
                              <p className="text-[10px] text-zinc-500 mt-1">Connecting to support dispatcher and queue servers...</p>
                            </div>
                          </motion.div>
                        )}

                        {ticketState === "success" && (
                          <motion.div
                            key="success"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="h-[320px] flex flex-col justify-between py-4"
                          >
                            <div className="space-y-4">
                              <div className="w-11 h-11 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center text-brand">
                                <CheckCircle2 className="w-5 h-5" />
                              </div>
                              <div className="space-y-1.5">
                                <h3 className="text-lg font-bold text-white">Support Request Received</h3>
                                <p className="text-xs text-zinc-400 leading-relaxed max-w-md font-medium">
                                  Thank you! Your ticket has been logged in our system. A member of our support team will review your query and contact you at your email address.
                                </p>
                              </div>
                            </div>

                            <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-4.5 flex items-center justify-between">
                              <div>
                                <span className="block text-[8px] font-mono text-zinc-500 uppercase tracking-widest">Inquiry Ticket ID</span>
                                <span className="block text-sm font-mono font-bold text-white mt-1">{ticketNum}</span>
                              </div>
                              <Badge className="bg-brand/10 border-brand/20 text-brand text-[9px] uppercase font-bold px-3 py-1">
                                {routingMeta.queue}
                              </Badge>
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                setTicketState("form");
                                setName("");
                                setEmail("");
                                setMessage("");
                              }}
                              className="text-xs text-brand hover:underline font-bold flex items-center gap-1 w-fit cursor-pointer"
                            >
                              Create another support ticket <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )}

                  {/* TAB 4: System Status & Guides */}
                  {activeTab === "status" && (
                    <motion.div
                      key="status"
                      initial={{ opacity: 0, x: 6 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -6 }}
                      className="space-y-6"
                    >
                      <div className="border-b border-zinc-900 pb-4">
                        <CardTitle className="text-xl font-bold text-white">System Status & Help Guides</CardTitle>
                        <CardDescription className="text-xs text-zinc-500 mt-1">
                          Verify our service performance and read user guides to set up your profile.
                        </CardDescription>
                      </div>

                      {/* User-friendly System Status Grid */}
                      <div className="space-y-3.5">
                        <Label className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-500">Service Status Overview</Label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {[
                            { name: "Resume Parser", status: "Operational", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
                            { name: "Semantic Job Matcher", status: "Operational", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
                            { name: "Career Copilot", status: "Operational", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
                          ].map((svc) => (
                            <div key={svc.name} className="p-4 rounded-xl border border-zinc-900 bg-zinc-900/10 flex items-center justify-between text-xs font-bold">
                              <span className="text-zinc-300">{svc.name}</span>
                              <span className={`px-2 py-0.5 rounded-full border text-[9px] uppercase font-bold tracking-wider ${svc.color}`}>
                                {svc.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Downloadable Guides and Tutorials */}
                      <div className="space-y-3.5">
                        <Label className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-500">Resources & User Manuals</Label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="p-4 bg-zinc-950 border border-zinc-900 rounded-xl space-y-3 flex flex-col justify-between">
                            <div className="space-y-1">
                              <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                                <FileText className="w-4 h-4 text-brand" /> Resume Layout Template Guide
                              </h4>
                              <p className="text-[10px] text-zinc-500 leading-normal">
                                Get our standard single-column ATS resume layout template designed for perfect compliance and scoring.
                              </p>
                            </div>
                            <a 
                              href="/Axiom_Resume_Formatting_Guide.pdf"
                              target="_blank"
                              className="text-[10px] font-bold text-brand hover:underline flex items-center gap-1.5 mt-2 font-extrabold"
                            >
                              Download PDF Guide <ArrowRight className="w-3.5 h-3.5" />
                            </a>
                          </div>

                          <div className="p-4 bg-zinc-950 border border-zinc-900 rounded-xl space-y-3 flex flex-col justify-between">
                            <div className="space-y-1">
                              <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                                <Sparkles className="w-4 h-4 text-brand" /> Career Copilot Tutorial
                              </h4>
                              <p className="text-[10px] text-zinc-500 leading-normal">
                                Learn how to ask the right prompts to prepare for situational interviews or draft high-converting cover letters.
                              </p>
                            </div>
                            <button
                              onClick={() => {
                                setActiveTab("faq");
                                setFaqSearch("copilot");
                              }}
                              className="text-[10px] font-bold text-brand hover:underline flex items-center gap-1.5 mt-2 text-left font-extrabold cursor-pointer"
                            >
                              Read Tutorial FAQs <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                </AnimatePresence>
              </div>

            </div>
          </Card>

        </div>

        <Footer />
      </main>
    </SmoothScroll>
  );
}
