"use client";

import { useState } from "react";
import { parseAsString, useQueryState } from "nuqs";
import { RagSearchBar } from "@/components/search/rag-search-bar";

export function RagSearchExperience() {
  const [urlQuery, setUrlQuery] = useQueryState(
    "q",
    parseAsString.withDefault("").withOptions({
      history: "push",
      shallow: false,
    }),
  );
  const [draftQuery, setDraftQuery] = useState(urlQuery);
  const [isEditing, setIsEditing] = useState(false);

  return (
    <RagSearchBar
      placeholder=""
      searchHistory={true}
      value={isEditing ? draftQuery : urlQuery}
      onSearch={(searchQuery) => {
        setIsEditing(false);
        void setUrlQuery(searchQuery.trim() || null);
      }}
      onQueryChange={(next) => {
        setIsEditing(true);
        setDraftQuery(next);
      }}
      onFocus={() => {
        setIsEditing(true);
        setDraftQuery(urlQuery);
      }}
    />
  );
}
