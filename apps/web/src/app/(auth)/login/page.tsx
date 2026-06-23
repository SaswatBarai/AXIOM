"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { motion } from "framer-motion";
import {
  ArrowRight, CheckCircle2, Briefcase, FileText, Bot,
  TrendingUp, Zap, Star, Eye, EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { api, setAccessToken } from "@/lib/api";
import { setCredentials } from "@/store/authSlice";
import type { AppDispatch } from "@/store";

const floatA = { y: [0, -12, 0] as number[] };
const floatB = { y: [0, 10, 0] as number[] };
const floatC = { y: [0, -8, 0] as number[] };

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", form);
      setAccessToken(data.accessToken);
      dispatch(setCredentials({ user: data.user, accessToken: data.accessToken }));
      router.push("/dashboard");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(msg ?? "Invalid credentials");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-full w-full">

      {/* ── LEFT: Visual Panel ─────────────────────────────── */}
      <div className="hidden lg:flex w-[52%] flex-col justify-between p-12 relative overflow-hidden border-r border-zinc-800/50">
        {/* Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_60%,transparent_100%)]" />
        {/* Spotlight */}
        <div className="absolute top-[-10%] left-[30%] w-[500px] h-[500px] bg-white/4 rounded-full blur-[130px] pointer-events-none" />

        {/* Logo */}
        <Link href="/" className="relative z-10 flex items-center gap-2.5 w-fit group">
          <div className="w-9 h-9 bg-brand rounded-lg flex items-center justify-center font-bold text-xl text-black group-hover:scale-105 transition-transform">A</div>
          <span className="font-bold text-xl tracking-tight text-white">AXIOM</span>
        </Link>

        {/* Floating cards */}
        <div className="relative z-10 flex-1 flex items-center justify-center">
          <div className="relative w-full max-w-sm h-[360px]">

            {/* Card 1 – ATS Score */}
            <motion.div
              animate={floatA}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-0 left-0 w-52"
            >
              <Card className="border border-zinc-800 bg-zinc-900/80 backdrop-blur-sm p-5 shadow-2xl">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">ATS Score</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="flex items-end gap-2">
                  <span className="text-4xl font-bold text-white">87</span>
                  <span className="text-lg text-zinc-400 mb-1">%</span>
                </div>
                <div className="mt-3 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-white rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: "87%" }}
                    transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
                  />
                </div>
                <p className="text-[11px] text-emerald-400 mt-2">Ready for submission</p>
              </Card>
            </motion.div>

            {/* Card 2 – Job Match */}
            <motion.div
              animate={floatB}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              className="absolute top-8 right-0 w-48"
            >
              <Card className="border border-zinc-800 bg-zinc-900/80 backdrop-blur-sm p-4 shadow-2xl">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-bold text-white">V</div>
                  <div>
                    <div className="text-xs font-semibold text-white">Vercel</div>
                    <div className="text-[10px] text-zinc-500">Remote</div>
                  </div>
                </div>
                <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px]">94% Match</Badge>
              </Card>
            </motion.div>

            {/* Card 3 – Copilot */}
            <motion.div
              animate={floatC}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute bottom-10 left-6 w-56"
            >
              <Card className="border border-zinc-800 bg-zinc-900/80 backdrop-blur-sm p-4 shadow-2xl">
                <div className="flex items-center gap-2 mb-2">
                  <Bot className="w-4 h-4 text-zinc-300" />
                  <span className="text-xs font-semibold text-white">Career Copilot</span>
                  <span className="ml-auto w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  &ldquo;Your profile matches <span className="text-white font-medium">23 new roles</span> this week.&rdquo;
                </p>
              </Card>
            </motion.div>

            {/* Card 4 – Stats */}
            <motion.div
              animate={floatA}
              transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
              className="absolute bottom-0 right-4 w-40"
            >
              <Card className="border border-zinc-800 bg-zinc-900/80 backdrop-blur-sm p-4 shadow-2xl">
                <div className="flex items-center gap-1.5 mb-2">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-xs text-zinc-400">This month</span>
                </div>
                <div className="flex gap-3">
                  <div>
                    <div className="text-lg font-bold text-white">127</div>
                    <div className="text-[10px] text-zinc-500">Applied</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-white">12</div>
                    <div className="text-[10px] text-zinc-500">Interviews</div>
                  </div>
                </div>
              </Card>
            </motion.div>

          </div>
        </div>

        {/* Testimonial */}
        <div className="relative z-10 space-y-3">
          <div className="flex gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-white text-white" />
            ))}
          </div>
          <p className="text-sm text-zinc-300 leading-relaxed max-w-xs">
            &ldquo;AXIOM helped me land interviews at Stripe and Vercel within two weeks of uploading my resume.&rdquo;
          </p>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-bold text-white">S</div>
            <div>
              <div className="text-xs font-semibold text-white">Sarah K.</div>
              <div className="text-[11px] text-zinc-500">Software Engineer · Stripe</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT: Form Panel ──────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden">
        {/* Subtle spotlight */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-white/3 rounded-full blur-[120px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-sm relative"
        >
          {/* Mobile logo */}
          <Link href="/" className="lg:hidden flex items-center justify-center gap-2.5 mb-8 group">
            <div className="w-9 h-9 bg-brand rounded-lg flex items-center justify-center font-bold text-xl text-black">A</div>
            <span className="font-bold text-xl tracking-tight text-white">AXIOM</span>
          </Link>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-1.5">Welcome back</h1>
            <p className="text-sm text-zinc-400">Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-zinc-300">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                className="bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-600 focus-visible:ring-white/20 focus-visible:border-zinc-600 h-11"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium text-zinc-300">Password</Label>
                <Link href="/forgot-password" className="text-xs text-zinc-500 hover:text-white transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  className="bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-600 focus-visible:ring-white/20 focus-visible:border-zinc-600 h-11 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-550 hover:text-white transition-colors cursor-pointer flex items-center justify-center p-0.5"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-brand hover:bg-brand-hover text-black h-11 font-semibold transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 group"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  Signing in…
                </span>
              ) : (
                <>
                  Sign in
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-zinc-800" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-[#09090B] px-3 text-zinc-600">or</span>
            </div>
          </div>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-2 justify-center mb-6">
            {[
              { icon: Zap, label: "ATS Scorer" },
              { icon: Briefcase, label: "Job Matcher" },
              { icon: FileText, label: "Resume AI" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-full text-xs text-zinc-400">
                <Icon className="w-3.5 h-3.5" />
                {label}
              </div>
            ))}
          </div>

          <p className="text-center text-sm text-zinc-500">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-white font-medium hover:underline underline-offset-4">
              Sign up free
            </Link>
          </p>
        </motion.div>
      </div>

    </div>
  );
}
