"use client";

import React from "react";
import { unstable_ViewTransition as ViewTransition } from "react";
import { usePreloadedQuery, Preloaded } from "convex/react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { api } from "../../../../convex/_generated/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type ArticleProps = {
  preloadedArticle: Preloaded<typeof api.articles.getArticleBySlug>;
};

export function Article({ preloadedArticle }: ArticleProps) {
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
    <div className="mx-auto py-8">
      <Card className="border-none shadow-none">
        <CardHeader>
          <ViewTransition name={`title-${article.slug}`}>
            <CardTitle className="text-4xl font-bold leading-relaxed">
              {article.title}
            </CardTitle>
          </ViewTransition>
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

        <CardContent>
          {article.content ? (
            <MarkdownRenderer content={article.content} />
          ) : (
            <div className="prose prose-lg max-w-none">
              <p className="text-muted-foreground">文章内容加载中...</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Back to Home Button */}
      <div className="mt-8 text-center">
        <Link
          href="/"
          className="inline-flex items-center text-primary hover:text-primary/80 font-medium transition-colors"
        >
          ← 返回首页
        </Link>
      </div>
    </div>
  );
}
