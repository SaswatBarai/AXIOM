"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import { PasswordInput } from "./PasswordInput";
import { AuthFooter } from "./AuthFooter";
import { SocialAuthButtons } from "./SocialAuthButtons";

const PASSWORD_REQS = [
  { label: "At least 8 characters", test: (pw: string) => pw.length >= 8 },
  { label: "One uppercase letter", test: (pw: string) => /[A-Z]/.test(pw) },
  { label: "One number", test: (pw: string) => /[0-9]/.test(pw) },
  { label: "One special character", test: (pw: string) => /[!@#$%^&*()_+{}[\]:;<>,.?~\\/-]/.test(pw) },
];

export function SignupForm() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!agreed) {
      setError("You must agree to the Terms of Service.");
      return;
    }
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
    <div className="w-full space-y-6">
      {/* Heading */}
      <div className="space-y-1.5 text-center lg:text-left">
        <h1 className="text-3xl font-extrabold tracking-tight text-text-primary">
          Create Account
        </h1>
        <p className="text-sm text-text-secondary">
          Start your career journey with AXIOM today
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full Name */}
        <div className="space-y-1.5">
          <Label htmlFor="name" className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
            Full Name
          </Label>
          <Input
            id="name"
            type="text"
            placeholder="John Doe"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            className="h-11 bg-bg-elevated border-border-subtle text-text-primary placeholder:text-text-muted focus-visible:ring-brand/20 focus-visible:border-border-medium transition-all"
          />
        </div>

        {/* Email Address */}
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
            Email Address
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
            className="h-11 bg-bg-elevated border-border-subtle text-text-primary placeholder:text-text-muted focus-visible:ring-brand/20 focus-visible:border-border-medium transition-all"
          />
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <Label htmlFor="password" className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
            Password
          </Label>
          <PasswordInput
            id="password"
            placeholder="••••••••"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />

          {/* Password checklist */}
          {form.password.length > 0 && (
            <div className="grid grid-cols-2 gap-2 mt-2.5 p-2.5 bg-bg-card/45 border border-border-subtle/50 rounded-xl">
              {PASSWORD_REQS.map((req) => {
                const met = req.test(form.password);
                return (
                  <div key={req.label} className="flex items-center gap-1.5 text-[10px]">
                    {met ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 text-text-muted shrink-0" />
                    )}
                    <span className={met ? "text-emerald-500 font-medium" : "text-text-muted font-medium"}>
                      {req.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Checkbox agreement */}
        <div className="flex items-center  gap-2.5 pt-1 select-none">
          <input
            type="checkbox"
            id="terms"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="w-4.5 h-4.5 mt-0.5 rounded border-border-subtle bg-bg-elevated accent-brand shrink-0 cursor-pointer"
          />
          <label htmlFor="terms" className="text-xs text-text-secondary leading-relaxed cursor-pointer">
            I agree to the{" "}
            <Link href="/terms" className="text-text-primary font-semibold hover:text-brand hover:underline transition-all">
              Terms
            </Link>
            {" "}and{" "}
            <Link href="/privacy" className="text-text-primary font-semibold hover:text-brand hover:underline transition-all">
              Privacy Policy
            </Link>
          </label>
        </div>

        {/* Error message */}
        {error && (
          <div className="px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-500 font-medium">
            {error}
          </div>
        )}

        {/* Submit button */}
        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-brand hover:bg-brand-hover text-black h-11 font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 group cursor-pointer shadow-lg shadow-brand/5"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-black" />
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

      {/* SSO Sign Up Options */}
      <div className="space-y-3">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border-subtle/70" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-bg-base px-2.5 text-text-muted font-semibold tracking-wider">
              or sign up with
            </span>
          </div>
        </div>

        <SocialAuthButtons returnTo="/dashboard" />
      </div>

      {/* Redirect & Trust signals footer */}
      <div className="space-y-4 pt-2">
        <p className="text-center text-xs text-text-secondary">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-text-primary font-semibold hover:text-brand hover:underline underline-offset-4 transition-colors"
          >
            Sign in
          </Link>
        </p>

        <AuthFooter />
      </div>
    </div>
  );
}
