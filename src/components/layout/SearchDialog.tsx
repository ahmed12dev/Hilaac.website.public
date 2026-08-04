"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CalendarDays, FileText, Loader2, Newspaper, Search, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { SearchHit } from "@/app/api/search/route";
import { useLanguage } from "@/lib/i18n/provider";

const ICONS = {
  news: Newspaper,
  project: FileText,
  event: CalendarDays,
} as const;

export function SearchDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { tr, locale } = useLanguage();
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<SearchHit[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => inputRef.current?.focus(), 60);
      return () => clearTimeout(timer);
    }
    setQuery("");
    setHits([]);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  // Debounced search.
  useEffect(() => {
    const term = query.trim();
    if (term.length < 2) {
      setHits([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(term)}&locale=${locale}`,
          { signal: controller.signal },
        );
        const data = (await res.json()) as { hits: SearchHit[] };
        setHits(data.hits ?? []);
      } catch {
        setHits([]);
      } finally {
        setLoading(false);
      }
    }, 280);

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [query, locale]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[90] flex items-start justify-center bg-ink-950/70 px-4 pt-[12vh] backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label={tr("common.search")}
        >
          <motion.div
            className="w-full max-w-2xl overflow-hidden rounded-3xl border border-white/15 bg-white shadow-2xl dark:bg-ink-900"
            initial={{ y: -22, scale: 0.97, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: -22, scale: 0.97, opacity: 0 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 border-b border-ink-200/70 px-5 py-4 dark:border-ink-800">
              <Search className="h-5 w-5 shrink-0 text-gold-500" aria-hidden />
              <input
                ref={inputRef}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={tr("news.search")}
                aria-label={tr("common.search")}
                className="w-full bg-transparent text-base outline-none placeholder:text-ink-400"
              />
              {loading && <Loader2 className="h-4 w-4 animate-spin text-gold-500" aria-hidden />}
              <button
                type="button"
                onClick={onClose}
                aria-label={tr("nav.close")}
                className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-ink-400 transition hover:bg-ink-100 hover:text-gold-600 dark:hover:bg-ink-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-[52vh] overflow-y-auto p-2">
              {hits.map((hit) => {
                const Icon = ICONS[hit.type];
                return (
                  <Link
                    key={`${hit.type}-${hit.id}`}
                    href={hit.href}
                    onClick={onClose}
                    className="flex gap-3 rounded-2xl px-4 py-3 transition hover:bg-gold-500/10"
                  >
                    <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gold-500/12 text-gold-600 dark:text-gold-400">
                      <Icon className="h-[18px] w-[18px]" />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate font-semibold">{hit.title}</span>
                      <span className="line-clamp-2x block text-sm text-ink-500 dark:text-ink-400">
                        {hit.excerpt}
                      </span>
                    </span>
                  </Link>
                );
              })}

              {!loading && query.trim().length >= 2 && hits.length === 0 && (
                <p className="px-4 py-10 text-center text-sm text-ink-500">{tr("news.empty")}</p>
              )}

              {query.trim().length < 2 && (
                <p className="px-4 py-10 text-center text-sm text-ink-400">
                  {tr("news.search")} · <kbd className="rounded border border-ink-300 px-1.5 py-0.5 text-[0.7rem] dark:border-ink-700">Ctrl</kbd>
                  {" + "}
                  <kbd className="rounded border border-ink-300 px-1.5 py-0.5 text-[0.7rem] dark:border-ink-700">K</kbd>
                </p>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
