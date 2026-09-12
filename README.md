# HeadSalon

HeadSalon (海德沙龙) is a blog archive: a chronological index of articles, article pages, tag pages, semantic search over the corpus, and an optional AI chat grounded in the same articles. The front end is a Next.js 16 App Router app with Cache Components, so the index, article, and tag pages are prerendered or cached on the server. Articles, the search index, and the chat endpoint live in Convex.

## Stack

The app depends on these pieces:

- Next.js 16.3 App Router with `cacheComponents` and `partialPrefetching` on (`next.config.ts`), React 19
- Convex: `articles` and `articleTags` tables (`convex/schema.ts`), `@convex-dev/aggregate` for the home page count and offset, `@convex-dev/rag` for embeddings and search, an HTTP route for chat streaming (`convex/http.ts`)
- shadcn/ui components under `src/components/ui`, Vercel AI Elements under `src/components/ai-elements`, Tailwind v4
- Vercel AI SDK (`ai`, `@ai-sdk/react`, `@ai-sdk/openai`)
- pnpm, vitest, ESLint (`eslint-config-next`), knip

## Routes

- `/` — Chronological index, page 1. Rendered by `HomeArticleIndex` (`src/components/articles/home-article-index.tsx`).
- `/page/N` — Index pages 2 through N, 30 articles each. `/page/1` redirects to `/`. A page past the end returns 404.
- `/articles/[id]` — One article by Convex id. A legacy slug in the URL resolves through `articles.getArticleByParam` and permanently redirects to the id URL.
- `/tag/[tag]` — Tag index: articles that share one tag, via `articles.getArticlesByTag`.
- `/search` — RAG search. The client calls the action `rag_search.searchArticlesRAG`.
- `/discuss` — Discuss chat. Renders `ChatMaintenance` unless `NEXT_PUBLIC_AI_CHAT_ENABLED` is `true`. The client posts to the Convex HTTP route `POST /api/chat`.

The `(site)` route group adds the `Header` and page width. The `(chat)` group has its own layout without the header.

## Data loading

Server reads go through `src/lib/convex-cache.ts`: `fetchQuery` wrapped in `"use cache"` with `cacheTag`. The home loaders use `cacheLife("max")` and the tags `articles` and `home`. Article and tag loaders use `cacheLife("hours")` and a per-article or per-tag tag. The reasoning is in `docs/adr/0001-article-index-loading.md`.

### Home offset pagination

`articles.getHomeArticlePage` (`convex/articles.ts`) reads a `TableAggregate` over `articles` with sort key `[date, _id]` (`convex/lib/articleAggregate.ts`):

1. `count` gives `totalCount` and `totalPages` with `HOME_PAGE_SIZE = 30`.
2. `at(-(offset + 1))` finds the first key of the requested page in date-descending order.
3. `paginate` from that key returns 30 ids. The query loads those documents and returns the list projection (`_id`, `title`, `slug`, `date`, `tags`), never `content`.

`src/app/(site)/page/[page]/page.tsx` calls `getHomeArticleCount` in `generateStaticParams`, so `/page/2` through `/page/N` are prerendered. `/` is page 1 and has no `/page/1` twin.

Internal mutations that write `articles` use the `internalMutation` wrapper in `convex/lib/functions.ts`. The wrapper registers the aggregate trigger, so writes through it keep the aggregate in sync.

After the first deploy that includes the aggregate component, and whenever the aggregate may be out of sync with `articles`, run the backfill once:

```
npx convex run articles:backfillArticleAggregate '{"cursor": null}'
```

The mutation inserts 64 articles per call with `insertIfDoesNotExist` and schedules itself until `isDone` is `true`.

## Local development

You need Node.js, pnpm, and a Convex account.

1. Install dependencies. The repo pins `@types/react` through `pnpm.overrides`.

```
pnpm install
```

2. Start the Convex dev deployment. This creates or links a project, writes `convex/_generated/*`, pushes functions, and watches for changes. Keep it running.

```
npx convex dev
```

3. Set the Next.js environment variables in `.env.local`. The file is gitignored.

- `NEXT_PUBLIC_CONVEX_URL` — Deployment URL, `https://<name>.convex.cloud`. `npx convex dev` writes this value for you. The chat client derives the HTTP base by replacing `.cloud` with `.site` (`src/app/(chat)/discuss/use-discuss-chat.ts`). If the variable is missing, `ConvexClientProvider` renders without a client.
- `NEXT_PUBLIC_AI_CHAT_ENABLED` — Set to `true` to enable `/discuss`. Any other value shows the maintenance page.

4. Set provider keys on the Convex deployment (dashboard, Settings, Environment Variables), not in the repo. Embeddings use `openai.embedding("text-embedding-3-large")` from `@ai-sdk/openai`, which reads `OPENAI_API_KEY`. The chat model is the gateway string `xai/grok-4.5` in `convex/http.ts`, which the AI SDK resolves through Vercel AI Gateway with `AI_GATEWAY_API_KEY`.

5. Start Next.js and open http://localhost:3000.

```
pnpm dev
```

6. If `articles` has rows but `/` is empty, run the backfill from the previous section against the dev deployment.

## Scripts

```
pnpm dev                 # next dev
pnpm build               # next build
pnpm start               # next start
pnpm lint                # eslint . --max-warnings 0
pnpm test                # vitest (watch)
pnpm test:run            # vitest run
pnpm knip                # unused files, exports, dependencies
pnpm exec tsc --noEmit   # typecheck; there is no package.json script for it
```

Tests run under vitest with jsdom for `src/**` and Node for `convex/**/*.test.ts`, which use `convex-test`. Setup lives in `src/test/setup.ts`. `vitest.config.ts` maps `@` to `src` and `@convex` to `convex`.

## Content

- `articles` — `title`, `slug`, Markdown `content`, optional `excerpt`, `tags`, ISO `date`. Indexes `by_slug`, `by_date`, `by_tags`.
- `articleTags` — Join rows with `articleId`, `tag`, and `articleDate`. Index `by_tag_and_articleDate` drives tag pages. `migrations.backfillArticleTags` fills in missing rows.
- RAG — The actions `importArticlesBatch` and `importArticlesSimple` in `convex/import_articles.ts` embed `title` plus `content` into the RAG namespace `articles`, keyed by article `_id`, with the filters listed in `convex/articleRag.ts`. `rag_search.searchArticlesRAG` searches that namespace and returns the `SearchResult` shape from `convex/searchResult.ts`.

## Docs

- `CONTEXT.md` — Domain vocabulary. Use these terms in code, docs, and UI copy.
- `docs/adr/` — Architecture decision records.
