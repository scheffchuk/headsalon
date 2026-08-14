import Link from "next/link";
import { ViewTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { articleUrl, tagUrl } from "@/lib/urls";
import type { ArticlePreview } from "@convex/searchResult";

export function ArticlePreviewRow({
  article,
  emphasizedTag,
  titleViewTransitionName,
  openArticleInNewTab,
}: {
  article: ArticlePreview;
  emphasizedTag?: string;
  titleViewTransitionName?: string;
  openArticleInNewTab?: boolean;
}) {
  const titleLink = (
    <Link
      href={articleUrl({ _id: article._id })}
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
    <article className="py-4 [content-visibility:auto] [contain-intrinsic-size:auto_12rem]">
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
            <Link key={tag} href={tagUrl(tag)} prefetch={true}>
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
