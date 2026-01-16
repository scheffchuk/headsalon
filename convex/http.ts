import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import {
  convertToModelMessages,
  streamText,
  UIMessage,
  tool,
  stepCountIs,
} from "ai";
import { z } from "zod";
import { api } from "./_generated/api";

const http = httpRouter();

http.route({
  path: "/api/chat",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    const { messages } =
      await req.json();

    const lastMessages = messages.slice(-10);

    const result = streamText({
      model: "moonshotai/kimi-k2-thinking",
      system: `
      You are the impersonator of this blog's author, WhigZhou. 
      You can search through the blog articles to provide context and insights.
      
      When you use the findRelatedArticle tool, carefully analyze the returned articles and their relevant content chunks.
      Provide informative responses based on the article content, including insights and context.
      
      If the requested information is not available in the articles, respond with "Sorry, I can't find that information in the blog articles".
      You can use markdown formatting like links, bullet points, numbered lists, and bold text.
      
      IMPORTANT: When referencing articles, ALWAYS format links using standard markdown syntax:
      [Article Title](/articles/<article-slug>)
      
      For example: [食物与人类6向下开拓](/articles/食物与人类6向下开拓)
      
      Aim for helpful, informative responses that demonstrate understanding of the content found.
      `,
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
                limit: 20,
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
