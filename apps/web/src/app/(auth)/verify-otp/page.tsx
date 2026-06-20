"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { api } from "@/lib/api";

const RESEND_SECONDS = 30;

export default function VerifyOtpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const mode = searchParams.get("mode"); // "reset" for password reset flow

  const [digits, setDigits] = useState<string[]>(Array(6).fill(""));
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(RESEND_SECONDS);
  const [resending, setResending] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

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
    if (char && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const next = [...digits];
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i] ?? "";
    setDigits(next);
    const focusIndex = Math.min(pasted.length, 5);
    inputRefs.current[focusIndex]?.focus();
  }

  const handleResend = useCallback(async () => {
    setResending(true);
    setError("");
    try {
      await api.post("/api/auth/forgot-password", { email });
      setCountdown(RESEND_SECONDS);
    } catch {
      setError("Failed to resend code. Please try again.");
    } finally {
      setResending(false);
    }
  }, [email]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const otp = digits.join("");
    if (otp.length < 6) {
      setError("Please enter all 6 digits.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      if (mode === "reset") {
        router.push(`/reset-password?email=${encodeURIComponent(email)}&otp=${otp}`);
      } else {
        await api.post("/api/auth/verify-email", { email, otp });
        router.push("/login?verified=1");
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(msg ?? "Invalid or expired code. Please try again.");
      setDigits(Array(6).fill(""));
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12 bg-zinc-950 relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">A</span>
          </div>
          <span className="font-bold text-xl text-white">AXIOM</span>
        </div>

        <Card className="border border-zinc-800 bg-zinc-900 rounded-2xl shadow-xl">
          <CardHeader className="pb-0 text-center space-y-2 pt-8 px-8">
            <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
            <h1 className="text-2xl font-bold text-white">
              {mode === "reset" ? "Reset Your Password" : "Verify Your Email"}
            </h1>
            <p className="text-sm text-zinc-400">
              We sent a 6-digit code to{" "}
              <span className="text-white font-medium">{email || "your email"}</span>
            </p>
          </CardHeader>

          <CardContent className="pt-8 px-8 pb-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* OTP boxes */}
              <div className="flex gap-2 justify-center" onPaste={handlePaste}>
                {digits.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => { inputRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    placeholder="0"
                    className="w-12 h-12 text-center font-bold text-lg bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder:text-zinc-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 transition-colors"
                  />
                ))}
              </div>

              {/* Resend */}
              <div className="text-center text-sm text-zinc-400">
                <p>Didn&apos;t receive the code?</p>
                {countdown > 0 ? (
                  <span className="text-zinc-500">Resend in {countdown}s</span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resending}
                    className="text-purple-400 hover:text-purple-300 font-medium transition-colors disabled:opacity-50"
                  >
                    {resending ? "Sending…" : "Resend code"}
                  </button>
                )}
              </div>

              {error && (
                <div className="px-4 py-3 bg-red-500/10 border border-red-500/50 rounded-lg text-sm text-red-400">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={loading || digits.join("").length < 6}
                className="w-full bg-purple-500 hover:bg-purple-600 text-white h-11 rounded-lg font-medium transition-colors duration-200 disabled:opacity-60"
              >
                {loading ? "Verifying…" : mode === "reset" ? "Continue" : "Verify Email"}
              </Button>
            </form>

            <p className="text-center text-sm text-zinc-400 mt-6">
              Wrong email?{" "}
              <Link
                href={mode === "reset" ? "/forgot-password" : "/signup"}
                className="text-purple-400 hover:text-purple-300 font-medium transition-colors"
              >
                Go back
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
