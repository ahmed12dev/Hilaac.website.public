"use client";

import { Globe } from "lucide-react";
import { useLanguage } from "@/lib/i18n/provider";
import type { Locale } from "@/lib/types";
import { cn } from "@/lib/utils";

const OPTIONS: { code: Locale; label: string }[] = [
  { code: "so", label: "SO" },
  { code: "en", label: "EN" },
];

export function LanguageToggle({ className }: { className?: string }) {
  const { locale, setLocale, tr } = useLanguage();

  return (
    <div
      role="group"
      aria-label={tr("common.language")}
      className={cn(
        "flex items-center gap-0.5 rounded-full border border-ink-200/70 dark:border-ink-700",
        "bg-white/70 dark:bg-ink-800/70 p-1 backdrop-blur",
        className,
      )}
    >
      <Globe className="ml-1.5 mr-0.5 h-[15px] w-[15px] text-ink-400" aria-hidden />
      {OPTIONS.map((option) => (
        <button
          key={option.code}
          type="button"
          onClick={() => setLocale(option.code)}
          aria-pressed={locale === option.code}
          className={cn(
            "rounded-full px-2.5 py-1 text-xs font-bold transition-all",
            locale === option.code
              ? "bg-gold-gradient text-ink-900 shadow-[0_6px_16px_-8px_rgba(245,168,0,0.9)]"
              : "text-ink-500 dark:text-ink-400 hover:text-gold-600 dark:hover:text-gold-400",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
