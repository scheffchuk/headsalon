"use client";

import Link from "next/link";
import { usePreloadedQuery, Preloaded } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import TagArticleItem from "@/components/tag-article-item";
import { useRef } from "react";
import { ScrollProgress } from "@/components/ui/scroll-progress";

type TagArticlesProps = {
  preloadedArticles: Preloaded<typeof api.articles.getArticlesByTag>;
  tag: string;
};

export function TagArticles({ preloadedArticles, tag }: TagArticlesProps) {
  const articlesByTag = usePreloadedQuery(preloadedArticles);
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div className="mx-auto mt-16" ref={ref}>
      <div className="pointer-events-none fixed left-0 top-0 w-full z-50">
        <ScrollProgress className="absolute bg-[#3399FF]" />
      </div>
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
            <TagArticleItem article={article} tag={tag} key={index} />
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
