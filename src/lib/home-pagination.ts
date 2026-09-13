import { HOME_PAGE_SIZE } from "@convex/lib/homePageSize";

type HomePagerItem =
  | { type: "page"; page: number }
  | { type: "ellipsis"; key: string };

/** First, last, current ± 2; ellipsis in the gaps. */
export function homePagerWindow(
  page: number,
  totalPages: number,
): HomePagerItem[] {
  if (totalPages <= 0) {
    return [];
  }

  const numbers = new Set<number>([1, totalPages]);
  for (let n = page - 2; n <= page + 2; n++) {
    if (n >= 1 && n <= totalPages) {
      numbers.add(n);
    }
  }

  const sorted = [...numbers].sort((a, b) => a - b);
  const items: HomePagerItem[] = [];
  for (const [index, n] of sorted.entries()) {
    const prev = sorted[index - 1];
    if (prev !== undefined && n - prev > 1) {
      items.push({ type: "ellipsis", key: `ellipsis-${prev}-${n}` });
    }
    items.push({ type: "page", page: n });
  }
  return items;
}

export function parseHomePageParam(page: string): number | null {
  if (!/^[1-9]\d*$/.test(page)) {
    return null;
  }
  return Number(page);
}

/** Page 1 is `/`, so generateStaticParams only emits `/page/2`…`/page/N`. */
export function homeStaticParamsFromCount(
  totalCount: number,
): { page: string }[] {
  const totalPages = Math.ceil(totalCount / HOME_PAGE_SIZE);
  const params: { page: string }[] = [];
  for (let page = 2; page <= totalPages; page++) {
    params.push({ page: String(page) });
  }
  return params;
}
