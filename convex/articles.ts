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

// Get articles by tag
export const getArticlesByTag = query({
  args: {
    tag: v.string(),
  },
  handler: async (ctx, { tag }) => {
    // Get article IDs for the tag, ordered by date (newest first)
    const tagEntries = await ctx.db
      .query("articleTags")
      .withIndex("by_tag_date", (q) => q.eq("tag", tag))
      .order("desc")
      .collect();

    // Get full article data for each article ID
    const articles = [];
    for (const tagEntry of tagEntries) {
      const article = await ctx.db.get(tagEntry.articleId);
      if (article) {
        articles.push({
          _id: article._id,
          title: article.title,
          slug: article.slug,
          excerpt: article.excerpt,
          tags: article.tags,
          date: article.date,
        });
      }
    }

    return articles;
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
