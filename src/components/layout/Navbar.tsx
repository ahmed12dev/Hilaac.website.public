"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Facebook,
  Instagram,
  Linkedin,
  Menu,
  Search,
  X,
  Youtube,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ButtonLink } from "@/components/ui/Button";
import { useLanguage } from "@/lib/i18n/provider";
import type { TranslationKey } from "@/lib/i18n/dictionary";
import { cn, joinUrl } from "@/lib/utils";
import { LanguageToggle } from "./LanguageToggle";
import { SearchDialog } from "./SearchDialog";
import { ThemeToggle } from "./ThemeToggle";
import type { SiteSettings } from "@/lib/types";

const SOCIAL_ICONS = {
  facebook: Facebook,
  instagram: Instagram,
  youtube: Youtube,
  linkedin: Linkedin,
} as const;

const LINKS: { href: string; key: TranslationKey }[] = [
  { href: "/", key: "nav.home" },
  { href: "/about", key: "nav.about" },
  { href: "/constitution", key: "nav.constitution" },
  { href: "/leadership", key: "nav.leadership" },
  { href: "/news", key: "nav.news" },
  { href: "/projects", key: "nav.projects" },
  { href: "/events", key: "nav.events" },
  { href: "/gallery", key: "nav.gallery" },
  { href: "/contact", key: "nav.contact" },
];

