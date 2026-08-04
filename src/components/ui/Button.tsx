"use client";

import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "gold" | "outline" | "ghost" | "dark";
type Size = "sm" | "md" | "lg";

const BASE =
  "group relative inline-flex items-center justify-center gap-2 rounded-full font-semibold " +
  "transition-all duration-300 will-change-transform disabled:cursor-not-allowed disabled:opacity-60 " +
  "focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-gold-500";

const VARIANTS: Record<Variant, string> = {
  gold:
    "bg-gold-gradient text-ink-900 shadow-[0_18px_38px_-16px_rgba(245,168,0,0.75)] " +
    "hover:shadow-[0_26px_54px_-18px_rgba(245,168,0,0.95)] hover:-translate-y-0.5 active:translate-y-0",
  outline:
    "border-2 border-gold-500/70 text-gold-700 dark:text-gold-300 backdrop-blur-sm " +
    "hover:bg-gold-500 hover:text-ink-900 hover:border-gold-500 hover:-translate-y-0.5 active:translate-y-0",
  ghost:
    "text-ink-700 dark:text-ink-200 hover:bg-gold-500/10 hover:text-gold-700 dark:hover:text-gold-300",
  dark:
    "bg-ink-900 text-white hover:bg-ink-800 dark:bg-white dark:text-ink-900 dark:hover:bg-ink-100 " +
    "hover:-translate-y-0.5 active:translate-y-0",
};

const SIZES: Record<Size, string> = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3 text-[0.95rem]",
  lg: "px-8 py-4 text-base",
};

interface CommonProps {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
}

export function Button({
  variant = "gold",
  size = "md",
  className,
  children,
  ...props
}: CommonProps & ComponentProps<"button">) {
  return (
    <button className={cn(BASE, VARIANTS[variant], SIZES[size], className)} {...props}>
      {children}
    </button>
  );
}

export function ButtonLink({
  variant = "gold",
  size = "md",
  className,
  children,
  href,
  external,
  ...props
}: CommonProps & { href: string; external?: boolean } & Omit<ComponentProps<typeof Link>, "href">) {
  const classes = cn(BASE, VARIANTS[variant], SIZES[size], className);

  if (external || /^https?:\/\//.test(href)) {
    return (
      <a className={classes} href={href} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  }

  return (
    <Link className={classes} href={href} {...props}>
      {children}
    </Link>
  );
}
