"use client";

import dynamic from "next/dynamic";
import { ConvexClientProvider } from "@/providers/convex-client-provider";

const RagSearchExperience = dynamic(
  () =>
    import("./rag-search-experience").then((mod) => mod.RagSearchExperience),
  { ssr: false },
);

export function RagSearchExperienceClient() {
  return (
    <ConvexClientProvider>
      <RagSearchExperience />
    </ConvexClientProvider>
  );
}
