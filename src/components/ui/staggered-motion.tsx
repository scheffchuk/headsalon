"use client";

import { motion } from "motion/react";
import { type ReactNode } from "react";

export function StaggeredMotion({
  children,
  index,
  delay = 0.05,
  maxDelay = 0.2,
  duration = 0.2,
  initialY = 20,
  className,
}: {
  children: ReactNode;
  index: number;
  delay?: number;
  maxDelay?: number;
  duration?: number;
  initialY?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: initialY }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration,
        delay: Math.min(index * delay, maxDelay),
        ease: "easeOut",
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
