"use client";

import { useRef, type ReactNode } from "react";
import { ScrollProgress } from "@/components/ui/scroll-progress";

export function ArticleWithScrollProgress({
  children,
}: {
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div className="mx-auto py-8" ref={ref}>
      <div className="pointer-events-none fixed left-0 top-0 w-full z-50">
        <ScrollProgress
          className="absolute bg-brand"
          containerRef={ref}
        />
      </div>
      {children}
    </div>
  );
}

