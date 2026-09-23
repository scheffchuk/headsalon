"use node";

import { convexGateway } from "@convex-dev/ai-sdk-provider";
import { RAG } from "@convex-dev/rag";
import { SessionIdArg } from "convex-helpers/server/sessions";
import { ConvexError, v } from "convex/values";
import { components, internal } from "./_generated/api";
import { action, ActionCtx, internalAction } from "./_generated/server";
import {
  ARTICLE_RAG_FILTER_NAMES,
  ARTICLE_RAG_NAMESPACE,
  articleRagFilterValues,
  preprocessChineseQuery,
  projectSearchResults,
  type ArticleRagFilters,
  type ArticleRagInput,
} from "./articleRag";
import { SearchResultValidator, type SearchResult } from "./searchResult";

const gatewayEmbedding = convexGateway.embeddingModel(
  "openai/text-embedding-3-large",
);

export const articleRag = new RAG<ArticleRagFilters>(components.rag, {
  textEmbeddingModel: {
    ...gatewayEmbedding,
    // Namespace rows store this id. doEmbed still sends the gateway model id.
    modelId: "text-embedding-3-large",
    doEmbed: (options: Parameters<typeof gatewayEmbedding.doEmbed>[0]) =>
      gatewayEmbedding.doEmbed(options),
  },
  embeddingDimension: 3072,
  filterNames: [...ARTICLE_RAG_FILTER_NAMES],
});

export async function addArticle(
  ctx: ActionCtx,
  article: ArticleRagInput,
): Promise<void> {
  await articleRag.add(ctx, {
    namespace: ARTICLE_RAG_NAMESPACE,
    text: `${article.title}\n\n${article.content}`,
    key: article.articleId,
    importance: 1.0,
    filterValues: articleRagFilterValues(article),
  });
}

export const searchArticlesRAG = action({
  args: {
    ...SessionIdArg,
    query: v.string(),
    limit: v.optional(v.number()),
    tagFilter: v.optional(v.string()),
    similarityThreshold: v.optional(v.number()),
  },
  returns: v.array(SearchResultValidator),
  handler: async (
    ctx: ActionCtx,
    { sessionId, query, limit = 20, tagFilter, similarityThreshold = 0.3 },
  ) => {
    if (!query.trim()) return [];

    const rateLimit = await ctx.runMutation(internal.rateLimits.take, {
      operation: "search",
      sessionId,
    });
    if (!rateLimit.ok) {
      throw new ConvexError({
        kind: "RateLimited",
        retryAfter: rateLimit.retryAfter,
      });
    }

    return searchArticles(ctx, {
      query,
      limit,
      tagFilter,
      similarityThreshold,
    });
  },
});

export const searchArticlesRAGForChat = internalAction({
  args: {
    query: v.string(),
    limit: v.optional(v.number()),
    tagFilter: v.optional(v.string()),
    similarityThreshold: v.optional(v.number()),
  },
  returns: v.array(SearchResultValidator),
  handler: async (
    ctx: ActionCtx,
    { query, limit = 20, tagFilter, similarityThreshold = 0.3 },
  ) =>
    searchArticles(ctx, {
      query,
      limit,
      tagFilter,
      similarityThreshold,
    }),
});

async function searchArticles(
  ctx: ActionCtx,
  {
    query,
    limit,
    tagFilter,
    similarityThreshold,
  }: {
    query: string;
    limit: number;
    tagFilter?: string;
    similarityThreshold: number;
  },
): Promise<SearchResult[]> {
  if (!query.trim()) return [];

  try {
    const searchResult = await articleRag.search(ctx, {
      namespace: ARTICLE_RAG_NAMESPACE,
      query: preprocessChineseQuery(query),
      limit: Math.min(limit * 2, 100),
      vectorScoreThreshold: similarityThreshold,
      chunkContext: { before: 1, after: 1 },
      ...(tagFilter && {
        filterValues: [{ name: "tag", value: tagFilter }],
      }),
    });

    return projectSearchResults(searchResult, limit);
  } catch (error) {
    console.error("Error in RAG search:", error);
    return [];
  }
}
