"use client";

import { motion } from "framer-motion";
import { ChevronRight, Home } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/provider";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  breadcrumbs?: { label: string; href?: string }[];
}

/** Dark gold-lit banner used at the top of every inner page. */
export function PageHeader({ title, subtitle, eyebrow, breadcrumbs = [] }: PageHeaderProps) {
  const { tr } = useLanguage();

  return (
    <header className="relative overflow-hidden bg-ink-950 pt-36 pb-16 lg:pt-44 lg:pb-20">
      <div
        className="pointer-events-none absolute -left-24 -top-16 h-96 w-96 rounded-full bg-gold-500/20 blur-[120px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-10 -right-20 h-80 w-80 rounded-full bg-antique-500/18 blur-[110px]"
        aria-hidden
      />
      <div
        className="absolute inset-0 opacity-[0.14]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(245,168,0,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(245,168,0,0.3) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          maskImage: "radial-gradient(ellipse at 30% 50%, black 10%, transparent 72%)",
          WebkitMaskImage: "radial-gradient(ellipse at 30% 50%, black 10%, transparent 72%)",
        }}
        aria-hidden
      />
      <div className="hairline-gold absolute inset-x-0 bottom-0 h-px" aria-hidden />

      <div className="container-page relative">
        <motion.nav
          aria-label="Breadcrumb"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6 flex flex-wrap items-center gap-1.5 text-sm text-ink-400"
        >
          <Link href="/" className="inline-flex items-center gap-1.5 transition-colors hover:text-gold-400">
            <Home className="h-3.5 w-3.5" aria-hidden />
            {tr("nav.home")}
          </Link>
          {breadcrumbs.map((crumb) => (
            <span key={crumb.label} className="inline-flex items-center gap-1.5">
              <ChevronRight className="h-3.5 w-3.5 text-ink-600" aria-hidden />
              {crumb.href ? (
                <Link href={crumb.href} className="transition-colors hover:text-gold-400">
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-gold-400">{crumb.label}</span>
              )}
            </span>
          ))}
        </motion.nav>

        {eyebrow && (
          <motion.span
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.06 }}
            className="mb-4 inline-flex items-center gap-2 rounded-full border border-gold-500/35 bg-gold-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-gold-300"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-gold-500" aria-hidden />
            {eyebrow}
          </motion.span>
        )}

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-3xl text-3xl font-extrabold leading-tight text-white sm:text-4xl lg:text-5xl"
        >
          {title}
        </motion.h1>

        {subtitle && (
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.18 }}
            className="mt-5 max-w-2xl text-base leading-relaxed text-ink-300 sm:text-lg"
          >
            {subtitle}
          </motion.p>
        )}
      </div>
    </header>
  );
}
