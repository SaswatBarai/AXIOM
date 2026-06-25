"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";

export const SIDEBAR_COLLAPSED_WIDTH = 68;
export const SIDEBAR_DEFAULT_WIDTH = 256;
export const SIDEBAR_MIN_WIDTH = 200;
export const SIDEBAR_MAX_WIDTH = 360;

const STORAGE_COLLAPSED = "axiom-sidebar-collapsed";
const STORAGE_WIDTH = "axiom-sidebar-width";

type SidebarContextValue = {
  collapsed: boolean;
  width: number;
  effectiveWidth: number;
  isResizing: boolean;
  toggleCollapsed: () => void;
  setCollapsed: (collapsed: boolean) => void;
  setWidth: (width: number) => void;
  beginResize: () => void;
  endResize: () => void;
  resizeBy: (deltaX: number) => void;
};

const SidebarContext = createContext<SidebarContextValue | null>(null);

function clampWidth(value: number) {
  return Math.min(SIDEBAR_MAX_WIDTH, Math.max(SIDEBAR_MIN_WIDTH, value));
}

function readStoredCollapsed(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(STORAGE_COLLAPSED) === "true";
}

function readStoredWidth(): number {
  if (typeof window === "undefined") return SIDEBAR_DEFAULT_WIDTH;
  const raw = localStorage.getItem(STORAGE_WIDTH);
  if (!raw) return SIDEBAR_DEFAULT_WIDTH;
  const n = Number(raw);
  return Number.isFinite(n) ? clampWidth(n) : SIDEBAR_DEFAULT_WIDTH;
}

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsedState] = useState(false);
  const [width, setWidthState] = useState(SIDEBAR_DEFAULT_WIDTH);
  const [hydrated, setHydrated] = useState(false);
  const [isResizing, setIsResizing] = useState(false);

  useLayoutEffect(() => {
    setCollapsedState(readStoredCollapsed());
    setWidthState(readStoredWidth());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_COLLAPSED, String(collapsed));
  }, [collapsed, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_WIDTH, String(width));
  }, [width, hydrated]);

  const setCollapsed = useCallback((value: boolean) => {
    setCollapsedState(value);
  }, []);

  const toggleCollapsed = useCallback(() => {
    setCollapsedState((prev) => !prev);
  }, []);

  const setWidth = useCallback((value: number) => {
    setWidthState(clampWidth(value));
  }, []);

  const beginResize = useCallback(() => setIsResizing(true), []);
  const endResize = useCallback(() => setIsResizing(false), []);

  const resizeBy = useCallback((deltaX: number) => {
    if (deltaX === 0) return;
    setWidthState((prev) => clampWidth(prev + deltaX));
  }, []);

  const effectiveWidth = collapsed ? SIDEBAR_COLLAPSED_WIDTH : width;

  const value = useMemo(
    () => ({
      collapsed,
      width,
      effectiveWidth,
      isResizing,
      toggleCollapsed,
      setCollapsed,
      setWidth,
      beginResize,
      endResize,
      resizeBy,
    }),
    [
      collapsed,
      width,
      effectiveWidth,
      isResizing,
      toggleCollapsed,
      setCollapsed,
      setWidth,
      beginResize,
      endResize,
      resizeBy,
    ],
  );

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within SidebarProvider");
  }
  return context;
}
