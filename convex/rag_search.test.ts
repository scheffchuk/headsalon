/// <reference types="vite/client" />

import { register as registerRateLimiter } from "@convex-dev/rate-limiter/test";
import { convexTest } from "convex-test";
import type { SessionId } from "convex-helpers/server/sessions";
import { describe, expect, test } from "vitest";
import { api, internal } from "./_generated/api";
import schema from "./schema";

const modules = import.meta.glob(
  [
    "./schema.ts",
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

describe("RAG search rate limiting", () => {
  test("rejects a browser session before starting another embedding search", async () => {
    const t = setup();
    const sessionId = "browser-a" as SessionId;

    for (let request = 0; request < 5; request += 1) {
      await t.mutation(internal.rateLimits.take, {
        operation: "search",
        sessionId,
      });
    }

    await expect(
      t.action(api.rag_search.searchArticlesRAG, {
        query: "institutions",
        sessionId,
      }),
    ).rejects.toMatchObject({
      data: {
        kind: "RateLimited",
        retryAfter: expect.any(Number),
      },
    });
  });
});
