'use client';

import React from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ShipPaginationProps {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Compute the page numbers to display with ellipsis gaps.
 *
 * Always shows first, last, and a window around the current page (current-1,
 * current, current+1). Returns numbers for page buttons and `null` for
 * ellipsis placeholders.
 */
function getPageNumbers(current: number, total: number): (number | null)[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: (number | null)[] = [];
  const windowStart = Math.max(2, current - 1);
  const windowEnd = Math.min(total - 1, current + 1);

  // First page
  pages.push(1);

  // Ellipsis before window
  if (windowStart > 2) {
    pages.push(null);
  }

  // Window pages
  for (let i = windowStart; i <= windowEnd; i++) {
    pages.push(i);
  }

  // Ellipsis after window
  if (windowEnd < total - 1) {
    pages.push(null);
  }

  // Last page
  pages.push(total);

  return pages;
}

// ---------------------------------------------------------------------------
// Shared styles
// ---------------------------------------------------------------------------

const pageButtonBase =
  'min-w-[32px] h-8 flex items-center justify-center text-sm rounded-sm transition-all font-quantify';

const pageButtonActive =
  'bg-[rgba(var(--mg-primary),0.2)] border border-[rgba(var(--mg-primary),0.5)] text-[rgba(var(--mg-primary),1)]';

const pageButtonGhost =
  'text-[rgba(var(--mg-text),0.6)] hover:text-[rgba(var(--mg-primary),0.9)] hover:bg-[rgba(var(--mg-primary),0.1)]';

const navButtonBase =
  'w-8 h-8 flex items-center justify-center rounded-sm transition-all text-[rgba(var(--mg-text),0.6)] hover:text-[rgba(var(--mg-primary),0.9)] hover:bg-[rgba(var(--mg-primary),0.1)] disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-[rgba(var(--mg-text),0.6)]';

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Traditional pagination with result count and page number buttons.
 *
 * Displays "Showing X-Y of Z ships" on the left and page navigation
 * buttons on the right. Handles ellipsis for large page ranges.
 * Hides page buttons when there is only one page.
 */
export default function ShipPagination({
  page,
  totalPages,
  total,
  pageSize,
  onPageChange,
}: ShipPaginationProps) {
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  const pageNumbers = getPageNumbers(page, totalPages);

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
      {/* Result count */}
      <div className="text-[rgba(var(--mg-text),0.6)] text-sm">
        {total === 0
          ? 'No ships found'
          : `Showing ${start}-${end} of ${total} ships`}
      </div>

      {/* Page buttons (hidden when only 1 page) */}
      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          {/* Previous */}
          <button
            type="button"
            disabled={page === 1}
            onClick={() => onPageChange(page - 1)}
            className={navButtonBase}
            aria-label="Previous page"
          >
            <ChevronLeftIcon className="w-4 h-4" />
          </button>

          {/* Page numbers */}
          {pageNumbers.map((p, idx) =>
            p === null ? (
              <span
                key={`ellipsis-${idx}`}
                className="min-w-[32px] h-8 flex items-center justify-center text-[rgba(var(--mg-text),0.4)] text-sm"
              >
                ...
              </span>
            ) : (
              <button
                key={p}
                type="button"
                onClick={() => onPageChange(p)}
                className={`${pageButtonBase} ${
                  p === page ? pageButtonActive : pageButtonGhost
                }`}
                aria-current={p === page ? 'page' : undefined}
                aria-label={`Page ${p}`}
              >
                {p}
              </button>
            )
          )}

          {/* Next */}
          <button
            type="button"
            disabled={page === totalPages}
            onClick={() => onPageChange(page + 1)}
            className={navButtonBase}
            aria-label="Next page"
          >
            <ChevronRightIcon className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
