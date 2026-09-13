import type { Doc } from "@convex/_generated/dataModel";
import { getArticleByParam } from "@/lib/convex-cache";
import { articleUrl } from "@/lib/urls";

export type ArticleLookup =
  | { kind: "article"; article: Doc<"articles"> }
  | { kind: "redirect"; href: string };

export function classifyArticleLookup(
  param: string,
  article: Doc<"articles"> | null,
): ArticleLookup | null {
  if (!article) {
    return null;
  }
  if (param !== article._id) {
    return { kind: "redirect", href: articleUrl(article) };
  }
  return { kind: "article", article };
}

export async function lookupArticle(param: string): Promise<ArticleLookup | null> {
  const article = await getArticleByParam(param);
  return classifyArticleLookup(param, article);
}
