import Link from "next/link";
import { ViewTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import type { SearchResult } from "@convex/searchResult";

/** Fields required to render one **Article** row (chronological index, tag index, or RAG search). */
export type ArticlePreview = {
  _id: string;
  title: string;
  slug: string;
  date: string;
  tags: string[];
};

export type ArticlePreviewRowProps = {
  article: ArticlePreview;
  /** When listing a tag index, this tag uses the primary badge variant. */
  emphasizedTag?: string;
  /** When set, wraps the title link in ViewTransition (e.g. home `title-${slug}`). */
  titleViewTransitionName?: string;
  /** RAG search opens the **Article** in a new tab. */
  openArticleInNewTab?: boolean;
};

export function articlePreviewFromSearchResult(result: SearchResult): ArticlePreview {
  return {
    _id: result._id,
    title: result.title,
    slug: result.slug,
    date: result.date,
    tags: result.tags,
  };
}

export function ArticlePreviewRow({
  article,
  emphasizedTag,
  titleViewTransitionName,
  openArticleInNewTab,
}: ArticlePreviewRowProps) {
  const titleLink = (
    <Link
      href={`/articles/${article.slug}`}
      prefetch={true}
      {...(openArticleInNewTab
        ? { target: "_blank", rel: "noopener noreferrer" }
        : {})}
    >
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
