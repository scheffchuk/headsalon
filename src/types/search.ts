// Shared types for search functionality

export type SearchResult = {
  _id: string;
  title: string;
  slug: string;
  date: string;
  tags: string[];
  relevantChunks?: { content: string }[];
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