import Link from "next/link";
import { HighlightedText } from "@/components/highlighted-text";
import type { SearchResult } from "@/types/search";

type SearchResultItemProps = {
  article: SearchResult;
  query: string;
  onClick: () => void;
};

export function SearchResultItem({ article, query, onClick }: SearchResultItemProps) {
  // Create a clean excerpt from either the excerpt field or the first relevant chunk
  const createExcerpt = () => {
    // First try to use the excerpt field if available
    if (article.excerpt && article.excerpt.trim()) {
      return article.excerpt.slice(0, 200);
    }
    
    // Fall back to first relevant chunk, but create a cleaner excerpt
    if (article.relevantChunks?.[0]?.content) {
      const content = article.relevantChunks[0].content;
      // Remove the title from the content if it appears at the beginning
      const contentWithoutTitle = content.replace(new RegExp(`^${article.title}.*?\n\n?`, 's'), '');
      // Take the first 200 characters and ensure we break at a reasonable point
      const truncated = contentWithoutTitle.slice(0, 200);
      const lastSentence = truncated.lastIndexOf('。');
      const lastComma = truncated.lastIndexOf('，');
      const breakPoint = Math.max(lastSentence, lastComma);
      
      if (breakPoint > 50) {
        return truncated.slice(0, breakPoint + 1);
      }
      return truncated;
    }
    
    return "";
  };

  const excerpt = createExcerpt();

  return (
    <article className="py-4 border-b border-border/50 last:border-b-0">
      <h3 className="text-xl font-semibold mb-3">
        <Link
          href={`/articles/${article.slug}`}
          className="text-foreground hover:text-primary transition-colors"
          onClick={onClick}
        >
          <HighlightedText
            text={article.title}
            searchQuery={query}
            highlightClassName="bg-yellow-200 dark:bg-yellow-900/50 px-1 py-0.5 rounded font-medium"
          />
        </Link>
      </h3>

      {excerpt && (
        <p className="text-muted-foreground leading-relaxed">
          <HighlightedText
            text={excerpt + (excerpt.endsWith('。') || excerpt.endsWith('，') ? "" : "...")}
            searchQuery={query}
            highlightClassName="bg-blue-100 dark:bg-blue-900/30 px-1 py-0.5 rounded"
          />
        </p>
      )}
    </article>
  );
}