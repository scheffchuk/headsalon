import Link from "next/link";
import { HighlightedText } from "@/components/highlighted-text";
import type { SearchResult } from "@/types/search";

type SearchResultItemProps = {
  article: SearchResult;
  query: string;
  onClick: () => void;
};

export function SearchResultItem({ article, query, onClick }: SearchResultItemProps) {
  // Create excerpt with simplified logic - backend now provides clean excerpts
  const createExcerpt = () => {
    // Prefer the excerpt field provided by the backend
    if (article.excerpt && article.excerpt.trim()) {
      return article.excerpt;
    }
    
    // Fall back to first relevant chunk content if needed
    if (article.relevantChunks?.[0]?.content) {
      const content = article.relevantChunks[0].content;
      const truncated = content.slice(0, 200);
      const lastSentence = truncated.lastIndexOf('。');
      const lastComma = truncated.lastIndexOf('，');
      const breakPoint = Math.max(lastSentence, lastComma);
      
      return breakPoint > 50 ? truncated.slice(0, breakPoint + 1) : truncated;
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