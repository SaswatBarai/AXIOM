"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { api } from "@/lib/api";

export interface AppNotification {
  id:        string;
  type:      string;
  payload:   Record<string, unknown>;
  readAt:    string | null;
  createdAt: string;
}

export interface JobAlert {
  id:         string;
  name:       string;
  filters:    Record<string, unknown>;
  frequency:  "instant" | "daily" | "weekly";
  active:     boolean;
  lastSentAt: string | null;
  createdAt:  string;
}

export function useNotifications(token?: string) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount]     = useState(0);
  const [alerts, setAlerts]               = useState<JobAlert[]>([]);
  const socketRef                         = useRef<Socket | null>(null);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchNotifications = useCallback(async () => {
    try {
      const { data } = await api.get<{ notifications: AppNotification[]; unreadCount: number }>("/notifications");
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch { /* silent */ }
  }, []);

  const fetchAlerts = useCallback(async () => {
    try {
      const { data } = await api.get<{ alerts: JobAlert[] }>("/notifications/alerts");
      setAlerts(data.alerts);
    } catch { /* silent */ }
  }, []);

  // ── Socket.IO real-time ────────────────────────────────────────────────────
  useEffect(() => {
    if (!token) return;
    const socket = io(process.env["NEXT_PUBLIC_API_URL"] ?? "http://localhost:4000", {
      auth: { token },
      transports: ["websocket"],
    });
    socketRef.current = socket;
    socket.on("notification", (n: AppNotification) => {
      setNotifications((prev) => [n, ...prev]);
      setUnreadCount((c) => c + 1);
    });
    return () => { socket.disconnect(); };
  }, [token]);

  // ── Actions ────────────────────────────────────────────────────────────────
  const markRead = useCallback(async (id: string) => {
    await api.post(`/notifications/${id}/read`);
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, readAt: new Date().toISOString() } : n));
    setUnreadCount((c) => Math.max(0, c - 1));
  }, []);

  const markAllRead = useCallback(async () => {
    await api.post("/notifications/read-all");
    setNotifications((prev) => prev.map((n) => ({ ...n, readAt: n.readAt ?? new Date().toISOString() })));
    setUnreadCount(0);
  }, []);

  const createAlert = useCallback(async (name: string, filters: Record<string, unknown>, frequency: "instant" | "daily" | "weekly") => {
    const { data } = await api.post<{ alert: JobAlert }>("/notifications/alerts", { name, filters, frequency });
    setAlerts((prev) => [data.alert, ...prev]);
    return data.alert;
  }, []);

  const toggleAlert = useCallback(async (id: string, active: boolean) => {
    const { data } = await api.patch<{ alert: JobAlert }>(`/notifications/alerts/${id}`, { active });
    setAlerts((prev) => prev.map((a) => a.id === id ? data.alert : a));
  }, []);

  const deleteAlert = useCallback(async (id: string) => {
    await api.delete(`/notifications/alerts/${id}`);
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  }, []);

  return {
    notifications, unreadCount, alerts,
    fetchNotifications, fetchAlerts,
    markRead, markAllRead,
    createAlert, toggleAlert, deleteAlert,
  };
}
