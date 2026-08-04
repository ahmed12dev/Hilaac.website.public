"use client";

import {
  ArrowUp,
  Facebook,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  Send,
  Youtube,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useLanguage } from "@/lib/i18n/provider";
import type { TranslationKey } from "@/lib/i18n/dictionary";
import type { SiteSettings } from "@/lib/types";
import { cn } from "@/lib/utils";

const QUICK_LINKS: { href: string; key: TranslationKey }[] = [
  { href: "/about", key: "nav.about" },
  { href: "/leadership", key: "nav.leadership" },
  { href: "/news", key: "nav.news" },
  { href: "/projects", key: "nav.projects" },
  { href: "/events", key: "nav.events" },
  { href: "/gallery", key: "nav.gallery" },
  { href: "/contact", key: "nav.contact" },
];

const SOCIAL_ICONS = {
  facebook: Facebook,
  instagram: Instagram,
  youtube: Youtube,
  linkedin: Linkedin,
} as const;

export function Footer({ settings }: { settings: SiteSettings }) {
  const { tr, tx } = useLanguage();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const onSubscribe = (event: FormEvent) => {
    event.preventDefault();
    if (!email.trim()) return;
    // The admin dashboard exposes the subscriber list; this posts into it.
    void fetch("/api/newsletter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    }).catch(() => undefined);
    setSubscribed(true);
    setEmail("");
  };

  const socialEntries = Object.entries(settings.socials ?? {}).filter(
    ([key, url]) => Boolean(url) && key in SOCIAL_ICONS,
  ) as [keyof typeof SOCIAL_ICONS, string][];

  return (
    <footer className="relative overflow-hidden bg-ink-950 text-ink-300">
      {/* Gold glow */}
      <div
        className="pointer-events-none absolute -top-40 left-1/2 h-96 w-[60rem] -translate-x-1/2 rounded-full bg-gold-500/12 blur-[120px]"
        aria-hidden
      />
      <div className="hairline-gold absolute inset-x-0 top-0 h-px" aria-hidden />

      <div className="container-page relative py-16 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-12">
          {/* Brand */}
          <div className="lg:col-span-4">
            <Link href="/" className="mb-5 flex items-center gap-3">
              <span className="grid h-14 w-14 place-items-center rounded-full bg-white ring-2 ring-gold-500/60">
                <Image src="/images/logo.webp" alt="Xisbiga Hilaac" width={56} height={56} className="h-11 w-11 object-contain" />
              </span>
              <span className="leading-tight">
                <span className="block font-display text-xl font-extrabold text-white">
                  Xisbiga <span className="text-gradient-gold">Hilaac</span>
                </span>
                <span className="block text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-ink-500">
                  {tx(settings.tagline)}
                </span>
              </span>
            </Link>

            <p className="max-w-sm text-sm leading-relaxed text-ink-400">
              {tx(settings.heroSubheadline)}
            </p>

            {socialEntries.length > 0 && (
              <div className="mt-6">
                <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-ink-500">
                  {tr("footer.follow")}
                </p>
                <div className="flex flex-wrap gap-2.5">
                  {socialEntries.map(([key, url]) => {
                    const Icon = SOCIAL_ICONS[key];
                    return (
                      <a
                        key={key}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={key}
                        className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/5 text-ink-300 transition-all hover:-translate-y-0.5 hover:border-gold-500 hover:bg-gold-500 hover:text-ink-900"
                      >
                        <Icon className="h-[18px] w-[18px]" />
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Quick links */}
          <nav className="lg:col-span-3" aria-label={tr("footer.quickLinks")}>
            <h3 className="mb-5 font-display text-base font-bold text-white">
              {tr("footer.quickLinks")}
            </h3>
            <ul className="space-y-3 text-sm">
              {QUICK_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="group inline-flex items-center gap-2 text-ink-400 transition-colors hover:text-gold-400"
                  >
                    <span className="h-1 w-1 rounded-full bg-gold-500/60 transition-all group-hover:w-3" aria-hidden />
                    {tr(link.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contact */}
          <div className="lg:col-span-2">
            <h3 className="mb-5 font-display text-base font-bold text-white">{tr("nav.contact")}</h3>
            <ul className="space-y-4 text-sm text-ink-400">
              <li className="flex gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold-500" aria-hidden />
                <span>{tx(settings.contact.address)}</span>
              </li>
              <li className="flex gap-2.5">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-gold-500" aria-hidden />
                <a href={`mailto:${settings.contact.email}`} className="break-all transition-colors hover:text-gold-400">
                  {settings.contact.email}
                </a>
              </li>
              <li className="flex gap-2.5">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-gold-500" aria-hidden />
                <a href={`tel:${settings.contact.phone.replace(/\s/g, "")}`} className="transition-colors hover:text-gold-400">
                  {settings.contact.phone}
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="lg:col-span-3">
            <h3 className="mb-3 font-display text-base font-bold text-white">
              {tr("footer.newsletter")}
            </h3>
            <p className="mb-4 text-sm text-ink-400">{tr("footer.newsletterText")}</p>

            <form onSubmit={onSubscribe} className="space-y-3">
              <label htmlFor="footer-newsletter" className="sr-only">
                {tr("footer.emailPlaceholder")}
              </label>
              <div className="flex items-center gap-2 rounded-full border border-white/12 bg-white/5 p-1.5 focus-within:border-gold-500">
                <input
                  id="footer-newsletter"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={tr("footer.emailPlaceholder")}
                  className="w-full bg-transparent px-3 py-1.5 text-sm text-white outline-none placeholder:text-ink-500"
                />
                <button
                  type="submit"
                  aria-label={tr("cta.subscribe")}
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gold-gradient text-ink-900 transition-transform hover:scale-105"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
              {subscribed && (
                <p className="text-xs font-semibold text-gold-400" role="status">
                  {tr("footer.subscribed")}
                </p>
              )}
            </form>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className={cn(
            "mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/8 pt-7",
            "text-xs text-ink-500 sm:flex-row",
          )}
        >
          <p>
            © {new Date().getFullYear()} {tx(settings.partyName)}. {tr("footer.rights")}
          </p>

          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="inline-flex items-center gap-2 rounded-full border border-white/12 px-4 py-2 font-semibold transition-all hover:border-gold-500 hover:text-gold-400"
          >
            <ArrowUp className="h-3.5 w-3.5" />
            Top
          </button>
        </div>
      </div>
    </footer>
  );
}
