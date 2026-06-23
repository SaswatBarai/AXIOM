"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, ArrowLeft, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";

  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Read OTP from sessionStorage (set by verify-otp page, never in URL)
  const [otp, setOtp] = useState("");

  useEffect(() => {
    const stored = sessionStorage.getItem("resetOtp");
    if (!stored) {
      setError("Reset session expired. Please start again.");
      return;
    }
    setOtp(stored);
  }, []);

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await api.post("/auth/reset-password", {
        email,
        otp,
        newPassword: form.password,
      });
      setSuccess(true);
      sessionStorage.removeItem("resetOtp");
      setTimeout(() => router.push("/login?reset=1"), 2000);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(msg ?? "Reset failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (!email) {
    return (
      <div className="text-center space-y-4 p-8">
        <p className="text-zinc-400">Missing email. Please start the reset process again.</p>
        <Link href="/forgot-password" className="text-white underline">Go back</Link>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex items-center justify-center px-6 relative overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {[300, 500, 700, 900].map((size, i) => (
          <motion.div
            key={size}
            className="absolute rounded-full border border-zinc-800/40"
            style={{ width: size, height: size }}
            animate={{ scale: [1, 1.03, 1], opacity: [0.4, 0.15, 0.4] }}
            transition={{ duration: 4 + i, repeat: Infinity, ease: "easeInOut", delay: i * 0.6 }}
          />
        ))}
      </div>
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_50%,transparent_100%)] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-sm relative z-10"
      >
        <Link href="/" className="flex items-center justify-center gap-2.5 mb-10 group">
          <div className="w-9 h-9 bg-brand rounded-lg flex items-center justify-center font-bold text-xl text-black group-hover:scale-105 transition-transform">A</div>
          <span className="font-bold text-xl tracking-tight text-white">AXIOM</span>
        </Link>

        {success ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-4"
          >
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto">
              <ShieldCheck className="w-8 h-8 text-emerald-400" />
            </div>
            <h2 className="text-xl font-bold text-white">Password reset!</h2>
            <p className="text-sm text-zinc-400">Redirecting you to login…</p>
          </motion.div>
        ) : (
          <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center shadow-xl">
                <ShieldCheck className="w-8 h-8 text-zinc-300" />
              </div>
            </div>

            <div className="text-center space-y-1.5">
              <h1 className="text-2xl font-bold text-white">Set new password</h1>
              <p className="text-sm text-zinc-400">Must be at least 8 characters with a number, uppercase, and special character.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-zinc-300">New Password</Label>
                <div className="relative">
                  <Input
                    id="password" type={showPassword ? "text" : "password"} placeholder="••••••••"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required
                    className="bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-600 focus-visible:ring-white/20 focus-visible:border-zinc-600 h-11 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors cursor-pointer"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-zinc-300">Confirm Password</Label>
                <Input
                  id="confirmPassword" type="password" placeholder="••••••••"
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  required
                  className="bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-600 focus-visible:ring-white/20 focus-visible:border-zinc-600 h-11"
                />
              </div>

              {error && (
                <div className="px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">{error}</div>
              )}

              <Button
                type="submit" disabled={loading}
                className="w-full bg-brand hover:bg-brand-hover text-black h-11 font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2 group"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    Resetting…
                  </span>
                ) : (
                  <>
                    Reset Password
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </Button>
            </form>

            <Link href="/login" className="flex items-center justify-center gap-1.5 text-sm text-zinc-500 hover:text-white transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to login
            </Link>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="h-full w-full flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
