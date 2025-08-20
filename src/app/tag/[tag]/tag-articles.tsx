"use client";

import Link from "next/link";
import { usePreloadedQuery, Preloaded } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import TagArticleItem from "@/components/tag-article-item";
import { StaggeredMotion } from "@/components/ui/staggered-motion";

type TagArticlesProps = {
  preloadedArticles: Preloaded<typeof api.articles.getArticlesByTag>;
  tag: string;
};

export function TagArticles({ preloadedArticles, tag }: TagArticlesProps) {
  const articlesByTag = usePreloadedQuery(preloadedArticles);

  return (
    <div className="mx-auto mt-16">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">标签：{tag}</h1>
        <p className="text-gray-600">找到 {articlesByTag.length} 篇相关文章</p>
      </header>

      {/* Articles List */}
      {!articlesByTag.length ? (
        <div className="text-center py-16">
          <p className="text-gray-600 mb-4">该标签下暂无文章</p>
        </div>
      ) : (
        <div className="space-y-8">
          {articlesByTag.map((article, index) => (
            <StaggeredMotion key={article._id} index={index}>
              <TagArticleItem
                article={article}
                tag={tag}
              />
            </StaggeredMotion>
          ))}
        </div>
      )}

      {/* Back link */}
      <div className="mt-12 text-center">
        <Link
          href="/"
          className="text-gray-700 hover:text-blue-500 font-medium"
        >
          ← 返回首页
        </Link>
      </div>
    </div>
  );
}