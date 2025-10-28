"use client";

import { useRef } from "react";
import { usePreloadedQuery, Preloaded } from "convex/react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollProgress } from "@/components/ui/scroll-progress";
import { api } from "../../../../convex/_generated/api";

type ArticleProps = {
  preloadedArticle: Preloaded<typeof api.articles.getArticleBySlug>;
};

export function Article({ preloadedArticle }: ArticleProps) {
  const ref = useRef<HTMLDivElement>(null);
  const article = usePreloadedQuery(preloadedArticle);

  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (article === null) {
    notFound();
  }

  return (
    <div className="mx-auto py-8" ref={ref}>
      <div className="pointer-events-none fixed left-0 top-0 w-full z-50">
        <ScrollProgress className="absolute bg-[#3399FF]" />
      </div>
      <Card className="border-none shadow-none rounded-sm">
        <CardHeader>
          <CardTitle className="text-4xl font-bold leading-relaxed">
            {article.title}
          </CardTitle>
          <CardDescription className="text-lg">
            发布于
            <time dateTime={article.date} className="text-muted-foreground">
              {formatDate(article.date)}
            </time>
          </CardDescription>
          {article.tags && article.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
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
        </CardHeader>

        <CardContent className="wrap-normal">
          {article.content ? (
            <MarkdownRenderer content={article.content} />
          ) : (
            <div className="prose prose-lg max-w-none">
              <p className="text-muted-foreground">Loading...</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
