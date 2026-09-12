import { describe, expect, test } from "vitest";
import { homeStaticParamsFromCount } from "./home-pagination";

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
