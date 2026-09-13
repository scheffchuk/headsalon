<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# AGENTS

Flat reference. Every line must change behaviour vs default.

## Stance

- **Concise** — replies and commit messages; sacrifice grammar
- **Entropy** — leave the codebase better than you found it; shortcuts get copied
- When corrected, propose an AGENTS.md edit so the mistake can't recur
- Plain text only (no emojis)
- Large cleanups: run `knip`
- Make the best decision that will elevate all three: the user experience (UX), developer experience (DX), and agent experience (AX) always, without breaking anything

## TypeScript

- Let errors propagate unless you have a recovery path
- Prefer `unknown` + narrow; never cast to `any`
- Stay **concrete** — no abstraction or helper until an inline expression won't do
- Names over comments
- don't write local types. try to reuse existing types or export a type from a shared module file. prefer inferring types otherwise

## React

- React Compiler is on — skip manual `useMemo`/`useCallback`
- Small components; colocate what changes together
- Derive in render; `useEffect` only for external sync

## Tailwind

- Built-in values first, dynamic values sparingly, globals rarely
- v4 + global CSS + shadcn/ui

## Next

- Fetch in RSC (page can stay static)
- `next/font` + `next/script` when applicable
- Above-fold `next/image`: `sync`/`eager`; `priority` sparingly
- Watch serialized prop size RSC → client
