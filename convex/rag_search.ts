/* eslint-disable @typescript-eslint/no-explicit-any */
import { v } from "convex/values";
import { action, query, ActionCtx } from "./_generated/server";
import { RAG } from "@convex-dev/rag";
import { openai } from "@ai-sdk/openai";
import { components } from "./_generated/api";

// Type-safe filter definition following official docs
type ArticleFilters = {
  slug: string;
  date: string;
  creationTime: string;
  tag: string;
};

type SearchResult = {
  _id: string;
  articleId: string;
  title: string;
  slug: string;
  tags: string[];
  date: string;
  excerpt: string;
  score: number;
  relevantChunks: Array<{ content: string; score: number }>;
  _meta: {
    searchType: string;
    semanticScore: number;
  };
};

const rag = new RAG<ArticleFilters>(components.rag, {
  textEmbeddingModel: openai.embedding("text-embedding-3-large"),
  embeddingDimension: 3072,
  filterNames: ["slug", "date", "creationTime", "tag"],
});

const ARTICLES_NAMESPACE = "articles";

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

function extractTitleAndExcerpt(chunkText: string): {
  title: string;
  excerpt: string;
} {
  if (!chunkText || !chunkText.trim()) {
    return { title: "Untitled", excerpt: "" };
  }

  // Split by double newlines first to separate title from content
  const sections = chunkText.split("\n\n");
  let title = "Untitled";
  let excerpt = "";

  if (sections.length > 0) {
    // First section is likely the title
    const titleCandidate = sections[0].trim().replace(/\n/g, " ");

    // More flexible title validation - look for actual content characteristics
    if (
      titleCandidate &&
      titleCandidate.length > 2 &&
      titleCandidate.length < 500 &&
      // Avoid content that looks like body text
      !titleCandidate.includes("。。") &&
      !titleCandidate.includes("，，") &&
      // Title shouldn't start with common content words
      !titleCandidate.match(/^(这|那|在|对于|关于|根据|按照)/)
    ) {
      title = titleCandidate;
    }

    // Extract excerpt from remaining sections
    if (sections.length > 1) {
      const contentSections = sections.slice(1).join("\n\n");
      if (contentSections.trim()) {
        const truncated = contentSections.slice(0, 150);
        const lastSentence = truncated.lastIndexOf("。");
        const lastComma = truncated.lastIndexOf("，");
        const breakPoint = Math.max(lastSentence, lastComma);

        excerpt =
          breakPoint > 30 ? truncated.slice(0, breakPoint + 1) : truncated;
      }
    }
  }

  // If still no good title found, try single line approach
  if (title === "Untitled") {
    const lines = chunkText.split("\n").filter((line) => line.trim());
    if (lines.length > 0) {
      const firstLine = lines[0].trim();
      if (firstLine && firstLine.length > 2 && firstLine.length < 300) {
        title = firstLine;
        // Get excerpt from remaining lines
        if (lines.length > 1) {
          const remainingContent = lines.slice(1).join("\n");
          const truncated = remainingContent.slice(0, 150);
          const lastSentence = truncated.lastIndexOf("。");
          const lastComma = truncated.lastIndexOf("，");
          const breakPoint = Math.max(lastSentence, lastComma);

          excerpt =
            breakPoint > 30 ? truncated.slice(0, breakPoint + 1) : truncated;
        }
      }
    }
  }

  return { title, excerpt };
}

function transformSearchResults(
  searchResult: any,
  limit: number
): SearchResult[] {
  const { results, entries } = searchResult;

  if (!results || !entries) {
    return [];
  }

  // Deduplicate by article key and take highest scoring results
  const articleMap = new Map<string, any>();

  results.forEach((result: any) => {
    const entry = entries.find((e: any) => e.entryId === result.entryId);
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
        entry.filterValues?.map((f: any) => [f.name, f.value]) || []
      );

      // Process tags
      const tagValue = filters.get("tag") || "";
      const tags =
        typeof tagValue === "string" ? tagValue.split("|").filter(Boolean) : [];

      // Extract title and excerpt from the first chunk
      let title = "Untitled";
      let excerpt = "";

      if (result.content?.[0]?.text) {
        ({ title, excerpt } = extractTitleAndExcerpt(result.content[0].text));
      }

      // Create relevant chunks (max 3 for semantic search)
      const relevantChunks =
        result.content?.slice(0, 3).map((chunk: any) => ({
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
        excerpt,
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
  handler: async (
    ctx: ActionCtx,
    { query, limit = 20, tagFilter, similarityThreshold = 0.3 }
  ) => {
    if (!query.trim()) return [];

    try {
      const processedQuery = preprocessChineseQuery(query);

      // Use official RAG search API with performance optimizations
      const searchResult = await rag.search(ctx, {
        namespace: ARTICLES_NAMESPACE,
        query: processedQuery,
        limit: Math.min(limit * 2, 100),
        vectorScoreThreshold: similarityThreshold,
        chunkContext: { before: 1, after: 1 }, // Better context for Chinese text
        ...(tagFilter && {
          filterValues: [{ name: "tag", value: tagFilter }],
        }),
      });

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
  handler: async (ctx: ActionCtx) => {
    try {
      const searchResult = await rag.search(ctx, {
        namespace: ARTICLES_NAMESPACE,
        query: "文章",
        limit: 500,
        vectorScoreThreshold: 0.05,
      });

      const allTags = new Set<string>();

      if (searchResult.entries) {
        searchResult.entries.forEach((entry: any) => {
          const tagValue = entry.filterValues?.find(
            (f: any) => f.name === "tag"
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

export const getRAGArticleCount = query({
  args: {},
  handler: async () => ({
    message: "RAG system active",
    namespace: ARTICLES_NAMESPACE,
  }),
});
