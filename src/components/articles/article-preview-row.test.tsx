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
  test("renders shortId + decorative slug in article href", () => {
    render(
      <ArticlePreviewRow
        article={{
          _id: "kh77",
          title: "Test title",
          slug: "测试标题",
          shortId: "a3f9k2X1",
          date: "2025-05-04",
          tags: ["topic", "other"],
        }}
        emphasizedTag="topic"
      />,
    );

    const title = screen.getByRole("heading", { name: "Test title" });
    expect(title).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "topic" }).getAttribute("href")).toBe(
      "/tag/topic",
    );
    expect(title.closest("a")?.getAttribute("href")).toBe("/articles/a3f9k2X1");
    expect(screen.getByRole("time")).toHaveAttribute("dateTime", "2025-05-04");
  });
});
