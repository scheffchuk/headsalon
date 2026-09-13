/// <reference types="vite/client" />

import { register as registerRateLimiter } from "@convex-dev/rate-limiter/test";
import { convexTest } from "convex-test";
import { describe, expect, test } from "vitest";
import { internal } from "./_generated/api";
import schema from "./schema";

const modules = import.meta.glob(
  [
    "./schema.ts",
    "./http.ts",
    "./articleRag.ts",
    "./rag_search.ts",
    "./searchResult.ts",
    "./rateLimits.ts",
    "./_generated/**/*",
  ],
  { eager: false },
);

function setup() {
  const t = convexTest({ schema, modules });
  registerRateLimiter(t);
  return t;
}

describe("discuss chat rate limiting", () => {
  test("returns a structured 429 before model streaming starts", async () => {
    const t = setup();

    for (let request = 0; request < 3; request += 1) {
      await t.mutation(internal.rateLimits.take, {
        operation: "chat",
        sessionId: "browser-a",
      });
    }

    const response = await t.fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-HeadSalon-Session": "browser-a",
      },
      body: JSON.stringify({ messages: [] }),
    });

    expect(response.status).toBe(429);
    await expect(response.json()).resolves.toMatchObject({
      kind: "RateLimited",
      retryAfter: expect.any(Number),
    });
  });
});
