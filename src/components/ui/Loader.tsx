"use client";

import Image from "next/image";
import { useLanguage } from "@/lib/i18n/provider";
import { cn } from "@/lib/utils";

/** Branded loading state — a gold ring pulsing around the party emblem. */
export function Loader({ className, label }: { className?: string; label?: string }) {
  const { tr } = useLanguage();

  return (
    <div
      className={cn("flex flex-col items-center justify-center gap-5 py-24", className)}
      role="status"
      aria-live="polite"
    >
      <div className="relative h-20 w-20">
        <span className="absolute inset-0 rounded-full border-2 border-gold-500/50 animate-pulse-ring" aria-hidden />
        <span
          className="absolute inset-0 rounded-full border-2 border-transparent border-t-gold-500 border-r-gold-400"
          style={{ animation: "spin 1s linear infinite" }}
          aria-hidden
        />
        <Image
          src="/images/logo.webp"
          alt=""
          width={80}
          height={80}
          className="relative h-full w-full rounded-full object-contain p-3"
          aria-hidden
        />
      </div>
      <span className="text-sm font-medium tracking-wide text-ink-500 dark:text-ink-400">
        {label ?? tr("common.loading")}
      </span>
    </div>
  );
}

/** Shimmering placeholder block for card grids. */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-2xl bg-ink-200/60 dark:bg-ink-700/40",
        className,
      )}
      aria-hidden
    />
  );
}
