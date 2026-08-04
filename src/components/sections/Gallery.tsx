"use client";

import { motion } from "framer-motion";
import { Expand, Play } from "lucide-react";
import { useMemo, useState } from "react";
import { Lightbox } from "@/components/ui/Lightbox";
import { MediaImage } from "@/components/ui/MediaImage";
import { Section, SectionHeading } from "@/components/ui/Section";
import { useLanguage } from "@/lib/i18n/provider";
import type { GalleryItem } from "@/lib/types";
import { cn } from "@/lib/utils";

type Filter = "all" | "photo" | "video";

export function Gallery({
  items,
  limit,
  hideHeading,
}: {
  items: GalleryItem[];
  limit?: number;
  /** Set on the dedicated page, where <PageHeader> already states the title. */
  hideHeading?: boolean;
}) {
  const { tr, tx } = useLanguage();
  const [filter, setFilter] = useState<Filter>("all");
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const visible = useMemo(() => {
    const filtered = items.filter((item) => (filter === "all" ? true : item.type === filter));
    return limit ? filtered.slice(0, limit) : filtered;
  }, [items, filter, limit]);

  const tabs: { value: Filter; label: string }[] = [
    { value: "all", label: tr("gallery.all") },
    { value: "photo", label: tr("gallery.photos") },
    { value: "video", label: tr("gallery.videos") },
  ];

  return (
    <Section id="gallery">
      <div className="container-page">
        {!hideHeading && (
          <SectionHeading
            eyebrow={tr("nav.gallery")}
            title={tr("gallery.title")}
            subtitle={tr("gallery.subtitle")}
          />
        )}

        {/* Filters */}
        <div className="mb-10 flex flex-wrap justify-center gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setFilter(tab.value)}
              aria-pressed={filter === tab.value}
              className={cn(
                "rounded-full border px-5 py-2 text-sm font-bold transition-all",
                filter === tab.value
                  ? "border-transparent bg-gold-gradient text-ink-900 shadow-gold"
                  : "border-ink-200/70 text-ink-600 hover:border-gold-500 hover:text-gold-600 dark:border-ink-700 dark:text-ink-300",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Masonry */}
        <div className="columns-2 gap-4 sm:gap-5 lg:columns-3 xl:columns-4">
          {visible.map((item, index) => {
            // Vary heights so the masonry reads as an editorial wall.
            const ratio = item.width && item.height ? item.height / item.width : 0.75;
            const span = ratio > 1.15 ? "aspect-3/4" : ratio < 0.7 ? "aspect-16/9" : "aspect-4/3";

            return (
              <motion.button
                key={item.id}
                type="button"
                onClick={() => setOpenIndex(index)}
                initial={{ opacity: 0, y: 26 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.55, delay: (index % 8) * 0.05 }}
                aria-label={tx(item.title) || "Open image"}
                className={cn(
                  "group relative mb-4 block w-full break-inside-avoid overflow-hidden rounded-3xl",
                  "border border-ink-200/70 dark:border-ink-800 sm:mb-5",
                  "transition-all duration-500 hover:border-gold-500/60 hover:shadow-gold",
                )}
              >
                <div className={cn("relative w-full", span)}>
                  <MediaImage
                    src={item.thumb || item.src}
                    alt={tx(item.title) || "Xisbiga Hilaac"}
                    className="absolute inset-0 h-full w-full"
                    sizes="(max-width: 640px) 50vw, (max-width: 1280px) 33vw, 25vw"
                  />
                </div>

                {/* Hover veil */}
                <span
                  className="absolute inset-0 bg-gradient-to-t from-ink-950/85 via-ink-950/20 to-transparent opacity-0 transition-opacity duration-400 group-hover:opacity-100"
                  aria-hidden
                />

                <span className="absolute inset-0 grid place-items-center opacity-0 transition-all duration-400 group-hover:opacity-100">
                  <span className="grid h-12 w-12 place-items-center rounded-full bg-gold-gradient text-ink-900 shadow-gold">
                    {item.type === "video" ? (
                      <Play className="ml-0.5 h-5 w-5 fill-current" />
                    ) : (
                      <Expand className="h-5 w-5" />
                    )}
                  </span>
                </span>

                {tx(item.title) && (
                  <span className="absolute inset-x-0 bottom-0 translate-y-2 p-4 text-left text-sm font-semibold text-white opacity-0 transition-all duration-400 group-hover:translate-y-0 group-hover:opacity-100">
                    {tx(item.title)}
                  </span>
                )}

                {item.type === "video" && (
                  <span className="absolute left-3 top-3 rounded-full bg-ink-950/75 px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wide text-gold-400 backdrop-blur-sm">
                    Video
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>

        <Lightbox
          items={visible}
          index={openIndex}
          onClose={() => setOpenIndex(null)}
          onIndexChange={setOpenIndex}
        />
      </div>
    </Section>
  );
}
