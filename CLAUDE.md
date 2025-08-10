# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

HeadSalon is a Chinese-language blog application built with Next.js 15 and Convex as the backend database. The application serves articles with tagging, search functionality, and a clean Chinese typography-focused design.

## Development Commands

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npx convex deploy` - Deploy to Convex production (no --prod flag needed)
- `npx convex logs` - View production logs

## Architecture Overview

### Database Schema (Convex)
The application uses two main tables with optimized indexing:

1. **articles** - Core article content
   - Fields: title, slug, content, excerpt, tags (array), date
   - Indexes: by_slug, by_date, by_tags
   - Search indexes: search_title_content, search_content

2. **articleTags** - Junction table for efficient tag filtering
   - Fields: articleId (FK), tag, articleDate
   - Indexes: by_tag_date, by_article
   - Purpose: Eliminates memory warnings when filtering by tags

### Key Design Patterns

**Tag Filtering Performance**: Uses a junction table pattern where `getArticlesByTag` queries the `articleTags` table first (efficient indexed lookup), then fetches full article data. This prevents loading all articles into memory and eliminates Convex memory warnings.

**Search Architecture**: Implements dual-phase search that prioritizes title matches over content matches, with optional tag filtering via search indexes.

**Data Consistency**: The `articleTags` table is populated via migration (`migrations:populateArticleTags`) and should be kept in sync when articles are created/updated.

### File Structure

- `/convex/` - Convex backend (queries, schema, migrations)
- `/src/app/` - Next.js App Router pages and components
- `/src/app/articles/[slug]/` - Dynamic article pages
- `/src/app/tag/[tag]/` - Tag filtering pages
- `/src/components/` - Reusable UI components

### Frontend Patterns

**Convex Integration**: Uses preloadQuery pattern for SSR with `ConvexClientProvider` wrapping the app. Articles are preloaded on the server and hydrated on the client.

**Chinese Localization**: The app is Chinese-language focused with zh-CN locale settings and appropriate typography.

**Styling**: Uses Tailwind CSS with a constrained max-width design (max-w-2xl) centered layout.

**Filename Conventions**: All filenames should use kebab-case for consistency (e.g., `article-card.tsx`, `search-results.tsx`, `highlighted-text.tsx`). This applies to components, pages, utilities, and other source files.

## Migration Notes

When adding new articles or modifying tag relationships, run the `migrations:populateArticleTags` function in the Convex dashboard to maintain the articleTags junction table.

## Environment Variables

- `NEXT_PUBLIC_CONVEX_URL` - Required for Convex client connection