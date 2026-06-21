"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowRight, CheckCircle2, XCircle, Star,
  BarChart3, Target, Sparkles, Brain,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { api } from "@/lib/api";

const PASSWORD_REQS = [
  { label: "At least 8 characters", test: (pw: string) => pw.length >= 8 },
  { label: "One uppercase letter",  test: (pw: string) => /[A-Z]/.test(pw) },
  { label: "One number",            test: (pw: string) => /[0-9]/.test(pw) },
  { label: "One special character", test: (pw: string) => /[^A-Za-z0-9]/.test(pw) },
];

const STEPS = [
  { icon: Brain,    title: "Upload Resume",        desc: "Drop your resume — AI extracts everything instantly." },
  { icon: Target,   title: "Match Jobs",            desc: "Semantic matching against thousands of live roles." },
  { icon: BarChart3, title: "Track & Improve",      desc: "Analytics, gap detection, and copilot guidance." },
];

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!agreed) { setError("You must agree to the Terms of Service."); return; }
    setError("");
    setLoading(true);
    try {
      await api.post("/auth/register", form);
      router.push(`/verify-otp?email=${encodeURIComponent(form.email)}`);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(msg ?? "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-full w-full">

      {/* ── LEFT: Visual Panel ─────────────────────────────── */}
      <div className="hidden lg:flex w-[52%] flex-col justify-between p-8 relative overflow-hidden border-r border-zinc-800/50">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_60%,transparent_100%)]" />
        <div className="absolute top-[-10%] left-[30%] w-[500px] h-[500px] bg-white/4 rounded-full blur-[130px] pointer-events-none" />

        <Link href="/" className="relative z-10 flex items-center gap-2.5 w-fit group">
          <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center font-bold text-xl text-black group-hover:scale-105 transition-transform">A</div>
          <span className="font-bold text-xl tracking-tight text-white">AXIOM</span>
        </Link>

        {/* How it works steps */}
        <div className="relative z-10 flex-1 flex flex-col justify-center gap-4 py-6">
          <div className="space-y-1.5 mb-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-zinc-500" />
              <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-widest">How it works</span>
            </div>
            <h2 className="text-xl font-bold text-white leading-snug">
              From resume upload<br />to dream job in days.
            </h2>
          </div>

          <div className="space-y-2.5">
            {STEPS.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 + i * 0.15, ease: [0.16, 1, 0.3, 1] }}
                className="flex items-center gap-3 p-3 rounded-xl border border-zinc-800/60 bg-zinc-900/40 backdrop-blur-sm hover:border-zinc-700 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0">
                  <step.icon className="w-4 h-4 text-zinc-300" />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Step {i + 1}</div>
                  <div className="text-sm font-semibold text-white">{step.title}</div>
                  <div className="text-xs text-zinc-500 leading-snug">{step.desc}</div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Stats bar */}
          <div className="flex items-center gap-6 pt-4 border-t border-zinc-800/60">
            {[
              { value: "14k+", label: "Users" },
              { value: "89%",  label: "Interview rate" },
              { value: "3.2×", label: "Faster search" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-base font-bold text-white">{stat.value}</div>
                <div className="text-[11px] text-zinc-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonial */}
        <div className="relative z-10 p-4 rounded-xl border border-zinc-800/60 bg-zinc-900/30 space-y-2.5">
          <div className="flex gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="w-3.5 h-3.5 fill-white text-white" />
            ))}
          </div>
          <p className="text-sm text-zinc-300 leading-relaxed">
            &ldquo;Within 10 days I had 4 callbacks. The AI resume coach is genuinely game-changing.&rdquo;
          </p>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-bold text-white shrink-0">M</div>
            <div>
              <div className="text-xs font-semibold text-white">Marcus T.</div>
              <div className="text-[11px] text-zinc-500">Data Engineer · Google</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT: Form Panel ──────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-white/3 rounded-full blur-[120px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-sm relative"
        >
          <Link href="/" className="lg:hidden flex items-center justify-center gap-2.5 mb-8 group">
            <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center font-bold text-xl text-black">A</div>
            <span className="font-bold text-xl tracking-tight text-white">AXIOM</span>
          </Link>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-1.5">Create Account</h1>
            <p className="text-sm text-zinc-400">Start your career journey with AXIOM</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-zinc-300">Full Name</Label>
              <Input
                id="name" type="text" placeholder="John Doe"
                value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required
                className="bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-600 focus-visible:ring-white/20 focus-visible:border-zinc-600 h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-zinc-300">Email Address</Label>
              <Input
                id="email" type="email" placeholder="you@example.com"
                value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required
                className="bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-600 focus-visible:ring-white/20 focus-visible:border-zinc-600 h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-zinc-300">Password</Label>
              <Input
                id="password" type="password" placeholder="••••••••"
                value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required
                className="bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-600 focus-visible:ring-white/20 focus-visible:border-zinc-600 h-11"
              />
              {form.password.length > 0 && (
                <div className="grid grid-cols-2 gap-1 mt-2">
                  {PASSWORD_REQS.map((req) => {
                    const met = req.test(form.password);
                    return (
                      <div key={req.label} className="flex items-center gap-1.5 text-[11px]">
                        {met
                          ? <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                          : <XCircle className="w-3 h-3 text-zinc-700 shrink-0" />
                        }
                        <span className={met ? "text-emerald-400" : "text-zinc-600"}>{req.label}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex items-start gap-2.5 pt-1">
              <input
                type="checkbox" id="terms" checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="w-4 h-4 mt-0.5 rounded border-zinc-700 bg-zinc-800 accent-white shrink-0"
              />
              <label htmlFor="terms" className="text-xs text-zinc-500 leading-relaxed">
                I agree to the{" "}
                <Link href="/terms" className="text-zinc-300 hover:text-white transition-colors">Terms</Link>
                {" "}and{" "}
                <Link href="/privacy" className="text-zinc-300 hover:text-white transition-colors">Privacy Policy</Link>
              </label>
            </div>

            {error && (
              <div className="px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">
                {error}
              </div>
            )}

            <Button
              type="submit" disabled={loading}
              className="w-full bg-white hover:bg-zinc-100 text-black h-11 font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2 group"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  Creating account…
                </span>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-zinc-500 mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-white font-medium hover:underline underline-offset-4">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>

    </div>
  );
}
