// Simple search result caching using browser sessionStorage
// Automatically clears when browser session ends

type SearchResult = {
  _id: string;
  title: string;
  slug: string;
  date: string;
  tags: string[];
  relevantChunks?: { content: string }[];
};

type CachedSearchData = {
  results: SearchResult[];
  timestamp: number;
  scrollPosition: number;
};

const CACHE_PREFIX = "search-results";
const CACHE_TTL = 30 * 60 * 1000; // 15 minutes

// Generate cache key for search parameters
function getCacheKey(query: string, limit: number, tagFilter?: string): string {
  const normalizedQuery = query.trim().toLowerCase();
  const tag = tagFilter || "all";
  return `${CACHE_PREFIX}-${normalizedQuery}-${limit}-${tag}`;
}

// Check if cached data is still valid
function isCacheValid(timestamp: number): boolean {
  return Date.now() - timestamp < CACHE_TTL;
}

// Store search results in cache
export function cacheSearchResults(
  query: string,
  limit: number,
  results: SearchResult[],
  scrollPosition: number = 0,
  tagFilter?: string
): void {
  if (typeof window === "undefined") return; // SSR safety

  try {
    const cacheKey = getCacheKey(query, limit, tagFilter);
    const cacheData: CachedSearchData = {
      results,
      timestamp: Date.now(),
      scrollPosition,
    };

    sessionStorage.setItem(cacheKey, JSON.stringify(cacheData));
  } catch (error) {
    // Handle storage quota exceeded or other errors gracefully
    console.warn("Failed to cache search results:", error);
  }
}

// Retrieve search results from cache
export function getCachedSearchResults(
  query: string,
  limit: number,
  tagFilter?: string
): { results: SearchResult[]; scrollPosition: number } | null {
  if (typeof window === "undefined") return null; // SSR safety

  try {
    const cacheKey = getCacheKey(query, limit, tagFilter);
    const cached = sessionStorage.getItem(cacheKey);

    if (!cached) return null;

    const cacheData: CachedSearchData = JSON.parse(cached);

    // Check if cache is still valid
    if (!isCacheValid(cacheData.timestamp)) {
      sessionStorage.removeItem(cacheKey);
      return null;
    }

    return {
      results: cacheData.results,
      scrollPosition: cacheData.scrollPosition,
    };
  } catch (error) {
    console.warn("Failed to retrieve cached search results:", error);
    return null;
  }
}

// Clear all search caches
export function clearSearchCache(): void {
  if (typeof window === "undefined") return;

  try {
    const keys = Object.keys(sessionStorage);
    keys.forEach((key) => {
      if (key.startsWith(CACHE_PREFIX)) {
        sessionStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.warn("Failed to clear search cache:", error);
  }
}

// Clear specific search cache
export function clearSpecificSearchCache(
  query: string,
  limit: number,
  tagFilter?: string
): void {
  if (typeof window === "undefined") return;

  try {
    const cacheKey = getCacheKey(query, limit, tagFilter);
    sessionStorage.removeItem(cacheKey);
  } catch (error) {
    console.warn("Failed to clear specific search cache:", error);
  }
}
