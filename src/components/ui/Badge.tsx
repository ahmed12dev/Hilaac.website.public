"use client";

import type { ReactNode } from "react";
import { useLanguage } from "@/lib/i18n/provider";
import type { ProjectStatus } from "@/lib/types";
import { cn } from "@/lib/utils";
import type { TranslationKey } from "@/lib/i18n/dictionary";

export function Badge({
  children,
  className,
  tone = "gold",
}: {
  children: ReactNode;
  className?: string;
  tone?: "gold" | "neutral" | "dark";
}) {
  const tones = {
    gold: "bg-gold-500/12 text-gold-700 dark:text-gold-300 border-gold-500/30",
    neutral: "bg-ink-500/10 text-ink-600 dark:text-ink-300 border-ink-500/20",
    dark: "bg-ink-900/85 text-white border-white/15 backdrop-blur-sm",
  } as const;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold tracking-wide",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

const STATUS_STYLES: Record<ProjectStatus, string> = {
  ongoing: "bg-gold-500/15 text-gold-700 dark:text-gold-300 border-gold-500/35",
  completed: "bg-emerald-500/12 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
  planned: "bg-sky-500/12 text-sky-700 dark:text-sky-300 border-sky-500/30",
  paused: "bg-ink-500/12 text-ink-600 dark:text-ink-300 border-ink-500/25",
};

const STATUS_DOT: Record<ProjectStatus, string> = {
  ongoing: "bg-gold-500",
  completed: "bg-emerald-500",
  planned: "bg-sky-500",
  paused: "bg-ink-400",
};

export function StatusBadge({ status, className }: { status: ProjectStatus; className?: string }) {
  const { tr } = useLanguage();
  const key = `projects.status.${status}` as TranslationKey;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold",
        STATUS_STYLES[status] ?? STATUS_STYLES.planned,
        className,
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          STATUS_DOT[status] ?? STATUS_DOT.planned,
          status === "ongoing" && "animate-pulse",
        )}
        aria-hidden
      />
      {tr(key)}
    </span>
  );
}
