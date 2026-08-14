"use client";

import { motion, SpringOptions, useScroll, useSpring } from "motion/react";
import { cn } from "@/lib/utils";
import { RefObject } from "react";

const DEFAULT_SPRING_OPTIONS: SpringOptions = {
  stiffness: 200,
  damping: 50,
  restDelta: 0.001,
};

export function ScrollProgress({
  className,
  springOptions,
  containerRef,
}: {
  className?: string;
  springOptions?: SpringOptions;
  containerRef?: RefObject<HTMLDivElement | null>;
}) {
  const { scrollYProgress } = useScroll({
    target: containerRef,
  });

  const scaleX = useSpring(scrollYProgress, {
    ...DEFAULT_SPRING_OPTIONS,
    ...(springOptions ?? {}),
  });

  return (
    <motion.div
      className={cn("inset-x-0 top-0 h-1 origin-left", className)}
      style={{
        scaleX,
      }}
    />
  );
}
