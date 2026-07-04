import { permanentRedirect } from "next/navigation";

/** Legacy URLs with a decorative slug tail → canonical /articles/{shortId}. */
export default async function LegacyDecorativeSlugRedirect({
  params,
}: PageProps<"/articles/[shortId]/[...slug]">) {
  const { shortId } = await params;
  permanentRedirect(`/articles/${shortId}`);
}
