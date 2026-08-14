import { Suspense } from "react";
import { ArticleListClient } from "@/components/articles/article-list-client";
import { ArticleListSkeleton } from "@/components/articles/articles-skeleton";

export default function HomePage() {
  return (
    <Suspense fallback={<ArticleListSkeleton />}>
      <ArticleListClient />
    </Suspense>
  );
}
