import { v } from "convex/values";
import { query } from "./_generated/server";
import { paginationOptsValidator } from "convex/server";
import type { Doc } from "./_generated/dataModel";

// Get articles for home page - paginated
export const getArticles = query({
  args: {
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const result = await ctx.db
      .query("articles")
      .order("desc")
      .paginate(args.paginationOpts);

    return {
      ...result,
      page: result.page.map((article) => ({
        _id: article._id,
        title: article.title,
        slug: article.slug,
        date: article.date,
        tags: article.tags,
      })),
    };
  },
});

// Get articles by tag - optimized with junction table
export const getArticlesByTag = query({
  args: {
    tag: v.string(),
  },
  handler: async (ctx, { tag }) => {
    if (!tag.trim()) {
      return [];
    }

    // Get article IDs for the tag, ordered by date (newest first)
    const tagEntries = await ctx.db
      .query("articleTags")
      .withIndex("by_tag_date", (q) => q.eq("tag", tag))
      .order("desc")
      .collect();

    // Batch retrieve articles by ID
    const articles = await Promise.all(
      tagEntries.map((entry) => ctx.db.get(entry.articleId))
    );

    // Filter out null results and return with excerpt
    return articles
      .filter((article): article is Doc<"articles"> => article !== null)
      .map((article) => ({
        _id: article._id,
        title: article.title,
        slug: article.slug,
        excerpt: article.excerpt,
        tags: article.tags,
        date: article.date,
      }));
  },
});

// Get article by slug
export const getArticleBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    if (!slug.trim()) {
      return null;
    }

    return await ctx.db
      .query("articles")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();
  },
});

// Full-text search with title and content search
export const searchArticles = query({
  args: {
    query: v.string(),
    paginationOpts: paginationOptsValidator,
    tagFilter: v.optional(v.string()),
  },
  handler: async (ctx, { query: searchQuery, paginationOpts, tagFilter }) => {
    // Early return for empty queries
    if (!searchQuery.trim()) {
      return { page: [], isDone: true, continueCursor: "" };
    }

    const maxResults = paginationOpts.numItems || 100;

    // Search in titles (higher priority)
    const titleResults = await ctx.db
      .query("articles")
      .withSearchIndex("search_title_content", (q) => {
        let search = q.search("title", searchQuery);
        if (tagFilter) {
          search = search.eq("tags", [tagFilter]);
        }
        return search;
      })
      .take(maxResults);

    // Search in content
    const contentResults = await ctx.db
      .query("articles")
      .withSearchIndex("search_content", (q) => {
        let search = q.search("content", searchQuery);
        if (tagFilter) {
          search = search.eq("tags", [tagFilter]);
        }
        return search;
      })
      .take(maxResults);

    // Transform results
    const transformArticle = (
      article: Doc<"articles">,
      matchType: "title" | "content"
    ) => ({
      _id: article._id,
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt,
      tags: article.tags,
      date: article.date,
      _matchType: matchType, // Add match type for debugging
    });

    const titleResultsTransformed = titleResults.map((article) =>
      transformArticle(article, "title")
    );
    const contentResultsTransformed = contentResults.map((article) =>
      transformArticle(article, "content")
    );

    // Combine and deduplicate (title matches have priority)
    const combinedResultsMap = new Map();

    // Add title matches first (higher priority)
    titleResultsTransformed.forEach((article) => {
      combinedResultsMap.set(article._id, article);
    });

    // Add content matches only if not already included
    contentResultsTransformed.forEach((article) => {
      if (!combinedResultsMap.has(article._id)) {
        combinedResultsMap.set(article._id, article);
      }
    });

    // Convert to array and limit results
    const combinedResults = Array.from(combinedResultsMap.values())
      .slice(0, maxResults)
      .map(({ _matchType, ...article }) => article); // Remove debug field

    // For pagination, we'll consider it done if we have fewer results than requested
    const isDone = combinedResults.length < maxResults;

    return {
      page: combinedResults,
      isDone,
      continueCursor: "", // Simplified cursor handling
    };
  },
});
