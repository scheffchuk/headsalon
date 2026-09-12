import { notFound } from "next/navigation";
import { getHomeArticlePage } from "@/lib/convex-cache";
import { ArticlePreviewRow } from "./article-preview-row";
import { HomePagination } from "./home-pagination";

export async function HomeArticleIndex({ page }: { page: number }) {
  const result = await getHomeArticlePage(page);

  if (page > 1 && (result.totalPages === 0 || page > result.totalPages)) {
    notFound();
  }

  return (
    <div className="mx-auto py-8 mt-16">
      <div className="flex flex-col space-y-6">
        {result.items.map((article) => (
          <ArticlePreviewRow
            key={article._id}
            article={article}
            titleViewTransitionName={`title-${article._id}`}
          />
        ))}
      </div>
      <HomePagination page={page} totalPages={result.totalPages} />
    </div>
  );
}
