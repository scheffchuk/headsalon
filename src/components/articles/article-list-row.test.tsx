import type { ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { ArticleListRow } from "./article-list-row";

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

describe("ArticleListRow", () => {
  test("renders article title, date, tags; emphasizes active tag badge", () => {
    render(
      <ArticleListRow
        article={{
          _id: "kh77",
          title: "Test title",
          slug: "test-title",
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
    expect(title.closest("a")?.getAttribute("href")).toBe("/articles/test-title");
    expect(screen.getByRole("time")).toHaveAttribute("dateTime", "2025-05-04");
  });
});
