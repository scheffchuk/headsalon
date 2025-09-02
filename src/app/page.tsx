import { Suspense } from "react";
import { LoadingText } from "@/components/ui/loading-text";
import { ArticlesContainer } from "@/components/articles/articles-container";

export default function HomePage() {
  return (
    <Suspense fallback={<LoadingText />}>
      <ArticlesContainer />
    </Suspense>
  );
}
