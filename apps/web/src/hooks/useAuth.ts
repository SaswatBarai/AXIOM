"use client";

import { useEffect, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "@/store";
import { setCredentials, clearCredentials, setLoading } from "@/store/authSlice";
import { api, setAccessToken } from "@/lib/api";

export function useAuth() {
  const dispatch = useDispatch<AppDispatch>();
  const { user, accessToken, isAuthenticated, isLoading } = useSelector(
    (state: RootState) => state.auth,
  );
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current || isAuthenticated) {
      dispatch(setLoading(false));
      return;
    }
    initialized.current = true;
    api
      .get("/auth/me", { withCredentials: true })
      .then(({ data }) => {
        dispatch(setCredentials({ user: data.user, accessToken: "" }));
      })
      .catch(() => {
        setAccessToken(null);
        dispatch(clearCredentials());
      });
  }, [dispatch, isAuthenticated]);

  async function logout() {
    try { await api.post("/auth/logout", {}, { withCredentials: true }); }
    finally { setAccessToken(null); dispatch(clearCredentials()); }
  }

  return { user, accessToken, isAuthenticated, isLoading, logout };
}
