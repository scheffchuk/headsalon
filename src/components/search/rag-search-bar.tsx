"use client";

import { useEffect, useRef, useState } from "react";
import { Clock, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const HISTORY_VERSION = "v1";
const HISTORY_KEY = `headsalon-search-history:${HISTORY_VERSION}`;
/** Pre-versioning key; migrated into HISTORY_KEY on first read. */
const LEGACY_HISTORY_KEY_UNVERSIONED = "headsalon-search-history";
const LEGACY_HISTORY_KEY = "smart-search-history";

function parseHistoryJson(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is string => typeof item === "string");
  } catch {
    return [];
  }
}

function loadSearchHistoryList(): string[] {
  if (typeof window === "undefined") return [];

  try {
    let merged = parseHistoryJson(localStorage.getItem(HISTORY_KEY));

    if (merged.length === 0) {
      merged = parseHistoryJson(
        localStorage.getItem(LEGACY_HISTORY_KEY_UNVERSIONED),
      );
      if (merged.length > 0) {
        try {
          localStorage.setItem(HISTORY_KEY, JSON.stringify(merged));
          localStorage.removeItem(LEGACY_HISTORY_KEY_UNVERSIONED);
        } catch {
          /* private mode / quota */
        }
      }
    }

    if (merged.length === 0) {
      const legacy = parseHistoryJson(localStorage.getItem(LEGACY_HISTORY_KEY));
      if (legacy.length > 0) {
        merged = legacy;
        try {
          localStorage.setItem(HISTORY_KEY, JSON.stringify(merged));
          localStorage.removeItem(LEGACY_HISTORY_KEY);
          localStorage.removeItem(LEGACY_HISTORY_KEY_UNVERSIONED);
        } catch {
          /* private mode / quota */
        }
      }
    }

    return merged;
  } catch {
    return [];
  }
}

export type RagSearchBarProps = {
  className?: string;
  placeholder?: string;
  onSearch?: (query: string) => void;
  onQueryChange?: (query: string) => void;
  searchHistory?: boolean;
  maxHistoryItems?: number;
};

export function RagSearchBar({
  className,
  placeholder = "Search…",
  onSearch,
  onQueryChange,
  searchHistory = false,
  maxHistoryItems = 10,
}: RagSearchBarProps) {
  const [query, setQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [historyList, setHistoryList] = useState<string[]>(() =>
    searchHistory ? loadSearchHistoryList() : [],
  );
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDocMouseDown = (event: MouseEvent) => {
      if (
        rootRef.current &&
        !rootRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
        setSelectedIndex(-1);
      }
    };
    const onGlobalKeyDown = (event: KeyboardEvent) => {
      if (event.key === "/" && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener("mousedown", onDocMouseDown);
    document.addEventListener("keydown", onGlobalKeyDown);
    return () => {
      document.removeEventListener("mousedown", onDocMouseDown);
      document.removeEventListener("keydown", onGlobalKeyDown);
    };
  }, []);

  const saveToHistory = (q: string) => {
    if (!searchHistory || !q.trim()) return;
    const next = [
      q,
      ...historyList.filter((item) => item !== q),
    ].slice(0, maxHistoryItems);
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
    } catch {
      /* private mode / quota */
    }
    setHistoryList(next);
  };

  const clearHistory = () => {
    try {
      localStorage.removeItem(HISTORY_KEY);
      localStorage.removeItem(LEGACY_HISTORY_KEY_UNVERSIONED);
      localStorage.removeItem(LEGACY_HISTORY_KEY);
    } catch {
      /* private mode / quota */
    }
    setHistoryList([]);
  };

  const runSearch = (raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed) return;
    onSearch?.(trimmed);
    saveToHistory(trimmed);
    setShowDropdown(false);
    setSelectedIndex(-1);
  };

  const trimmedQuery = query.trim();
  const queryLower = query.toLowerCase();
  const historyMatchingQuery = historyList.filter(
    (h) =>
      h.toLowerCase().includes(queryLower) && h !== trimmedQuery,
  );
  const dropdownItems =
    historyMatchingQuery.length > 0
      ? historyMatchingQuery
      : historyList.filter((h) => h !== trimmedQuery);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    onQueryChange?.(value);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const items = dropdownItems;
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        if (items.length === 0) break;
        setSelectedIndex((i) => (i + 1) % items.length);
        setShowDropdown(true);
        break;
      case "ArrowUp":
        e.preventDefault();
        if (items.length === 0) break;
        setSelectedIndex((i) =>
          i <= 0 ? items.length - 1 : i - 1,
        );
        setShowDropdown(true);
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && items[selectedIndex]) {
          const picked = items[selectedIndex];
          setQuery(picked);
          onQueryChange?.(picked);
          runSearch(picked);
        } else {
          runSearch(query);
        }
        break;
      case "Escape":
        setShowDropdown(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
      default:
        break;
    }
  };

  const clearQuery = () => {
    setQuery("");
    onQueryChange?.("");
    setShowDropdown(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  return (
    <div className={cn("relative", className)} ref={rootRef}>
      <div className="relative group">
        <Input
          ref={inputRef}
          type="text"
          role="searchbox"
          aria-label={placeholder}
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowDropdown(true)}
          placeholder={placeholder}
          className={cn(
            "transition-all duration-200 rounded-full",
            query ? "pr-20" : "pr-12",
          )}
        />

        <div className="absolute inset-y-0 right-2 flex items-center gap-1">
          {query ? (
            <>
              <button
                type="button"
                onClick={clearQuery}
                className="p-1.5 hover:bg-muted rounded-full transition-colors"
              >
                <X className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
              </button>
              <div className="h-6 w-px bg-border" />
            </>
          ) : null}
          <button
            type="button"
            onClick={() => runSearch(query)}
            disabled={!query.trim()}
            className={cn(
              "p-1.5 rounded-full transition-colors",
              query.trim()
                ? "hover:bg-muted text-foreground"
                : "text-muted-foreground cursor-not-allowed",
            )}
          >
            <Search className="h-4 w-4" />
          </button>
        </div>
      </div>

      {searchHistory &&
        showDropdown &&
        historyList.length > 0 &&
        dropdownItems.length > 0 && (
          <div className="absolute top-full left-0 right-0 z-50 mt-1 min-w-32 overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md max-h-64 overflow-y-auto">
            <div className="flex items-center justify-between px-2 py-1.5">
              <span className="text-xs font-semibold text-muted-foreground">
                Recent
              </span>
              <button
                type="button"
                onClick={clearHistory}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Clear
              </button>
            </div>
            {dropdownItems.map((historyItem, index) => (
              <button
                key={historyItem}
                type="button"
                onClick={() => {
                  setQuery(historyItem);
                  onQueryChange?.(historyItem);
                  runSearch(historyItem);
                }}
                className={cn(
                  "relative flex w-full cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden transition-colors hover:bg-accent hover:text-accent-foreground",
                  selectedIndex === index &&
                    "bg-accent text-accent-foreground",
                )}
              >
                <Clock className="h-3 w-3 text-muted-foreground shrink-0" />
                <span className="truncate">{historyItem}</span>
              </button>
            ))}
            <div className="-mx-1 my-1 h-px bg-muted" />
            <div className="px-2 py-1.5 bg-muted/50 text-xs text-muted-foreground">
              <span>↑↓ Navigate • Enter Select • Esc Close • Ctrl+/ Focus</span>
            </div>
          </div>
        )}
    </div>
  );
}
