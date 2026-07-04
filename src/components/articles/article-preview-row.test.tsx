import type { ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { ArticlePreviewRow } from "./article-preview-row";

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...rest
  }: {
    children: ReactNode;
    href: string;
    prefetch?: boolean;
  }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

describe("ArticlePreviewRow", () => {
  test("renders article id in href", () => {
    render(
      <ArticlePreviewRow
        article={{
          _id: "j57abc123def4567890123456789012",
          title: "Test title",
          slug: "测试标题",
          date: "2025-05-04",
          tags: ["topic", "other"],
        }}
        emphasizedTag="topic"
      />,
    );

    const title = screen.getByRole("heading", { name: "Test title" });
    expect(title.closest("a")?.getAttribute("href")).toBe(
      "/articles/j57abc123def4567890123456789012",
    );
    expect(screen.getByRole("link", { name: "topic" }).getAttribute("href")).toBe(
      "/tag/topic",
    );
  });
});
