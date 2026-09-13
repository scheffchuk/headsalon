import { MINUTE, RateLimiter } from "@convex-dev/rate-limiter";
import { ConvexError, v } from "convex/values";
import { components } from "./_generated/api";
import { internalMutation } from "./_generated/server";

const operationValidator = v.union(v.literal("chat"), v.literal("search"));

const rateLimiter = new RateLimiter(components.rateLimiter, {
  chatSession: {
    kind: "token bucket",
    rate: 10,
    period: MINUTE,
    capacity: 3,
  },
  searchSession: {
    kind: "token bucket",
    rate: 20,
    period: MINUTE,
    capacity: 5,
  },
  chatGlobal: {
    kind: "token bucket",
    rate: 100,
    period: MINUTE,
    capacity: 20,
  },
  searchGlobal: {
    kind: "token bucket",
    rate: 300,
    period: MINUTE,
    capacity: 50,
  },
});

const limitNames = {
  chat: { session: "chatSession", global: "chatGlobal" },
  search: { session: "searchSession", global: "searchGlobal" },
} as const;

export const take = internalMutation({
  args: {
    operation: operationValidator,
    sessionId: v.string(),
  },
  returns: v.object({
    ok: v.boolean(),
    retryAfter: v.union(v.null(), v.number()),
  }),
  handler: async (ctx, { operation, sessionId }) => {
    const names = limitNames[operation];
    const sessionStatus = await rateLimiter.check(ctx, names.session, {
      key: sessionId,
    });
    const globalStatus = await rateLimiter.check(ctx, names.global);

    if (!sessionStatus.ok || !globalStatus.ok) {
      return {
        ok: false,
        retryAfter: Math.max(
          sessionStatus.retryAfter ?? 0,
          globalStatus.retryAfter ?? 0,
        ),
      };
    }

    const sessionConsumption = await rateLimiter.limit(ctx, names.session, {
      key: sessionId,
    });
    const globalConsumption = await rateLimiter.limit(ctx, names.global);

    if (!sessionConsumption.ok || !globalConsumption.ok) {
      throw new ConvexError({
        kind: "RateLimited",
        retryAfter: Math.max(
          sessionConsumption.retryAfter ?? 0,
          globalConsumption.retryAfter ?? 0,
        ),
      });
    }

    return { ok: true, retryAfter: null };
  },
});
