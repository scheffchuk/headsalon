"use client";

import { ElementType, useEffect, useRef, useMemo } from "react";
import { motion, ValueAnimationTransition } from "motion/react";
import { cn } from "@/lib/utils";

const CenterUnderline = ({
  children,
  as,
  className,
  transition = { duration: 0.2, ease: "easeInOut" },
  underlineHeightRatio = 0.1,
  underlinePaddingRatio = 0.01,
  ...props
}: {
  children: React.ReactNode;
  as?: ElementType;
  className?: string;
  transition?: ValueAnimationTransition;
  underlineHeightRatio?: number;
  underlinePaddingRatio?: number;
}) => {
  const textRef = useRef<HTMLSpanElement>(null);
  const MotionComponent = useMemo(() => motion.create(as ?? "span"), [as]);

  useEffect(() => {
    const updateUnderlineStyles = () => {
      if (textRef.current) {
        const fontSize = parseFloat(getComputedStyle(textRef.current).fontSize);
        const underlineHeight = fontSize * underlineHeightRatio;
        const underlinePadding = fontSize * underlinePaddingRatio;
        textRef.current.style.setProperty(
          "--underline-height",
          `${underlineHeight}px`
        );
        textRef.current.style.setProperty(
          "--underline-padding",
          `${underlinePadding}px`
        );
      }
    };

    updateUnderlineStyles();
    window.addEventListener("resize", updateUnderlineStyles);

    return () => window.removeEventListener("resize", updateUnderlineStyles);
  }, [underlineHeightRatio, underlinePaddingRatio]);

  const underlineVariants = {
    hidden: {
      width: 0,
      originX: 0.5,
    },
    visible: {
      width: "100%",
      transition: transition,
    },
  };

  return (
    <MotionComponent
      className={cn("relative inline-block cursor-pointer", className)}
      whileHover="visible"
      ref={textRef}
      {...props}
    >
      <span>{children}</span>
      <motion.div
        className="absolute left-1/2 bg-current -translate-x-1/2"
        style={{
          height: "var(--underline-height)",
          bottom: "calc(-1 * var(--underline-padding))",
        }}
        variants={underlineVariants}
        aria-hidden="true"
      />
    </MotionComponent>
  );
};

CenterUnderline.displayName = "CenterUnderline";

export default CenterUnderline;
