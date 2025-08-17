import { v } from "convex/values";
import { internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";

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

// Migration to populate embeddings table from existing articles (auto-batching)
export const populateEmbeddings = internalMutation({
  args: {
    startIndex: v.optional(v.number()),
    batchSize: v.optional(v.number()),
  },
  handler: async (ctx, { startIndex = 0, batchSize = 300 }) => {
    console.log(`Starting embeddings population from index ${startIndex}, batch size ${batchSize}`);
    
    // Get total count without loading all articles
    const totalCount = 2315; // Known total to avoid loading all articles
    
    // Use more efficient pagination - get only what we need
    const articles = await ctx.db
      .query("articles")
      .order("desc")
      .take(startIndex + batchSize);
    
    // Get only the slice we want for this batch
    const batch = articles.slice(startIndex, startIndex + batchSize);
    
    if (batch.length === 0) {
      console.log("No more articles to process - all embedding generation completed!");
      return { 
        totalArticles: totalCount,
        scheduled: 0,
        skipped: 0,
        processed: 0,
        hasMore: false,
        currentIndex: startIndex,
        message: "All articles have been processed for embedding generation!"
      };
    }
    
    let scheduled = 0;
    let skipped = 0;
    
    console.log(`Processing batch: articles ${startIndex} to ${startIndex + batch.length - 1} (${batch.length} articles)`);
    console.log(`Progress: ${startIndex + batch.length}/${totalCount} articles`);
    
    // Schedule embedding generation for this batch
    for (const article of batch) {
      try {
        // Check if embeddings already exist
        const existingEmbeddings = await ctx.db
          .query("articleEmbeddings")
          .withIndex("by_article", (q) => q.eq("articleId", article._id))
          .first();
        
        if (!existingEmbeddings) {
          // Schedule embedding generation with small delay
          await ctx.scheduler.runAfter(scheduled * 100, internal.embeddings.scheduleEmbeddingGeneration, {
            articleId: article._id,
          });
          scheduled++;
          
          // Log first few articles to avoid log overflow
          if (scheduled <= 5) {
            console.log(`Scheduled: ${article.title}`);
          }
        } else {
          skipped++;
          if (skipped <= 3) {
            console.log(`Skipped (has embeddings): ${article.title}`);
          }
        }
      } catch (error) {
        console.error(`Failed to schedule article ${article._id}:`, error);
      }
    }
    
    const nextIndex = startIndex + batchSize;
    const hasMore = nextIndex < totalCount;
    
    // Auto-schedule next batch if there are more articles and we're under function limit
    if (hasMore && scheduled < 250) {
      console.log(`Auto-scheduling next batch starting at index ${nextIndex}`);
      await ctx.scheduler.runAfter(10000, internal.migrations.populateEmbeddings, {
        startIndex: nextIndex,
        batchSize,
      });
    }
    
    console.log(`Batch completed: scheduled ${scheduled}, skipped ${skipped}, processed ${batch.length}`);
    
    if (hasMore) {
      if (scheduled >= 250) {
        console.log(`Function limit reached. Run populateEmbeddings({"startIndex": ${nextIndex}}) to continue`);
      } else {
        console.log(`Next batch will start automatically in 10 seconds at index ${nextIndex}`);
      }
    } else {
      console.log("🎉 All articles have been scheduled for embedding generation!");
    }
    
    return { 
      totalArticles: totalCount,
      scheduled,
      skipped,
      processed: batch.length,
      hasMore,
      currentIndex: startIndex,
      nextIndex,
      message: hasMore ? 
        (scheduled >= 250 ? 
          `Run populateEmbeddings({"startIndex": ${nextIndex}}) to continue` : 
          `Next batch auto-scheduled at index ${nextIndex}`) :
        "🎉 All articles scheduled for embedding generation!"
    };
  },
});

// Clear all embeddings in one go (for complete reset)
export const clearAllEmbeddings = internalMutation({
  args: {},
  handler: async (ctx) => {
    console.log("Clearing all embeddings...");
    
    let deletedCount = 0;
    let batchCount = 0;
    
    while (true) {
      // Get a batch of embeddings to delete
      const batch = await ctx.db.query("articleEmbeddings").take(50);
      
      if (batch.length === 0) {
        break;
      }
      
      // Delete this batch
      for (const embedding of batch) {
        await ctx.db.delete(embedding._id);
        deletedCount++;
      }
      
      batchCount++;
      console.log(`Deleted batch ${batchCount}: ${deletedCount} embeddings total`);
      
      // Safety limit to avoid timeout
      if (batchCount >= 50) {
        console.log(`Processed ${batchCount} batches. Run again if more embeddings remain.`);
        return { 
          deletedCount,
          hasMore: true,
          message: "Run clearAllEmbeddings again to continue deletion"
        };
      }
    }
    
    console.log(`Finished deleting all ${deletedCount} embeddings`);
    return { 
      deletedCount,
      hasMore: false,
      message: "All embeddings cleared! Ready to run populateEmbeddings."
    };
  },
});

