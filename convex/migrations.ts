import { v } from "convex/values";
import { internalMutation, type MutationCtx } from "./_generated/server";
import { generateShortId } from "./lib/shortId";

async function allocateUniqueShortId(
  ctx: MutationCtx,
  used: Set<string>,
): Promise<string> {
  for (let attempt = 0; attempt < 30; attempt++) {
    const candidate = generateShortId();
    if (used.has(candidate)) {
      continue;
    }

    const existing = await ctx.db
      .query("articles")
      .withIndex("by_shortId", (q) => q.eq("shortId", candidate))
      .unique();

    if (!existing) {
      used.add(candidate);
      return candidate;
    }
  }

  throw new Error("Failed to allocate unique shortId");
}

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

export const backfillShortIds = internalMutation({
  args: {},
  returns: v.object({
    articlesUpdated: v.number(),
    tagRowsInserted: v.number(),
  }),
  handler: async (ctx) => {
    const articles = await ctx.db.query("articles").collect();
    const usedShortIds = new Set<string>();
    let articlesUpdated = 0;

    for (const article of articles) {
      const existingShortId = article.shortId?.trim();
      if (existingShortId) {
        usedShortIds.add(existingShortId);
        continue;
      }

      const shortId = await allocateUniqueShortId(ctx, usedShortIds);
      await ctx.db.patch("articles", article._id, { shortId });
      articlesUpdated++;
    }

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
            articleDate: refreshed.date,
          });
          tagRowsInserted++;
        }
      }
    }

    console.log(
      `backfillShortIds: ${articlesUpdated} articles, ${tagRowsInserted} tag inserts`,
    );

    return { articlesUpdated, tagRowsInserted };
  },
});
