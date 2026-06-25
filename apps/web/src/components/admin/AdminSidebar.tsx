"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  Users,
  Briefcase,
  Server,
  ScrollText,
  LogOut,
  ChevronRight,
  PanelLeftClose,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

const ADMIN_NAV = [
  { href: "/admin/overview", label: "Overview",  icon: BarChart3 },
  { href: "/admin/users",    label: "Users",      icon: Users },
  { href: "/admin/jobs",     label: "Jobs",       icon: Briefcase },
  { href: "/admin/system",   label: "System",     icon: Server },
  { href: "/admin/audit",    label: "Audit Log",  icon: ScrollText },
];

export function AdminSidebar() {
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
        "flex flex-col h-full border-r border-border-subtle bg-bg-card border-t-2 border-red-500/30 transition-all duration-300 ease-in-out select-none",
        collapsed ? "w-[68px]" : "w-64"
      )}
    >
      <div className="flex items-center h-14 border-b border-border-subtle px-3 shrink-0">
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
              <span className="font-semibold text-[15px] text-text-primary tracking-tight">
                Admin
              </span>
            )}
          </div>
          {!collapsed && (
            <button
              onClick={() => setCollapsed(true)}
              className="flex items-center justify-center h-8 w-8 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-hover transition-all duration-150 shrink-0"
              title="Collapse sidebar"
            >
              <PanelLeftClose size={18} />
            </button>
          )}
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-3 scrollbar-none">
        <div className={cn("space-y-0.5", collapsed ? "px-2" : "px-3")}>
          {ADMIN_NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                title={collapsed ? label : undefined}
                className={cn(
                  "flex items-center rounded-lg text-[13px] font-medium transition-all duration-150 group relative",
                  active
                    ? "bg-bg-elevated text-text-primary shadow-sm"
                    : "text-text-secondary hover:text-text-primary hover:bg-bg-hover",
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
                    active ? "text-text-primary" : "text-text-muted group-hover:text-text-secondary"
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
                    className="ml-auto text-text-muted transition-transform duration-200"
                  />
                )}
                {active && collapsed && (
                  <span className="absolute -right-0.5 top-1/2 -translate-y-1/2 w-[3px] h-4 bg-brand rounded-full" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      <div className={cn("border-t border-border-subtle shrink-0", collapsed ? "px-2 py-3" : "px-3 py-3")}>
        {user && (
          <div
            className={cn(
              "flex items-center rounded-lg transition-all duration-200 mb-1.5",
              collapsed ? "h-10 w-10 justify-center mx-auto" : "gap-3 px-3 py-1"
            )}
          >
            <div className="w-8 h-8 rounded-full bg-bg-elevated border border-border-subtle flex items-center justify-center shrink-0">
              <span className="text-xs font-semibold text-text-primary uppercase">
                {user.name?.charAt(0) ?? user.email.charAt(0)}
              </span>
            </div>
            {!collapsed && (
              <div className="min-w-0 flex flex-col justify-center">
                <p className="text-xs font-semibold text-text-primary truncate leading-none">
                  {user.name ?? "Admin"}
                </p>
                <p className="text-[10px] text-text-secondary truncate leading-none mt-0.5">
                  {user.role}
                </p>
              </div>
            )}
          </div>
        )}
        <button
          onClick={handleLogout}
          title={collapsed ? "Log out" : undefined}
          className={cn(
            "flex items-center rounded-lg text-[13px] font-medium text-text-secondary hover:text-red-500 hover:bg-red-500/10 transition-all duration-150 group cursor-pointer",
            collapsed ? "h-10 w-10 justify-center mx-auto" : "h-10 w-full gap-3 px-3"
          )}
        >
          <span className="w-8 h-8 flex items-center justify-center shrink-0">
            <LogOut size={18} strokeWidth={1.75} className="text-text-secondary group-hover:text-red-500 transition-colors" />
          </span>
          {!collapsed && <span>Log out</span>}
        </button>
      </div>
    </aside>
  );
}
