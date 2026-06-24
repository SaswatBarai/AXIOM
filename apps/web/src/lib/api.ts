"use client";

import axios from "axios";

export const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// ── In-memory access token (survives SPA navigation, cleared on page reload) ──
let _accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  _accessToken = token;
}

export function getAccessToken(): string | null {
  return _accessToken;
}

// Attach access token from memory on every outgoing request.
// Cookie is the fallback — requireAuth reads both.
api.interceptors.request.use((config) => {
  if (_accessToken) {
    config.headers.Authorization = `Bearer ${_accessToken}`;
  }
  return config;
});

// ── Refresh mutex — only one refresh request in-flight at a time ──────────────
let refreshPromise: Promise<{ accessToken: string; refreshToken: string }> | null = null;

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;

    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error);
    }

    // Don't try to refresh if the failing request IS the refresh endpoint
    // (prevents infinite loop when the refresh token itself is invalid)
    if (original.url?.includes("/auth/refresh")) {
      console.warn("[auth] Refresh token invalid or expired — logging out");
      _handleSessionExpired();
      return Promise.reject(error);
    }

    original._retry = true;

    console.info("[auth] Access token expired — starting refresh");

    if (refreshPromise === null) {
      refreshPromise = axios
        .post<{ accessToken: string; refreshToken: string }>(
          "/api/auth/refresh",
          {},
          { withCredentials: true },
        )
        .then(({ data }) => data)
        .finally(() => {
          refreshPromise = null;
        });
    }

    try {
      const data = await refreshPromise;
      setAccessToken(data.accessToken);
      original.headers.Authorization = `Bearer ${data.accessToken}`;
      console.info("[auth] Refresh succeeded — replaying original request");
      return api(original);
    } catch (refreshError) {
      const status = (refreshError as { response?: { status?: number } })?.response?.status;
      if (status === 401 || status === 403) {
        // Refresh token is genuinely expired or revoked — hard logout
        console.warn(`[auth] Refresh returned ${status} — session expired, logging out`);
        _handleSessionExpired();
      } else {
        // Transient error (5xx, network timeout) — don't log out; let the
        // original request fail so the caller can show a retry UI
        console.error("[auth] Refresh failed with transient error — not logging out", refreshError);
      }
      return Promise.reject(refreshError);
    }
  },
);

function _handleSessionExpired() {
  setAccessToken(null);
  if (typeof window !== "undefined") {
    const path = window.location.pathname;
    const isProtectedRoute =
      path.startsWith("/dashboard") || path.startsWith("/admin");
    if (isProtectedRoute) {
      window.location.href = "/login";
    }
  }
}
