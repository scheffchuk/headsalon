import Link from "next/link";
import { unstable_ViewTransition as ViewTransition } from "react";
import { Badge } from "@/components/ui/badge";
import type { SearchResult } from "@/types/search";

type SearchResultItemProps = {
  article: SearchResult;
  onClick: () => void;
};

export function SearchResultItem({ article, onClick }: SearchResultItemProps) {
  // Format date for display (matching main article card format)
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <article className="py-4">
      <ViewTransition name={`title-${article.slug}`}>
        <Link href={`/articles/${article.slug}`} prefetch={true} onClick={onClick}>
          <h2 className="text-3xl font-semibold text-[#3399ff] hover:text-blue-500 transition-colors mb-3">
            {article.title}
          </h2>
        </Link>
      </ViewTransition>

      <div className="flex items-center justify-between text-sm text-gray-500">
        <time dateTime={article.date}>{formatDate(article.date)}</time>
      </div>

      {article.tags && article.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {article.tags.map((tag: string) => (
            <Link key={tag} href={`/tag/${encodeURIComponent(tag)}`}>
              <Badge
                variant="secondary"
                className="hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                {tag}
              </Badge>
            </Link>
          ))}
        </div>
      )}
    </article>
  );
}