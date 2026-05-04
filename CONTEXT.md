# HeadSalon domain context

Vocabulary for the blog/chat app backed by Convex. Use these terms consistently in docs and UI copy.

## Language

**Article** — A Convex `articles` document (title, slug, HTML-capable Markdown `content`, `tags`, ISO `date`, optional `excerpt`). Rendered at `/articles/[slug]`.

**Chronological index** — Articles ordered by `date` descending, shown on the home page via Convex `articles.getArticles` with client pagination/subscription (`usePaginatedQuery`) so the list stays in sync with imports.

**Tag index** — Articles that share a tag, resolved through `articleTags` / `articles.getArticlesByTag`, rendered under `/tag/[tag]`.

**RAG search** — Semantic retrieval over embedded article chunks via Convex action `rag_search.searchArticlesRAG`; result shape lives in `convex/searchResult.ts` as validators + inferred `SearchResult` type.

**Discuss chat** — Client-only assistant UI under `/discuss`, gated by `NEXT_PUBLIC_AI_CHAT_ENABLED`; bundled behind `next/dynamic` with `ssr: false`.

**RAG search bar** — Narrow UI for `/search`: text input, optional local history (`headsalon-search-history`), callback-only search (no URL sync unless `urlSync` is implemented later).

## Relationships

- The **Chronological index** and **Article**/**Tag index** reads use **different loaders** by design — see [`docs/adr/0001-article-index-loading.md`](docs/adr/0001-article-index-loading.md).
- **RAG search** returns article metadata aligned with list cards but is independent of the chronological index query.

## Example dialogue

> **Dev:** “Should we render the home article list on the server for SEO?”  
> **Product:** “No — we need the home list to update live when articles sync in Convex. Article and tag pages can stay RSC + cached `fetchQuery`.”

## Flagged ambiguities

- Prefer **Article** over “post” in code and docs unless user-facing Chinese copy says otherwise.
