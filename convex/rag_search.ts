"use node";

import { v } from "convex/values";
import { action, ActionCtx } from "./_generated/server";
import { RAG } from "@convex-dev/rag";
import { openai } from "@ai-sdk/openai";
import { components } from "./_generated/api";

// Type-safe filter definition following official docs
type ArticleFilters = {
  slug: string;
  date: string;
  creationTime: string;
  tag: string;
  title: string;
};

// Use the exact same SearchResult interface as the frontend
export type SearchResult = {
  _id: string;
  articleId: string;
  title: string;
  slug: string;
  date: string;
  tags: string[];
  score?: number;
  relevantChunks?: {
    content: string;
    score?: number;
  }[];
  _meta?: {
    searchType: string;
    semanticScore: number;
  };
};

// Validators for SearchResult
const RelevantChunkValidator = v.object({
  content: v.string(),
  score: v.optional(v.number()),
});

const SearchResultValidator = v.object({
  _id: v.string(),
  articleId: v.string(),
  title: v.string(),
  slug: v.string(),
  date: v.string(),
  tags: v.array(v.string()),
  score: v.optional(v.number()),
  relevantChunks: v.optional(v.array(RelevantChunkValidator)),
  _meta: v.optional(
    v.object({
      searchType: v.string(),
      semanticScore: v.number(),
    })
  ),
});

const rag = new RAG<ArticleFilters>(components.rag, {
  textEmbeddingModel: openai.embedding("text-embedding-3-large"),
  embeddingDimension: 3072,
  filterNames: ["slug", "date", "creationTime", "tag", "title"],
});

const ARTICLES_NAMESPACE = "articles";

// Type-safe RAG search result types
interface RAGSearchResult {
  results: Array<{
    entryId: string;
    score: number;
    content?: Array<{ text: string }>;
  }>;
  entries: Array<{
    entryId: string;
    key: string;
    filterValues?: Array<{ name: string; value: string }>;
  }>;
}

interface RAGEntry {
  entryId: string;
  key: string;
  filterValues?: Array<{ name: string; value: string }>;
}

interface RAGResult {
  entryId: string;
  score: number;
  content?: Array<{ text: string }>;
}

