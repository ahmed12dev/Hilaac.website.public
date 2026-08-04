"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect } from "react";
import type { GalleryItem } from "@/lib/types";
import { useLanguage } from "@/lib/i18n/provider";
import { mediaUrl } from "@/lib/utils";

interface LightboxProps {
  items: GalleryItem[];
  index: number | null;
  onClose: () => void;
  onIndexChange: (index: number) => void;
}

export function Lightbox({ items, index, onClose, onIndexChange }: LightboxProps) {
  const { tx } = useLanguage();
  const open = index !== null && index >= 0 && index < items.length;
  const item = open ? items[index] : null;

  const go = useCallback(
    (delta: number) => {
      if (index === null || !items.length) return;
      onIndexChange((index + delta + items.length) % items.length);
    },
    [index, items.length, onIndexChange],
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowRight") go(1);
      if (event.key === "ArrowLeft") go(-1);
    };
    document.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose, go]);

  return (
    <AnimatePresence>
      {open && item && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={tx(item.title) || "Gallery"}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-ink-950/92 backdrop-blur-md p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-4 top-4 z-10 rounded-full border border-white/20 bg-white/10 p-3 text-white transition hover:bg-gold-500 hover:text-ink-900"
          >
            <X className="h-5 w-5" />
          </button>

          {items.length > 1 && (
            <>
              <button
                type="button"
                aria-label="Previous"
                onClick={(e) => {
                  e.stopPropagation();
                  go(-1);
                }}
                className="absolute left-3 z-10 rounded-full border border-white/20 bg-white/10 p-3 text-white transition hover:bg-gold-500 hover:text-ink-900 sm:left-6"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                type="button"
                aria-label="Next"
                onClick={(e) => {
                  e.stopPropagation();
                  go(1);
                }}
                className="absolute right-3 z-10 rounded-full border border-white/20 bg-white/10 p-3 text-white transition hover:bg-gold-500 hover:text-ink-900 sm:right-6"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}

          <motion.figure
            key={item.id}
            className="relative max-h-[86vh] w-full max-w-5xl"
            initial={{ scale: 0.94, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.94, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            {item.type === "video" ? (
              <video
                src={mediaUrl(item.src) ?? undefined}
                poster={mediaUrl(item.poster) ?? undefined}
                controls
                autoPlay
                className="max-h-[76vh] w-full rounded-3xl bg-black"
              />
            ) : (
              <div className="relative mx-auto aspect-4/3 w-full overflow-hidden rounded-3xl bg-ink-900 ring-1 ring-gold-500/25">
                <Image
                  src={mediaUrl(item.src) ?? "/images/logo.webp"}
                  alt={tx(item.title) || "Xisbiga Hilaac"}
                  fill
                  sizes="(max-width: 1024px) 100vw, 1024px"
                  className="object-contain"
                  priority
                />
              </div>
            )}

            {tx(item.title) && (
              <figcaption className="mt-4 text-center text-sm text-white/80">
                {tx(item.title)}
                <span className="ml-3 text-white/40">
                  {(index ?? 0) + 1} / {items.length}
                </span>
              </figcaption>
            )}
          </motion.figure>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
