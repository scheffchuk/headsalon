import { ConvexError } from "convex/values";
import { describe, expect, test } from "vitest";
import {
  getRateLimitRetryAfter,
  getRateLimitMessage,
} from "./rate-limit";

describe("rate-limit client contract", () => {
  test("reads retry timing from a Convex action error", () => {
    const error = new ConvexError({
      kind: "RateLimited",
      retryAfter: 6_001,
    });

    expect(getRateLimitRetryAfter(error)).toBe(6_001);
  });

  test("reads retry timing from a chat HTTP error body", () => {
    const error = new Error(
      JSON.stringify({ kind: "RateLimited", retryAfter: 12_000 }),
    );

    expect(getRateLimitRetryAfter(error)).toBe(12_000);
  });

  test("ignores unrelated errors", () => {
    expect(getRateLimitRetryAfter(new Error("offline"))).toBeNull();
  });

  test("formats the shared neutral countdown message", () => {
    expect(getRateLimitMessage(12)).toBe(
      "Too many requests. Try again in 12 seconds.",
    );
  });
});
