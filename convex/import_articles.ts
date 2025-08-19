import { v } from "convex/values";
import { action } from "./_generated/server";
import { RAG } from "@convex-dev/rag";
import { openai } from "@ai-sdk/openai";
import { components } from "./_generated/api";

// Initialize RAG component with Chinese-optimized embedding model
const rag = new RAG(components.rag, {
  textEmbeddingModel: openai.embedding("text-embedding-3-large"),
  embeddingDimension: 3072, // text-embedding-3-large dimensions
  filterNames: ["slug", "date", "creationTime", "tag", "title"],
});

// Namespace for organizing content - using "articles" for blog content
const ARTICLES_NAMESPACE = "articles";

// Article type from the JSONL export
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

// Import articles from JSONL data in batches
export const importArticlesBatch = action({
  args: {
    articles: v.array(ArticleValidator),
    batchIndex: v.optional(v.number()),
  },
  handler: async (ctx, { articles, batchIndex = 0 }) => {
    console.log(
      `Starting import batch ${batchIndex} with ${articles.length} articles`
    );

    let imported = 0;
    let skipped = 0;
    let errors = 0;

    for (const article of articles) {
      try {
        // Check if article already exists in RAG system
        const existsCheck = await rag.search(ctx, {
          namespace: ARTICLES_NAMESPACE,
          query: article._id,
          limit: 1,
          vectorScoreThreshold: 0.1,
        });

        const exists = existsCheck.entries.some(
          (entry) => entry.key === article._id
        );

        if (!exists) {
          // Combine title and content for better searchability
          const fullText = `${article.title}\n\n${article.content}`;

          // Add content to RAG with full metadata for filtering
          // Handle multiple tags by creating a single combined tag filter
          const tagString = article.tags.join("|"); // Join tags with separator

          await rag.add(ctx, {
            namespace: ARTICLES_NAMESPACE,
            text: fullText,
            key: article._id, // Use article._id as unique key
            importance: 1.0, // All articles have equal importance
            filterValues: [
              { name: "slug", value: article.slug },
              { name: "date", value: article.date },
              { name: "creationTime", value: article._creationTime.toString() },
              { name: "tag", value: tagString }, // Single tag field with all tags
              { name: "title", value: article.title },
            ],
          });

          imported++;

          // Log first few articles to avoid log overflow
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
          error
        );
      }
    }

    console.log(
      `Batch ${batchIndex} completed: imported ${imported}, skipped ${skipped}, errors ${errors}`
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

// Note: JSONL parsing removed - use prepare_large_batch.js script instead

// Simple import helper for smaller datasets (direct array input)
export const importArticlesSimple = action({
  args: {
    articles: v.array(ArticleValidator),
  },
  handler: async (ctx, { articles }) => {
    // Process articles directly without self-reference
    console.log(`Starting simple import with ${articles.length} articles`);

    let imported = 0;
    let skipped = 0;
    let errors = 0;

    for (const article of articles) {
      try {
        // Check if article already exists in RAG system
        const existsCheck = await rag.search(ctx, {
          namespace: ARTICLES_NAMESPACE,
          query: article._id,
          limit: 1,
          vectorScoreThreshold: 0.1,
        });

        const exists = existsCheck.entries.some(
          (entry) => entry.key === article._id
        );

        if (!exists) {
          // Combine title and content for better searchability
          const fullText = `${article.title}\n\n${article.content}`;

          // Add content to RAG with full metadata for filtering
          // Handle multiple tags by creating a single combined tag filter
          const tagString = article.tags.join("|"); // Join tags with separator

          await rag.add(ctx, {
            namespace: ARTICLES_NAMESPACE,
            text: fullText,
            key: article._id, // Use article._id as unique key
            importance: 1.0, // All articles have equal importance
            filterValues: [
              { name: "slug", value: article.slug },
              { name: "date", value: article.date },
              { name: "creationTime", value: article._creationTime.toString() },
              { name: "tag", value: tagString }, // Single tag field with all tags
              { name: "title", value: article.title },
            ],
          });

          imported++;
          console.log(`Imported: ${article.title}`);
        } else {
          skipped++;
          console.log(`Skipped (already exists): ${article.title}`);
        }
      } catch (error) {
        errors++;
        console.error(
          `Failed to import article ${article._id} (${article.title}):`,
          error
        );
      }
    }

    console.log(
      `Simple import completed: imported ${imported}, skipped ${skipped}, errors ${errors}`
    );

    return {
      batchIndex: 0,
      totalArticles: articles.length,
      imported,
      skipped,
      errors,
      success: errors === 0,
    };
  },
});
