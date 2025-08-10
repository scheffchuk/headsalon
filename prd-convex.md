# Product Requirements Document: HeadSalon Blog (Convex Backend)

## 1. Product Overview

### 1.1 Product Name
HeadSalon Blog - Dynamic Content Management System with Convex Backend

### 1.2 Product Vision
Create a modern, performant blog platform with real-time search capabilities using Convex as a reactive backend to showcase HeadSalon's extensive article collection with enhanced discoverability and user experience.

### 1.3 Target Audience
- Readers interested in HeadSalon's content
- Content consumers seeking specific topics through search
- Users browsing by categories/tags

### 1.4 Key Success Metrics
- Page load speed < 2 seconds
- Search response time < 300ms
- 95%+ uptime on Vercel + Convex
- Mobile-responsive design
- SEO-optimized content delivery

## 2. Product Requirements

### 2.1 Core Features

#### 2.1.1 Article Management
- **Display System**: Clean, readable article presentation
- **Content Structure**: Title, date, tags, content, excerpt
- **Navigation**: Previous/next article navigation
- **Metadata**: Automatic SEO tags and Open Graph data
- **Real-time Updates**: Articles update across all clients instantly

#### 2.1.2 Real-time Search
- **Search Interface**: Prominent search bar with autocomplete
- **Search Scope**: Full-text search across titles, content, and tags
- **Real-time Results**: Live search results as user types
- **Performance**: Sub-300ms response time
- **Results Display**: Live results with highlighting
- **No Results**: Helpful suggestions and related content

#### 2.1.3 Tag-based Filtering
- **Tag Display**: Visual tag system on articles
- **Tag Navigation**: Clickable tags for filtering
- **Tag Overview**: Tag cloud or category page
- **Filter Combination**: Multiple tag filtering support
- **Real-time Updates**: Filter results update live

#### 2.1.4 Pagination System
- **Article Listing**: Paginated article grid/list
- **Page Size**: 12-20 articles per page
- **Navigation**: Previous/Next and page numbers
- **URL Structure**: SEO-friendly pagination URLs


### 2.2 Technical Requirements

#### 2.2.1 Performance
- **Static Generation**: Next.js SSG for article pages
- **Real-time Queries**: Convex automatic caching and reactivity
- **Optimistic Updates**: Instant UI feedback
- **Image Optimization**: Next.js Image component
- **Bundle Size**: Optimized JavaScript delivery

#### 2.2.2 Convex Backend Architecture
- **Database**: Convex document database with JSON-like structure
- **Schema**: TypeScript schema definitions with automatic validation
- **Functions**: Queries, mutations, and actions for all operations
- **Real-time**: Automatic subscriptions and live updates
- **Vector Search**: Built-in vector search for enhanced content discovery

#### 2.2.3 Search Implementation Options
- **Option 1: Convex Real-time Search (Recommended)**
  - Server-side search with live results
  - Automatic result updates when content changes
  - Full-text search across all fields
- **Option 2: Hybrid Search**
  - Convex backend + client-side enhancement
  - Best of both worlds approach
- **Option 3: Vector-enhanced Search**
  - Semantic search using embeddings
  - Enhanced content discovery


### 2.3 User Experience Requirements

#### 2.3.1 Design Standards
- **Design System**: Consistent visual language with shadcn/ui
- **Typography**: Readable fonts optimized for long-form content
- **Color Scheme**: Professional, accessible color palette
- **Spacing**: Consistent spacing and layout grid
- **Responsive**: Mobile-first responsive design

#### 2.3.2 Accessibility
- **WCAG Compliance**: Level AA accessibility standards
- **Keyboard Navigation**: Full keyboard accessibility
- **Screen Readers**: Proper ARIA labels and semantic HTML
- **Color Contrast**: Sufficient contrast ratios

#### 2.3.3 Browser Support
- **Modern Browsers**: Chrome, Firefox, Safari, Edge (latest 2 versions)
- **Mobile Browsers**: iOS Safari, Chrome Mobile
- **Progressive Enhancement**: Graceful degradation for older browsers

## 3. Technical Specifications

