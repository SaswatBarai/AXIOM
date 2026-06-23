"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api, setAccessToken } from "@/lib/api";
import { setCredentials } from "@/store/authSlice";
import type { AppDispatch } from "@/store";
import { PasswordInput } from "./PasswordInput";
import { AuthFooter } from "./AuthFooter";

export function LoginForm() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const [form, setForm] = useState({ email: "", password: "" });
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
    <div className="w-full space-y-6">
      {/* Welcome Heading */}
      <div className="space-y-1.5 text-center lg:text-left">
        <h1 className="text-3xl font-extrabold tracking-tight text-text-primary">
          Welcome back
        </h1>
        <p className="text-sm text-text-secondary">
          Enter your email and password to log in to your account
        </p>
      </div>

      {/* Form block */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email Address */}
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
            Email address
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
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
              Password
            </Label>
            <Link
              href="/forgot-password"
              className="text-xs text-text-muted hover:text-text-primary hover:underline underline-offset-2 transition-all"
            >
              Forgot password?
            </Link>
          </div>
          <PasswordInput
            id="password"
            placeholder="••••••••"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-500 font-medium">
            {error}
          </div>
        )}

        {/* Submit CTA */}
        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-brand hover:bg-brand-hover text-black h-11 font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 group cursor-pointer shadow-lg shadow-brand/5"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-black" />
              Signing in…
            </span>
          ) : (
            <>
              Sign in to AXIOM
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </>
          )}
        </Button>
      </form>

      {/* Social login buttons (Stripe/Linear style) */}
      <div className="space-y-3">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border-subtle/70" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-bg-base px-2.5 text-text-muted font-semibold tracking-wider">
              or continue with
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button
            type="button"
            variant="outline"
            className="h-10 bg-bg-card border-border-subtle text-text-primary hover:bg-bg-hover rounded-xl text-xs font-semibold cursor-pointer"
            onClick={() => alert("Social sign-in coming soon!")}
          >
            Google
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-10 bg-bg-card border-border-subtle text-text-primary hover:bg-bg-hover rounded-xl text-xs font-semibold cursor-pointer"
            onClick={() => alert("Social sign-in coming soon!")}
          >
            GitHub
          </Button>
        </div>
      </div>

      {/* Auth Footer & Sign up link */}
      <div className="space-y-4 pt-2">
        <p className="text-center text-xs text-text-secondary">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="text-text-primary font-semibold hover:text-brand hover:underline underline-offset-4 transition-colors"
          >
            Sign up free
          </Link>
        </p>

        <AuthFooter />
      </div>
    </div>
  );
}
