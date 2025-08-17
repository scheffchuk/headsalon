import Link from "next/link";
import { HighlightedText } from "@/components/highlighted-text";
import type { SearchResult } from "@/types/search";

type SearchResultItemProps = {
  article: SearchResult;
  query: string;
  onClick: () => void;
};

export function SearchResultItem({ article, query, onClick }: SearchResultItemProps) {
  const excerpt = article.relevantChunks?.[0]?.content?.slice(0, 150) || "";

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
            text={excerpt + "..."}
            searchQuery={query}
            highlightClassName="bg-blue-100 dark:bg-blue-900/30 px-1 py-0.5 rounded"
          />
        </p>
      )}
    </article>
  );
}