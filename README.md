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
- **Smart search UI.** Optional local history uses `localStorage` key `smart-search-history`. The component can parse `word:token` filter fragments out of the query string (`smart-search.tsx`); wire `urlSync` / filters if you extend search.
- **Chat URL.** If `NEXT_PUBLIC_CONVEX_URL` is missing or wrong, `/discuss` will not reach the Convex HTTP action—verify `.site` resolves and CORS matches your deployment model.
- **Roadmap page.** `/flashing` renders the interactive roadmap (`HeadSalonRom` + `rom-data.ts`); the header link is commented out in `header.tsx`—enable it if you want it in nav.
- **Performance / DX.** React Compiler is on; avoid adding `useMemo`/`useCallback` unless you have a measured reason. Prefer RSC data fetching where the app already does (e.g. article metadata via `getArticleBySlug`).

## Reference

- Next.js App Router UI: `src/app` (home article list, `/articles/[slug]`, `/tag/[tag]`, `/search`, `/discuss`).
- Global shell: `src/app/layout.tsx` (Geist fonts, `ConvexClientProvider`, header, toasts, Vercel Analytics, `lang="zh-CN"`).
- Header nav: logo home, 搜索 → `/search`, AI → `/discuss` (`src/components/header.tsx`).
- Article index: paginated Convex query `articles.getArticles` (`src/components/articles/article-list.tsx`).
- Article detail: markdown/content rendering, scroll progress wrapper, metadata generation (`src/app/articles/[slug]/`).
- Tag pages: articles by tag via `articleTags` index (`src/app/tag/[tag]/`).
- Search: client calls action `rag_search.searchArticlesRAG`; results component `src/components/search/search-results.tsx`; smart input `src/components/smart-search.tsx`.
- AI chat: client `useChat` → Convex HTTP `POST /api/chat` (`src/app/discuss/chat-bot.tsx`, `convex/http.ts`): streaming model, system prompt, tool `findRelatedArticle` → `searchArticlesRAG`.
- Convex data: `articles` (slug, content, tags, date, excerpt), `articleTags` join table; indexes `by_slug`, `by_date`, `by_tags` / `by_tag_and_articleDate`.
- RAG: `@convex-dev/rag` in `convex/convex.config.ts`; add/search in `import_articles.ts` and `rag_search.ts`.
- Styling: Tailwind v4 + shared UI under `src/components/ui` and AI Elements–style chat pieces under `src/components/ai-elements`.
- Scripts: `pnpm dev`, `pnpm build`, `pnpm start`, `pnpm lint`.
