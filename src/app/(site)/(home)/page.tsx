import { Suspense } from "react";
import { HomeArticleIndex } from "@/components/articles/home-article-index";
import { ArticleListSkeleton } from "@/components/articles/articles-skeleton";

export default function HomePage() {
  return (
    <Suspense fallback={<ArticleListSkeleton />}>
      <HomeArticleIndex page={1} />
    </Suspense>
  );
}
