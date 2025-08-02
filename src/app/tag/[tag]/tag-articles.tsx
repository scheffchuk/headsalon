"use client";

import Link from "next/link";
import { usePreloadedQuery, Preloaded } from "convex/react";
import { api } from "../../../../convex/_generated/api";

interface TagArticlesProps {
  preloadedArticles: Preloaded<typeof api.articles.getArticlesByTag>;
  tag: string;
}

export function TagArticles({ preloadedArticles, tag }: TagArticlesProps) {
  const articlesByTag = usePreloadedQuery(preloadedArticles);

  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

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
          {articlesByTag.map((article) => (
            <article key={article._id} className="gap-8 py-4">
              <header className="mb-3">
                <h2 className="text-3xl font-bold mb-2">
                  <Link
                    prefetch={true}
                    href={`/articles/${article.slug}`}
                    className="text-3xl font-semibold text-[#3399ff] hover:text-blue-500 transition-colors mb-3"
                  >
                    {article.title}
                  </Link>
                </h2>

                <div className="flex flex-col gap-4 text-sm text-gray-600">
                  <time dateTime={article.date}>
                    {formatDate(article.date)}
                  </time>

                  <div className="flex flex-wrap gap-2">
                    {article.tags.map((articleTag) => (
                      <Link
                        key={articleTag}
                        prefetch={true}
                        href={`/tag/${encodeURIComponent(articleTag)}`}
                        className={`px-2 py-1 rounded-md text-xs transition-colors ${articleTag === tag
                            ? "bg-blue-400 text-white"
                            : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                          }`}
                      >
                        {articleTag}
                      </Link>
                    ))}
                  </div>
                </div>
              </header>
            </article>
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
