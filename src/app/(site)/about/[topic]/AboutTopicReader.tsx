"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { BookProse } from "@/components/ui/BookProse";
import { PageHeader } from "@/components/ui/PageHeader";
import { useLanguage } from "@/lib/i18n/provider";
import type { TranslationKey } from "@/lib/i18n/dictionary";
import type { Localized } from "@/lib/types";

/**
 * One About passage — history, vision or mission — set for reading, in the
 * same book style the constitution uses.
 *
 * The dark PageHeader comes first for the same reason every other inner page
 * has one: the navbar is fixed and transparent at the top of the page, so it
 * needs something dark behind it before the paper starts.
 */
export function AboutTopicReader({
  titleKey,
  text,
}: {
  titleKey: TranslationKey;
  text: Localized;
}) {
  const { tr, tx } = useLanguage();

  return (
    <>
      <PageHeader
        eyebrow={tr("nav.about")}
        title={tr(titleKey)}
        breadcrumbs={[{ label: tr("nav.about"), href: "/about" }, { label: tr(titleKey) }]}
      />

      <section className="book-paper py-14 lg:py-20">
        <div className="container-page">
          <article className="mx-auto max-w-3xl">
            <BookProse text={tx(text)} dropCap />

            <div className="no-print mt-14 border-t border-ink-200 pt-6 text-center dark:border-ink-800">
              <Link
                href="/about"
                className="inline-flex items-center gap-2 rounded-xl border border-ink-300/70 px-4 py-2.5 text-sm font-bold text-ink-700 transition hover:border-gold-500/60 dark:border-ink-700 dark:text-ink-200"
              >
                <ArrowLeft className="h-4 w-4" />
                {tr("about.backToAbout")}
              </Link>
            </div>
          </article>
        </div>
      </section>
    </>
  );
}
