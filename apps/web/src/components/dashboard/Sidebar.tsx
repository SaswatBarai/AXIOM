"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Briefcase,
  ClipboardList,
  Bot,
  BarChart2,
  Settings,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard",              label: "Overview",     icon: LayoutDashboard },
  { href: "/dashboard/resume",       label: "Resume",       icon: FileText },
  { href: "/dashboard/jobs",         label: "Jobs",         icon: Briefcase },
  { href: "/dashboard/applications", label: "Applications", icon: ClipboardList },
  { href: "/dashboard/copilot",      label: "AI Copilot",   icon: Bot },
  { href: "/dashboard/analytics",    label: "Analytics",    icon: BarChart2 },
  { href: "/dashboard/settings",     label: "Settings",     icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  function handleLogout() {
    logout();
    router.push("/login");
  }

  return (
    <aside className="w-64 flex flex-col h-full border-r border-zinc-800 bg-zinc-950">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-zinc-800">
        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center font-bold text-base text-black shrink-0">
          A
        </div>
        <span className="font-semibold text-white tracking-tight">AXIOM</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors group",
                active
                  ? "bg-white/10 text-white"
                  : "text-zinc-400 hover:text-white hover:bg-white/5"
              )}
            >
              <Icon
                size={17}
                className={cn(
                  "shrink-0 transition-colors",
                  active ? "text-white" : "text-zinc-500 group-hover:text-zinc-300"
                )}
              />
              <span>{label}</span>
              {active && (
                <ChevronRight size={14} className="ml-auto text-zinc-400" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User + Logout */}
      <div className="border-t border-zinc-800 p-3 space-y-1">
        {user && (
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0">
              <span className="text-xs font-semibold text-zinc-300 uppercase">
                {user.name?.charAt(0) ?? user.email.charAt(0)}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">{user.name ?? "User"}</p>
              <p className="text-xs text-zinc-500 truncate">{user.email}</p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-zinc-400 hover:text-white hover:bg-red-500/10 hover:text-red-400 transition-colors group"
        >
          <LogOut size={17} className="shrink-0 text-zinc-500 group-hover:text-red-400 transition-colors" />
          <span>Log out</span>
        </button>
      </div>
    </aside>
  );
}
