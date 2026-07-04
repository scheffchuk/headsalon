import { Suspense } from "react";
import { permanentRedirect } from "next/navigation";

/** Legacy URLs with extra path segments → canonical /articles/{id}. */
export default function LegacyArticlePathRedirect({
  params,
}: PageProps<"/articles/[id]/[...slug]">) {
  return (
    <Suspense fallback={null}>
      {params.then(({ id }) => {
        permanentRedirect(`/articles/${id}`);
      })}
    </Suspense>
  );
}
