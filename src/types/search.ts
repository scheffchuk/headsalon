// Shared types for search functionality

// Custom SearchResult type that matches the Convex backend
export type SearchResult = {
  _id: string;
  articleId: string;
  title: string;
  slug: string;
  date: string;
  tags: string[];
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
};

export type SearchActions = {
  executeSearch: (searchTerm: string) => void;
  handleClear: () => void;
};
