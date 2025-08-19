import { internalMutation } from "./_generated/server";

// Migration to populate articleTags table from existing articles
export const populateArticleTags = internalMutation({
  args: {},
  handler: async (ctx) => {
    console.log("Starting articleTags migration...");

    const articles = await ctx.db.query("articles").collect();
    let processedCount = 0;

    for (const article of articles) {
      // Check if tags already exist for this article
      const existingTags = await ctx.db
        .query("articleTags")
        .withIndex("by_article", (q) => q.eq("articleId", article._id))
        .collect();

      if (existingTags.length === 0) {
        // Create articleTags entries
        for (const tag of article.tags) {
          await ctx.db.insert("articleTags", {
            articleId: article._id,
            tag: tag,
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

// Note: Old embedding and RAG migration functions removed
// Articles are now imported directly via RAG using import_articles:importArticlesBatch
