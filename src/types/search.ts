// Shared types for search functionality

export type SearchResult = {
  _id: string;
  articleId: string;
  title: string;
  slug: string;
  date: string;
  tags: string[];
  excerpt: string;
  score?: number;
  relevantChunks?: { 
    content: string; 
    score?: number;
  }[];
  _meta?: {
    searchType: string;
    semanticScore: number;
  };
};

export type SearchState = {
  query: string;
  results: SearchResult[];
  isLoading: boolean;
  lastSearchedQuery: string;
  hasSearched: boolean;
};

export type SearchActions = {
  setQuery: (query: string) => void;
  handleClear: () => void;
  handleArticleClick: () => void;
};