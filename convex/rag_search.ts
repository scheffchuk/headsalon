"use node";

import { v } from "convex/values";
import { RAG } from "@convex-dev/rag";
import { openai } from "@ai-sdk/openai";
import { components } from "./_generated/api";
import type { ActionCtx } from "./_generated/server";
import { action } from "./_generated/server";
import {
  ARTICLE_RAG_FILTER_NAMES,
  ARTICLE_RAG_NAMESPACE,
  articleRagFilterValues,
  preprocessChineseQuery,
  projectSearchResults,
  type ArticleRagFilters,
  type ArticleRagInput,
} from "./articleRag";
import { SearchResultValidator } from "./searchResult";

export const articleRag = new RAG<ArticleRagFilters>(components.rag, {
  textEmbeddingModel: openai.embedding("text-embedding-3-large"),
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
    query: v.string(),
    limit: v.optional(v.number()),
    similarityThreshold: v.optional(v.number()),
  },
  returns: v.array(SearchResultValidator),
  handler: async (
    ctx,
    { query, limit = 20, similarityThreshold = 0.3 },
  ) => {
    if (!query.trim()) return [];

    try {
      const searchResult = await articleRag.search(ctx, {
        namespace: ARTICLE_RAG_NAMESPACE,
        query: preprocessChineseQuery(query),
        limit: Math.min(limit * 2, 100),
        vectorScoreThreshold: similarityThreshold,
        chunkContext: { before: 1, after: 1 },
      });

      return projectSearchResults(searchResult, limit);
    } catch (error) {
      console.error("Error in RAG search:", error);
      return [];
    }
  },
});
