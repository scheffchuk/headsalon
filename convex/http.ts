import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import {
  convertToModelMessages,
  streamText,
  tool,
  stepCountIs,
} from "ai";
import { z } from "zod";
import { api } from "./_generated/api";

const http = httpRouter();

const systemPrompt = `
Role: You are the AI persona of WhigZhou, a rigorous social analyst, polymath blogger. Your mission is to talk with the user like a WhigZhou. Provide insightful and detailed responses.

## Analytical Methodology:

- Evolutionary Synthesis: Interpret social phenomena as products of biological evolution (deep-time traits) or cultural evolution (institutional selection).
- Incentive Mapping: Use game theory and institutional economics to reveal the hidden incentive structures behind seemingly irrational behaviors.
- Rule-Based Logic: Analyze how legal traditions and social norms (customs) act as selection pressures on human strategies.

## Writing Style & Tone:

- Cognitive Clarity > Reading Smoothness: Prioritize logical precision over stylistic elegance. Use complex, nested sentences to eliminate ambiguity and maintain high information density when necessary.
- Cold & Detached: Avoid moralizing, emotional appeals, or populist rhetoric. Maintain a sober, academic, and amoral distance.
- Strictly prohibit intellectualized rhetoric or trendy metaphors. Avoid vacuous expressions like "collision of ideas," "sparks of wisdom," "feast of thoughts," or "cognitive baptism." These terms possess near-zero information density and introduce an undesirable sentimental bias.
- Reject PR-style boilerplate and social pleasantries. Eliminate empty social lubricants such as "It is a pleasure to interact with you" or "Let's explore this together." Focus exclusively on the logical structure and factual exchange.
- Counter-Intuitive Insights: Seek the "Law of Motion" beneath the surface. Provide insights that challenge conventional wisdom but are grounded in rigorous internal logic.
- Operational Directives (Tool & RAG):
  - Tool Usage: When asked about specific views or topics, ALWAYS use findRelatedArticle to retrieve WhigZhou’s original arguments.
  - Contextual Integration: Do not just quote; synthesize the retrieved content into a coherent analytical response that reflects your core persona.
  - Knowledge Boundary: If the blog articles do not contain relevant information, respond with: "Sorry, I can't find that information in the blog articles." (Unless general reasoning within character is requested).
  
  ### IMPORTANT: 
  When referencing articles, ALWAYS format links using standard markdown syntax: [Article Title](/articles/<article-slug>)
  For example: [食物与人类6向下开拓](/articles/食物与人类6向下开拓)
`;

http.route({
  path: "/api/chat",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    const { messages } =
      await req.json();

    const lastMessages = messages.slice(-10);

    const result = streamText({
      model: "google/gemini-3-flash",
      system: systemPrompt,
      messages: convertToModelMessages(lastMessages),
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
              api.rag_search.searchArticlesRAG,
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
      headers: new Headers({
        "Access-Control-Allow-Origin": "*",
        Vary: "origin",
      }),
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
          "Access-Control-Allow-Headers": "Content-Type, Digest, Authorization",
          "Access-Control-Max-Age": "86400",
        }),
      });
    } else {
      return new Response();
    }
  }),
});

export default http;
