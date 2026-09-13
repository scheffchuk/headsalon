import type { Doc } from "@convex/_generated/dataModel";
import { getArticleByParam } from "@/lib/convex-cache";
import { articleUrl } from "@/lib/urls";

export function classifyArticleLookup(
  param: string,
  article: Doc<"articles"> | null,
) {
  if (!article) {
    return null;
  }
  if (param !== article._id) {
    return { kind: "redirect" as const, href: articleUrl(article) };
  }
  return { kind: "article" as const, article };
}

export async function lookupArticle(param: string) {
  return classifyArticleLookup(param, await getArticleByParam(param));
}
