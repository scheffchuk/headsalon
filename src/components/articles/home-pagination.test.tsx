import type { ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { HomePagination } from "./home-pagination";

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
}));

describe("HomePagination", () => {
  test("hides when there is only one page", () => {
    const { container } = render(<HomePagination page={1} totalPages={1} />);
    expect(container).toBeEmptyDOMElement();
  });

  test("page 1 always shows Previous disabled and Next to page 2", () => {
    render(<HomePagination page={1} totalPages={78} />);

    expect(screen.getByRole("link", { name: /previous/i })).toHaveAttribute(
      "aria-disabled",
      "true",
    );
    expect(screen.getByRole("link", { name: /next/i })).toHaveAttribute(
      "href",
      "/page/2",
    );
    expect(screen.getByRole("link", { name: /next/i })).toHaveAttribute(
      "data-prefetch",
      "true",
    );
    expect(screen.getByRole("link", { name: /next/i })).not.toHaveAttribute(
      "aria-disabled",
    );
    expect(screen.getByText("Page 1 of 78")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "1" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "78" })).toHaveAttribute(
      "href",
      "/page/78",
    );
    expect(screen.queryByRole("link", { name: "40" })).toBeNull();
    expect(screen.getAllByRole("link")).toHaveLength(6);
  });

  test("mid page windows first, last, current ± 2", () => {
    render(<HomePagination page={40} totalPages={78} />);

    expect(screen.getByRole("link", { name: /previous/i })).toHaveAttribute(
      "href",
      "/page/39",
    );
    expect(screen.getByRole("link", { name: /next/i })).toHaveAttribute(
      "href",
      "/page/41",
    );
    expect(screen.getByText("Page 40 of 78")).toBeInTheDocument();
    expect(
      screen.getAllByRole("link").map((link) => link.getAttribute("href")),
    ).toEqual([
      "/page/39",
      "/",
      "/page/38",
      "/page/39",
      "/page/40",
      "/page/41",
      "/page/42",
      "/page/78",
      "/page/41",
    ]);
    expect(screen.getAllByText("More pages")).toHaveLength(2);
  });

  test("last page disables Next", () => {
    render(<HomePagination page={78} totalPages={78} />);

    expect(screen.getByRole("link", { name: /next/i })).toHaveAttribute(
      "aria-disabled",
      "true",
    );
    expect(screen.getByRole("link", { name: /previous/i })).toHaveAttribute(
      "href",
      "/page/77",
    );
    expect(screen.getByText("Page 78 of 78")).toBeInTheDocument();
  });
});
