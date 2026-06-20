"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { api } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/api/auth/forgot-password", { email });
      setSent(true);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(msg ?? "Something went wrong. Please try again.");
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
            <h1 className="text-2xl font-bold text-white">Reset Password</h1>
            <p className="text-sm text-zinc-400">
              {sent
                ? "Check your inbox for the reset code"
                : "Enter your email to receive a reset code"}
            </p>
          </CardHeader>

          <CardContent className="pt-8 px-8 pb-8">
            {sent ? (
              <div className="space-y-6">
                <div className="px-4 py-4 bg-emerald-500/10 border border-emerald-500/50 rounded-lg text-sm text-emerald-400 text-center">
                  We&apos;ve sent a 6-digit reset code to{" "}
                  <span className="font-medium">{email}</span>
                </div>
                <Link
                  href={`/verify-otp?email=${encodeURIComponent(email)}&mode=reset`}
                  className="block w-full"
                >
                  <Button className="w-full bg-purple-500 hover:bg-purple-600 text-white h-11 rounded-lg font-medium transition-colors duration-200">
                    Enter Reset Code
                  </Button>
                </Link>
                <p className="text-center text-sm text-zinc-400">
                  Didn&apos;t receive it?{" "}
                  <button
                    type="button"
                    onClick={() => setSent(false)}
                    className="text-purple-400 hover:text-purple-300 font-medium transition-colors"
                  >
                    Try again
                  </button>
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-white">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus-visible:ring-purple-500/50 focus-visible:border-purple-500 h-11"
                  />
                </div>

                {error && (
                  <div className="px-4 py-3 bg-red-500/10 border border-red-500/50 rounded-lg text-sm text-red-400">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-purple-500 hover:bg-purple-600 text-white h-11 rounded-lg font-medium transition-colors duration-200 disabled:opacity-60"
                >
                  {loading ? "Sending…" : "Send Reset Code"}
                </Button>
              </form>
            )}

            <p className="text-center text-sm text-zinc-400 mt-6">
              Remember your password?{" "}
              <Link href="/login" className="text-purple-400 hover:text-purple-300 font-medium transition-colors">
                Back to login
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
