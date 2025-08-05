"use client";

import React from "react";
import { unstable_ViewTransition as ViewTransition } from "react";
import { usePreloadedQuery, Preloaded } from "convex/react";
import { notFound } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { api } from "../../../../convex/_generated/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ArticleProps {
  preloadedArticle: Preloaded<typeof api.articles.getArticleBySlug>;
}

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
          <div className="prose prose-lg max-w-none">
            {article.content ? (
              <ReactMarkdown
                components={{
                  h1: ({ node, ...props }) => (
                    <h1 className="text-3xl font-bold mt-8 mb-6" {...props} />
                  ),
                  h2: ({ node, ...props }) => (
                    <h2 className="text-2xl font-bold mt-8 mb-4" {...props} />
                  ),
                  h3: ({ node, ...props }) => (
                    <h3
                      className="text-xl font-semibold mt-6 mb-3"
                      {...props}
                    />
                  ),
                  p: ({ node, ...props }) => (
                    <p className="mb-4 leading-relaxed" {...props} />
                  ),
                  a: ({ node, ...props }) => (
                    <a className="text-primary hover:underline" {...props} />
                  ),
                  code: ({ node, ...props }) => (
                    <code
                      className="bg-muted px-2 py-1 rounded text-sm"
                      {...props}
                    />
                  ),
                  pre: ({ node, ...props }) => (
                    <pre
                      className="bg-muted p-4 rounded-lg overflow-x-auto my-4"
                      {...props}
                    />
                  ),
                  ul: ({ node, ...props }) => (
                    <ul
                      className="list-disc list-inside mb-4 space-y-1"
                      {...props}
                    />
                  ),
                  ol: ({ node, ...props }) => (
                    <ol
                      className="list-decimal list-inside mb-4 space-y-1"
                      {...props}
                    />
                  ),
                  li: ({ node, ...props }) => (
                    <li className="ml-4" {...props} />
                  ),
                  blockquote: ({ node, ...props }) => (
                    <blockquote
                      className="border-l-4 border-muted pl-4 italic my-4"
                      {...props}
                    />
                  ),
                  strong: ({ node, ...props }) => (
                    <strong className="font-semibold" {...props} />
                  ),
                  em: ({ node, ...props }) => (
                    <em className="italic" {...props} />
                  ),
                }}
              >
                {article.content}
              </ReactMarkdown>
            ) : (
              <p className="text-muted-foreground">文章内容加载中...</p>
            )}
          </div>
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
