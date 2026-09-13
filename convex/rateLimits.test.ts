/// <reference types="vite/client" />

import { register as registerRateLimiter } from "@convex-dev/rate-limiter/test";
import { convexTest } from "convex-test";
import { describe, expect, test } from "vitest";
import { internal } from "./_generated/api";
import schema from "./schema";

const modules = import.meta.glob(
  ["./schema.ts", "./rateLimits.ts", "./_generated/**/*"],
  { eager: false },
);

function setup() {
  const t = convexTest({ schema, modules });
  registerRateLimiter(t);
  return t;
}

describe("public AI rate limits", () => {
  test("chat allows the configured session burst then returns a retry delay", async () => {
    const t = setup();

    for (let request = 0; request < 3; request += 1) {
      await expect(
        t.mutation(internal.rateLimits.take, {
          operation: "chat",
          sessionId: "browser-a",
        }),
      ).resolves.toEqual({ ok: true, retryAfter: null });
    }

    const rejected = await t.mutation(internal.rateLimits.take, {
      operation: "chat",
      sessionId: "browser-a",
    });

    expect(rejected.ok).toBe(false);
    expect(rejected.retryAfter).toBeGreaterThan(0);

    await expect(
      t.mutation(internal.rateLimits.take, {
        operation: "chat",
        sessionId: "browser-b",
      }),
    ).resolves.toEqual({ ok: true, retryAfter: null });
  });

  test("chat shares a global ceiling across browser sessions", async () => {
    const t = setup();

    for (let request = 0; request < 20; request += 1) {
      const accepted = await t.mutation(internal.rateLimits.take, {
        operation: "chat",
        sessionId: `browser-${request}`,
      });
      expect(accepted).toEqual({ ok: true, retryAfter: null });
    }

    const rejected = await t.mutation(internal.rateLimits.take, {
      operation: "chat",
      sessionId: "browser-over-global-limit",
    });

    expect(rejected.ok).toBe(false);
    expect(rejected.retryAfter).toBeGreaterThan(0);
  });

  test("search has its own five-request session burst", async () => {
    const t = setup();

    for (let request = 0; request < 5; request += 1) {
      const accepted = await t.mutation(internal.rateLimits.take, {
        operation: "search",
        sessionId: "browser-a",
      });
      expect(accepted).toEqual({ ok: true, retryAfter: null });
    }

    const rejected = await t.mutation(internal.rateLimits.take, {
      operation: "search",
      sessionId: "browser-a",
    });

    expect(rejected.ok).toBe(false);
    expect(rejected.retryAfter).toBeGreaterThan(0);
  });
});