### 3.1 Technology Stack
- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript for type safety
- **Styling**: Tailwind CSS for rapid development
- **Backend**: Convex (reactive database + serverless functions)
- **Search**: Convex queries + vector search
- **UI Components**: shadcn/ui with Command, Dialog, Toast components
- **Deployment**: Vercel (frontend) + Convex (backend)

### 3.2 Convex Schema Definition
```typescript
// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  articles: defineTable({
    title: v.string(),
    slug: v.string(),
    content: v.string(),
    excerpt: v.optional(v.string()),
    tags: v.array(v.string()),
    date: v.string(),
    embedding: v.optional(v.array(v.number())),
    wordCount: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_date", ["date"])
    .index("by_tags", ["tags"])
    .vectorIndex("by_embedding", {
      vectorField: "embedding",
      dimensions: 1536,
      filterFields: ["tags"]
    }),
    
});
```

### 3.3 Convex Functions Structure
```typescript
// Queries (real-time, cached)
convex/articles.ts:
  - getArticles(paginationOpts, filters)
  - getArticleBySlug(slug)
  - searchArticles(query)
  - getArticlesByTag(tag)

// Mutations (transactional writes)
convex/articles.ts:
  - createArticle(data)
  - updateArticle(id, data)

// Actions (external API calls)
convex/search.ts:
  - generateEmbedding(text) // For vector search
```

### 3.4 API Integration Patterns
```typescript
// Frontend usage with Convex React
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";

// Real-time article list
const articles = useQuery(api.articles.getArticles, { limit: 20 });

// Real-time search
const searchResults = useQuery(api.articles.searchArticles, { query });

```

### 3.5 Real-time Features Implementation

#### 3.5.1 Live Search
- **Real-time Queries**: Search results update automatically
- **Debounced Input**: 300ms delay to prevent excessive queries
- **Live Results**: No manual refresh needed
- **Cross-client Updates**: Search results sync across all users



### 3.6 File Structure
```
headsalon-blog/
├── convex/
│   ├── schema.ts                    # Database schema
│   ├── articles.ts                  # Article queries/mutations  
│   ├── search.ts                    # Search functionality
│   └── _generated/                  # Auto-generated types
├── src/
│   ├── app/
│   │   ├── page.tsx                 # Home page
│   │   ├── article/[slug]/page.tsx  # Article pages
│   │   ├── search/page.tsx          # Search results
│   │   ├── tag/[tag]/page.tsx       # Tag filtering
│   │   ├── globals.css
│   │   └── layout.tsx               # Root layout
│   ├── components/
│   │   ├── article-card.tsx
│   │   ├── SearchBar.tsx
│   │   ├── TagFilter.tsx
│   │   ├── Pagination.tsx
│   │   └── ui/                      # shadcn/ui components
│   ├── lib/
│   │   ├── utils.ts
│   │   └── convex.ts                # Convex client setup
│   └── types/
│       └── article.ts
├── scripts/
│   ├── import-articles.ts           # Article migration
│   └── generate-embeddings.ts       # Batch embedding generation
└── public/
```

## 4. Implementation Phases

### Phase 1: Foundation (Week 1)
- [ ] Next.js project setup with TypeScript
- [ ] Install dependencies:
  ```bash
  # Convex Backend
  npm install convex
  npx convex dev --once # Initialize Convex
  
  
  # Search & Processing
  npm install gray-matter remark remark-html
  
  # UI Components
  npx shadcn-ui@latest init
  npx shadcn-ui@latest add button card input command pagination
  
  # Additional utilities
  npm install date-fns clsx
  ```
- [ ] Convex schema design and setup
- [ ] Basic project structure
- [ ] Development environment configuration

### Phase 2: Data Migration (Week 1-2)
- [ ] Article import script for Convex
- [ ] Content processing pipeline
- [ ] Database population and validation
- [ ] Embedding generation for existing articles (optional for enhanced search)

### Phase 3: Core Features (Week 2-3)
- [ ] Article listing with real-time updates
- [ ] Individual article pages
- [ ] Basic navigation and routing
- [ ] Responsive layout implementation

