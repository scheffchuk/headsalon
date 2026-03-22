import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

type Article = {
  _id: string;
  title: string;
  slug: string;
  tags: string[];
  date: string;
};

type TagArticleItemProps = {
  article: Article;
  tag: string;
};

export default function TagArticleItem({ article, tag }: TagArticleItemProps) {
  return (
    <article className="py-4">
      <h2 className="text-3xl font-semibold mb-2">
        <Link
          prefetch={true}
          href={`/articles/${article.slug}`}
          className="text-brand hover:text-brand/80 focus-visible:text-brand/80 transition-colors"
        >
          {article.title}
        </Link>
      </h2>

      <div className="flex flex-col gap-4 text-sm text-muted-foreground">
        <time dateTime={article.date}>{formatDate(article.date)}</time>

        <div className="flex flex-wrap gap-2">
          {article.tags.map((articleTag) => (
            <Link
              key={articleTag}
              prefetch={true}
              href={`/tag/${encodeURIComponent(articleTag)}`}
            >
              <Badge
                variant={articleTag === tag ? "default" : "secondary"}
                className="transition-colors hover:bg-primary hover:text-primary-foreground"
              >
                {articleTag}
              </Badge>
            </Link>
          ))}
        </div>
      </div>
    </article>
  );
}
