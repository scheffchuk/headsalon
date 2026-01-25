# React Best Practices Audit

Prioritized list of quick wins and top fixes, aligned with Vercel React best practices and your rules (RSC-first, React Compiler, no manual useMemo/useCallback).

---

## P0 – Critical / Quick Wins

### 1. Eliminate fetch waterfalls (async-parallel, server-cache-react)

**Article page** (`/articles/[slug]`) and **tag page** (`/tag/[tag]`) each fetch the same data twice: once in `generateMetadata`, once in the page RSC. Sequential duplicates add latency.

**Fix:** Wrap Convex `fetchQuery` in `React.cache()` so metadata and content share one request:

```ts
// e.g. convex/lib.ts or colocated
import { cache } from "react";
import { fetchQuery } from "convex/nextjs";
import { api } from "../convex/_generated/api";

export const getArticleBySlug = cache((slug: string) =>
  fetchQuery(api.articles.getArticleBySlug, { slug: decodeURIComponent(slug) })
);

export const getArticlesByTag = cache((tag: string) =>
  fetchQuery(api.articles.getArticlesByTag, { tag: decodeURIComponent(tag) })
);
```

Use these in both `generateMetadata` and the page components. Same pattern for tag pages.

**Impact:** Fewer round-trips, faster TTFB. **Effort:** Low.

---

### 2. Fix list `key`: use `article.slug`, not index

**File:** `src/components/articles/article-list.tsx`

```tsx
key={`article-${index}`}
```

Index keys break when list order changes (sort, filter, pagination) and can cause stale state / wrong DOM reuse.

**Fix:** `key={article.slug}` (slug is stable and unique; already used in `ViewTransition`).

**Impact:** Correct reconciliation, avoids subtle bugs. **Effort:** Trivial.

---

### 3. Fix `&&` conditionals that can render `0` (rendering-conditional-render)

**Files:**  
- `src/components/articles/article-list.tsx` (tags)  
- `src/app/articles/[slug]/article.tsx` (tags)  
- `src/components/search/search-result-item.tsx` (tags)

```tsx
{article.tags && article.tags.length > 0 && (
  <div>...</div>
)}
```

When `article.tags` is `[]`, this evaluates to `0` and React renders `"0"`.

**Fix:** Use a ternary:

```tsx
{article.tags && article.tags.length > 0 ? (
  <div>...</div>
) : null}
```

Or: `{article.tags?.length ? (...) : null}`.

**Impact:** Removes visible `0` bug. **Effort:** Trivial.

---

### 4. Header logo: above-the-fold image should not be `loading="lazy"`

**File:** `src/components/header.tsx`

Logo is in the header on every page, so it’s above the fold. `loading="lazy"` delays it.

**Fix:** Remove `loading="lazy"` (default eager) or use `priority` if you want explicit preload. Your rules: use `priority` sparingly for above-the-fold images.

**Impact:** Faster LCP for logo. **Effort:** Trivial.

---

### 5. Avoid barrel import for search (bundle-barrel-imports)

**File:** `src/app/search/search.tsx`

```ts
import { SearchResults } from "@/components/search";
```

This goes through `@/components/search/index.ts`. Barrel files hinder tree-shaking and can pull in unused code.

**Fix:** Import directly:

```ts
import { SearchResults } from "@/components/search/search-results";
```

**Impact:** Smaller bundles, clearer dependencies. **Effort:** Trivial.

---

## P1 – High-Value, Low Effort

### 6. Remove manual `useCallback` (React Compiler)

**File:** `src/components/ai-elements/conversation.tsx`

```tsx
const handleScrollToBottom = useCallback(() => {
  scrollToBottom();
}, [scrollToBottom]);
```

With React Compiler, skip manual `useCallback`.

**Fix:** Use a plain function: `const handleScrollToBottom = () => scrollToBottom();`

**Impact:** Less boilerplate, same behavior. **Effort:** Trivial.

---

### 7. Dynamic import heavy, route-specific client components (bundle-dynamic-imports)

**Routes:**  
- `/discuss` – `ChatBot` (AI SDK, Convex, etc.)  
- `/search` – `SearchPageContent` + `SmartSearch`  
- `/flashing` – `HeadSalonRom` (layout `useMemo`, D3-style logic)

These are heavy and only needed on their routes. Loading them in the main bundle increases initial JS everywhere.

**Fix:** Use `next/dynamic` with `ssr: false` (or appropriate `loading`) on those pages:

```tsx
// discuss/page.tsx
const ChatBot = dynamic(() => import("./chat-bot"), { ssr: false });
```

Same idea for search and flashing. Keep `Suspense` fallbacks where you already have them.

**Impact:** Smaller main bundle, faster initial load. **Effort:** Low.

