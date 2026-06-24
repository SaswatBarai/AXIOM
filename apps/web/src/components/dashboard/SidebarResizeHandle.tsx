"use client";

import { useEffect, useRef } from "react";
import { useSidebar } from "@/contexts/SidebarContext";
import { cn } from "@/lib/utils";

export function SidebarResizeHandle() {
  const { collapsed, beginResize, endResize, resizeBy, isResizing } = useSidebar();
  const dragging = useRef(false);

  useEffect(() => {
    function onMouseMove(e: MouseEvent) {
      if (!dragging.current) return;
      resizeBy(e.movementX);
    }

    function onMouseUp() {
      if (!dragging.current) return;
      dragging.current = false;
      endResize();
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    }

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [resizeBy, endResize]);

  if (collapsed) return null;

  return (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-label="Resize sidebar"
      className={cn(
        "absolute top-0 right-0 z-20 h-full w-1.5 cursor-col-resize touch-none",
        "group/handle flex items-center justify-center",
        isResizing ? "bg-brand/30" : "hover:bg-brand/15",
      )}
      onMouseDown={(e) => {
        e.preventDefault();
        dragging.current = true;
        beginResize();
        document.body.style.cursor = "col-resize";
        document.body.style.userSelect = "none";
      }}
    >
      <div
        className={cn(
          "h-8 w-0.5 rounded-full bg-border-medium opacity-0 transition-opacity",
          "group-hover/handle:opacity-100",
          isResizing && "opacity-100 bg-brand",
        )}
      />
    </div>
  );
}
