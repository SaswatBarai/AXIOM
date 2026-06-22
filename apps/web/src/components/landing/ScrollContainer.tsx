"use client";

import { useRef } from "react";
import { ScrollLine } from "./ScrollLine";

export function ScrollContainer({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={containerRef} className="relative w-full">
      {/* ScrollLine runs along the left perimeter margin of the grid */}
      <ScrollLine containerRef={containerRef} />
      
      {/* Content sections layered above the guide */}
      <div className="relative z-10 w-full">
        {children}
      </div>
    </div>
  );
}
