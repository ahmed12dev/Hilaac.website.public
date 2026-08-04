"use client";

import { ArrowLeft, CalendarDays, Clock, Share2, Tag, User } from "lucide-react";
import Link from "next/link";
import { NewsCard } from "@/components/ui/NewsCard";
import { MediaImage } from "@/components/ui/MediaImage";
import { PageHeader } from "@/components/ui/PageHeader";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { useLanguage } from "@/lib/i18n/provider";
import type { NewsArticle } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export function ArticleView({
  article,
  related,
}: {
  article: NewsArticle;
  related: NewsArticle[];
}) {
  const { tr, tx, locale } = useLanguage();
  const body = tx(article.body) || tx(article.excerpt);

  const share = async () => {
    const data = { title: tx(article.title), url: window.location.href };
    if (navigator.share) {
      try {
        await navigator.share(data);
        return;
      } catch {
        /* user dismissed the share sheet */
      }
    }
    await navigator.clipboard.writeText(data.url);
  };

  return (
    <>
      <PageHeader
        eyebrow={article.category}
        title={tx(article.title)}
        breadcrumbs={[
          { label: tr("nav.news"), href: "/news" },
          { label: tx(article.title).slice(0, 42) + (tx(article.title).length > 42 ? "…" : "") },
        ]}
      />

      <Section>
        <div className="container-page">
          <article className="mx-auto max-w-3xl">
            {/* Meta */}
            <Reveal className="mb-8 flex flex-wrap items-center gap-x-6 gap-y-3 border-b border-ink-200/70 pb-7 text-sm text-ink-500 dark:border-ink-800 dark:text-ink-400">
              <span className="inline-flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-gold-500" aria-hidden />
                {formatDate(article.publishedAt, locale)}
              </span>
              {article.author && (
                <span className="inline-flex items-center gap-2">
                  <User className="h-4 w-4 text-gold-500" aria-hidden />
                  {article.author}
                  {article.authorRole ? ` · ${article.authorRole}` : ""}
                </span>
              )}
              {article.readingMinutes ? (
                <span className="inline-flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gold-500" aria-hidden />
                  {article.readingMinutes} {tr("news.readingTime")}
                </span>
              ) : null}

              <button
                type="button"
                onClick={share}
                className="ml-auto inline-flex items-center gap-2 rounded-full border border-ink-200/70 px-4 py-2 font-semibold transition-all hover:border-gold-500 hover:text-gold-600 dark:border-ink-700"
              >
                <Share2 className="h-4 w-4" />
                Share
              </button>
            </Reveal>

            {/* Cover */}
            <Reveal className="mb-10">
              <div className="relative aspect-16/9 overflow-hidden rounded-4xl border border-ink-200/70 dark:border-ink-800">
                <MediaImage
                  src={article.cover}
                  alt={tx(article.title)}
                  className="absolute inset-0 h-full w-full"
                  sizes="(max-width: 768px) 100vw, 768px"
                  priority
                />
              </div>
            </Reveal>

            {/* Body */}
            <Reveal>
              <p className="mb-8 border-l-4 border-gold-500 pl-5 font-display text-lg leading-relaxed text-ink-700 dark:text-ink-200">
                {tx(article.excerpt)}
              </p>

              <div className="space-y-5 text-[1.02rem] leading-[1.85] text-ink-700 dark:text-ink-300">
                {body
                  .split(/\n{2,}/)
                  .filter(Boolean)
                  .map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
              </div>
            </Reveal>

            {/* Tags */}
            {article.tags?.length ? (
              <Reveal className="mt-10 flex flex-wrap items-center gap-2">
                <Tag className="h-4 w-4 text-gold-500" aria-hidden />
                {article.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-gold-500/12 px-3 py-1 text-xs font-bold text-gold-700 dark:text-gold-300"
                  >
                    #{tag}
                  </span>
                ))}
              </Reveal>
            ) : null}

            <Reveal className="mt-12">
              <Link
                href="/news"
                className="inline-flex items-center gap-2 rounded-full border border-ink-200/70 px-5 py-3 text-sm font-bold transition-all hover:-translate-x-0.5 hover:border-gold-500 hover:text-gold-600 dark:border-ink-700"
              >
                <ArrowLeft className="h-4 w-4" />
                {tr("nav.news")}
              </Link>
            </Reveal>
          </article>

          {/* Related */}
          {related.length > 0 && (
            <div className="mx-auto mt-20 max-w-6xl">
              <Reveal className="mb-8">
                <h2 className="font-display text-2xl font-bold">{tr("news.related")}</h2>
                <div className="hairline-gold mt-4 h-px w-24" aria-hidden />
              </Reveal>

              <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">
                {related.map((item) => (
                  <NewsCard key={item.id} article={item} />
                ))}
              </div>
            </div>
          )}
        </div>
      </Section>
    </>
  );
}
