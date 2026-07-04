import { v } from "convex/values";
import { internalMutation } from "./_generated/server";
import { nanoid } from "nanoid";
import {
  slugifyForUrlKey,
  tagKeyFromDisplayName,
  withCollisionSuffix,
} from "./lib/urlKey";

export const populateArticleTags = internalMutation({
  args: {},
  returns: v.object({ processedArticles: v.number() }),
  handler: async (ctx) => {
    console.log("Starting articleTags migration...");

    const articles = await ctx.db.query("articles").collect();
    let processedCount = 0;

    for (const article of articles) {
      const existingTags = await ctx.db
        .query("articleTags")
        .withIndex("by_articleId", (q) => q.eq("articleId", article._id))
        .collect();

      if (existingTags.length === 0) {
        for (const tag of article.tags) {
          await ctx.db.insert("articleTags", {
            articleId: article._id,
            tag,
            tagKey: tagKeyFromDisplayName(tag),
            articleDate: article.date,
          });
        }
        processedCount++;
      }
    }

    console.log(`Migration completed. Processed ${processedCount} articles.`);
    return { processedArticles: processedCount };
  },
});

export const backfillUrlKeys = internalMutation({
  args: {},
  returns: v.object({
    articlesUpdated: v.number(),
    tagRowsUpdated: v.number(),
    tagRowsInserted: v.number(),
  }),
  handler: async (ctx) => {
    const articles = await ctx.db.query("articles").collect();
    const usedUrlKeys = new Set<string>();
    let articlesUpdated = 0;

    for (const article of articles) {
      let urlKey = article.urlKey?.trim();

      if (!urlKey) {
        urlKey = slugifyForUrlKey(article.title);
        while (usedUrlKeys.has(urlKey)) {
          urlKey = withCollisionSuffix(slugifyForUrlKey(article.title), nanoid(6));
        }

        const existing = await ctx.db
          .query("articles")
          .withIndex("by_urlKey", (q) => q.eq("urlKey", urlKey))
          .unique();

        if (existing && existing._id !== article._id) {
          urlKey = withCollisionSuffix(slugifyForUrlKey(article.title), nanoid(6));
        }

        await ctx.db.patch("articles", article._id, { urlKey });
        articlesUpdated++;
      }

      usedUrlKeys.add(urlKey);
    }

    let tagRowsUpdated = 0;
    let tagRowsInserted = 0;

    for (const article of articles) {
      const refreshed = await ctx.db.get("articles", article._id);
      if (!refreshed) continue;

      const existingTagRows = await ctx.db
        .query("articleTags")
        .withIndex("by_articleId", (q) => q.eq("articleId", article._id))
        .collect();

      if (existingTagRows.length === 0) {
        for (const tag of refreshed.tags) {
          await ctx.db.insert("articleTags", {
            articleId: article._id,
            tag,
            tagKey: tagKeyFromDisplayName(tag),
            articleDate: refreshed.date,
          });
          tagRowsInserted++;
        }
        continue;
      }

      for (const row of existingTagRows) {
        const tagKey = tagKeyFromDisplayName(row.tag);
        if (row.tagKey !== tagKey) {
          await ctx.db.patch("articleTags", row._id, { tagKey });
          tagRowsUpdated++;
        }
      }
    }

    console.log(
      `backfillUrlKeys: ${articlesUpdated} articles, ${tagRowsUpdated} tag patches, ${tagRowsInserted} tag inserts`,
    );

    return { articlesUpdated, tagRowsUpdated, tagRowsInserted };
  },
});
