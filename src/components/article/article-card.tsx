import Link from "next/link";
import { unstable_ViewTransition as ViewTransition } from "react";
import { Badge } from "../ui/badge";


type Article = {
  _id: string;
  title: string;
  slug: string;
  date: string;
  tags: string[];
};

type ArticleProps = {
  article: Article;
};

export function ArticleCard({ article }: ArticleProps) {
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
        <Link href={`/articles/${article.slug}`} prefetch={true}>
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
          {article.tags.map((tag) => (
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
