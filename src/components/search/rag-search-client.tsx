"use client";

import dynamic from "next/dynamic";

export const RagSearchExperienceClient = dynamic(
  () =>
    import("./rag-search-experience").then((mod) => mod.RagSearchExperience),
  { ssr: false },
);