---

### 8. `ConversationScrollButton`: use ternary instead of `&&`

**File:** `src/components/ai-elements/conversation.tsx`

```tsx
return !isAtBottom && (<Button ... />);
```

When `isAtBottom` is true this returns `false`; React treats it fine, but the pattern is easy to misuse. Prefer explicit conditional rendering.

**Fix:** `return !isAtBottom ? <Button ... /> : null;`

**Impact:** Clearer, more consistent with best practices. **Effort:** Trivial.

---

## P2 – Medium Priority

### 9. Revisit `useMemo` in `underline-center` (React Compiler)

**File:** `src/components/ui/underline-center.tsx`

```tsx
const MotionComponent = useMemo(() => motion.create(as ?? "span"), [as]);
```

With React Compiler, usually avoid manual `useMemo`. `motion.create` is a bit special (dynamic component). If the compiler doesn’t optimize it, keeping `useMemo` may be reasonable.

**Fix:** Try removing `useMemo` and rely on the compiler; keep it only if you see unnecessary churn (e.g. in React DevTools).

**Impact:** Cleaner code, possibly fewer allocations. **Effort:** Low.

---

### 10. Smart-search: cache and version `localStorage` (client-localstorage-schema, js-cache-storage)

**File:** `src/components/smart-search.tsx`

- `localStorage` is read and `JSON.parse`’d in multiple places (initial load, `saveToHistory`, etc.).
- No schema version, so future changes risk invalid data.

**Fix:**  
- Centralize reads (e.g. one getter) and cache in memory for the session.  
- Add a version field to stored data and migrate/handle old formats.

**Impact:** Fewer repeated reads, safer evolution. **Effort:** Medium.

---

### 11. `useEffect` in smart-search (rerender-move-effect-to-event where possible)

**File:** `src/components/smart-search.tsx`

You use `useEffect` for:

- Reading `localStorage` on mount  
- Click-outside listener  
- URL sync with `searchParams`

Click-outside and URL sync have to stay in effects. The localStorage read on mount is appropriate. Worth ensuring you’re not syncing URL or handling outside-clicks in a way that could be moved to event handlers (e.g. initial URL read vs. ongoing sync).

**Fix:** No change strictly required; just avoid adding new effects for things that can be done in event handlers (e.g. “load history when user opens dropdown” vs. always on mount).

**Impact:** Keeps effects minimal. **Effort:** Low (review only).

---

## P3 – Lower Priority / Verify

### 12. Vercel Analytics loading (bundle-defer-third-party)

**File:** `src/app/layout.tsx`

`@vercel/analytics` is typically designed to defer. Confirm it’s not blocking initial paint or hydration. If it is, load it via `next/script` with `strategy="lazyOnload"` or equivalent.

**Impact:** Avoids third-party work on critical path. **Effort:** Low (verify + small tweak if needed).

---

### 13. `useMemo` in `rom` layout

**File:** `src/components/rom.tsx`

Layout computation (`nodes`, `links`, etc.) is wrapped in `useMemo`. That’s a good candidate for memoization regardless of React Compiler.

**Fix:** Keep it unless profiling shows it’s unnecessary.

**Impact:** N/A. **Effort:** None.

---

### 14. `rom` `&&` for link rendering

**File:** `src/components/rom.tsx`

```tsx
{node.isLeaf && node.hasUrl && node.url ? (
  <Link ... />
) : (
  <span ... />
)}
```

This already uses a ternary; the `&&` chain is only for the condition, so you never render `0` or `false`. Fine as is.

---

## Summary

| Priority | Item | Effort | Impact |
|----------|------|--------|--------|
| P0 | 1. Cache fetches (article + tag) | Low | High |
| P0 | 2. List `key` → `article.slug` | Trivial | Medium |
| P0 | 3. Tags `&&` → ternary | Trivial | Medium |
| P0 | 4. Logo: remove `loading="lazy"` | Trivial | Medium |
| P0 | 5. Direct search import | Trivial | Low–Medium |
| P1 | 6. Drop `useCallback` in conversation | Trivial | Low |
| P1 | 7. Dynamic import discuss/search/flashing | Low | High |
| P1 | 8. ConversationScrollButton ternary | Trivial | Low |
| P2 | 9. `useMemo` in underline-center | Low | Low |
| P2 | 10. localStorage cache + versioning | Medium | Medium |
| P2 | 11. Review `useEffect` usage | Low | Low |
| P3 | 12. Verify Analytics defer | Low | Low |
| P3 | 13–14. Rom `useMemo` / conditionals | None | – |

**Suggested order:** Do P0 items first (especially #1–4), then P1. Revisit P2–P3 when you’re doing deeper perf or refactors.
