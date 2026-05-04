# Article index: live home list vs RSC reads

The chronological index on `/` uses Convex client pagination (`usePaginatedQuery` on `articles.getArticles`) so new or updated articles appear without a full page refresh. Article detail and tag listing routes use `fetchQuery` from the server with `React.cache` in `src/lib/convex-cache.ts` for efficient RSC metadata and body loads. This split is intentional: freshness for the main index, server-side caching and simpler data loading for stable document and tag views.