### Phase 4: Search & Filtering (Week 3-4)
- [ ] Real-time search implementation with Convex
- [ ] Tag-based filtering system
- [ ] Advanced search with vector similarity
- [ ] Search result optimization

### Phase 5: Polish & Optimization (Week 4-5)
- [ ] Performance optimization
- [ ] SEO implementation
- [ ] Accessibility improvements
- [ ] Cross-browser testing
- [ ] Real-time performance optimization

### Phase 6: Deployment (Week 5)
- [ ] Production deployment to Vercel
- [ ] Convex production environment setup
- [ ] Environment variables configuration
- [ ] Performance monitoring setup
- [ ] Analytics integration
- [ ] Launch preparation

## 5. Success Criteria

### 5.1 Performance Metrics
- Page Speed Insights score > 90
- First Contentful Paint < 1.5s
- Largest Contentful Paint < 2.5s
- Cumulative Layout Shift < 0.1
- Real-time update latency < 100ms

### 5.2 Functionality Metrics
- Search results returned in < 300ms
- Zero critical accessibility violations
- 100% of articles successfully migrated
- Mobile usability score of 100
- Real-time features work across all clients

### 5.3 User Experience Metrics
- Bounce rate < 40%
- Average session duration > 2 minutes
- Pages per session > 2
- Mobile traffic accommodation

## 6. Constraints & Assumptions

### 6.1 Technical Constraints
- Convex free tier: 1-6 developers, 20 projects
- Vector search: 4096 dimensions max, 256 results limit
- Convex actions required for external API calls
- No user authentication required for basic features

### 6.2 Business Constraints
- Timeline: 5 weeks for initial launch
- Budget: ~$25/month (Convex Pro)
- Resources: Single developer implementation
- Content: Existing markdown articles only

### 6.3 Assumptions
- Articles are primarily in Chinese language
- Real-time features add significant value
- Convex learning curve is acceptable
- Vector search limitations are sufficient
- Monthly subscription cost is acceptable

## 7. Risk Assessment

### 7.1 Technical Risks
- **Convex Learning Curve**: New platform concepts
  - *Mitigation*: Start with documentation and examples
- **Vector Search Limits**: 256 results, actions-only
  - *Mitigation*: Design around limitations, use hybrid approach
- **Vendor Lock-in**: Hard to migrate away from Convex
  - *Mitigation*: Document data structure, plan exit strategy

### 7.2 Business Risks
- **Cost Scaling**: Usage-based pricing could increase
  - *Mitigation*: Implement proper rate limiting and monitoring
- **Feature Limitations**: Platform constraints
  - *Mitigation*: Prototype key features early to validate

## 8. Convex vs Traditional Backend Comparison

### 8.1 Convex Advantages
- **Real-time by Default**: No WebSocket setup needed
- **TypeScript Integration**: End-to-end type safety
- **Built-in Vector Search**: Perfect for RAG
- **No API Development**: Functions auto-generate APIs
- **Automatic Caching**: Performance optimizations included

### 8.2 Traditional Backend Advantages
- **Cost Control**: Free tiers available
- **Flexibility**: Full control over architecture
- **Ecosystem**: Larger community and resources
- **Portability**: Standard technologies
- **Learning**: Widely applicable skills

### 8.3 Recommendation
Convex is ideal for this project if:
- Real-time features are high priority
- Development speed matters more than cost
- You're comfortable with modern JavaScript/TypeScript
- The monthly subscription fits your budget
- You value integrated developer experience

## 9. Future Enhancements

### 9.1 Phase 2 Features
- Advanced semantic search with AI embeddings
- Content recommendation system
- Reader analytics and insights
- Multi-language support
- Enhanced mobile experience
- Content export/sharing features

### 9.2 Long-term Vision
- Multi-author blog support
- Content management system (CMS)
- Reader comments and engagement
- Newsletter integration
- Content analytics dashboard
- API for third-party integrations
- Advanced content filtering and categorization

---

**Document Version**: 1.0 (Convex Backend)  
**Last Updated**: [Current Date]  
**Owner**: Development Team  
**Alternative**: See PRD.md for traditional backend approach