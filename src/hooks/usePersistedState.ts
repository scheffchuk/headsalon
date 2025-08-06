import { useState } from "react";

const PAGINATION_KEY = "articles_loaded";

export function usePersistedPagination() {
  // Initialize directly from sessionStorage (no useEffect needed)
  const [initialItems] = useState(() => {
    if (typeof window === 'undefined') return 20;
    const stored = sessionStorage.getItem(PAGINATION_KEY);
    return stored ? parseInt(stored, 10) : 20;
  });

  const saveItems = (count: number) => {
    sessionStorage.setItem(PAGINATION_KEY, count.toString());
  };

  return {
    initialItems,
    saveItems,
  };
}
