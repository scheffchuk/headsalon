import { describe, expect, test } from "vitest";
import { homePagerWindow, homeStaticParamsFromCount } from "./home-pagination";

describe("homeStaticParamsFromCount", () => {
  test("page 1 is / so params start at page 2", () => {
    expect(homeStaticParamsFromCount(30)).toEqual([]);
    expect(homeStaticParamsFromCount(31)).toEqual([{ page: "2" }]);
  });

  test("count maps to page 2 through N", () => {
    expect(homeStaticParamsFromCount(90)).toEqual([
      { page: "2" },
      { page: "3" },
    ]);
  });

  test("empty corpus has no /page/N params", () => {
    expect(homeStaticParamsFromCount(0)).toEqual([]);
  });
});

describe("homePagerWindow", () => {
  test("first page: first, current ± 2, last, ellipsis", () => {
    expect(homePagerWindow(1, 78)).toEqual([
      { type: "page", page: 1 },
      { type: "page", page: 2 },
      { type: "page", page: 3 },
      { type: "ellipsis", key: "ellipsis-3-78" },
      { type: "page", page: 78 },
    ]);
  });

  test("mid page: first, last, current ± 2, ellipsis in both gaps", () => {
    expect(homePagerWindow(40, 78)).toEqual([
      { type: "page", page: 1 },
      { type: "ellipsis", key: "ellipsis-1-38" },
      { type: "page", page: 38 },
      { type: "page", page: 39 },
      { type: "page", page: 40 },
      { type: "page", page: 41 },
      { type: "page", page: 42 },
      { type: "ellipsis", key: "ellipsis-42-78" },
      { type: "page", page: 78 },
    ]);
  });

  test("last page: first, current ± 2, last, ellipsis", () => {
    expect(homePagerWindow(78, 78)).toEqual([
      { type: "page", page: 1 },
      { type: "ellipsis", key: "ellipsis-1-76" },
      { type: "page", page: 76 },
      { type: "page", page: 77 },
      { type: "page", page: 78 },
    ]);
  });

  test("no ellipsis when the window covers every page", () => {
    expect(homePagerWindow(3, 5)).toEqual([
      { type: "page", page: 1 },
      { type: "page", page: 2 },
      { type: "page", page: 3 },
      { type: "page", page: 4 },
      { type: "page", page: 5 },
    ]);
  });

  test("empty total has no items", () => {
    expect(homePagerWindow(1, 0)).toEqual([]);
  });
});
