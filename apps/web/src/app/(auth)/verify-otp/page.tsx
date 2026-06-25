"use client";

import { useState, useRef, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

const RESEND_SECONDS = 30;

function VerifyOtpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const mode = searchParams.get("mode");

  const [digits, setDigits] = useState<string[]>(Array(6).fill(""));
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [countdown, setCountdown] = useState(RESEND_SECONDS);
  const [resending, setResending] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => { inputRefs.current[0]?.focus(); }, []);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  function handleChange(index: number, value: string) {
    const char = value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = char;
    setDigits(next);
    if (char && index < 5) inputRefs.current[index + 1]?.focus();
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent<HTMLDivElement>) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const next = [...digits];
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i] ?? "";
    setDigits(next);
    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
  }

  const handleResend = useCallback(async () => {
    setResending(true);
    setError("");
    try {
      if (mode === "reset") {
        await api.post("/auth/forgot-password", { email });
      } else {
        await api.post("/auth/resend-verification", { email });
      }
      setCountdown(RESEND_SECONDS);
    } catch {
      setError("Failed to resend code.");
    } finally {
      setResending(false);
    }
  }, [email, mode]);

  async function handleSubmit() {
    const otp = digits.join("");
    if (otp.length < 6) { setError("Please enter all 6 digits."); return; }
    setError("");
    setLoading(true);
    try {
      if (mode === "reset") {
        sessionStorage.setItem("resetOtp", otp);
        router.push(`/reset-password?email=${encodeURIComponent(email)}`);
      } else {
        await api.post("/auth/verify-email", { email, otp });
        setSuccess(true);
        setTimeout(() => router.push("/login?verified=1"), 1500);
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(msg ?? "Invalid or expired code.");
      setDigits(Array(6).fill(""));
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  }

  const filled = digits.filter(Boolean).length;

  return (
    <div className="h-full w-full flex items-center justify-center px-6 relative overflow-hidden">
      {/* Animated rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {[280, 460, 640, 820].map((size, i) => (
          <motion.div
            key={size}
            className="absolute rounded-full border border-border-subtle/40"
            style={{ width: size, height: size }}
            animate={{ scale: [1, 1.04, 1], opacity: [0.35, 0.12, 0.35] }}
            transition={{ duration: 4 + i * 0.8, repeat: Infinity, ease: "easeInOut", delay: i * 0.5 }}
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
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-2.5 mb-10 group">
          <div className="w-9 h-9 bg-brand rounded-lg flex items-center justify-center font-bold text-xl text-black group-hover:scale-105 transition-transform">A</div>
          <span className="font-bold text-xl tracking-tight text-text-primary">AXIOM</span>
        </Link>

        <AnimatePresence mode="wait">
          {success ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-4"
            >
              <motion.div
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 0.5 }}
                className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto"
              >
                <MailCheck className="w-8 h-8 text-emerald-400" />
              </motion.div>
              <div>
                <h2 className="text-xl font-bold text-text-primary">Verified!</h2>
                <p className="text-sm text-text-secondary mt-1">Redirecting you to login…</p>
              </div>
            </motion.div>
          ) : (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
              {/* Icon */}
              <div className="text-center space-y-4">
                <motion.div
                   animate={{ y: [0, -6, 0] }}
                   transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                   className="w-16 h-16 rounded-2xl bg-bg-elevated border border-border-subtle flex items-center justify-center mx-auto shadow-xl"
                >
                  <MailCheck className="w-8 h-8 text-text-secondary" />
                </motion.div>
                <div>
                  <h1 className="text-2xl font-bold text-text-primary">
                    {mode === "reset" ? "Reset Your Password" : "Check your email"}
                  </h1>
                  <p className="text-sm text-text-secondary mt-1.5">
                    Enter the 6-digit code sent to{" "}
                    <span className="text-text-primary font-medium truncate">{email || "your email"}</span>
                  </p>
                </div>
              </div>

              {/* OTP boxes */}
              <div>
                <div
                  className="flex gap-2.5 justify-center"
                  onPaste={handlePaste}
                >
                  {digits.map((digit, i) => (
                    <motion.div
                      key={i}
                      animate={digit ? { scale: [1, 1.08, 1] } : { scale: 1 }}
                      transition={{ duration: 0.15 }}
                    >
                      <input
                        ref={(el) => { inputRefs.current[i] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleChange(i, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(i, e)}
                        placeholder="·"
                        className={[
                          "w-11 h-13 text-center font-bold text-xl rounded-xl border-2 transition-all duration-150 outline-none bg-bg-elevated",
                          "text-text-primary placeholder:text-text-muted",
                          digit ? "border-border-medium" : "border-border-subtle",
                          "focus:border-brand",
                        ].join(" ")}
                      />
                    </motion.div>
                  ))}
                </div>

                {/* Progress dots */}
                <div className="flex gap-1.5 justify-center mt-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{ width: i < filled ? 20 : 6 }}
                      transition={{ duration: 0.2 }}
                      className={`h-1 rounded-full ${i < filled ? "bg-text-primary" : "bg-border-subtle"}`}
                    />
                  ))}
                </div>
              </div>

              {/* Resend */}
              <div className="text-center text-sm text-text-muted space-y-1">
                <p>Didn&apos;t get the code?</p>
                {countdown > 0 ? (
                  <div className="flex items-center justify-center gap-1.5">
                    <div className="relative w-5 h-5">
                      <svg className="w-5 h-5 -rotate-90" viewBox="0 0 20 20">
                        <circle cx="10" cy="10" r="8" fill="none" className="stroke-border-subtle" strokeWidth="2" />
                        <motion.circle
                          cx="10" cy="10" r="8" fill="none" className="stroke-text-secondary" strokeWidth="2"
                          strokeDasharray={50.3}
                          animate={{ strokeDashoffset: 50.3 - (50.3 * countdown / RESEND_SECONDS) }}
                          transition={{ duration: 0.5 }}
                          strokeLinecap="round"
                        />
                      </svg>
                    </div>
                    <span>Resend in {countdown}s</span>
                  </div>
                ) : (
                  <button
                    type="button" onClick={handleResend} disabled={resending}
                    className="text-text-secondary hover:text-text-primary font-medium transition-colors disabled:opacity-50"
                  >
                    {resending ? "Sending…" : "Resend code"}
                  </button>
                )}
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400 text-center"
                >
                  {error}
                </motion.div>
              )}

              <Button
                onClick={handleSubmit}
                disabled={loading || filled < 6}
                className="w-full bg-brand hover:bg-brand-hover text-black h-11 font-semibold transition-all disabled:opacity-30 flex items-center justify-center gap-2 group"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    Verifying…
                  </span>
                ) : (
                  <>
                    {mode === "reset" ? "Continue" : "Verify Email"}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </Button>

              <Link
                href={mode === "reset" ? "/forgot-password" : "/signup"}
                className="flex items-center justify-center gap-1.5 text-sm text-text-muted hover:text-text-primary transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                {mode === "reset" ? "Back to reset" : "Wrong email? Go back"}
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={
      <div className="h-full w-full flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand/20 border-t-brand rounded-full animate-spin" />
      </div>
    }>
      <VerifyOtpForm />
    </Suspense>
  );
}
