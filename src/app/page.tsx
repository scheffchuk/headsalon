import { Suspense } from "react";
import { ArticlesClient } from "../components/articles/articles-client";
import { ArticlesSkeleton } from "@/components/articles/articles-skeleton";

export default function HomePage() {
  return (
    <Suspense fallback={<ArticlesSkeleton />}>
      <ArticlesClient />
    </Suspense>
  );
}
