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

/** Resolves an admin-supplied media path against the API host. */
export function mediaUrl(src?: string | null): string | null {
  if (!src) return null;
  if (/^(https?:)?\/\//.test(src) || src.startsWith("data:")) return src;
  const base = (process.env.NEXT_PUBLIC_API_BASE || "").replace(/\/+$/, "");
  if (src.startsWith("/")) return base ? `${base}${src}` : src;
  return base ? `${base}/${src}` : `/${src}`;
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

/**
 * Where /admin sends an administrator: the management dashboard's login.
 * Falls back to the registration system's own admin panel when the dashboard
 * host isn't configured, so the link is never dead.
 */
export function adminUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_ADMIN_URL;
  if (explicit) return explicit;
  return mediaUrl('/admin.html') ?? '/';
}
