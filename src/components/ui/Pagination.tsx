"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLanguage } from "@/lib/i18n/provider";
import { cn } from "@/lib/utils";

interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
  className?: string;
}

/** Builds a compact page list: 1 … 4 5 6 … 12 */
function pageList(page: number, total: number): (number | "gap")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set<number>([1, total, page, page - 1, page + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);

  const out: (number | "gap")[] = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - (sorted[i - 1] as number) > 1) out.push("gap");
    out.push(p);
  });
  return out;
}

export function Pagination({ page, totalPages, onChange, className }: PaginationProps) {
  const { tr } = useLanguage();
  if (totalPages <= 1) return null;

  const base =
    "inline-flex h-11 min-w-11 items-center justify-center rounded-full px-3 text-sm font-semibold transition";

  return (
    <nav aria-label={tr("common.page")} className={cn("flex flex-wrap items-center justify-center gap-2", className)}>
      <button
        type="button"
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        aria-label={tr("common.prev")}
        className={cn(base, "border border-ink-200 dark:border-ink-700 hover:border-gold-500 hover:text-gold-600 disabled:opacity-40 disabled:hover:border-ink-200")}
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {pageList(page, totalPages).map((entry, i) =>
        entry === "gap" ? (
          <span key={`gap-${i}`} className="px-1 text-ink-400">
            …
          </span>
        ) : (
          <button
            key={entry}
            type="button"
            onClick={() => onChange(entry)}
            aria-current={entry === page ? "page" : undefined}
            className={cn(
              base,
              entry === page
                ? "bg-gold-gradient text-ink-900 shadow-gold"
                : "border border-ink-200 dark:border-ink-700 hover:border-gold-500 hover:text-gold-600",
            )}
          >
            {entry}
          </button>
        ),
      )}

      <button
        type="button"
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
        aria-label={tr("common.next")}
        className={cn(base, "border border-ink-200 dark:border-ink-700 hover:border-gold-500 hover:text-gold-600 disabled:opacity-40 disabled:hover:border-ink-200")}
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );
}
