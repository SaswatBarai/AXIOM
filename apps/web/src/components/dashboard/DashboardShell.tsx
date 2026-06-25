"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Sidebar, SidebarToggleButton } from "@/components/dashboard/Sidebar";
import { SidebarProvider } from "@/contexts/SidebarContext";
import { RouteSkeleton } from "@/components/dashboard/RouteSkeleton";
import { NotificationBell } from "@/components/dashboard/NotificationBell";
import { Button } from "@/components/ui/button";
import { DashboardNavProvider, useDashboardNav } from "@/contexts/DashboardNavContext";
import { cn } from "@/lib/utils";

function DashboardMain({ children }: { children: React.ReactNode }) {
  const { isNavigating, targetHref } = useDashboardNav();

  return (
    <main className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
      {isNavigating && targetHref ? <RouteSkeleton href={targetHref} /> : children}
    </main>
  );
}

function DashboardShellInner({ children }: { children: React.ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const pathname = usePathname();
  const { navigate } = useDashboardNav();

  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileNavOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileNavOpen]);

  return (
    <div className="flex h-[100dvh] bg-bg-base overflow-hidden relative">
      {/* Desktop sidebar */}
      <div className="hidden md:flex md:flex-shrink-0 h-full">
        <Sidebar />
      </div>

      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="flex items-center justify-between gap-3 px-4 sm:px-6 py-3 border-b border-border-subtle bg-bg-base/80 backdrop-blur-sm flex-shrink-0 safe-area-top">
          <div className="flex items-center gap-2 min-w-0">
            <SidebarToggleButton className="hidden md:flex shrink-0" />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="md:hidden h-9 w-9 shrink-0 text-text-secondary hover:text-text-primary"
              onClick={() => setMobileNavOpen(true)}
              aria-label="Open navigation menu"
              aria-expanded={mobileNavOpen}
            >
              <Menu size={18} />
            </Button>
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2 min-w-0 md:hidden"
            >
              <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center font-bold text-sm text-black shrink-0">
                A
              </div>
              <span className="font-semibold text-sm text-text-primary truncate">AXIOM</span>
            </button>
          </div>
          <NotificationBell />
        </header>

        <DashboardMain>{children}</DashboardMain>
      </div>

      {/* Mobile nav drawer */}
      <AnimatePresence>
        {mobileNavOpen && (
          <>
            <motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-[2px] md:hidden"
              aria-label="Close navigation menu"
              onClick={() => setMobileNavOpen(false)}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.22, ease: "easeInOut" }}
              className={cn(
                "fixed inset-y-0 left-0 z-50 w-[min(18rem,88vw)] md:hidden",
                "shadow-2xl border-r border-border-subtle",
              )}
            >
              <div className="relative h-full">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute top-3 right-3 z-10 h-8 w-8 text-text-muted hover:text-text-primary"
                  onClick={() => setMobileNavOpen(false)}
                  aria-label="Close navigation menu"
                >
                  <X size={16} />
                </Button>
                <Sidebar mobile onNavigate={() => setMobileNavOpen(false)} />
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <DashboardNavProvider>
      <SidebarProvider>
        <DashboardShellInner>{children}</DashboardShellInner>
      </SidebarProvider>
    </DashboardNavProvider>
  );
}
