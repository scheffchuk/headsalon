# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

HeadSalon is a Chinese-language blog application built with Next.js 15 and Convex as the backend database. The application serves articles with tagging, search functionality, AI chat features, and a clean Chinese typography-focused design.

## Development Commands

- `pnpm dev` - Start development server with Turbopack (prefer pnpm for package management)
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `npx convex deploy` - Deploy to Convex production (no --prod flag needed)
- `npx convex logs` - View production logs
- `node prepare_import_batch.js` - Prepare article batches for RAG system import

Note: Use `pnpm` for package management when possible. The project includes a `pnpm-lock.yaml` file.

## Architecture Overview

### Database Schema (Convex)
The application uses two main tables with optimized indexing:

1. **articles** - Core article content
   - Fields: title, slug, content, excerpt, tags (array), date
   - Indexes: by_slug, by_date, by_tags
   - Full CRUD operations with RAG system synchronization

2. **articleTags** - Junction table for efficient tag filtering
   - Fields: articleId (FK), tag, articleDate
   - Indexes: by_tag_date, by_article
   - Purpose: Eliminates memory warnings when filtering by tags

### RAG (Retrieval Augmented Generation) System
The application includes a sophisticated RAG implementation for AI-powered search:

**RAG Configuration**: Uses OpenAI's text-embedding-3-large model with 3072 dimensions for Chinese text optimization. Articles are stored in the "articles" namespace with comprehensive metadata filtering.

**Search Architecture**: Implements semantic search with Chinese text preprocessing, including punctuation normalization and query expansion for short queries. Results are deduplicated and ranked by relevance scores.

**Content Processing**: Articles are combined (title + content) before embedding, with tags stored as pipe-separated strings for efficient filtering. Each article maintains filter values for slug, date, creationTime, tag, and title.

### Key Design Patterns

**Tag Filtering Performance**: Uses a junction table pattern where `getArticlesByTag` queries the `articleTags` table first (efficient indexed lookup), then fetches full article data. This prevents loading all articles into memory and eliminates Convex memory warnings.

**SSR with Convex**: Implements preloadQuery pattern for server-side rendering. Home page uses cached fetchQuery with React cache and Next.js unstable_cache for performance. Article pages use preloadQuery for immediate data availability.

**Search State Management**: Custom useSearch hook manages search state with debouncing (300ms search, 500ms URL updates), caching, and scroll position restoration. Results are cached in sessionStorage for navigation performance.

**Data Consistency**: The `articleTags` table is populated via migration (`migrations:populateArticleTags`) and maintained automatically when articles are created/updated. RAG system sync is handled separately through dedicated actions.

### File Structure

- `/convex/` - Convex backend (queries, schema, migrations, RAG)
  - `schema.ts` - Database schema with optimized indexes
  - `articles.ts` - Article CRUD operations with junction table management
  - `rag_search.ts` - RAG system implementation and search logic
  - `import_articles.ts` - Batch import functionality for RAG system
  - `migrations.ts` - Database migration utilities
- `/src/app/` - Next.js App Router pages with SSR patterns
- `/src/components/` - Reusable UI components including AI chat elements
- `/src/hooks/` - Custom React hooks (useSearch)
- `/src/providers/` - React context providers (Convex client)
- `/src/types/` - TypeScript type definitions
- `/src/utils/` - Utility functions (search caching)

### Frontend Patterns

**Convex Integration**: Uses preloadQuery for article pages and cached fetchQuery for home page pagination. ConvexClientProvider wraps the entire app for Convex React client access.

**AI Chat Integration**: Implements AI SDK with AI elements for conversational search and assistance. Uses multi-model support through AI gateway configuration.

**Chinese Localization**: HTML lang set to "zh-CN" with Chinese-optimized typography. RAG system includes Chinese text preprocessing for better search results.

**Styling**: Tailwind CSS with constrained layout (max-w-2xl centered). Uses shadcn/ui components with New York style and Lucide icons. Includes custom animations and scroll progress indicators.

**State Management**: Search functionality uses custom hooks with caching and URL synchronization. Pagination handled server-side with client-side navigation.

**Filename Conventions**: 
- Frontend files (components, pages, utilities) use kebab-case (e.g., `article-card.tsx`, `search-results.tsx`)
- Convex backend files use snake_case with underscores (e.g., `rag_search.ts`, `import_articles.ts`)

## RAG System Operations

### Content Import Process
1. Export articles to JSONL format with required fields (_id, title, slug, content, excerpt, tags, date, _creationTime)
2. Use `prepare_import_batch.js` to create manageable batches (default 50 articles)
3. Import batches via Convex dashboard using `importArticlesBatch` action
4. Monitor logs for import success/failure rates

### Search Functionality
- Semantic search through `searchArticlesRAG` action with Chinese text optimization
- Configurable similarity thresholds and result limits
- Tag filtering integrated with semantic search
- Results include relevance scores and highlighted content chunks

## Migration Notes

When adding new articles or modifying tag relationships:
1. Run the `migrations:populateArticleTags` function in Convex dashboard to maintain the articleTags junction table
2. Use article CRUD mutations which automatically maintain both tables and RAG system consistency
3. For bulk operations, use the batch import system which handles RAG synchronization

## Environment Variables

- `NEXT_PUBLIC_CONVEX_URL` - Required for Convex client connection