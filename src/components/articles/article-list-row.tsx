import Link from "next/link";
import { ViewTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

/** Fields required to render one row on home or tag index (excerpt omitted intentionally). */
export type ArticleListItem = {
  _id: string;
  title: string;
  slug: string;
  date: string;
  tags: string[];
};

type ArticleListRowProps = {
  article: ArticleListItem;
  /** When listing `/tag/[tag]`, badge for this tag uses `default` variant. */
  emphasizedTag?: string;
  /** When set, wraps the title link in ViewTransition (e.g. home `title-${slug}`). */
  titleViewTransitionName?: string;
};

export function ArticleListRow({
  article,
  emphasizedTag,
  titleViewTransitionName,
}: ArticleListRowProps) {
  const titleLink = (
    <Link href={`/articles/${article.slug}`} prefetch={true}>
      <h2 className="text-3xl font-semibold text-brand hover:text-brand/80 focus-visible:text-brand/80 transition-colors mb-3">
        {article.title}
      </h2>
    </Link>
  );

  return (
    <article className="py-4">
      {titleViewTransitionName ? (
        <ViewTransition name={titleViewTransitionName}>{titleLink}</ViewTransition>
      ) : (
        titleLink
      )}

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <time dateTime={article.date}>{formatDate(article.date)}</time>
      </div>

      {article.tags?.length ? (
        <div className="flex flex-wrap gap-2 mt-2">
          {article.tags.map((tag) => (
            <Link key={tag} href={`/tag/${encodeURIComponent(tag)}`} prefetch={true}>
              <Badge
                variant={tag === emphasizedTag ? "default" : "secondary"}
                className="transition-colors hover:bg-primary hover:text-primary-foreground"
              >
                {tag}
              </Badge>
            </Link>
          ))}
        </div>
      ) : null}
    </article>
  );
}
