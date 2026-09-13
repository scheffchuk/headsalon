"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { parseAsString, useQueryState } from "nuqs";
import { RagSearchBar } from "@/components/search/rag-search-bar";
import { useRateLimitCountdown } from "@/hooks/use-rate-limit-countdown";
import { syncAnonymousSessionCookie } from "@/lib/anonymous-session";

export function RagSearchExperience({
  initialRetryAfter,
  needsSessionCookie,
}: {
  initialRetryAfter: number | null;
  needsSessionCookie: boolean;
}) {
  const router = useRouter();
  const [urlQuery, setUrlQuery] = useQueryState(
    "q",
    parseAsString.withDefault("").withOptions({
      history: "push",
      shallow: false,
    }),
  );
  const rateLimit = useRateLimitCountdown(initialRetryAfter);
  const [draftQuery, setDraftQuery] = useState(urlQuery);
  const [isEditing, setIsEditing] = useState(false);
  const [sessionError, setSessionError] = useState<string | null>(null);

  useEffect(() => {
    if (!needsSessionCookie) return;

    void syncAnonymousSessionCookie()
      .then(() => router.refresh())
      .catch(() => {
        setSessionError("Search is temporarily unavailable. Please try again.");
      });
  }, [needsSessionCookie, router]);

  const handleSearch = async (searchQuery: string) => {
    if (rateLimit.isRateLimited) return;

    try {
      await syncAnonymousSessionCookie();
      setSessionError(null);
    } catch {
      setSessionError("Search is temporarily unavailable. Please try again.");
      return;
    }

    const nextQuery = searchQuery.trim();
    setIsEditing(false);
    await setUrlQuery(nextQuery || null);
    if (nextQuery && nextQuery === urlQuery) router.refresh();
  };

  return (
    <>
      <RagSearchBar
        placeholder=""
        searchHistory={true}
        value={isEditing ? draftQuery : urlQuery}
        disabled={rateLimit.isRateLimited}
        onSearch={handleSearch}
        onQueryChange={(next) => {
          setIsEditing(true);
          setDraftQuery(next);
        }}
        onFocus={() => {
          setIsEditing(true);
          setDraftQuery(urlQuery);
        }}
      />
      {rateLimit.message || sessionError ? (
        <p
          aria-live="polite"
          className="mt-3 text-sm text-destructive"
          role="alert"
        >
          {rateLimit.message ?? sessionError}
        </p>
      ) : null}
    </>
  );
}
