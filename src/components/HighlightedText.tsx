import React from "react";

interface HighlightedTextProps {
  text: string;
  searchQuery: string;
  className?: string;
  highlightClassName?: string;
  caseSensitive?: boolean;
}

// Escape special regex characters
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Split text into parts, marking which parts should be highlighted
function getHighlightedParts(
  text: string,
  searchQuery: string,
  caseSensitive = false
): Array<{ text: string; highlighted: boolean }> {
  if (!searchQuery.trim()) {
    return [{ text, highlighted: false }];
  }

  // Split search query by spaces to handle multi-word searches
  const searchTerms = searchQuery
    .trim()
    .split(/\s+/)
    .filter(term => term.length > 0)
    .map(term => escapeRegExp(term));

  if (searchTerms.length === 0) {
    return [{ text, highlighted: false }];
  }

  // Create regex pattern for all search terms
  const pattern = `(${searchTerms.join("|")})`;
  const flags = caseSensitive ? "g" : "gi";
  const regex = new RegExp(pattern, flags);

  // Split text by matches
  const parts = text.split(regex);

  return parts.map((part, index) => {
    // Every odd index in the split result is a match
    const isMatch = index % 2 === 1;
    return {
      text: part,
      highlighted: isMatch && part.trim().length > 0,
    };
  }).filter(part => part.text.length > 0); // Remove empty parts
}

export function HighlightedText({
  text,
  searchQuery,
  className = "",
  highlightClassName = "bg-yellow-200 dark:bg-yellow-900/50 px-1 py-0.5 rounded-sm font-medium",
  caseSensitive = false,
}: HighlightedTextProps) {
  const parts = getHighlightedParts(text, searchQuery, caseSensitive);

  return (
    <span className={className}>
      {parts.map((part, index) => (
        <React.Fragment key={index}>
          {part.highlighted ? (
            <mark className={highlightClassName}>
              {part.text}
            </mark>
          ) : (
            part.text
          )}
        </React.Fragment>
      ))}
    </span>
  );
}

// Utility function to extract excerpt around search terms
export function getSearchExcerpt(
  text: string,
  searchQuery: string,
  maxLength = 200,
  caseSensitive = false
): string {
  if (!searchQuery.trim() || !text) {
    return text.slice(0, maxLength) + (text.length > maxLength ? "..." : "");
  }

  const searchTerms = searchQuery
    .trim()
    .split(/\s+/)
    .filter(term => term.length > 0);

  if (searchTerms.length === 0) {
    return text.slice(0, maxLength) + (text.length > maxLength ? "..." : "");
  }

  // Find the first occurrence of any search term
  let firstMatchIndex = -1;

  for (const term of searchTerms) {
    const flags = caseSensitive ? "g" : "gi";
    const regex = new RegExp(escapeRegExp(term), flags);
    const match = text.match(regex);

    if (match) {
      const index = text.search(regex);
      if (firstMatchIndex === -1 || index < firstMatchIndex) {
        firstMatchIndex = index;
      }
    }
  }

  // If no match found, return beginning of text
  if (firstMatchIndex === -1) {
    return text.slice(0, maxLength) + (text.length > maxLength ? "..." : "");
  }

  // Calculate excerpt boundaries
  const halfLength = Math.floor(maxLength / 2);
  const start = Math.max(0, firstMatchIndex - halfLength);
  const end = Math.min(text.length, start + maxLength);

  // Adjust start if we have room at the end
  const adjustedStart = Math.max(0, Math.min(start, end - maxLength));

  const excerpt = text.slice(adjustedStart, end);

  // Add ellipsis if needed
  const prefix = adjustedStart > 0 ? "..." : "";
  const suffix = end < text.length ? "..." : "";

  return prefix + excerpt + suffix;
}