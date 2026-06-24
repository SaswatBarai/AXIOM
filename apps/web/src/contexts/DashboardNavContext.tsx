"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import { usePathname, useRouter } from "next/navigation";

type DashboardNavContextValue = {
  isNavigating: boolean;
  targetHref: string | null;
  navigate: (href: string) => void;
};

const DashboardNavContext = createContext<DashboardNavContextValue | null>(null);

function hrefMatchesPathname(href: string, pathname: string): boolean {
  const path = href.split("?")[0]?.split("#")[0] ?? href;
  if (path === "/dashboard") return pathname === "/dashboard";
  return pathname === path || pathname.startsWith(`${path}/`);
}

export function DashboardNavProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [targetHref, setTargetHref] = useState<string | null>(null);
  const targetHrefRef = useRef<string | null>(null);

  const navigate = useCallback(
    (href: string) => {
      if (hrefMatchesPathname(href, pathname)) return;

      targetHrefRef.current = href;
      setTargetHref(href);
      startTransition(() => {
        router.push(href);
      });
    },
    [pathname, router],
  );

  useEffect(() => {
    const target = targetHrefRef.current;
    if (target && hrefMatchesPathname(target, pathname)) {
      targetHrefRef.current = null;
      setTargetHref(null);
    }
  }, [pathname]);

  const isNavigating =
    isPending || (targetHref !== null && !hrefMatchesPathname(targetHref, pathname));

  return (
    <DashboardNavContext.Provider value={{ isNavigating, targetHref, navigate }}>
      {children}
    </DashboardNavContext.Provider>
  );
}

export function useDashboardNav() {
  const context = useContext(DashboardNavContext);
  if (!context) {
    throw new Error("useDashboardNav must be used within DashboardNavProvider");
  }
  return context;
}
