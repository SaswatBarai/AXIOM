"use client";

import { Button } from "@/components/ui/button";
import { getOAuthStartUrl } from "@/lib/oauth";

type OAuthProvider = "google" | "github";

interface SocialAuthButtonsProps {
  returnTo?: string;
}

function startOAuth(provider: OAuthProvider, returnTo: string) {
  window.location.href = getOAuthStartUrl(provider, returnTo);
}

export function SocialAuthButtons({ returnTo = "/dashboard" }: SocialAuthButtonsProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <Button
        type="button"
        variant="outline"
        className="h-10 bg-bg-card border-border-subtle text-text-primary hover:bg-bg-hover rounded-xl text-xs font-semibold cursor-pointer"
        onClick={() => startOAuth("google", returnTo)}
      >
        Google
      </Button>
      <Button
        type="button"
        variant="outline"
        className="h-10 bg-bg-card border-border-subtle text-text-primary hover:bg-bg-hover rounded-xl text-xs font-semibold cursor-pointer"
        onClick={() => startOAuth("github", returnTo)}
      >
        GitHub
      </Button>
    </div>
  );
}
