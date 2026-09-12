export const HOME_PAGE_SIZE = 30;

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
