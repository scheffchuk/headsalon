import Link from "next/link";
import React from "react";

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
    <article className="gap-8 py-4">
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
          <time dateTime={article.date}>{formatDate(article.date)}</time>

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
  );
}