# HeadSalon

## Guides

**What this is.** HeadSalon (海德沙龙) is a Next.js front end for a blog archive: article listing, per-article pages, tag views, semantic search over the corpus, and an AI chat that can call a RAG tool to ground answers in the same articles. Backend is [Convex](https://www.convex.dev/) (tables + `@convex-dev/rag` + HTTP routes for chat streaming).

**Initial setup.**

1. Install dependencies: `pnpm install` (repo pins React types via `pnpm.overrides`).
2. Create/link a Convex project: `npx convex dev` (or deploy with `npx convex deploy`). This generates `convex/_generated/*` and syncs functions.
3. Env for the Next app: set `NEXT_PUBLIC_CONVEX_URL` to your deployment URL (Convex dashboard → Settings → URL). The chat UI builds the HTTP API base by switching `.cloud` → `.site` for `…/api/chat`.
4. Convex env: configure whatever your Convex project needs for embeddings (OpenAI `text-embedding-3-large` in `convex/rag_search.ts` / `import_articles.ts`) and for the chat model configured in `convex/http.ts`. Set those in the Convex dashboard (or CLI) as secrets—do not commit keys.
5. Run locally: `pnpm dev` with `npx convex dev` running so the client can talk to your dev backend.

**Content.** Articles live in Convex (`articles`, `articleTags` in `convex/schema.ts`). Bulk ingest uses the `importArticlesBatch` action in `convex/import_articles.ts` (JSONL-shaped batches) and indexes text into the RAG namespace `articles`.

## Tips

- **Search quality.** Very short Chinese-only queries are rewritten server-side (`关于…的内容`) before embedding search; see `preprocessChineseQuery` in `convex/rag_search.ts`.
- **Semantic search UI.** `RagSearchBar` (`src/components/search/rag-search-bar.tsx`) calls `rag_search.searchArticlesRAG`. Optional query history uses versioned `localStorage` key `headsalon-search-history:v1`, with migration from the older unversioned `headsalon-search-history` and legacy `smart-search-history`. Parsed `word:token` filter fragments are supported; `urlSync` can wire `?q=` later.
- **Chat URL.** If `NEXT_PUBLIC_CONVEX_URL` is missing or wrong, `/discuss` will not reach the Convex HTTP action—verify `.site` resolves and CORS matches your deployment model.
- **Performance / DX.** React Compiler is on; avoid adding `useMemo`/`useCallback` unless you have a measured reason. Prefer RSC data fetching where the app already does (e.g. articles via `getArticleBySlug` / `getArticlesByTag` in `src/lib/convex-cache.ts`, wrapped in `React.cache` for per-request dedupe). `next.config.ts` enables Cache Components and `experimental.optimizePackageImports` for `lucide-react` / `radix-ui`.

## Reference

- Next.js App Router UI: `src/app/(site)/` for the blog shell (home, `/articles/[slug]`, `/tag/[tag]`, `/search`); `src/app/(chat)/discuss/` for chat (no shared site `Header` on discuss—see `(chat)/layout.tsx`).
- Global shell: `src/app/layout.tsx` (Geist fonts, `ConvexClientProvider`, toasts, Vercel Analytics, `lang="zh-CN"`). Blog chrome: `(site)/layout.tsx` adds `Header` + max-width wrapper.
- Header nav: logo home, 搜索 → `/search`, AI → `/discuss` (`src/components/header.tsx`).
- Article index: paginated Convex query `articles.getArticles` (`src/components/articles/article-list.tsx`).
- Article detail: markdown rendering, scroll-progress client wrapper, metadata (`src/app/(site)/articles/[slug]/`).
- Tag pages: articles by tag; list UI colocated in `src/app/(site)/tag/[tag]/page.tsx`.
- Search: client calls action `rag_search.searchArticlesRAG`; results `src/components/search/search-results.tsx`; experience `src/components/search/rag-search-experience.tsx`.
- AI chat: `src/app/(chat)/discuss/discuss-chat-client.tsx` loads `chat-bot.tsx` with `next/dynamic` (`ssr: false`). `DiscussChatProvider` / `useDiscussChatContext` (`discuss-chat-context.tsx`) share state for the message list and composer. Transport: `useChat` + Convex HTTP `POST /api/chat` (`convex/http.ts`): streaming model, system prompt, tool `findRelatedArticle` → `searchArticlesRAG`.
- Convex data: `articles` (slug, content, tags, date, excerpt), `articleTags` join table; indexes `by_slug`, `by_date`, `by_tags` / `by_tag_and_articleDate`.
- RAG: `@convex-dev/rag` in `convex/convex.config.ts`; add/search in `import_articles.ts` and `rag_search.ts`.
- Styling: Tailwind v4 + shared UI under `src/components/ui` and AI Elements–style chat pieces under `src/components/ai-elements`.
- Scripts: `pnpm dev`, `pnpm build`, `pnpm start`, `pnpm lint`, `pnpm test:run`, `pnpm knip`.
