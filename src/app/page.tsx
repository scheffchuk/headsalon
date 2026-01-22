import { Suspense } from "react";
import { ArticleList } from "../components/articles/article-list";
import { ArticleListSkeleton } from "@/components/articles/articles-skeleton";

export default function HomePage() {
  return (
    <Suspense fallback={<ArticleListSkeleton />}>
      <ArticleList />
    </Suspense>
  );
}
