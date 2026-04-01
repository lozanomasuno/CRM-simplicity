import { useState, useMemo } from 'react';

export const PAGE_SIZE_OPTIONS = [5, 10, 25, 50] as const;
export type PageSize = (typeof PAGE_SIZE_OPTIONS)[number];

export interface PaginationResult<T> {
  page: number;
  pageSize: PageSize;
  totalPages: number;
  totalItems: number;
  pageItems: T[];
  setPage: (p: number) => void;
  setPageSize: (s: PageSize) => void;
  canPrev: boolean;
  canNext: boolean;
  prev: () => void;
  next: () => void;
}

/**
 * Generic pagination hook.
 * @param items - The already-filtered array to paginate.
 * @param defaultPageSize - Initial page size (default 10).
 */
export function usePagination<T>(
  items: T[],
  defaultPageSize: PageSize = 10
): PaginationResult<T> {
  const [currentPage,     setCurrentPage]     = useState(1);
  const [currentPageSize, setCurrentPageSize] = useState<PageSize>(defaultPageSize);

  const totalPages = Math.max(1, Math.ceil(items.length / currentPageSize));
  const effectivePage = Math.min(Math.max(1, currentPage), totalPages);

  const setPage = (p: number) => setCurrentPage(Math.min(Math.max(1, p), totalPages));

  const setPageSize = (s: PageSize) => {
    setCurrentPageSize(s);
    setCurrentPage(1);
  };

  const pageItems = useMemo(
    () => items.slice((effectivePage - 1) * currentPageSize, effectivePage * currentPageSize),
    [items, effectivePage, currentPageSize]
  );

  return {
    page:     effectivePage,
    pageSize: currentPageSize,
    totalPages,
    totalItems: items.length,
    pageItems,
    setPage,
    setPageSize,
    canPrev: effectivePage > 1,
    canNext: effectivePage < totalPages,
    prev:    () => setPage(effectivePage - 1),
    next:    () => setPage(effectivePage + 1),
  };
}
