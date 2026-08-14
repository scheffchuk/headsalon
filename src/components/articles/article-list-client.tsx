"use client";

import dynamic from "next/dynamic";
import { ArticleListSkeleton } from "./articles-skeleton";

export const ArticleListClient = dynamic(
  () => import("./article-list").then((mod) => mod.ArticleList),
  { ssr: false, loading: () => <ArticleListSkeleton /> },
);
