import { ConvexError } from "convex/values";

export const RATE_LIMIT_SESSION_COOKIE = "headsalon-anonymous-session";

export type RateLimitPayload = {
  kind: "RateLimited";
  retryAfter: number;
};

export type RateLimitDeadline = { retryAfter: number } | { retryAt: number };

function isRateLimitPayload(value: unknown): value is RateLimitPayload {
  if (typeof value !== "object" || value === null) return false;

  const payload = value as Record<string, unknown>;
  return (
    payload.kind === "RateLimited" &&
    typeof payload.retryAfter === "number" &&
    Number.isFinite(payload.retryAfter) &&
    payload.retryAfter > 0
  );
}

export function getRateLimitRetryAfter(error: unknown): number | null {
  if (error instanceof ConvexError && isRateLimitPayload(error.data)) {
    return error.data.retryAfter;
  }

  if (!(error instanceof Error)) return null;

  try {
    const payload: unknown = JSON.parse(error.message);
    return isRateLimitPayload(payload) ? payload.retryAfter : null;
  } catch {
    return null;
  }
}

export function getRateLimitMessage(secondsRemaining: number): string {
  return `Too many requests. Try again in ${secondsRemaining} seconds.`;
}
