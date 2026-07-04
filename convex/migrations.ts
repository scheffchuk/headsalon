import { v } from "convex/values";
import { internalMutation } from "./_generated/server";

/** Populate articleTags join rows for articles missing them. */
export const backfillArticleTags = internalMutation({
  args: {},
  returns: v.object({ tagRowsInserted: v.number() }),
  handler: async (ctx) => {
    const articles = await ctx.db.query("articles").collect();
    let tagRowsInserted = 0;

    for (const article of articles) {
      const existingTagRows = await ctx.db
        .query("articleTags")
        .withIndex("by_articleId", (q) => q.eq("articleId", article._id))
        .collect();

      if (existingTagRows.length === 0) {
        for (const tag of article.tags) {
          await ctx.db.insert("articleTags", {
            articleId: article._id,
            tag,
            articleDate: article.date,
          });
          tagRowsInserted++;
        }
      }
    }

    console.log(`backfillArticleTags: ${tagRowsInserted} tag inserts`);
    return { tagRowsInserted };
  },
});
