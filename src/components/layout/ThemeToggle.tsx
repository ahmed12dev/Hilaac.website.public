"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { useLanguage } from "@/lib/i18n/provider";
import { useTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";

export function ThemeToggle({
  className,
  onDark = false,
}: {
  className?: string;
  /** Subdued styling for the dark utility strip at the top of the header. */
  onDark?: boolean;
}) {
  const { theme, toggleTheme, mounted } = useTheme();
  const { tr } = useLanguage();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`${tr("common.theme")}: ${isDark ? "dark" : "light"}`}
      title={tr("common.theme")}
      className={cn(
        "relative grid place-items-center rounded-full backdrop-blur transition-all",
        onDark
          ? "h-8 w-8 border border-white/15 bg-white/8 text-white/70 hover:border-gold-400/60 hover:text-gold-300"
          : cn(
              "h-10 w-10 border border-ink-200/70 bg-white/70 dark:border-ink-700 dark:bg-ink-800/70",
              "hover:border-gold-500 hover:text-gold-600 dark:hover:text-gold-400 hover:shadow-gold",
            ),
        className,
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={mounted ? theme : "placeholder"}
          initial={{ rotate: -70, opacity: 0, scale: 0.6 }}
          animate={{ rotate: 0, opacity: 1, scale: 1 }}
          exit={{ rotate: 70, opacity: 0, scale: 0.6 }}
          transition={{ duration: 0.24 }}
          className="grid place-items-center"
        >
          {isDark ? (
            <Moon className={onDark ? "h-4 w-4" : "h-[18px] w-[18px]"} />
          ) : (
            <Sun className={onDark ? "h-4 w-4" : "h-[18px] w-[18px]"} />
          )}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}
