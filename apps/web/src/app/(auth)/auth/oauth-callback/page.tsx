"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useDispatch } from "react-redux";
import { Loader2 } from "lucide-react";
import { api, setAccessToken } from "@/lib/api";
import { setCredentials } from "@/store/authSlice";
import type { AppDispatch } from "@/store";

function OAuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch<AppDispatch>();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const oauthError = searchParams.get("error");
    if (oauthError) {
      setError(oauthError);
      return;
    }

    const accessToken = searchParams.get("accessToken");
    const returnTo = searchParams.get("returnTo") ?? "/dashboard";

    if (!accessToken) {
      setError("Missing sign-in token. Please try again.");
      return;
    }

    // Remove token from the address bar as soon as we read it.
    window.history.replaceState({}, "", "/auth/oauth-callback");

    async function finishLogin() {
      try {
        setAccessToken(accessToken);
        const { data } = await api.get("/auth/me");
        dispatch(setCredentials({ user: data.user, accessToken }));
        router.replace(returnTo.startsWith("/") ? returnTo : "/dashboard");
      } catch {
        setAccessToken(null);
        setError("Could not complete sign-in. Please try again.");
      }
    }

    void finishLogin();
  }, [dispatch, router, searchParams]);

  if (error) {
    return (
      <div className="w-full max-w-md space-y-4 text-center">
        <h1 className="text-2xl font-bold text-text-primary">Sign-in failed</h1>
        <p className="text-sm text-red-400">{error}</p>
        <Link
          href="/login"
          className="inline-flex text-sm font-semibold text-brand hover:underline"
        >
          Back to login
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <Loader2 className="h-8 w-8 animate-spin text-brand" />
      <p className="text-sm text-text-secondary">Completing sign-in…</p>
    </div>
  );
}

export default function OAuthCallbackPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <Suspense
        fallback={
          <div className="flex flex-col items-center gap-3 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-brand" />
            <p className="text-sm text-text-secondary">Loading…</p>
          </div>
        }
      >
        <OAuthCallbackContent />
      </Suspense>
    </div>
  );
}
