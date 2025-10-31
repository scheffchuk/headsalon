"use client";

import { useRef, ReactNode } from "react";
import { ScrollProgress } from "@/components/ui/scroll-progress";

type ArticleWithScrollProgressProps = {
  children: ReactNode;
};

export function ArticleWithScrollProgress({
  children,
}: ArticleWithScrollProgressProps) {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div className="mx-auto py-8" ref={ref}>
      <div className="pointer-events-none fixed left-0 top-0 w-full z-50">
        <ScrollProgress
          className="absolute bg-[#3399FF]"
          containerRef={ref}
        />
      </div>
      {children}
    </div>
  );
}

