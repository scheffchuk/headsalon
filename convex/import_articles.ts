"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { ARTICLE_RAG_NAMESPACE } from "./articleRag";
import { addArticle, articleRag } from "./rag_search";

const ArticleValidator = v.object({
  _creationTime: v.number(),
  _id: v.string(),
  content: v.string(),
  date: v.string(),
  excerpt: v.string(),
  slug: v.string(),
  tags: v.array(v.string()),
  title: v.string(),
});

export const importArticlesBatch = action({
  args: {
    articles: v.array(ArticleValidator),
    batchIndex: v.optional(v.number()),
  },
  returns: v.object({
    batchIndex: v.number(),
    totalArticles: v.number(),
    imported: v.number(),
    skipped: v.number(),
    errors: v.number(),
    success: v.boolean(),
  }),
  handler: async (ctx, { articles, batchIndex = 0 }) => {
    console.log(
      `Starting import batch ${batchIndex} with ${articles.length} articles`,
    );

    let imported = 0;
    let skipped = 0;
    let errors = 0;

    for (const article of articles) {
      try {
        const existsCheck = await articleRag.search(ctx, {
          namespace: ARTICLE_RAG_NAMESPACE,
          query: article._id,
          limit: 1,
          vectorScoreThreshold: 0.1,
        });

        const exists = existsCheck.entries.some(
          (entry) => entry.key === article._id,
        );

        if (!exists) {
          await addArticle(ctx, {
            articleId: article._id,
            title: article.title,
            slug: article.slug,
            content: article.content,
            tags: article.tags,
            date: article.date,
            creationTime: article._creationTime,
          });
          imported++;
          if (imported <= 5) {
            console.log(`Imported: ${article.title}`);
          }
        } else {
          skipped++;
          if (skipped <= 3) {
            console.log(`Skipped (already exists): ${article.title}`);
          }
        }
      } catch (error) {
        errors++;
        console.error(
          `Failed to import article ${article._id} (${article.title}):`,
          error,
        );
      }
    }

    console.log(
      `Batch ${batchIndex} completed: imported ${imported}, skipped ${skipped}, errors ${errors}`,
    );

    return {
      batchIndex,
      totalArticles: articles.length,
      imported,
      skipped,
      errors,
      success: errors === 0,
    };
  },
});
