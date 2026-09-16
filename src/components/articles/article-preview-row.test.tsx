import type { ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { ArticlePreviewRow } from "./article-preview-row";

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    prefetch,
    ...rest
  }: {
    children: ReactNode;
    href: string;
    prefetch?: boolean;
  }) => (
    <a href={href} data-prefetch={prefetch ? "true" : undefined} {...rest}>
      {children}
    </a>
  ),
  useLinkStatus: () => ({ pending: false }),
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
    expect(title.closest("a")).toHaveAttribute("data-prefetch", "true");
    expect(screen.getByRole("link", { name: "topic" }).getAttribute("href")).toBe(
      "/tag/topic",
    );
  });
});
