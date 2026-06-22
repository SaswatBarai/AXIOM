"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Briefcase,
  ClipboardList,
  Bot,
  BarChart2,
  GraduationCap,
  MapPin,
  Settings,
  LogOut,
  ChevronRight,
  PanelLeftClose,
  MessageSquare,
  Shield,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard",              label: "Overview",     icon: LayoutDashboard },
  { href: "/dashboard/resume",       label: "Resume",       icon: FileText },
  { href: "/dashboard/jobs",         label: "Jobs",         icon: Briefcase },
  { href: "/dashboard/applications", label: "Applications", icon: ClipboardList },
  { href: "/dashboard/skills",       label: "Skills",       icon: GraduationCap },
  { href: "/dashboard/interview",    label: "Interview",    icon: MessageSquare },
  { href: "/dashboard/roadmap",      label: "Roadmap",      icon: MapPin },
  { href: "/dashboard/copilot",      label: "AI Copilot",   icon: Bot },
  { href: "/dashboard/analytics",    label: "Analytics",    icon: BarChart2 },
  { href: "/dashboard/settings",     label: "Settings",     icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  function handleLogout() {
    logout();
    router.push("/login");
  }

  return (
    <aside
      className={cn(
        "flex flex-col h-full border-r border-zinc-800/80 bg-zinc-950 transition-all duration-300 ease-in-out select-none",
        collapsed ? "w-[68px]" : "w-64"
      )}
    >
      {/* ─── Header: Logo + Collapse ─── */}
      <div className="flex items-center h-14 border-b border-zinc-800/80 px-3 shrink-0">
        <div
          className={cn(
            "flex items-center w-full transition-all duration-300",
            collapsed ? "justify-center" : "justify-between"
          )}
        >
          <div
            className={cn(
              "flex items-center gap-2.5 min-w-0",
              collapsed && "cursor-pointer hover:opacity-80 transition-opacity"
            )}
            onClick={collapsed ? () => setCollapsed(false) : undefined}
            title={collapsed ? "Expand sidebar" : undefined}
          >
            <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center font-bold text-sm text-black shrink-0">
              A
            </div>
            {!collapsed && (
              <span className="font-semibold text-[15px] text-white tracking-tight transition-opacity duration-200">
                AXIOM
              </span>
            )}
          </div>

          {!collapsed && (
            <button
              onClick={() => setCollapsed(true)}
              className="flex items-center justify-center h-8 w-8 rounded-lg text-zinc-500 hover:text-white hover:bg-white/[0.04] transition-all duration-150 shrink-0"
              title="Collapse sidebar"
            >
              <PanelLeftClose size={18} />
            </button>
          )}
        </div>
      </div>

      {/* ─── Navigation ─── */}
      <nav className="flex-1 overflow-y-auto py-3 scrollbar-none">
        <div className={cn("space-y-0.5", collapsed ? "px-2" : "px-3")}>
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active =
              pathname === href ||
              (href !== "/dashboard" && pathname.startsWith(href));

            return (
              <Link
                key={href}
                href={href}
                title={collapsed ? label : undefined}
                className={cn(
                  "flex items-center rounded-lg text-[13px] font-medium transition-all duration-150 group relative",
                  active
                    ? "bg-white/[0.08] text-white shadow-sm"
                    : "text-zinc-400 hover:text-white hover:bg-white/[0.04]",
                  collapsed
                    ? "h-10 w-10 justify-center mx-auto"
                    : "h-10 gap-3 px-3"
                )}
              >
                <Icon
                  size={18}
                  strokeWidth={active ? 2 : 1.75}
                  className={cn(
                    "shrink-0 transition-colors",
                    active ? "text-white" : "text-zinc-500 group-hover:text-zinc-300"
                  )}
                />
                {!collapsed && (
                  <span className="transition-opacity duration-150 truncate">
                    {label}
                  </span>
                )}
                {active && !collapsed && (
                  <ChevronRight
                    size={14}
                    className="ml-auto text-zinc-600 transition-transform duration-200"
                  />
                )}

                {/* Active indicator dot for collapsed mode */}
                {active && collapsed && (
                  <span className="absolute -right-0.5 top-1/2 -translate-y-1/2 w-[3px] h-4 bg-brand rounded-full" />
                )}
              </Link>
            );
          })}

          {user?.role === "ADMIN" && (
            <>
              <div className="border-t border-zinc-800/40 my-2" />
              <Link
                href="/admin/overview"
                title={collapsed ? "Admin" : undefined}
                className={cn(
                  "flex items-center rounded-lg text-[13px] font-medium transition-all duration-150 group relative",
                  pathname.startsWith("/admin")
                    ? "bg-white/[0.08] text-white shadow-sm"
                    : "text-zinc-400 hover:text-white hover:bg-white/[0.04]",
                  collapsed
                    ? "h-10 w-10 justify-center mx-auto"
                    : "h-10 gap-3 px-3"
                )}
              >
                <Shield
                  size={18}
                  strokeWidth={pathname.startsWith("/admin") ? 2 : 1.75}
                  className={cn(
                    "shrink-0 transition-colors",
                    pathname.startsWith("/admin") ? "text-red-400" : "text-zinc-500 group-hover:text-zinc-300"
                  )}
                />
                {!collapsed && (
                  <span className="transition-opacity duration-150 truncate">Admin</span>
                )}
                {pathname.startsWith("/admin") && !collapsed && (
                  <ChevronRight size={14} className="ml-auto text-zinc-600" />
                )}
                {pathname.startsWith("/admin") && collapsed && (
                  <span className="absolute -right-0.5 top-1/2 -translate-y-1/2 w-[3px] h-4 bg-brand rounded-full" />
                )}
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* ─── Footer: User + Logout ─── */}
      <div
        className={cn(
          "border-t border-zinc-800/80 shrink-0",
          collapsed ? "px-2 py-3" : "px-3 py-3"
        )}
      >
        {/* User info + Logout */}
        <div>
          {user && (
            <div
              className={cn(
                "flex items-center rounded-lg transition-all duration-200 mb-1.5",
                collapsed ? "h-10 w-10 justify-center mx-auto" : "gap-3 px-3 py-1"
              )}
            >
              <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700/50 flex items-center justify-center shrink-0">
                <span className="text-xs font-semibold text-zinc-300 uppercase">
                  {user.name?.charAt(0) ?? user.email.charAt(0)}
                </span>
              </div>
              {!collapsed && (
                <div className="min-w-0 flex flex-col justify-center transition-opacity duration-200">
                  <p className="text-xs font-semibold text-white truncate leading-none">
                    {user.name ?? "User"}
                  </p>
                  <p className="text-[10px] text-zinc-500 truncate leading-none mt-0.5">
                    {user.email}
                  </p>
                </div>
              )}
            </div>
          )}

          <button
            onClick={handleLogout}
            title={collapsed ? "Log out" : undefined}
            className={cn(
              "flex items-center rounded-lg text-[13px] font-medium text-zinc-500 hover:text-red-400 hover:bg-red-500/[0.08] transition-all duration-150 group cursor-pointer",
              collapsed
                ? "h-10 w-10 justify-center mx-auto"
                : "h-10 w-full gap-3 px-3"
            )}
          >
            <span className="w-8 h-8 flex items-center justify-center shrink-0">
              <LogOut
                size={18}
                strokeWidth={1.75}
                className="text-zinc-500 group-hover:text-red-400 transition-colors"
              />
            </span>
            {!collapsed && (
              <span className="transition-opacity duration-150">Log out</span>
            )}
          </button>
        </div>
      </div>
    </aside>
  );
}
