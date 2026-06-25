"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Mail, ArrowLeft, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/auth/forgot-password", { email });
      setSent(true);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(msg ?? "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="h-full w-full flex items-center justify-center px-6 relative overflow-hidden">
      {/* Animated rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {[300, 500, 700, 900].map((size, i) => (
          <motion.div
            key={size}
            className="absolute rounded-full border border-border-subtle/40"
            style={{ width: size, height: size }}
            animate={{ scale: [1, 1.03, 1], opacity: [0.4, 0.15, 0.4] }}
            transition={{ duration: 4 + i, repeat: Infinity, ease: "easeInOut", delay: i * 0.6 }}
          />
        ))}
      </div>
      {/* Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_50%,transparent_100%)] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-sm relative z-10"
      >
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-2.5 mb-10 group">
          <div className="w-9 h-9 bg-brand rounded-lg flex items-center justify-center font-bold text-xl text-black group-hover:scale-105 transition-transform">A</div>
          <span className="font-bold text-xl tracking-tight text-text-primary">AXIOM</span>
        </Link>

        {!sent ? (
          <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            {/* Icon */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-bg-elevated border border-border-subtle flex items-center justify-center shadow-xl">
                  <ShieldCheck className="w-8 h-8 text-text-secondary" />
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-text-primary rounded-full flex items-center justify-center">
                  <span className="text-bg-base text-[10px] font-bold">?</span>
                </div>
              </div>
            </div>

            <div className="text-center space-y-1.5">
              <h1 className="text-2xl font-bold text-text-primary">Forgot password?</h1>
              <p className="text-sm text-text-secondary">No worries — we&apos;ll send you reset instructions.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-text-secondary">Email</Label>
                <Input
                  id="email" type="email" placeholder="you@example.com"
                  value={email} onChange={(e) => setEmail(e.target.value)} required
                  className="bg-bg-elevated border-border-subtle text-text-primary placeholder:text-text-muted focus-visible:ring-brand/20 focus-visible:border-border-medium h-11"
                />
              </div>

              {error && (
                <div className="px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">
                  {error}
                </div>
              )}

              <Button
                type="submit" disabled={loading}
                className="w-full bg-brand hover:bg-brand-hover text-black h-11 font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2 group"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    Sending…
                  </span>
                ) : (
                  <>
                    Send Reset Code
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </Button>
            </form>

            <Link href="/login" className="flex items-center justify-center gap-1.5 text-sm text-text-muted hover:text-text-primary transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to login
            </Link>
          </motion.div>
        ) : (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-6"
          >
            {/* Animated mail icon */}
            <div className="flex justify-center">
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                className="w-16 h-16 rounded-2xl bg-bg-elevated border border-border-subtle flex items-center justify-center shadow-xl"
              >
                <Mail className="w-8 h-8 text-text-primary" />
              </motion.div>
            </div>

            <div className="text-center space-y-1.5">
              <h1 className="text-2xl font-bold text-text-primary">Check your inbox</h1>
              <p className="text-sm text-text-secondary">
                We sent a 6-digit code to{" "}
                <span className="text-text-primary font-medium">{email}</span>
              </p>
            </div>

            <div className="p-4 bg-bg-card border border-border-subtle rounded-xl space-y-1.5">
              {["Check spam/junk if not visible", "Code expires in 10 minutes", "Only the latest code is valid"].map((tip) => (
                <div key={tip} className="flex items-center gap-2 text-xs text-text-secondary">
                  <div className="w-1 h-1 bg-text-muted rounded-full shrink-0" />
                  {tip}
                </div>
              ))}
            </div>

            <Link href={`/verify-otp?email=${encodeURIComponent(email)}&mode=reset`} className="block">
              <Button className="w-full bg-brand hover:bg-brand-hover text-black h-11 font-semibold flex items-center justify-center gap-2 group">
                Enter Reset Code
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Button>
            </Link>

            <button
              type="button" onClick={() => setSent(false)}
              className="w-full text-center text-sm text-text-muted hover:text-text-primary transition-colors"
            >
              Try a different email
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
