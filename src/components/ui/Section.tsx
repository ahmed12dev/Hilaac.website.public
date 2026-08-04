"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Reveal } from "./Reveal";

interface SectionProps {
  id?: string;
  children: ReactNode;
  className?: string;
  /** Adds a very subtle tinted background for alternating bands. */
  muted?: boolean;
}

export function Section({ id, children, className, muted }: SectionProps) {
  return (
    <section
      id={id}
      className={cn(
        "relative scroll-mt-24 py-20 lg:py-28",
        muted && "bg-ink-50/70 dark:bg-ink-900/40",
        className,
      )}
    >
      {children}
    </section>
  );
}

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "center" | "left";
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
  className,
}: SectionHeadingProps) {
  return (
    <Reveal
      className={cn(
        "mb-14 max-w-2xl",
        align === "center" ? "mx-auto text-center" : "text-left",
        className,
      )}
    >
      {eyebrow && (
        <span
          className={cn(
            "mb-4 inline-flex items-center gap-2 rounded-full border border-gold-500/30 bg-gold-500/10",
            "px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-gold-700 dark:text-gold-300",
          )}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-gold-500" aria-hidden />
          {eyebrow}
        </span>
      )}

      <h2 className="text-3xl font-extrabold leading-tight sm:text-4xl lg:text-[2.75rem]">
        {title}
      </h2>

      <div
        className={cn(
          "hairline-gold mt-5 h-px w-28",
          align === "center" ? "mx-auto" : "",
        )}
        aria-hidden
      />

      {subtitle && (
        <p className="mt-5 text-base leading-relaxed text-ink-600 dark:text-ink-400 sm:text-lg">
          {subtitle}
        </p>
      )}
    </Reveal>
  );
}
