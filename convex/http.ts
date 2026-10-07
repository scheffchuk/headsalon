import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { convexGateway } from "@convex-dev/ai-sdk-provider";
import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  isStepCount,
  streamText,
  toUIMessageStream,
  tool,
  type UIMessage,
} from "ai";
import { z } from "zod";
import { internal } from "./_generated/api";

const http = httpRouter();
const SESSION_HEADER = "X-HeadSalon-Session";

/** Forced off. Restore `true` in step with `isAiChatEnabled` to bring chat back. */
function isDiscussChatEnabled(): boolean {
  return false;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  Vary: "origin",
};

export function messagesForModel(messages: UIMessage[]): UIMessage[] {
  const recent = messages.slice(-10);
  const lastIndex = recent.length - 1;
  return recent.flatMap((message, index) => {
    if (message.role !== "assistant" || index === lastIndex) {
      return [message];
    }
    const parts = message.parts.filter(
      (part) =>
        part.type !== "dynamic-tool" && !part.type.startsWith("tool-"),
    );
    return parts.length === 0 ? [] : [{ ...message, parts }];
  });
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
- Call findRelatedArticle once for a specific view or topic, then answer. Do not search again.
- Synthesize retrieved content into a coherent response; don't just quote
- If articles lack relevant info: "Sorry, I can't find that information in the blog articles."

Link format: [Article Title](/articles/<id>)
Example: use the id field from tool results (Convex document id).
`;

http.route({
  path: "/api/chat",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    if (!isDiscussChatEnabled()) {
      return Response.json(
        { kind: "Disabled" },
        { status: 503, headers: corsHeaders },
      );
    }

    const sessionId = req.headers.get(SESSION_HEADER) ?? "anonymous";
    const rateLimit = await ctx.runMutation(internal.rateLimits.take, {
      operation: "chat",
      sessionId,
    });
    if (!rateLimit.ok) {
      return rateLimitedResponse(rateLimit.retryAfter ?? 1_000);
    }

    const { messages } = (await req.json()) as { messages: UIMessage[] };

    const result = streamText({
      model: convexGateway("x-ai/grok-4.5"),
      system: systemPrompt,
      messages: await convertToModelMessages(messagesForModel(messages)),
      stopWhen: isStepCount(2),
      prepareStep: ({ stepNumber }) =>
        stepNumber === 0 ? {} : { toolChoice: "none" },
      tools: {
        findRelatedArticle: tool({
          description:
            "Find related articles from the blog's RAG system based on the user's query. Call once.",
          inputSchema: z.object({
            query: z.string().describe("The user's query"),
          }),
          execute: async ({ query }) => {
            console.log("findRelatedArticle query:", query);

            const searchResults = await ctx.runAction(
              internal.rag_search.searchArticlesRAGForChat,
              {
                query,
                limit: 4,
                neighbors: false,
              },
            );

            return searchResults.map((article) => {
              const passage = article.relevantChunks?.[0]?.content;
              return passage
                ? { id: article._id, title: article.title, passage }
                : { id: article._id, title: article.title };
            });
          },
        }),
      },
      onError(error) {
        console.error("streamText error", error);
      },
    });

    return createUIMessageStreamResponse({
      headers: corsHeaders,
      stream: toUIMessageStream({ stream: result.stream }),
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
