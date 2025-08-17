import { v } from "convex/values";
import { action, internalQuery } from "./_generated/server";
import { openai } from "@ai-sdk/openai";
import { embed } from "ai";
import { internal } from "./_generated/api";
import type { Doc } from "./_generated/dataModel";

// Internal query to get embedding documents by IDs
export const getEmbeddingsByIds = internalQuery({
  args: {
    ids: v.array(v.id("articleEmbeddings")),
  },
  handler: async (ctx, { ids }) => {
    const embeddings = await Promise.all(ids.map((id) => ctx.db.get(id)));
    return embeddings.filter(
      (embedding): embedding is Doc<"articleEmbeddings"> => embedding !== null
    );
  },
});

// Generate embedding for search query
export const generateSearchEmbedding = action({
  args: {
    query: v.string(),
  },
  handler: async (ctx, { query }) => {
    if (!query.trim()) {
      throw new Error("Search query cannot be empty");
    }

    try {
      const { embedding } = await embed({
        model: openai.embedding("text-embedding-3-large"),
        value: query,
      });

      return embedding;
    } catch (error) {
      console.error("Error generating embedding:", error);
      throw new Error("Failed to generate embedding for search query");
    }
  },
});

// Simple embedding cache for query optimization
const embeddingCache = new Map<
  string,
  { embedding: number[]; timestamp: number }
>();
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

// Helper function to get or generate embedding with caching
const getCachedEmbedding = async (query: string): Promise<number[]> => {
  const now = Date.now();
  const cached = embeddingCache.get(query);

  // Return cached embedding if valid
  if (cached && now - cached.timestamp < CACHE_TTL) {
    return cached.embedding;
  }

  // Generate new embedding directly
  try {
    const { embedding } = await embed({
      model: openai.embedding("text-embedding-3-large"),
      value: query,
    });

    // Cache the result
    embeddingCache.set(query, { embedding, timestamp: now });

    // Clean up expired entries occasionally
    if (embeddingCache.size > 100) {
      for (const [key, value] of embeddingCache.entries()) {
        if (now - value.timestamp >= CACHE_TTL) {
          embeddingCache.delete(key);
        }
      }
    }

    return embedding;
  } catch (error) {
    console.error("Error generating cached embedding:", error);
    throw new Error("Failed to generate embedding for search query");
  }
};

// Helper function to preprocess Chinese queries
function preprocessChineseQuery(query: string): string {
  // Remove extra whitespace and normalize
  let processed = query.trim().replace(/\s+/g, " ");

  // Convert traditional Chinese punctuation to simplified
  processed = processed
    .replace(/，/g, ",")
    .replace(/；/g, ";")
    .replace(/：/g, ":")
    .replace(/"|"/g, '"')
    .replace(/'/g, "'");

  // Add context for very short Chinese queries (1-2 characters)
  const chineseChars = processed.match(/[\u4e00-\u9fff]/g)?.length || 0;
  if (chineseChars <= 2 && chineseChars > 0) {
    // For very short queries, add semantic context
    processed = `关于${processed}的内容`; // "Content about {query}"
  }

  return processed;
}

// Pure vector search optimized for Chinese content
export const searchArticles = action({
  args: {
    query: v.string(),
    limit: v.optional(v.number()),
    similarityThreshold: v.optional(v.number()),
    tagFilter: v.optional(v.string()),
  },
  handler: async (
    ctx,
    { query, limit = 20, similarityThreshold = 0.345, tagFilter }
  ) => {
    if (!query.trim()) {
      return [];
    }

    try {
      // Preprocess query for better Chinese matching
      const processedQuery = preprocessChineseQuery(query);

      // Generate embedding for the search query with caching
      const queryEmbedding = await getCachedEmbedding(processedQuery);

      // Perform vector similarity search optimized for Chinese content
      const vectorResults = await ctx.vectorSearch(
        "articleEmbeddings",
        "by_embedding",
        {
          vector: queryEmbedding,
          limit: Math.min(limit * 2, 100), // Get more results for better Chinese matching
        }
      );

      // Get embedding documents using the internal query
      const embeddingDocs = await ctx.runQuery(
        internal.semantic_search.getEmbeddingsByIds,
        { ids: vectorResults.map((result) => result._id) }
      );

      const results = vectorResults
        .map((vectorResult) => {
          const doc = embeddingDocs.find(
            (d: Doc<"articleEmbeddings">) => d._id === vectorResult._id
          );
          return doc ? { ...doc, _score: vectorResult._score } : null;
        })
        .filter(
          (result): result is Doc<"articleEmbeddings"> & { _score: number } =>
            result !== null
        );

      // Group results by article and calculate max score
      const articleScores = new Map<
        string,
        {
          articleId: string;
          maxScore: number;
          chunks: { content: string; score: number }[];
          metadata: {
            title: string;
            slug: string;
            tags: string[];
            date: string;
          };
        }
      >();

      for (const result of results) {
        const { _score, articleId, content, metadata } = result;

        // Dynamic similarity threshold based on query characteristics
        let dynamicThreshold = similarityThreshold;
        const chineseChars = query.match(/[\u4e00-\u9fff]/g)?.length || 0;

        // Lower threshold for Chinese queries (embeddings can be less precise)
        if (chineseChars > 0) {
          dynamicThreshold = Math.max(0.2, similarityThreshold - 0.1);
        }

        // Skip results below dynamic threshold
        if (_score < dynamicThreshold) continue;

        // Apply tag filtering if specified
        if (tagFilter && !metadata.tags.includes(tagFilter)) continue;

        if (!articleScores.has(articleId)) {
          articleScores.set(articleId, {
            articleId,
            maxScore: _score,
            chunks: [{ content, score: _score }],
            metadata,
          });
        } else {
          const existing = articleScores.get(articleId)!;
          existing.maxScore = Math.max(existing.maxScore, _score);
          existing.chunks.push({ content, score: _score });
        }
      }

      // Sort by best score and return results
      const sortedResults = Array.from(articleScores.values())
        .sort((a, b) => b.maxScore - a.maxScore)
        .slice(0, limit);

      // Format results for consistency
      const formattedResults = sortedResults.map(
        ({ articleId, maxScore, chunks, metadata }) => ({
          _id: articleId,
          articleId,
          title: metadata.title,
          slug: metadata.slug,
          tags: metadata.tags,
          date: metadata.date,
          excerpt: "", // Will be populated by frontend if needed
          score: maxScore,
          relevantChunks: chunks
            .sort((a, b) => b.score - a.score)
            .slice(0, 3) // Top 3 most relevant chunks for Chinese content
            .map((chunk) => ({
              content: chunk.content,
              score: chunk.score,
            })),
          _meta: {
            searchType: "semantic",
            semanticScore: maxScore,
          },
        })
      );

      return formattedResults;
    } catch (error) {
      console.error("Error in vector search:", error);
      throw new Error(
        `Failed to perform vector search: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  },
});
