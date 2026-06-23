"use client";

import axios from "axios";

export const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// Attach access token from Redux on every request
let _accessToken: string | null = null;
export function setAccessToken(token: string | null) {
  _accessToken = token;
}

api.interceptors.request.use((config) => {
  if (_accessToken) {
    config.headers.Authorization = `Bearer ${_accessToken}`;
  }
  return config;
});

// Auto-refresh on 401 — with mutex to prevent concurrent refresh calls
let refreshPromise: Promise<{ accessToken: string; refreshToken: string }> | null = null;

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      if (refreshPromise === null) {
        refreshPromise = axios
          .post("/api/auth/refresh", {}, { withCredentials: true })
          .then(({ data }) => data)
          .finally(() => { refreshPromise = null; });
      }
      try {
        const data = await refreshPromise;
        setAccessToken(data.accessToken);
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(original);
      } catch {
        setAccessToken(null);
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);
