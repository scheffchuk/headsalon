# Article index: cached RSC offset pages

The chronological index uses the same cached RSC loader as article detail and tag listing: `fetchQuery` from the server with `"use cache"` in `src/lib/convex-cache.ts`. Home is `/` (page 1) and `/page/N`, offset pages of 30, prerendered with `generateStaticParams`. Cache Components uses `cacheLife("max")` and `cacheTag("articles", "home")` on the index loaders. This reverses the earlier live `usePaginatedQuery` client island on `/`.
