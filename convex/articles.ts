import { v } from "convex/values";
import { query } from "./_generated/server";
import { paginationOptsValidator } from "convex/server";

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

// Get article by slug
export const getArticleBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    return await ctx.db
      .query("articles")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();
  },
});

// High-performance full-text search
export const searchArticles = query({
  args: {
    query: v.string(),
    paginationOpts: paginationOptsValidator,
    tagFilter: v.optional(v.string()),
  },
  handler: async (ctx, { query: searchQuery, paginationOpts, tagFilter }) => {
    if (!searchQuery.trim()) {
      return { page: [], isDone: true, continueCursor: "" };
    }

    // Search in titles first (most relevant)
    const titleResults = await ctx.db
      .query("articles")
      .withSearchIndex("search_title_content", (q) => {
        let search = q.search("title", searchQuery);
        if (tagFilter) {
          search = search.eq("tags", [tagFilter]);
        }
        return search;
      })
      .paginate(paginationOpts);

    // If we need more results, search in content
    if (!titleResults.isDone || titleResults.page.length < 10) {
      const contentResults = await ctx.db
        .query("articles")
        .withSearchIndex("search_content", (q) => {
          let search = q.search("content", searchQuery);
          if (tagFilter) {
            search = search.eq("tags", [tagFilter]);
          }
          return search;
        })
        .take(10 - titleResults.page.length);

      // Combine results, prioritizing title matches
      const combinedResults = [
        ...titleResults.page,
        ...contentResults.filter(
          (content) =>
            !titleResults.page.some((title) => title._id === content._id)
        ),
      ];

      return {
        page: combinedResults.map((article) => ({
          _id: article._id,
          title: article.title,
          slug: article.slug,
          excerpt: article.excerpt,
          tags: article.tags,
          date: article.date,
        })),
        isDone:
          titleResults.isDone &&
          contentResults.length < 10 - titleResults.page.length,
        continueCursor: titleResults.continueCursor,
      };
    }

    return {
      ...titleResults,
      page: titleResults.page.map((article) => ({
        _id: article._id,
        title: article.title,
        slug: article.slug,
        excerpt: article.excerpt,
        tags: article.tags,
        date: article.date,
      })),
    };
  },
});

// Get articles by tag
export const getArticlesByTag = query({
  args: {
    tag: v.string(),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, { tag, paginationOpts }) => {
    // Get all articles and filter on the server side
    const allArticles = await ctx.db.query("articles").order("desc").collect();

    // Filter articles that contain the tag
    const filteredArticles = allArticles.filter(
      (article) => article.tags && article.tags.includes(tag)
    );

    // Manual pagination
    const startIndex = paginationOpts.cursor
      ? parseInt(paginationOpts.cursor)
      : 0;
    const endIndex = startIndex + paginationOpts.numItems;
    const pageArticles = filteredArticles.slice(startIndex, endIndex);
    const hasMore = endIndex < filteredArticles.length;

    return {
      page: pageArticles.map((article) => ({
        _id: article._id,
        title: article.title,
        slug: article.slug,
        excerpt: article.excerpt,
        tags: article.tags,
        date: article.date,
      })),
      isDone: !hasMore,
      continueCursor: hasMore ? endIndex.toString() : null,
    };
  },
});
