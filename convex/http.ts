import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import {
  convertToModelMessages,
  streamText,
  tool,
  stepCountIs,
} from "ai";
import { z } from "zod";
import { ConvexError } from "convex/values";
import { internal } from "./_generated/api";

const http = httpRouter();
const SESSION_HEADER = "X-HeadSalon-Session";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  Vary: "origin",
};

function getRateLimitRetryAfter(error: unknown): number | null {
  if (!(error instanceof ConvexError)) return null;
  const data: unknown = error.data;
  if (typeof data !== "object" || data === null) return null;

  const payload = data as Record<string, unknown>;
  return payload.kind === "RateLimited" &&
    typeof payload.retryAfter === "number" &&
    Number.isFinite(payload.retryAfter) &&
    payload.retryAfter > 0
    ? payload.retryAfter
    : null;
}

function rateLimitedResponse(retryAfter: number): Response {
  return Response.json(
    { kind: "RateLimited", retryAfter },
    {
      status: 429,
      headers: {
        ...corsHeaders,
        "Retry-After": Math.ceil(retryAfter / 1_000).toString(),
      },
    },
  );
}

const systemPrompt = `You are WhigZhou — rigorous social analyst, polymath blogger. Discuss like a human; be insightful but concise.

Methodology:
- Evolutionary synthesis: social phenomena as products of biological/cultural evolution
- Incentive mapping: game theory + institutional economics revealing hidden structures
- Rule-based logic: legal traditions and norms as selection pressures

Style:
- Logical precision > stylistic elegance; complex sentences fine when eliminating ambiguity
- Detached, amoral, no moralizing or emotional appeals
- Seek counter-intuitive "laws of motion" beneath surface

Communication rules (MANDATORY):
- End clean. No trailing "if you want I can…" / "want me to…?" / "let me know if…" filler. Only offer options when user asked for them.
- No contrastive process narration. Never "I'm doing X instead of Y" / "let me verify rather than assume" / "the issue isn't X, it's Y." State results directly.
- No performative hedging. Never open with "Great question!" / "Sure!" / "Absolutely!" or apologize preemptively. Begin with substance.
- No agreement preambles. Never "You're right" / "That's a great point" / "Interesting question." Agreement is implicit in the answer.
- No epistemic stalling. Never "This is complex, but…" / "There are many perspectives…" If uncertain, say so briefly then proceed.
- No mirror-back paraphrasing. Never "So you're asking about X." Just answer.

Tool usage:
- ALWAYS use findRelatedArticle for specific views/topics
- Synthesize retrieved content into coherent response; don't just quote
- If articles lack relevant info: "Sorry, I can't find that information in the blog articles."

Link format: [Article Title](/articles/<id>)
Example: use the id field from tool results (Convex document id).
`;

http.route({
  path: "/api/chat",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    const sessionId = req.headers.get(SESSION_HEADER) ?? "anonymous";
    let rateLimit;
    try {
      rateLimit = await ctx.runMutation(internal.rateLimits.take, {
        operation: "chat",
        sessionId,
      });
    } catch (error) {
      const retryAfter = getRateLimitRetryAfter(error);
      if (retryAfter !== null) return rateLimitedResponse(retryAfter);
      throw error;
    }
    if (!rateLimit.ok) {
      return rateLimitedResponse(rateLimit.retryAfter ?? 1_000);
    }

    const { messages } =
      await req.json();

    const lastMessages = messages.slice(-10);

    const result = streamText({
      model: "xai/grok-4.5",
      system: systemPrompt,
      messages: await convertToModelMessages(lastMessages),
      stopWhen: stepCountIs(5),
      tools: {
        findRelatedArticle: tool({
          description:
            "Find related articles from the blog's RAG system based on the user's query",
          inputSchema: z.object({
            query: z.string().describe("The user's query"),
          }),
          execute: async ({ query }) => {
            console.log("findRelatedArticle query:", query);

            const searchResults = await ctx.runAction(
              internal.rag_search.searchArticlesRAGForChat,
              {
                query,
              }
            );

            return searchResults.map((article) => ({
              id: article._id,
              title: article.title,
              slug: article.slug,
              date: article.date,
              tags: article.tags,
              relevantChunks: article.relevantChunks?.slice(0, 2) || [],
            }));
          },
        }),
      },
      onError(error) {
        console.error("streamText error", error);
      },
    });

    return result.toUIMessageStreamResponse({
      headers: new Headers(corsHeaders),
    });
  }),
});

http.route({
  path: "/api/chat",
  method: "OPTIONS",
  handler: httpAction(async (_, request) => {
    const headers = request.headers;
    if (
      headers.get("Origin") !== null &&
      headers.get("Access-Control-Request-Method") !== null &&
      headers.get("Access-Control-Request-Headers") !== null
    ) {
      return new Response(null, {
        headers: new Headers({
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST",
          "Access-Control-Allow-Headers":
            "Content-Type, Digest, Authorization, X-HeadSalon-Session",
          "Access-Control-Max-Age": "86400",
        }),
      });
    } else {
      return new Response();
    }
  }),
});

export default http;
