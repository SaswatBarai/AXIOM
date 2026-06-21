"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "@/store";
import { setCredentials, clearCredentials, setLoading } from "@/store/authSlice";
import { api } from "@/lib/api";

export function useAuth() {
  const dispatch = useDispatch<AppDispatch>();
  const { user, accessToken, isAuthenticated, isLoading } = useSelector(
    (state: RootState) => state.auth,
  );

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
    if (!token) {
      dispatch(setLoading(false));
      return;
    }
    if (isAuthenticated) {
      dispatch(setLoading(false));
      return;
    }
    api
      .get("/auth/me", { headers: { Authorization: `Bearer ${token}` } })
      .then(({ data }) => {
        dispatch(setCredentials({ user: data.user, accessToken: token }));
      })
      .catch(() => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        dispatch(clearCredentials());
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function logout() {
    const token = localStorage.getItem("accessToken");
    if (token) {
      api
        .post("/auth/logout", {}, { headers: { Authorization: `Bearer ${token}` } })
        .catch(() => {});
    }
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    dispatch(clearCredentials());
  }

  return { user, accessToken, isAuthenticated, isLoading, logout };
}
