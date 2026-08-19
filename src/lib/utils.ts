import type { Locale, Localized } from "./types";

/** Tailwind-friendly conditional class joiner. */
export function cn(...values: Array<string | false | null | undefined>): string {
  return values.filter(Boolean).join(" ");
}

/** Resolves a possibly-localised admin field for the active language. */
export function t(value: Localized | undefined | null, locale: Locale): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value[locale] ?? value.so ?? value.en ?? "";
}

const LOCALE_TAG: Record<Locale, string> = { so: "so-SO", en: "en-GB" };

export function formatDate(input?: string | null, locale: Locale = "so"): string {
  if (!input) return "";
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(LOCALE_TAG[locale], {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function formatTime(input?: string | null, locale: Locale = "so"): string {
  if (!input) return "";
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(LOCALE_TAG[locale], {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function dateParts(input?: string | null, locale: Locale = "so") {
  const date = input ? new Date(input) : null;
  if (!date || Number.isNaN(date.getTime())) return { day: "--", month: "---", year: "" };
  return {
    day: new Intl.DateTimeFormat(LOCALE_TAG[locale], { day: "2-digit" }).format(date),
    month: new Intl.DateTimeFormat(LOCALE_TAG[locale], { month: "short" }).format(date),
    year: String(date.getFullYear()),
  };
}

export function formatMoney(amount?: number, currency = "USD"): string {
  if (amount === undefined || amount === null) return "—";
  const abs = Math.abs(amount);
  const compact = abs >= 1000;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    notation: compact ? "compact" : "standard",
    maximumFractionDigits: compact ? 1 : 0,
  }).format(amount);
}

export function formatNumber(value: number, locale: Locale = "so"): string {
  return new Intl.NumberFormat(LOCALE_TAG[locale]).format(value);
}

/**
 * Paths this website serves itself, which must never be rewritten onto the
 * registration system's host: uploads from the media library, and the images
 * bundled in /public.
 */
const LOCAL_MEDIA_PREFIXES = ["/api/media/", "/images/", "/_next/"];

/**
 * Resolves a media path.
 *
 * Anything absolute, or served by this app, is returned untouched. Only a
 * legacy relative path from the registration system's admin panel is resolved
 * against NEXT_PUBLIC_API_BASE.
 */
export function mediaUrl(src?: string | null): string | null {
  if (!src) return null;
  const value = src.trim();
  if (!value) return null;
  if (/^(https?:)?\/\//.test(value) || value.startsWith("data:")) return value;
  if (LOCAL_MEDIA_PREFIXES.some((prefix) => value.startsWith(prefix))) return value;

  const base = (process.env.NEXT_PUBLIC_API_BASE || "").replace(/\/+$/, "");
  if (value.startsWith("/")) return base ? `${base}${value}` : value;
  return base ? `${base}/${value}` : `/${value}`;
}

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.xisbiga-hilaac.com").replace(/\/+$/, "");

export const REGISTER_URL =
  process.env.NEXT_PUBLIC_REGISTER_URL || "https://www.xisbiga-hilaac.com/register.html";

/**
 * Where "Join the Party" sends a visitor.
 *
 * Defaults to this site's own /join page, which posts through to the existing
 * registration backend — so a member who joins here lands in the same
 * `registrations` table the admin dashboard manages.
 *
 * Set NEXT_PUBLIC_REGISTER_URL to send people to the standalone registration
 * app instead (it takes an absolute URL, or a path resolved against the API
 * host, e.g. `/register.html`).
 */
export function joinUrl(fromSettings?: string | null): string {
  const override = process.env.NEXT_PUBLIC_REGISTER_URL;
  if (override) {
    return /^https?:\/\//.test(override) ? override : (mediaUrl(override) ?? "/join");
  }
  void fromSettings; // admin-stored value only applies when an override is set
  return "/join";
}

