"use client";

import { useEffect, useRef, useState } from "react";
import { Bell, CheckCheck, X, Briefcase, BarChart2, MessageSquare } from "lucide-react";
import { useNotifications, type AppNotification } from "@/hooks/useNotifications";
import { useAuth } from "@/hooks/useAuth";

const TYPE_ICON: Record<string, React.ElementType> = {
  JOB_ALERT:     Briefcase,
  WEEKLY_DIGEST: BarChart2,
};

const TYPE_LABEL: Record<string, string> = {
  JOB_ALERT:     "Job Alert",
  WEEKLY_DIGEST: "Weekly Digest",
};

function NotifItem({ n, onRead }: { n: AppNotification; onRead: () => void }) {
  const Icon = TYPE_ICON[n.type] ?? MessageSquare;
  return (
    <div
      className={`flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-gray-700/50 transition-colors
        ${!n.readAt ? "bg-orange-900/10 border-l-2 border-orange-500" : ""}`}
      onClick={onRead}
    >
      <div className="flex-shrink-0 mt-0.5 p-1.5 rounded-lg bg-gray-700">
        <Icon size={13} className="text-orange-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-gray-300">{TYPE_LABEL[n.type] ?? n.type}</p>
        <p className="text-[11px] text-gray-500 mt-0.5 truncate">
          {(n.payload as Record<string, string>)["jobTitle"] ?? (n.payload as Record<string, string>)["alertName"] ?? "New notification"}
        </p>
        <p className="text-[10px] text-gray-600 mt-0.5">
          {new Date(n.createdAt).toLocaleDateString()}
        </p>
      </div>
      {!n.readAt && (
        <div className="flex-shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full bg-orange-500" />
      )}
    </div>
  );
}

export function NotificationBell() {
  const { user } = useAuth();
  const { notifications, unreadCount, fetchNotifications, markRead, markAllRead } = useNotifications(
    typeof window !== "undefined" ? (localStorage.getItem("accessToken") ?? undefined) : undefined,
  );
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!user) return null;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="relative p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
        aria-label="Notifications"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-brand text-[10px] font-bold text-black flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-10 w-80 rounded-xl border border-gray-700 bg-gray-800 shadow-2xl z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
            <span className="text-sm font-semibold text-white">Notifications</span>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllRead}
                  className="flex items-center gap-1 text-[11px] text-orange-400 hover:text-orange-300 transition-colors"
                >
                  <CheckCheck size={12} /> Mark all read
                </button>
              )}
              <button type="button" onClick={() => setOpen(false)} className="text-gray-500 hover:text-gray-300">
                <X size={14} />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-gray-700/50">
            {notifications.length === 0 ? (
              <div className="py-10 text-center text-sm text-gray-500">No notifications yet</div>
            ) : (
              notifications.map((n) => (
                <NotifItem key={n.id} n={n} onRead={() => { if (!n.readAt) markRead(n.id); }} />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
