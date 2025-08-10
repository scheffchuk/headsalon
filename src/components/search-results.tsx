import Link from "next/link";
import { HighlightedText, getSearchExcerpt } from "./highlighted-text";

type Article = {
  _id: string;
  title: string;
  slug: string;
  date: string;
  tags: string[];
  excerpt?: string;
  content?: string;
  _matchType?: "title" | "content";
};

interface SearchResultsProps {
  articles: Article[];
  isLoading: boolean;
  query: string;
  totalCount?: number;
  showMatchTypes?: boolean;
  maxExcerptLength?: number;
}

// Loading skeleton component for cleaner structure
const SearchSkeleton = () => (
  <div className="space-y-6">
    {Array.from({ length: 3 }, (_, i) => (
      <div key={i} className="py-4 animate-pulse">
        <div className="h-8 bg-muted rounded mb-3 w-3/4" />
        <div className="h-4 bg-muted rounded mb-2 w-1/4" />
        <div className="flex gap-2">
          <div className="h-6 bg-muted rounded w-16" />
          <div className="h-6 bg-muted rounded w-20" />
        </div>
      </div>
    ))}
  </div>
);

// Empty state component for better organization
const EmptySearchState = ({
  message,
  subtitle,
}: {
  message: string;
  subtitle?: string;
}) => (
  <div className="text-center py-12">
    <div className="text-muted-foreground text-lg mb-2">{message}</div>
    {subtitle && (
      <div className="text-sm text-muted-foreground">{subtitle}</div>
    )}
  </div>
);

// Enhanced article card with search highlighting
const SearchResultCard = ({
  article,
  query,
}: {
  article: Article;
  query: string;
}) => {
  const excerpt =
    article.excerpt ||
    (article.content ? getSearchExcerpt(article.content, query, 150) : "");

  return (
    <article className="py-4 border-b border-border/50 last:border-b-0">
      <div className="space-y-3">
        {/* Title with highlighting */}
        <h3 className="text-xl font-semibold">
          <Link
            href={`/articles/${article.slug}`}
            className="text-foreground hover:text-primary transition-colors"
          >
            <HighlightedText
              text={article.title}
              searchQuery={query}
              highlightClassName="bg-yellow-200 dark:bg-yellow-900/50 px-1 py-0.5 rounded font-medium"
            />
          </Link>
        </h3>

        {/* Excerpt with highlighting */}
        {excerpt && (
          <p className="text-muted-foreground leading-relaxed">
            <HighlightedText
              text={excerpt}
              searchQuery={query}
              highlightClassName="bg-blue-100 dark:bg-blue-900/30 px-1 py-0.5 rounded"
            />
          </p>
        )}
      </div>
    </article>
  );
};

export function SearchResults({
  articles,
  isLoading,
  query,
  totalCount,
}: SearchResultsProps) {
  // Early returns for different states
  if (isLoading) {
    return <SearchSkeleton />;
  }

  if (!query.trim()) {
    return (
      <EmptySearchState
        message="请输入关键词搜索文章"
        subtitle="支持搜索标题、内容"
      />
    );
  }

  if (articles.length === 0) {
    return (
      <EmptySearchState
        message={`没有找到包含 "${query}" 的文章`}
        subtitle="尝试使用不同的关键词或浏览所有文章"
      />
    );
  }

  // Categorize results by match type
  const titleMatches = articles.filter((a) => a._matchType === "title");
  const contentMatches = articles.filter(
    (a) => a._matchType === "content" || !a._matchType
  );
  const resultCount = totalCount ?? articles.length;

  return (
    <div className="space-y-6">
      {/* Results summary */}
      <div className="flex items-center justify-between border-b pb-3">
        <div className="text-sm text-muted-foreground">
          找到{" "}
          <span className="font-medium text-foreground">{resultCount}</span>{" "}
          篇包含
          <span className="font-medium text-foreground">
            &quot;{query}&quot;
          </span>{" "}
          的文章
        </div>
      </div>

      {/* Search results */}
      <div className="space-y-8">
        {/* Title matches first (higher priority) */}
        {titleMatches.map((article) => (
          <SearchResultCard
            key={`title-${article._id}`}
            article={article}
            query={query}
          />
        ))}

        {/* Content matches */}
        {contentMatches.map((article) => (
          <SearchResultCard
            key={`content-${article._id}`}
            article={article}
            query={query}
          />
        ))}
      </div>
    </div>
  );
}

// Export the search result card for reuse
export { SearchResultCard };
