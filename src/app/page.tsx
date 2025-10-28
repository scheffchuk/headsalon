import { Suspense } from "react";
import { Articles } from "../components/articles/articles-client";
import { ArticlesSkeleton } from "@/components/articles/articles-skeleton";

export default function HomePage() {
  return (
    <Suspense fallback={<ArticlesSkeleton />}>
      <Articles />
    </Suspense>
  );
}