export function Navbar({ settings }: { settings?: SiteSettings }) {
  const { tr, tx } = useLanguage();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the mobile drawer whenever the route changes.
  useEffect(() => setMenuOpen(false), [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  // Ctrl/Cmd+K opens search.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const socialEntries = Object.entries(settings?.socials ?? {}).filter(
    ([key, url]) => Boolean(url) && key in SOCIAL_ICONS,
  ) as [keyof typeof SOCIAL_ICONS, string][];

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[80] focus:rounded-full focus:bg-gold-500 focus:px-5 focus:py-3 focus:font-semibold focus:text-ink-900"
      >
        {tr("common.search") === "Search" ? "Skip to content" : "U bood nuxurka"}
      </a>

      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-400",
          scrolled
            ? "border-b border-ink-200/60 bg-white/85 shadow-[0_10px_40px_-24px_rgba(15,23,42,0.35)] backdrop-blur-xl dark:border-ink-800/70 dark:bg-ink-950/85"
            : "border-b border-transparent bg-transparent",
        )}
      >
        {/* Utility strip. Carries the details that were crowding the main row —
            contact, socials, language and theme — and folds away on scroll so
            the header condenses to a single compact bar. Always sits over a
            dark hero or page header, so its colours are fixed light-on-dark. */}
        <div
          className={cn(
            "hidden overflow-hidden transition-all duration-400 lg:block",
            scrolled
              ? "max-h-0 border-b-0 opacity-0"
              : "max-h-14 border-b border-white/10 opacity-100",
          )}
          aria-hidden={scrolled}
        >
          <div className="container-page flex h-11 items-center justify-between gap-6">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-white/45">
              {tx(settings?.tagline ?? "")}
            </p>

            <div className="flex items-center gap-3">
              {socialEntries.length > 0 && (
                <>
                  <div className="flex items-center gap-1">
                    {socialEntries.map(([key, url]) => {
                      const Icon = SOCIAL_ICONS[key];
                      return (
                        <a
                          key={key}
                          href={url}
                          target="_blank"
                          rel="noreferrer noopener"
                          aria-label={key}
                          className="grid h-7 w-7 place-items-center rounded-full text-white/55 transition-colors hover:bg-white/10 hover:text-gold-300"
                        >
                          <Icon className="h-[15px] w-[15px]" />
                        </a>
                      );
                    })}
                  </div>
                  <span className="h-4 w-px bg-white/15" aria-hidden />
                </>
              )}
              <LanguageToggle onDark />
              <ThemeToggle onDark />
            </div>
          </div>
        </div>

        {/* Main bar */}
        <div
          className={cn(
            "container-page flex items-center justify-between gap-6 transition-all duration-400",
            scrolled ? "py-2" : "py-3.5",
          )}
        >
          {/* Brand */}
          <Link href="/" className="group flex shrink-0 items-center gap-3" aria-label="Xisbiga Hilaac">
            <span className="relative grid h-11 w-11 place-items-center overflow-hidden rounded-full ring-2 ring-gold-500/60 transition-transform duration-300 group-hover:scale-105 sm:h-12 sm:w-12">
              <Image
                src="/images/logo-circle.webp"
                alt="Xisbiga Hilaac"
                width={48}
                height={48}
                priority
                className="h-full w-full object-cover"
              />
            </span>
            <span className="hidden leading-tight sm:block">
              <span className="block font-display text-[1.05rem] font-extrabold tracking-tight">
                Xisbiga <span className="text-gradient-gold">Hilaac</span>
              </span>
              <span className="block text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-ink-400">
                Political Party
              </span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 xl:flex" aria-label="Primary">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative rounded-full px-3 py-2 text-[0.875rem] font-semibold transition-colors",
                  isActive(link.href)
                    ? "text-gold-600 dark:text-gold-400"
                    : "text-ink-600 hover:text-gold-600 dark:text-ink-300 dark:hover:text-gold-400",
                )}
              >
                {tr(link.key)}
                {isActive(link.href) && (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-gold-gradient"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label={tr("common.search")}
              className="grid h-10 w-10 place-items-center rounded-full border border-ink-200/70 bg-white/70 backdrop-blur transition-all hover:border-gold-500 hover:text-gold-600 dark:border-ink-700 dark:bg-ink-800/70 dark:hover:text-gold-400"
            >
              <Search className="h-[18px] w-[18px]" />
            </button>

            <ThemeToggle className="lg:hidden" />

            <ButtonLink href={joinUrl()} size="sm" className="hidden lg:inline-flex">
              {tr("cta.join")}
            </ButtonLink>

            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label={tr("nav.menu")}
              aria-expanded={menuOpen}
              className="grid h-10 w-10 place-items-center rounded-full border border-ink-200/70 bg-white/70 backdrop-blur transition-all hover:border-gold-500 hover:text-gold-600 dark:border-ink-700 dark:bg-ink-800/70 xl:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-[70] bg-ink-950/60 backdrop-blur-sm xl:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
            />
            <motion.aside
              className="fixed inset-y-0 right-0 z-[75] flex w-[86%] max-w-sm flex-col bg-white shadow-2xl dark:bg-ink-950 xl:hidden"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 34 }}
              aria-label="Mobile navigation"
            >
              <div className="flex items-center justify-between border-b border-ink-200/70 p-5 dark:border-ink-800">
                <span className="flex items-center gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-full bg-white ring-2 ring-gold-500/60">
                    <Image src="/images/logo-circle.webp" alt="" width={44} height={44} className="h-8 w-8 object-contain" />
                  </span>
                  <span className="font-display font-extrabold">
                    Xisbiga <span className="text-gradient-gold">Hilaac</span>
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => setMenuOpen(false)}
                  aria-label={tr("nav.close")}
                  className="grid h-10 w-10 place-items-center rounded-full border border-ink-200 dark:border-ink-700 hover:border-gold-500 hover:text-gold-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <nav className="flex-1 overflow-y-auto p-4" aria-label="Mobile primary">
                {LINKS.map((link, index) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: 26 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 + index * 0.045 }}
                  >
                    <Link
                      href={link.href}
                      className={cn(
                        "flex items-center justify-between rounded-2xl px-4 py-3.5 text-base font-semibold transition-colors",
                        isActive(link.href)
                          ? "bg-gold-500/12 text-gold-700 dark:text-gold-300"
                          : "text-ink-700 hover:bg-gold-500/8 hover:text-gold-700 dark:text-ink-200 dark:hover:text-gold-300",
                      )}
                    >
                      {tr(link.key)}
                      {isActive(link.href) && <span className="h-2 w-2 rounded-full bg-gold-500" aria-hidden />}
                    </Link>
                  </motion.div>
                ))}
              </nav>

              <div className="space-y-4 border-t border-ink-200/70 p-5 dark:border-ink-800">
                <div className="flex items-center gap-3">
                  <LanguageToggle className="w-fit" />
                  <ThemeToggle />
                </div>
                <ButtonLink href={joinUrl()} size="md" className="w-full">
                  {tr("cta.join")}
                </ButtonLink>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
