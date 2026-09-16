import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { useLinkStatus } from "next/link";
import { LinkPending } from "./link-pending";

vi.mock("next/link", () => ({
  useLinkStatus: vi.fn(() => ({ pending: false })),
}));

describe("LinkPending", () => {
  beforeEach(() => {
    vi.mocked(useLinkStatus).mockReturnValue({ pending: false });
  });

  test("leaves children readable while idle", () => {
    render(<LinkPending>标题</LinkPending>);
    const label = screen.getByText("标题");
    expect(label).not.toHaveAttribute("aria-busy");
    expect(label).toHaveClass("opacity-100");
  });

  test("dims after click while navigation is pending", () => {
    vi.mocked(useLinkStatus).mockReturnValue({ pending: true });
    render(<LinkPending>标题</LinkPending>);
    const label = screen.getByText("标题");
    expect(label).toHaveAttribute("aria-busy", "true");
    expect(label).toHaveClass("opacity-50", "delay-100");
  });
});