function preprocessChineseQuery(query: string): string {
  let processed = query.trim().replace(/\s+/g, " ");

  processed = processed
    .replace(/，/g, ",")
    .replace(/；/g, ";")
    .replace(/：/g, ":")
    .replace(/"|"/g, '"')
    .replace(/'/g, "'");

  const chineseChars = processed.match(/[\u4e00-\u9fff]/g)?.length || 0;
  if (chineseChars <= 2 && chineseChars > 0) {
    processed = `关于${processed}的内容`;
  }

  return processed;
}

function transformSearchResults(
  searchResult: RAGSearchResult,
  limit: number
): SearchResult[] {
  const { results, entries } = searchResult;

  if (!results || !entries) {
    return [];
  }

  // Deduplicate by article key and take highest scoring results
  const articleMap = new Map<
    string,
    { result: RAGResult; entry: RAGEntry }
  >();

  results.forEach((result: RAGResult) => {
    const entry = entries.find((e: RAGEntry) => e.entryId === result.entryId);
    if (!entry) return;

    const articleId = entry.key || entry.entryId;
    if (
      !articleMap.has(articleId) ||
      result.score > (articleMap.get(articleId)?.result.score || 0)
    ) {
      articleMap.set(articleId, { result, entry });
    }
  });

  return Array.from(articleMap.values())
    .slice(0, limit)
    .map(({ result, entry }) => {
      // Extract filter values
      const filters = new Map(
        entry.filterValues?.map((f) => [f.name, f.value]) || []
      );

      // Process tags
      const tagValue = filters.get("tag") || "";
      const tags =
        typeof tagValue === "string" ? tagValue.split("|").filter(Boolean) : [];

      // Get title directly from filter values
      const title = (filters.get("title") as string) || "Untitled";

      // Create relevant chunks (max 3 for semantic search)
      const relevantChunks =
        result.content?.slice(0, 3).map((chunk) => ({
          content: chunk.text || "",
          score: result.score,
        })) || [];

      return {
        _id: entry.key || entry.entryId,
        articleId: entry.key || entry.entryId,
        title,
        slug: (filters.get("slug") as string) || "",
        tags,
        date: (filters.get("date") as string) || "",
        score: result.score,
        relevantChunks,
        _meta: {
          searchType: "rag_semantic",
          semanticScore: result.score,
        },
      };
    });
}

export const addArticleToRAG = action({
  args: {
    articleId: v.string(),
    title: v.string(),
    slug: v.string(),
    content: v.string(),
    excerpt: v.optional(v.string()),
    tags: v.array(v.string()),
    date: v.string(),
  },
  returns: v.object({
    success: v.boolean(),
    articleId: v.string(),
  }),
  handler: async (
    ctx: ActionCtx,
    { articleId, title, slug, content, tags, date }
  ) => {
    try {
      const fullText = `${title}\n\n${content}`;
      const tagString = tags.join("|");

      await rag.add(ctx, {
        namespace: ARTICLES_NAMESPACE,
        text: fullText,
        key: articleId,
        importance: 1.0,
        filterValues: [
          { name: "slug", value: slug },
          { name: "date", value: date },
          { name: "creationTime", value: Date.now().toString() },
          { name: "tag", value: tagString },
          { name: "title", value: title },
        ],
      });

      console.log(`Successfully added article to RAG: ${title} (${articleId})`);
      return { success: true, articleId };
    } catch (error) {
      console.error(
        `Failed to add article to RAG: ${title} (${articleId})`,
        error
      );
      throw error;
    }
  },
});

export const searchArticlesRAG = action({
  args: {
    query: v.string(),
    limit: v.optional(v.number()),
    tagFilter: v.optional(v.string()),
    similarityThreshold: v.optional(v.number()),
  },
  returns: v.array(SearchResultValidator),
  handler: async (
    ctx: ActionCtx,
    { query, limit = 20, tagFilter, similarityThreshold = 0.3 }
  ) => {
    if (!query.trim()) return [];

    try {
      const processedQuery = preprocessChineseQuery(query);

      // Use official RAG search API with performance optimizations
      const searchResult = (await rag.search(ctx, {
        namespace: ARTICLES_NAMESPACE,
        query: processedQuery,
        limit: Math.min(limit * 2, 100),
        vectorScoreThreshold: similarityThreshold,
        chunkContext: { before: 1, after: 1 }, // Better context for Chinese text
        ...(tagFilter && {
          filterValues: [{ name: "tag", value: tagFilter }],
        }),
      })) as RAGSearchResult;

      const transformedResults = transformSearchResults(searchResult, limit);

      console.log(
        `RAG search for "${query}" returned ${transformedResults.length} results`
      );

      return transformedResults;
    } catch (error) {
      console.error("Error in RAG search:", error);
      return [];
    }
  },
});

export const getAvailableTags = action({
  args: {},
  returns: v.object({
    tags: v.array(v.string()),
    count: v.number(),
  }),
  handler: async (ctx: ActionCtx) => {
    try {
      const searchResult = (await rag.search(ctx, {
        namespace: ARTICLES_NAMESPACE,
        query: "文章",
        limit: 3000,
        vectorScoreThreshold: 0.05,
      })) as RAGSearchResult;

      const allTags = new Set<string>();

      if (searchResult.entries) {
        searchResult.entries.forEach((entry: RAGEntry) => {
          const tagValue = entry.filterValues?.find(
            (f) => f.name === "tag"
          )?.value;
          if (typeof tagValue === "string") {
            tagValue.split("|").forEach((tag) => {
              const trimmedTag = tag.trim();
              if (trimmedTag) allTags.add(trimmedTag);
            });
          }
        });
      }

      const sortedTags = Array.from(allTags).sort();
      console.log(`Found ${sortedTags.length} unique tags in RAG system`);

      return { tags: sortedTags, count: sortedTags.length };
    } catch (error) {
      console.error("Error getting available tags:", error);
      return { tags: [], count: 0 };
    }
  },
});
