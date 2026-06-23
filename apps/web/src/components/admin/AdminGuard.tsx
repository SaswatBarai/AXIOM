"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [serverChecked, setServerChecked] = useState(false);
  const [isServerAdmin, setIsServerAdmin] = useState(false);

  useEffect(() => {
    async function verifyAdmin() {
      try {
        const res = await api.get("/users/me");
        setIsServerAdmin(res.data.user?.role === "ADMIN");
      } catch {
        setIsServerAdmin(false);
      } finally {
        setServerChecked(true);
      }
    }
    if (!isLoading && isAuthenticated) {
      verifyAdmin();
    } else if (!isLoading && !isAuthenticated) {
      setServerChecked(true);
      setIsServerAdmin(false);
    }
  }, [isLoading, isAuthenticated]);

  useEffect(() => {
    if (serverChecked && (!isAuthenticated || user?.role !== "ADMIN" || !isServerAdmin)) {
      router.replace("/dashboard");
    }
  }, [serverChecked, isAuthenticated, user, router, isServerAdmin]);

  if (isLoading || !serverChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-base">
        <div className="w-7 h-7 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== "ADMIN" || !isServerAdmin) return null;

  return <>{children}</>;
}
