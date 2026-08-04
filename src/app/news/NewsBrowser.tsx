"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Search, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { FeaturedNewsCard, NewsCard } from "@/components/ui/NewsCard";
import { PageHeader } from "@/components/ui/PageHeader";
import { Pagination } from "@/components/ui/Pagination";
import { Section } from "@/components/ui/Section";
import { useLanguage } from "@/lib/i18n/provider";
import type { NewsArticle, NewsCategory } from "@/lib/types";
import { cn, t } from "@/lib/utils";

const PAGE_SIZE = 6;

export function NewsBrowser({
  articles,
  categories,
}: {
  articles: NewsArticle[];
  categories: NewsCategory[];
}) {
  const { tr, tx, locale } = useLanguage();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [page, setPage] = useState(1);

  const featured = useMemo(
    () => articles.find((article) => article.featured) ?? null,
    [articles],
  );

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return articles
      .filter((article) => (category === "all" ? true : article.categorySlug === category))
      .filter((article) => {
        if (!term) return true;
        return [
          t(article.title, locale),
          t(article.excerpt, locale),
          article.category ?? "",
          ...(article.tags ?? []),
        ]
          .join(" ")
          .toLowerCase()
          .includes(term);
      })
      .sort((a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt));
  }, [articles, query, category, locale]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Any filter change resets to the first page.
  useEffect(() => setPage(1), [query, category]);

  const showFeatured = featured && category === "all" && !query.trim();

  return (
    <>
      <PageHeader
        eyebrow={tr("nav.news")}
        title={tr("news.title")}
        subtitle={tr("news.subtitle")}
        breadcrumbs={[{ label: tr("nav.news") }]}
      />

      <Section>
        <div className="container-page">
          {/* Search + categories */}
          <div className="mb-12 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-sm">
              <Search
                className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gold-500"
                aria-hidden
              />
              <label htmlFor="news-search" className="sr-only">
                {tr("news.search")}
              </label>
              <input
                id="news-search"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={tr("news.search")}
                className="w-full rounded-full border border-ink-200/80 bg-white py-3.5 pl-12 pr-11 text-[0.95rem] outline-none transition-all placeholder:text-ink-400 focus:border-gold-500 focus:ring-4 focus:ring-gold-500/15 dark:border-ink-700 dark:bg-ink-900"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label={tr("nav.close")}
                  className="absolute right-3.5 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full text-ink-400 transition hover:bg-ink-100 hover:text-gold-600 dark:hover:bg-ink-800"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <CategoryChip
                active={category === "all"}
                onClick={() => setCategory("all")}
                label={tr("news.all")}
              />
              {categories.map((item) => (
                <CategoryChip
                  key={item.id}
                  active={category === item.slug}
                  onClick={() => setCategory(item.slug)}
                  label={tx(item.name)}
                />
              ))}
            </div>
          </div>

          {/* Featured */}
          {showFeatured && (
            <div className="mb-10">
              <FeaturedNewsCard article={featured} />
            </div>
          )}

          {/* Grid */}
          {pageItems.length === 0 ? (
            <p className="py-20 text-center text-ink-500">{tr("news.empty")}</p>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={`${category}-${query}-${page}`}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35 }}
                className="grid gap-7 md:grid-cols-2 lg:grid-cols-3"
              >
                {pageItems.map((article) => (
                  <NewsCard key={article.id} article={article} />
                ))}
              </motion.div>
            </AnimatePresence>
          )}

          <Pagination
            page={page}
            totalPages={totalPages}
            onChange={(next) => {
              setPage(next);
              window.scrollTo({ top: 380, behavior: "smooth" });
            }}
            className="mt-14"
          />
        </div>
      </Section>
    </>
  );
}

function CategoryChip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-full border px-4 py-2 text-sm font-bold transition-all",
        active
          ? "border-transparent bg-gold-gradient text-ink-900 shadow-gold"
          : "border-ink-200/70 text-ink-600 hover:border-gold-500 hover:text-gold-600 dark:border-ink-700 dark:text-ink-300",
      )}
    >
      {label}
    </button>
  );
}
