"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { useLanguage } from "@/lib/i18n/provider";
import type { HeroSlide } from "@/lib/types";
import { cn, mediaUrl } from "@/lib/utils";

const INTERVAL = 6000;

/**
 * Cross-fading background slideshow for the hero.
 *
 * Slides come from the admin dashboard (site settings → hero slides), so the
 * pictures can be changed without touching code. A single slide renders as a
 * plain static background with no controls.
 */
export function HeroSlideshow({
  slides,
  parallaxStyle,
}: {
  slides: HeroSlide[];
  /** Motion style from the parent so the slideshow shares the hero parallax. */
  parallaxStyle?: React.ComponentProps<typeof motion.div>["style"];
}) {
  const { locale } = useLanguage();
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const count = slides.length;

  const go = useCallback(
    (delta: number) => setIndex((current) => (current + delta + count) % count),
    [count],
  );

  // Auto-advance, unless there's nothing to advance to or motion is reduced.
  useEffect(() => {
    if (count <= 1 || paused || reduce) return;
    const timer = setInterval(() => go(1), INTERVAL);
    return () => clearInterval(timer);
  }, [count, paused, reduce, go]);

  // Pause while the tab is hidden so slides don't race ahead in the background.
  useEffect(() => {
    const onVisibility = () => setPaused(document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  if (count === 0) return null;

  const caption = (slide: HeroSlide) =>
    (locale === "en" ? slide.captionEn : slide.captionSo) || slide.captionEn || slide.captionSo || "";

  return (
    <>
      <motion.div style={parallaxStyle} className="absolute inset-0 -z-20 scale-110">
        <AnimatePresence initial={false}>
          <motion.div
            key={index}
            className="absolute inset-0"
            initial={{ opacity: 0, scale: 1.06 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              opacity: { duration: reduce ? 0.01 : 1.2, ease: "easeInOut" },
              scale: { duration: reduce ? 0.01 : INTERVAL / 1000 + 1.2, ease: "linear" },
            }}
          >
            <Image
              src={mediaUrl(slides[index].src) ?? "/images/flag.webp"}
              alt=""
              fill
              // Only the first slide is LCP-critical; the rest load as they come up.
              priority={index === 0}
              sizes="100vw"
              className="object-cover"
              aria-hidden
            />
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {count > 1 && (
        // Bottom-right: clear of the left-aligned hero copy, the stat strip
        // below it, and the centred scroll cue.
        <div
          className="absolute bottom-6 right-5 z-10 flex flex-col items-end gap-2.5 sm:bottom-8 sm:right-8"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {caption(slides[index]) && (
            <AnimatePresence mode="wait">
              <motion.p
                key={`caption-${index}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.4 }}
                className="rounded-full border border-white/15 bg-ink-950/45 px-4 py-1.5 text-xs font-semibold text-ink-100 backdrop-blur-sm"
              >
                {caption(slides[index])}
              </motion.p>
            </AnimatePresence>
          )}

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Previous slide"
              className="grid h-9 w-9 place-items-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur transition hover:border-gold-400 hover:bg-gold-500 hover:text-ink-900"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-2" role="tablist" aria-label="Hero slides">
              {slides.map((slide, i) => (
                <button
                  key={`${slide.src}-${i}`}
                  type="button"
                  role="tab"
                  aria-selected={i === index}
                  aria-label={`Slide ${i + 1}`}
                  onClick={() => setIndex(i)}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-400",
                    i === index ? "w-8 bg-gold-gradient" : "w-1.5 bg-white/45 hover:bg-white/70",
                  )}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Next slide"
              className="grid h-9 w-9 place-items-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur transition hover:border-gold-400 hover:bg-gold-500 hover:text-ink-900"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
