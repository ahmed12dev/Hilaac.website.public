"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Quote, Star } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { MediaImage } from "@/components/ui/MediaImage";
import { Section, SectionHeading } from "@/components/ui/Section";
import { useLanguage } from "@/lib/i18n/provider";
import type { Testimonial } from "@/lib/types";
import { cn } from "@/lib/utils";

export function Testimonials({ testimonials }: { testimonials: Testimonial[] }) {
  const { tr, tx } = useLanguage();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const count = testimonials.length;

  const go = useCallback(
    (delta: number) => setIndex((current) => (current + delta + count) % count),
    [count],
  );

  useEffect(() => {
    if (paused || count <= 1) return;
    const timer = setInterval(() => go(1), 7000);
    return () => clearInterval(timer);
  }, [paused, count, go]);

  if (!count) return null;
  const active = testimonials[index];

  return (
    <Section id="testimonials" muted>
      <div className="container-page">
        <SectionHeading
          eyebrow={tr("testimonials.title")}
          title={tr("testimonials.title")}
          subtitle={tr("testimonials.subtitle")}
        />

        <div
          className="relative mx-auto max-w-4xl"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
          onBlur={() => setPaused(false)}
        >
          {/* Glow */}
          <div className="pointer-events-none absolute -inset-6 rounded-5xl bg-gold-500/10 blur-3xl" aria-hidden />

          <div className="relative overflow-hidden rounded-5xl border border-ink-200/70 bg-white p-8 shadow-soft dark:border-ink-800 dark:bg-ink-900 sm:p-12">
            <Quote
              className="absolute right-8 top-8 h-20 w-20 text-gold-500/10 sm:h-28 sm:w-28"
              aria-hidden
            />

            <AnimatePresence mode="wait">
              <motion.blockquote
                key={active.id}
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -22 }}
                transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
                className="relative"
              >
                {active.rating ? (
                  <div className="mb-6 flex gap-1" aria-label={`${active.rating} / 5`}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          "h-4 w-4",
                          i < (active.rating ?? 0)
                            ? "fill-gold-500 text-gold-500"
                            : "text-ink-300 dark:text-ink-600",
                        )}
                        aria-hidden
                      />
                    ))}
                  </div>
                ) : null}

                <p className="mb-8 font-display text-xl leading-relaxed sm:text-2xl">
                  “{tx(active.quote)}”
                </p>

                <footer className="flex items-center gap-4">
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full ring-2 ring-gold-500/50">
                    <MediaImage
                      src={active.avatar}
                      alt={active.name}
                      className="absolute inset-0 h-full w-full"
                      sizes="56px"
                    />
                  </div>
                  <div>
                    <cite className="block font-display font-bold not-italic">{active.name}</cite>
                    <span className="text-sm text-ink-500 dark:text-ink-400">
                      {tx(active.role)}
                      {active.region ? ` · ${active.region}` : ""}
                    </span>
                  </div>
                </footer>
              </motion.blockquote>
            </AnimatePresence>
          </div>

          {/* Controls */}
          {count > 1 && (
            <div className="mt-8 flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => go(-1)}
                aria-label={tr("common.prev")}
                className="grid h-11 w-11 place-items-center rounded-full border border-ink-200/70 bg-white transition-all hover:-translate-x-0.5 hover:border-gold-500 hover:text-gold-600 dark:border-ink-700 dark:bg-ink-900"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              <div className="flex gap-2">
                {testimonials.map((item, i) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setIndex(i)}
                    aria-label={`${i + 1}`}
                    aria-current={i === index}
                    className={cn(
                      "h-2 rounded-full transition-all duration-400",
                      i === index ? "w-8 bg-gold-gradient" : "w-2 bg-ink-300 dark:bg-ink-700",
                    )}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={() => go(1)}
                aria-label={tr("common.next")}
                className="grid h-11 w-11 place-items-center rounded-full border border-ink-200/70 bg-white transition-all hover:translate-x-0.5 hover:border-gold-500 hover:text-gold-600 dark:border-ink-700 dark:bg-ink-900"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </Section>
  );
}
