"use client";

import { usePathname, useRouter } from "next/navigation";
import { useDashboardNav } from "@/contexts/DashboardNavContext";
import { useSidebar } from "@/contexts/SidebarContext";
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
  PanelLeftOpen,
  MessageSquare,
  Shield,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { SidebarResizeHandle } from "@/components/dashboard/SidebarResizeHandle";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/resume", label: "Resume", icon: FileText },
  { href: "/dashboard/jobs", label: "Jobs", icon: Briefcase },
  { href: "/dashboard/applications", label: "Applications", icon: ClipboardList },
  { href: "/dashboard/skills", label: "Skills", icon: GraduationCap },
  { href: "/dashboard/interview", label: "Interview", icon: MessageSquare },
  { href: "/dashboard/roadmap", label: "Roadmap", icon: MapPin },
  { href: "/dashboard/copilot", label: "AI Copilot", icon: Bot },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart2 },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function Sidebar({
  mobile = false,
  onNavigate,
}: {
  mobile?: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { navigate } = useDashboardNav();
  const { collapsed, effectiveWidth, isResizing, toggleCollapsed, setCollapsed } = useSidebar();
  const { user, logout } = useAuth();

  const isCollapsed = mobile ? false : collapsed;

  function handleLogout() {
    onNavigate?.();
    logout();
    router.push("/login");
  }

  function handleNavClick(href: string, e: React.MouseEvent<HTMLAnchorElement>) {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    onNavigate?.();
    navigate(href);
  }

  function handleAdminClick(e: React.MouseEvent<HTMLAnchorElement>) {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    onNavigate?.();
    router.push("/admin/overview");
  }

  return (
    <aside
      className={cn(
        "relative flex flex-col h-full border-r border-border-subtle bg-bg-card select-none shrink-0",
        mobile && "w-full border-r-0",
        !mobile && !isResizing && "transition-[width] duration-300 ease-in-out",
      )}
      style={mobile ? undefined : { width: effectiveWidth }}
    >
      {!mobile && <SidebarResizeHandle />}

      {/* Header */}
      <div className="flex items-center h-14 border-b border-border-subtle px-3 shrink-0">
        <div
          className={cn(
            "flex items-center w-full",
            isCollapsed ? "justify-center" : "justify-between gap-2",
          )}
        >
          <div
            className={cn(
              "flex items-center gap-2.5 min-w-0",
              isCollapsed && !mobile && "cursor-pointer hover:opacity-80 transition-opacity",
            )}
            onClick={isCollapsed && !mobile ? () => setCollapsed(false) : undefined}
            title={isCollapsed && !mobile ? "Expand sidebar" : undefined}
          >
            <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center font-bold text-sm text-black shrink-0">
              A
            </div>
            {!isCollapsed && (
              <span className="font-semibold text-[15px] text-text-primary tracking-tight truncate">
                AXIOM
              </span>
            )}
          </div>

          {!isCollapsed && !mobile && (
            <button
              type="button"
              onClick={toggleCollapsed}
              className="flex items-center justify-center h-8 w-8 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-hover transition-all duration-150 shrink-0"
              title="Collapse sidebar"
              aria-label="Collapse sidebar"
            >
              <PanelLeftClose size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 scrollbar-none">
        <div className={cn("space-y-0.5", isCollapsed ? "px-2" : "px-3")}>
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active =
              pathname === href || (href !== "/dashboard" && pathname.startsWith(href));

            return (
              <a
                key={href}
                href={href}
                onClick={(e) => handleNavClick(href, e)}
                title={isCollapsed ? label : undefined}
                className={cn(
                  "flex items-center rounded-lg text-[13px] font-medium transition-all duration-150 group relative",
                  active
                    ? "bg-bg-elevated text-text-primary shadow-sm"
                    : "text-text-secondary hover:text-text-primary hover:bg-bg-hover",
                  isCollapsed ? "h-10 w-10 justify-center mx-auto" : "h-10 gap-3 px-3",
                )}
              >
                <Icon
                  size={18}
                  strokeWidth={active ? 2 : 1.75}
                  className={cn(
                    "shrink-0 transition-colors",
                    active ? "text-text-primary" : "text-text-muted group-hover:text-text-secondary",
                  )}
                />
                {!isCollapsed && <span className="truncate">{label}</span>}
                {active && !isCollapsed && (
                  <ChevronRight size={14} className="ml-auto text-text-muted shrink-0" />
                )}
                {active && isCollapsed && (
                  <span className="absolute -right-0.5 top-1/2 -translate-y-1/2 w-[3px] h-4 bg-brand rounded-full" />
                )}
              </a>
            );
          })}

          {user?.role === "ADMIN" && (
            <>
              <div className="border-t border-border-subtle/50 my-2" />
              <a
                href="/admin/overview"
                onClick={handleAdminClick}
                title={isCollapsed ? "Admin" : undefined}
                className={cn(
                  "flex items-center rounded-lg text-[13px] font-medium transition-all duration-150 group relative",
                  pathname.startsWith("/admin")
                    ? "bg-bg-elevated text-text-primary shadow-sm"
                    : "text-text-secondary hover:text-text-primary hover:bg-bg-hover",
                  isCollapsed ? "h-10 w-10 justify-center mx-auto" : "h-10 gap-3 px-3",
                )}
              >
                <Shield
                  size={18}
                  strokeWidth={pathname.startsWith("/admin") ? 2 : 1.75}
                  className={cn(
                    "shrink-0 transition-colors",
                    pathname.startsWith("/admin") ? "text-red-500" : "text-text-muted group-hover:text-text-secondary",
                  )}
                />
                {!isCollapsed && <span className="truncate">Admin</span>}
                {pathname.startsWith("/admin") && !isCollapsed && (
                  <ChevronRight size={14} className="ml-auto text-text-muted shrink-0" />
                )}
                {pathname.startsWith("/admin") && isCollapsed && (
                  <span className="absolute -right-0.5 top-1/2 -translate-y-1/2 w-[3px] h-4 bg-brand rounded-full" />
                )}
              </a>
            </>
          )}
        </div>
      </nav>

      {/* Footer */}
      <div className={cn("border-t border-border-subtle shrink-0", isCollapsed ? "px-2 py-3" : "px-3 py-3")}>
        {user && (
          <div
            className={cn(
              "flex items-center rounded-lg mb-1.5",
              isCollapsed ? "h-10 w-10 justify-center mx-auto" : "gap-3 px-3 py-1",
            )}
          >
            <div className="w-8 h-8 rounded-full bg-bg-elevated border border-border-subtle flex items-center justify-center shrink-0">
              <span className="text-xs font-semibold text-text-primary uppercase">
                {user.name?.charAt(0) ?? user.email.charAt(0)}
              </span>
            </div>
            {!isCollapsed && (
              <div className="min-w-0 flex flex-col justify-center">
                <p className="text-xs font-semibold text-text-primary truncate leading-none">
                  {user.name ?? "User"}
                </p>
                <p className="text-[10px] text-text-secondary truncate leading-none mt-0.5">
                  {user.email}
                </p>
              </div>
            )}
          </div>
        )}

        <button
          type="button"
          onClick={handleLogout}
          title={isCollapsed ? "Log out" : undefined}
          className={cn(
            "flex items-center rounded-lg text-[13px] font-medium text-text-secondary hover:text-red-500 hover:bg-red-500/10 transition-all duration-150 group cursor-pointer w-full",
            isCollapsed ? "h-10 w-10 justify-center mx-auto" : "h-10 gap-3 px-3",
          )}
        >
          <span className="w-8 h-8 flex items-center justify-center shrink-0">
            <LogOut
              size={18}
              strokeWidth={1.75}
              className="text-text-secondary group-hover:text-red-500 transition-colors"
            />
          </span>
          {!isCollapsed && <span>Log out</span>}
        </button>
      </div>
    </aside>
  );
}

export function SidebarToggleButton({ className }: { className?: string }) {
  const { collapsed, toggleCollapsed } = useSidebar();

  return (
    <button
      type="button"
      onClick={toggleCollapsed}
      className={cn(
        "flex items-center justify-center h-9 w-9 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-hover transition-colors",
        className,
      )}
      aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
    >
      {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
    </button>
  );
}
