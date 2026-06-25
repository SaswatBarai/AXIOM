type OAuthProvider = "google" | "github";

/** API base including `/api` suffix — matches NEXT_PUBLIC_API_URL */
function apiBase(): string {
  const raw = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
  return raw.replace(/\/$/, "");
}

export function getOAuthStartUrl(provider: OAuthProvider, returnTo: string): string {
  const params = new URLSearchParams({ returnTo });
  return `${apiBase()}/auth/${provider}?${params}`;
}
