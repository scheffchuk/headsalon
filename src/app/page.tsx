import { ArticlesPreview } from "./article-preview";
import { unstable_ViewTransition as ViewTransition } from "react";

export default function HomePage() {
  return (
    <ViewTransition>
      <ArticlesPreview />
    </ViewTransition>
  );
}
