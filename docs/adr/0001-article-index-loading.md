# Article index: live home list vs RSC reads

The chronological index on `/` uses Convex client pagination (`usePaginatedQuery` on `articles.getArticles`) so new or updated articles appear without a full page refresh. Article detail and tag listing routes use `fetchQuery` from the server with `"use cache"` in `src/lib/convex-cache.ts` so document and tag views participate in Cache Components (Partial Prerendering, `cacheLife("hours")`, `cacheTag`). This split is intentional: freshness for the main index, cached RSC reads for stable document and tag views.
