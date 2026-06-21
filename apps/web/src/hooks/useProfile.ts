"use client";

import { useState, useEffect, useCallback } from "react";
import { useDispatch } from "react-redux";
import { api } from "@/lib/api";
import { setCredentials } from "@/store/authSlice";
import type { UserProfile, UserPreferences } from "@axiom/shared-types";

function authHeader() {
  const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function useProfile() {
  const dispatch = useDispatch();
  const [profile, setProfile]     = useState<UserProfile | null>(null);
  const [prefs, setPrefs]         = useState<UserPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]         = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    try {
      setIsLoading(true);
      const [profileRes, prefsRes] = await Promise.all([
        api.get("/users/me", { headers: authHeader() }),
        api.get("/users/me/preferences", { headers: authHeader() }),
      ]);
      setProfile(profileRes.data.user);
      setPrefs(prefsRes.data.preferences);
    } catch {
      setError("Failed to load profile");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  async function updateProfile(data: Partial<UserProfile>) {
    const res = await api.put("/users/me", data, { headers: authHeader() });
    const updated = res.data.user;
    setProfile(updated);
    // keep Redux user in sync
    const token = localStorage.getItem("accessToken") ?? "";
    dispatch(setCredentials({ user: updated, accessToken: token }));
    return updated;
  }

  async function changePassword(currentPassword: string, newPassword: string) {
    await api.patch("/users/me/password", { currentPassword, newPassword }, { headers: authHeader() });
  }

  async function updatePreferences(data: Partial<UserPreferences>) {
    const res = await api.put("/users/me/preferences", data, { headers: authHeader() });
    setPrefs(res.data.preferences);
    return res.data.preferences;
  }

  async function deleteAccount() {
    await api.delete("/users/me", { headers: authHeader() });
  }

  return { profile, prefs, isLoading, error, updateProfile, changePassword, updatePreferences, deleteAccount, refetch: fetchProfile };
}
