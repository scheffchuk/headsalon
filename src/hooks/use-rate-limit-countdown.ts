"use client";

import { useEffect, useState } from "react";
import {
  getRateLimitMessage,
  type RateLimitDeadline,
} from "@/lib/rate-limit";

export function useRateLimitCountdown(initialRetryAfter?: number | null) {
  const [deadline, setDeadline] = useState<RateLimitDeadline | null>(
    initialRetryAfter == null ? null : { retryAfter: initialRetryAfter },
  );
  const [now, setNow] = useState(0);

  const start = (retryAfter: number) => {
    const startedAt = Date.now();
    setNow(startedAt);
    setDeadline({ retryAt: startedAt + retryAfter });
  };

  useEffect(() => {
    if (deadline === null) return;

    const update = () => {
      const currentTime = Date.now();
      setNow(currentTime);
      if ("retryAfter" in deadline) {
        setDeadline({ retryAt: currentTime + deadline.retryAfter });
      } else if (currentTime >= deadline.retryAt) {
        setDeadline(null);
      }
    };

    const interval = window.setInterval(update, 100);
    return () => window.clearInterval(interval);
  }, [deadline]);

  const secondsRemaining =
    deadline === null
      ? null
      : "retryAfter" in deadline
        ? Math.ceil(deadline.retryAfter / 1_000)
        : Math.max(1, Math.ceil((deadline.retryAt - now) / 1_000));

  return {
    isRateLimited: secondsRemaining !== null,
    message:
      secondsRemaining === null
        ? null
        : getRateLimitMessage(secondsRemaining),
    secondsRemaining,
    start,
  };
}
