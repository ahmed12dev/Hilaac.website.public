"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  List,
  Printer,
  ScrollText,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { BookProse } from "@/components/ui/BookProse";
import { useLanguage } from "@/lib/i18n/provider";
import type { Localized } from "@/lib/types";
import { cn } from "@/lib/utils";

export interface ConstitutionChapter {
  id: string;
  chapterNo: string;
  title: Localized;
  body: Localized;
}

export function ConstitutionReader({ chapters }: { chapters: ConstitutionChapter[] }) {
  const { tr, tx } = useLanguage();
  const [index, setIndex] = useState(0);
  const [contentsOpen, setContentsOpen] = useState(false);
  const [continuous, setContinuous] = useState(false);
  const articleRef = useRef<HTMLDivElement>(null);
  const hasJumped = useRef(false);

  const count = chapters.length;

  const go = useCallback(
    (next: number) => {
      if (next < 0 || next >= count) return;
      setIndex(next);
      setContentsOpen(false);
      // Bring the reader back to the top of the page it just turned to.
      articleRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    },
    [count],
  );

  // Deep links like /constitution#chapter-3 open straight to that chapter.
  useEffect(() => {
    if (hasJumped.current || !count) return;
    hasJumped.current = true;
    const hash = window.location.hash.replace("#", "");
    if (!hash) return;
    const found = chapters.findIndex((c) => `chapter-${c.id}` === hash);
    if (found >= 0) setIndex(found);
  }, [chapters, count]);

  // Arrow keys turn pages, the way a reader expects.
  useEffect(() => {
    if (continuous) return;
    function onKey(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;
      if (event.key === "ArrowRight") go(index + 1);
      if (event.key === "ArrowLeft") go(index - 1);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, index, continuous]);

  if (!count) {
    return (
      <div className="container-page py-24 text-center">
        <BookOpen className="mx-auto mb-4 h-12 w-12 text-ink-400 dark:text-ink-600" />
        <p className="text-lg font-semibold">{tr("constitution.empty")}</p>
      </div>
    );
  }

  const active = chapters[index];

  const contentsList = (
    <ol className="space-y-1">
      {chapters.map((chapter, i) => {
        const current = !continuous && i === index;
        return (
          <li key={chapter.id}>
            <button
              type="button"
              onClick={() => {
                if (continuous) {
                  document
                    .getElementById(`chapter-${chapter.id}`)
                    ?.scrollIntoView({ behavior: "smooth", block: "start" });
                  setContentsOpen(false);
                } else {
                  go(i);
                }
              }}
              aria-current={current ? "true" : undefined}
              className={cn(
                "flex w-full items-baseline gap-3 rounded-xl px-3 py-2 text-left text-sm transition-colors",
                current
                  ? "bg-gold-500/15 font-bold text-gold-700 dark:text-gold-300"
                  : "text-ink-600 hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-white/6",
              )}
            >
              <span className="w-8 shrink-0 font-mono text-xs opacity-70">
                {chapter.chapterNo || i + 1}
              </span>
              <span className="flex-1">{tx(chapter.title)}</span>
            </button>
          </li>
        );
      })}
    </ol>
  );

  return (
    <section className="book-paper py-14 lg:py-20">
      <div className="container-page">
        <div className="lg:grid lg:grid-cols-[17rem_1fr] lg:gap-12">
          {/* Contents — a sidebar on desktop */}
          <aside className="no-print hidden lg:block">
            <div className="sticky top-28 max-h-[calc(100vh-9rem)] overflow-y-auto rounded-3xl border border-ink-200/70 bg-white/70 p-4 backdrop-blur dark:border-ink-800 dark:bg-ink-900/60">
              <p className="mb-3 flex items-center gap-2 px-3 text-[0.65rem] font-bold uppercase tracking-[0.16em] text-ink-500">
                <List className="h-3.5 w-3.5" />
                {tr("constitution.contents")}
              </p>
              {contentsList}
            </div>
          </aside>

          <div>
            {/* Reader controls */}
            <div className="no-print mb-7 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setContentsOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl border border-ink-300/70 px-3.5 py-2 text-xs font-bold text-ink-700 transition hover:border-gold-500/60 dark:border-ink-700 dark:text-ink-200 lg:hidden"
              >
                <List className="h-3.5 w-3.5" />
                {tr("constitution.contents")}
              </button>

              <button
                type="button"
                onClick={() => setContinuous((v) => !v)}
                className="inline-flex items-center gap-2 rounded-xl border border-ink-300/70 px-3.5 py-2 text-xs font-bold text-ink-700 transition hover:border-gold-500/60 dark:border-ink-700 dark:text-ink-200"
              >
                {continuous ? (
                  <>
                    <BookOpen className="h-3.5 w-3.5" />
                    {tr("constitution.paged")}
                  </>
                ) : (
                  <>
                    <ScrollText className="h-3.5 w-3.5" />
                    {tr("constitution.readAll")}
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 rounded-xl border border-ink-300/70 px-3.5 py-2 text-xs font-bold text-ink-700 transition hover:border-gold-500/60 dark:border-ink-700 dark:text-ink-200"
              >
                <Printer className="h-3.5 w-3.5" />
                {tr("constitution.print")}
              </button>

              {!continuous && (
                <span className="ml-auto text-xs font-semibold text-ink-500">
                  {tr("constitution.chapter")} {index + 1} {tr("constitution.of")} {count}
                </span>
              )}
            </div>

            {/* Progress through the book */}
            {!continuous && (
              <div className="no-print mb-8 h-1 overflow-hidden rounded-full bg-ink-200 dark:bg-white/10">
                <motion.div
                  className="h-full rounded-full bg-gold-gradient"
                  initial={false}
                  animate={{ width: `${((index + 1) / count) * 100}%` }}
                  transition={{ duration: 0.35 }}
                />
              </div>
            )}

            {/* The page */}
            <div ref={articleRef} className="scroll-mt-28">
              {continuous ? (
                <div className="space-y-16">
                  {chapters.map((chapter, i) => (
                    <article key={chapter.id} id={`chapter-${chapter.id}`} className="scroll-mt-28">
                      <ChapterHeading
                        no={chapter.chapterNo || String(i + 1)}
                        title={tx(chapter.title)}
                        label={tr("constitution.chapter")}
                      />
                      <BookProse text={tx(chapter.body)} dropCap />
                    </article>
                  ))}
                </div>
              ) : (
                <AnimatePresence mode="wait">
                  <motion.article
                    key={active.id}
                    id={`chapter-${active.id}`}
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -24 }}
                    transition={{ duration: 0.25 }}
                  >
                    <ChapterHeading
                      no={active.chapterNo || String(index + 1)}
                      title={tx(active.title)}
                      label={tr("constitution.chapter")}
                    />
                    <BookProse text={tx(active.body)} dropCap />
                  </motion.article>
                </AnimatePresence>
              )}
            </div>

            {/* Turn the page */}
            {!continuous && (
              <nav className="no-print mt-12 flex items-center justify-between gap-4 border-t border-ink-200 pt-6 dark:border-ink-800">
                <button
                  type="button"
                  onClick={() => go(index - 1)}
                  disabled={index === 0}
                  className="inline-flex items-center gap-2 rounded-xl border border-ink-300/70 px-4 py-2.5 text-sm font-bold text-ink-700 transition hover:border-gold-500/60 disabled:pointer-events-none disabled:opacity-40 dark:border-ink-700 dark:text-ink-200"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">{tr("constitution.prev")}</span>
                </button>

                <button
                  type="button"
                  onClick={() => go(index + 1)}
                  disabled={index === count - 1}
                  className="inline-flex items-center gap-2 rounded-xl bg-gold-gradient px-5 py-2.5 text-sm font-bold text-ink-900 shadow-gold transition-transform hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-40"
                >
                  <span className="hidden sm:inline">{tr("constitution.next")}</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </nav>
            )}
          </div>
        </div>
      </div>

      {/* Contents drawer on small screens */}
      <AnimatePresence>
        {contentsOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setContentsOpen(false)}
              className="no-print fixed inset-0 z-50 bg-ink-950/70 backdrop-blur-sm lg:hidden"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 34 }}
              role="dialog"
              aria-modal="true"
              aria-label={tr("constitution.contents")}
              className="no-print fixed inset-x-0 bottom-0 z-50 max-h-[75vh] overflow-y-auto rounded-t-4xl border-t border-ink-200 bg-white p-5 dark:border-ink-800 dark:bg-ink-900 lg:hidden"
            >
              <div className="mb-4 flex items-center justify-between">
                <p className="flex items-center gap-2 text-sm font-bold">
                  <List className="h-4 w-4" />
                  {tr("constitution.contents")}
                </p>
                <button
                  type="button"
                  onClick={() => setContentsOpen(false)}
                  aria-label={tr("nav.close")}
                  className="grid h-9 w-9 place-items-center rounded-lg text-ink-500 transition hover:bg-ink-100 dark:hover:bg-white/8"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              {contentsList}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </section>
  );
}

function ChapterHeading({ no, title, label }: { no: string; title: string; label: string }) {
  return (
    <header className="mb-8 border-b border-ink-200 pb-6 text-center dark:border-ink-800">
      <p className="text-[0.65rem] font-bold uppercase tracking-[0.3em] text-gold-600 dark:text-gold-400">
        {label} {no}
      </p>
      <h2 className="mt-2 font-display text-2xl font-extrabold sm:text-3xl">{title}</h2>
    </header>
  );
}
