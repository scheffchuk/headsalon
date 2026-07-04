import { permanentRedirect } from "next/navigation";

/** Legacy URLs with extra path segments → canonical /articles/{id}. */
export default async function LegacyArticlePathRedirect({
  params,
}: PageProps<"/articles/[id]/[...slug]">) {
  const { id } = await params;
  permanentRedirect(`/articles/${id}`);
}
