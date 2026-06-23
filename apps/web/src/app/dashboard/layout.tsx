import type { Metadata } from "next";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { NotificationBell } from "@/components/dashboard/NotificationBell";
import { ProtectedRoute } from "@/components/shared/ProtectedRoute";

export const metadata: Metadata = {
  title: {
    default: "Dashboard",
    template: "%s | AXIOM",
  },
  robots: { index: false, follow: false },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-bg-base overflow-hidden relative">
        <div className="hidden md:flex md:flex-shrink-0">
          <Sidebar />
        </div>
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Topbar */}
          <header className="flex items-center justify-end px-6 py-3 border-b border-border-subtle bg-bg-base/80 backdrop-blur-sm flex-shrink-0">
            <NotificationBell />
          </header>
          <main className="flex-1 overflow-hidden">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
