import { LoadingText } from "@/components/ui/loading-text";
import { ArticlesPreview } from "./article-preview";
import { Suspense, unstable_ViewTransition as ViewTransition } from "react";

export default function HomePage() {
  return (
    <ViewTransition>
      <Suspense fallback={<LoadingText />}>
        <ArticlesPreview />
      </Suspense>
    </ViewTransition>
  );
}
