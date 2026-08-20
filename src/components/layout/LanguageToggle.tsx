"use client";

import { Globe } from "lucide-react";
import { useLanguage } from "@/lib/i18n/provider";
import type { Locale } from "@/lib/types";
import { cn } from "@/lib/utils";

const OPTIONS: { code: Locale; label: string }[] = [
  { code: "so", label: "SO" },
  { code: "en", label: "EN" },
];

export function LanguageToggle({
  className,
  onDark = false,
}: {
  className?: string;
  /** Subdued styling for the dark utility strip at the top of the header. */
  onDark?: boolean;
}) {
  const { locale, setLocale, tr } = useLanguage();

  return (
    <div
      role="group"
      aria-label={tr("common.language")}
      className={cn(
        "flex items-center gap-0.5 rounded-full backdrop-blur",
        onDark
          ? "border border-white/15 bg-white/8 p-0.5"
          : "border border-ink-200/70 bg-white/70 p-1 dark:border-ink-700 dark:bg-ink-800/70",
        className,
      )}
    >
      <Globe
        className={cn(
          "ml-1.5 mr-0.5 h-[15px] w-[15px]",
          onDark ? "text-white/50" : "text-ink-400",
        )}
        aria-hidden
      />
      {OPTIONS.map((option) => (
        <button
          key={option.code}
          type="button"
          onClick={() => setLocale(option.code)}
          aria-pressed={locale === option.code}
          className={cn(
            "rounded-full font-bold transition-all",
            onDark ? "px-2 py-0.5 text-[0.65rem]" : "px-2.5 py-1 text-xs",
            locale === option.code
              ? "bg-gold-gradient text-ink-900 shadow-[0_6px_16px_-8px_rgba(245,168,0,0.9)]"
              : onDark
                ? "text-white/60 hover:text-gold-300"
                : "text-ink-500 hover:text-gold-600 dark:text-ink-400 dark:hover:text-gold-400",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
