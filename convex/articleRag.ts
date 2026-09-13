import type { SearchResult } from "./searchResult";

export const ARTICLE_RAG_NAMESPACE = "articles";

export const ARTICLE_RAG_FILTER_NAMES = [
  "slug",
  "date",
  "creationTime",
  "tag",
  "title",
] as const;

export type ArticleRagFilters = Record<
  (typeof ARTICLE_RAG_FILTER_NAMES)[number],
  string
>;

export type ArticleRagInput = {
  articleId: string;
  title: string;
  slug: string;
  content: string;
  tags: string[];
  date: string;
  creationTime: number;
};

export type ArticleRagSearchHit = {
  results?: Array<{
    entryId: string;
    score: number;
    content?: Array<{ text?: string }>;
  }>;
  entries?: Array<{
    entryId: string;
    key?: string;
    filterValues?: Array<{ name: string; value: string }>;
  }>;
};

export function articleRagText(
  article: Pick<ArticleRagInput, "title" | "content">,
): string {
  return `${article.title}\n\n${article.content}`;
}

export function articleRagFilterValues(
  article: ArticleRagInput,
): Array<{ name: (typeof ARTICLE_RAG_FILTER_NAMES)[number]; value: string }> {
  return [
    { name: "slug", value: article.slug },
    { name: "date", value: article.date },
    { name: "creationTime", value: article.creationTime.toString() },
    { name: "tag", value: article.tags.join("|") },
    { name: "title", value: article.title },
  ];
}

export function preprocessChineseQuery(query: string): string {
  let processed = query.trim().replace(/\s+/g, " ");

  processed = processed
    .replace(/，/g, ",")
    .replace(/；/g, ";")
    .replace(/：/g, ":")
    .replace(/"|"/g, '"')
    .replace(/'/g, "'");

  const chineseChars = processed.match(/[\u4e00-\u9fff]/g)?.length || 0;
  if (chineseChars <= 2 && chineseChars > 0) {
    processed = `关于${processed}的内容`;
  }

  return processed;
}

export function projectSearchResults(
  searchResult: ArticleRagSearchHit,
  limit: number,
): SearchResult[] {
  const { results, entries } = searchResult;

  if (!results || !entries) {
    return [];
  }

  const articleMap = new Map<
    string,
    { result: (typeof results)[number]; entry: (typeof entries)[number] }
  >();

  results.forEach((result) => {
    const entry = entries.find((e) => e.entryId === result.entryId);
    if (!entry) return;

    const articleId = entry.key || entry.entryId;
    if (
      !articleMap.has(articleId) ||
      result.score > (articleMap.get(articleId)?.result.score || 0)
    ) {
      articleMap.set(articleId, { result, entry });
    }
  });

  return Array.from(articleMap.values())
    .slice(0, limit)
    .map(({ result, entry }) => {
      const filters = new Map(
        entry.filterValues?.map((f) => [f.name, f.value]) || [],
      );

      const tagValue = filters.get("tag") || "";
      const tags =
        typeof tagValue === "string" ? tagValue.split("|").filter(Boolean) : [];

      const title = filters.get("title") || "Untitled";
      const slug = filters.get("slug") || "";
      const articleId = entry.key || entry.entryId;

      const relevantChunks =
        result.content?.slice(0, 3).map((chunk) => ({
          content: chunk.text || "",
          score: result.score,
        })) || [];

      return {
        _id: articleId,
        articleId,
        title,
        slug,
        tags,
        date: filters.get("date") || "",
        score: result.score,
        relevantChunks,
        _meta: {
          searchType: "rag_semantic",
          semanticScore: result.score,
        },
      };
    });
}
