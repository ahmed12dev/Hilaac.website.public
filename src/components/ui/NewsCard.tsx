"use client";

import { ArrowUpRight, CalendarDays, Clock } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { MediaImage } from "@/components/ui/MediaImage";
import { useLanguage } from "@/lib/i18n/provider";
import type { NewsArticle } from "@/lib/types";
import { cn, formatDate } from "@/lib/utils";

export function NewsCard({ article, className }: { article: NewsArticle; className?: string }) {
  const { tr, tx, locale } = useLanguage();

  return (
    <article
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-4xl border border-ink-200/70 bg-white",
        "transition-all duration-500 hover:-translate-y-2 hover:border-gold-500/50 hover:shadow-gold-lg",
        "dark:border-ink-800 dark:bg-ink-900",
        className,
      )}
    >
      <div className="relative aspect-16/10 overflow-hidden">
        <MediaImage
          src={article.cover}
          alt={tx(article.title)}
          className="absolute inset-0 h-full w-full"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        {article.category && (
          <Badge tone="dark" className="absolute left-4 top-4">
            {article.category}
          </Badge>
        )}
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-500 dark:text-ink-400">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5 text-gold-500" aria-hidden />
            {formatDate(article.publishedAt, locale)}
          </span>
          {article.readingMinutes ? (
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-gold-500" aria-hidden />
              {article.readingMinutes} {tr("news.readingTime")}
            </span>
          ) : null}
        </div>

        <h3 className="line-clamp-2x mb-3 font-display text-lg font-bold leading-snug transition-colors group-hover:text-gold-600 dark:group-hover:text-gold-400">
          {tx(article.title)}
        </h3>

        <p className="line-clamp-3x mb-6 text-sm leading-relaxed text-ink-600 dark:text-ink-400">
          {tx(article.excerpt)}
        </p>

        <Link
          href={`/news/${article.slug}`}
          className="mt-auto inline-flex w-fit items-center gap-1.5 text-sm font-bold text-gold-600 transition-all hover:gap-2.5 dark:text-gold-400"
        >
          {/* Stretched link keeps the whole card clickable but the label accessible */}
          <span className="absolute inset-0" aria-hidden />
          {tr("cta.readMore")}
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}

export function FeaturedNewsCard({ article }: { article: NewsArticle }) {
  const { tr, tx, locale } = useLanguage();

  return (
    <article className="group relative overflow-hidden rounded-5xl border border-ink-200/70 bg-white shadow-soft transition-all duration-500 hover:border-gold-500/50 hover:shadow-gold-lg dark:border-ink-800 dark:bg-ink-900">
      <div className="grid lg:grid-cols-2">
        <div className="relative aspect-16/11 overflow-hidden lg:aspect-auto lg:min-h-[26rem]">
          <MediaImage
            src={article.cover}
            alt={tx(article.title)}
            className="absolute inset-0 h-full w-full"
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority
          />
          <Badge tone="dark" className="absolute left-5 top-5">
            {tr("news.featured")}
          </Badge>
        </div>

        <div className="flex flex-col justify-center p-8 lg:p-12">
          {article.category && (
            <Badge className="mb-5 w-fit">{article.category}</Badge>
          )}

          <h3 className="mb-4 font-display text-2xl font-extrabold leading-tight transition-colors group-hover:text-gold-600 dark:group-hover:text-gold-400 sm:text-3xl">
            {tx(article.title)}
          </h3>

          <p className="line-clamp-3x mb-7 leading-relaxed text-ink-600 dark:text-ink-400">
            {tx(article.excerpt)}
          </p>

          <div className="mb-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-ink-500 dark:text-ink-400">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="h-4 w-4 text-gold-500" aria-hidden />
              {formatDate(article.publishedAt, locale)}
            </span>
            {article.author && <span>· {article.author}</span>}
          </div>

          <Link
            href={`/news/${article.slug}`}
            className="inline-flex w-fit items-center gap-2 rounded-full bg-gold-gradient px-6 py-3 text-sm font-bold text-ink-900 shadow-gold transition-transform hover:-translate-y-0.5"
          >
            <span className="absolute inset-0" aria-hidden />
            {tr("cta.readMore")}
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}
