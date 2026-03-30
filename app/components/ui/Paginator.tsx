"use client";
import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { PAGE_SIZE_OPTIONS, PageSize } from '@/hooks/usePagination';

interface PaginatorProps {
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: PageSize;
  onPageChange: (p: number) => void;
  onPageSizeChange: (s: PageSize) => void;
  canPrev: boolean;
  canNext: boolean;
}

const Paginator = ({
  page, totalPages, totalItems, pageSize,
  onPageChange, onPageSizeChange, canPrev, canNext,
}: PaginatorProps) => {
  // Build visible page numbers: always show first, last, current ±1
  const pages: (number | '…')[] = [];
  const range = new Set([1, totalPages, page - 1, page, page + 1].filter((p) => p >= 1 && p <= totalPages));
  let prev = 0;
  for (const p of Array.from(range).sort((a, b) => a - b)) {
    if (prev && p - prev > 1) pages.push('…');
    pages.push(p);
    prev = p;
  }

  return (
    <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-3">

      {/* Left: total + per-page selector */}
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <span>{totalItems} registros</span>
        <span className="hidden sm:inline">·</span>
        <span className="hidden sm:inline">Mostrar</span>
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value) as PageSize)}
          className="px-2 py-1 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-mouse-gray-dark text-gray-700 dark:text-gray-300 focus:outline-none focus:border-neon-green-light text-xs"
        >
          {PAGE_SIZE_OPTIONS.map((s) => (
            <option key={s} value={s}>{s} por página</option>
          ))}
        </select>
      </div>

      {/* Right: page nav */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={!canPrev}
          className="p-1.5 rounded-lg text-gray-400 hover:text-neon-green-light hover:bg-neon-green-light/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          aria-label="Página anterior"
        >
          <ChevronLeft size={15} />
        </button>

        {pages.map((p, i) =>
          p === '…' ? (
            <span key={`ell-before-${pages[i + 1] ?? 'end'}`} className="px-1 text-xs text-gray-400">…</span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`min-w-[28px] h-7 px-1.5 rounded-lg text-xs font-bold transition-all ${
                p === page
                  ? 'bg-neon-green-light text-mouse-gray shadow'
                  : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-mouse-gray-dark'
              }`}
            >
              {p}
            </button>
          )
        )}

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={!canNext}
          className="p-1.5 rounded-lg text-gray-400 hover:text-neon-green-light hover:bg-neon-green-light/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          aria-label="Página siguiente"
        >
          <ChevronRight size={15} />
        </button>
      </div>
    </div>
  );
};

export default Paginator;
