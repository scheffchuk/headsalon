"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import { embedMany } from "ai";
import { openai } from "@ai-sdk/openai";

const CHUNK_SIZE = 800;
const CHUNK_OVERLAP = 100;

// Type for text chunks
type TextChunk = {
  content: string;
  start: number;
  end: number;
};

// Generate embeddings for a single article
export const generateEmbeddingsForArticle = action({
  args: { articleId: v.id("articles") },
  handler: async (ctx, { articleId }) => {
    // Get article content
    const article = await ctx.runQuery(internal.articles.getArticleById, {
      id: articleId,
    });

    if (!article) throw new Error("Article not found");

    // Check if embeddings already exist for this article
    const existingEmbeddings = await ctx.runQuery(
      internal.embeddings.getEmbeddingsByArticle,
      {
        articleId,
      }
    );

    if (existingEmbeddings.length > 0) {
      console.log(
        `Embeddings already exist for article ${articleId}, skipping`
      );
      return { chunksCreated: 0, skipped: true };
    }

    // Chunk content
    const chunks = chunkText(article.content, CHUNK_SIZE, CHUNK_OVERLAP);

    if (chunks.length === 0) {
      console.log(`No content to chunk for article ${articleId}`);
      return { chunksCreated: 0 };
    }

    // Generate embeddings in batches to avoid token limits
    const batchSize = 10;
    let totalChunksCreated = 0;

    for (let i = 0; i < chunks.length; i += batchSize) {
      const batch = chunks.slice(i, i + batchSize);

      try {
        const { embeddings } = await embedMany({
          model: openai.embedding("text-embedding-3-large"),
          values: batch.map((chunk) => chunk.content),
        });

        // Store embeddings for this batch
        for (let j = 0; j < batch.length; j++) {
          await ctx.runMutation(internal.embeddings.storeEmbedding, {
            articleId,
            chunkIndex: i + j,
            content: batch[j].content,
            embedding: embeddings[j],
            metadata: {
              title: article.title,
              slug: article.slug,
              tags: article.tags,
              date: article.date,
              chunkStart: batch[j].start,
              chunkEnd: batch[j].end,
            },
          });
          totalChunksCreated++;
        }
      } catch (error) {
        console.error(
          `Failed to generate embeddings for batch ${i}-${
            i + batchSize
          } of article ${articleId}:`,
          error
        );
        throw error;
      }
    }

    console.log(
      `Generated embeddings for article ${articleId}: ${totalChunksCreated} chunks`
    );
    return { chunksCreated: totalChunksCreated };
  },
});

// Note: For bulk embedding generation, use the migration functions in migrations.ts
// This avoids circular references and memory issues

/**
 * Intelligent text chunking optimized for Chinese content
 */
function chunkText(
  text: string,
  chunkSize: number,
  overlap: number
): TextChunk[] {
  if (!text || text.trim().length === 0) {
    return [];
  }

  // Clean and normalize the text
  const cleanText = text.trim();

  // Enhanced Chinese sentence splitting - includes more Chinese punctuation
  const sentences = cleanText
    .split(/[.!?。！？；：;:\n]+/)
    .filter((s) => s.trim().length > 0)
    .map((s) => s.trim());

  if (sentences.length === 0) {
    return [];
  }

  const chunks: TextChunk[] = [];
  let currentChunk = "";
  let currentStart = 0;

  for (let i = 0; i < sentences.length; i++) {
    const sentence = sentences[i].trim();

    // Improved token estimation for Chinese content
    // Chinese characters: ~1.3 tokens per character, English: ~0.25 tokens per character
    const chineseChars =
      (currentChunk + sentence).match(/[\u4e00-\u9fff]/g)?.length || 0;
    const totalLength = (currentChunk + sentence).length;
    const englishChars = totalLength - chineseChars;
    const estimatedTokens = chineseChars * 1.3 + englishChars * 0.25;

    if (estimatedTokens <= chunkSize || currentChunk === "") {
      // Add sentence to current chunk
      if (currentChunk === "") {
        currentChunk = sentence;
        currentStart = cleanText.indexOf(sentence);
      } else {
        // Use appropriate separator for Chinese vs English
        const separator = sentence.match(/[\u4e00-\u9fff]/) ? "" : ". ";
        currentChunk += separator + sentence;
      }
    } else {
      // Current chunk is full, save it and start a new one
      const chunkEnd = currentStart + currentChunk.length;
      chunks.push({
        content: currentChunk.trim(),
        start: currentStart,
        end: chunkEnd,
      });

      // Start new chunk with overlap
      if (overlap > 0 && chunks.length > 0) {
        // Take last few sentences for overlap
        const overlapSentences = sentences.slice(Math.max(0, i - 2), i);
        currentChunk =
          overlapSentences.join(". ") +
          (overlapSentences.length > 0 ? ". " : "") +
          sentence;
        // Find start position for overlap
        const overlapText = overlapSentences.join(". ");
        currentStart = overlapText
          ? cleanText.indexOf(overlapText)
          : cleanText.indexOf(sentence, chunkEnd);
      } else {
        currentChunk = sentence;
        currentStart = cleanText.indexOf(sentence, chunkEnd);
      }
    }
  }

  // Add the last chunk if it has content
  if (currentChunk.trim()) {
    chunks.push({
      content: currentChunk.trim(),
      start: currentStart,
      end: currentStart + currentChunk.length,
    });
  }

  // Filter out chunks that are too small (less than 50 characters)
  return chunks.filter((chunk) => chunk.content.length >= 50);
}
