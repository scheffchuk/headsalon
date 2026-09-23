import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { MessageResponse } from "./message";

describe("MessageResponse", () => {
  test("renders article links as anchors inside the paragraph", () => {
    render(
      <MessageResponse>
        {"详见[达尔萨斯](/articles/j57abc123def4567890123456789012)"}
      </MessageResponse>,
    );

    const link = screen.getByRole("link", { name: "达尔萨斯" });
    expect(link).toHaveAttribute(
      "href",
      "/articles/j57abc123def4567890123456789012",
    );
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
    expect(link.parentElement?.tagName).toBe("P");
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});
