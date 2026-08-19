import "server-only";
/**
 * REST client for the Xisbiga Hilaac admin dashboard (Node.js + PostgreSQL).
 *
 * Contract — every endpoint is a GET returning JSON:
 *   GET /api/public/settings                  -> SiteSettings
 *   GET /api/public/stats                     -> StatItem[]
 *   GET /api/public/leadership                -> Leader[]
 *   GET /api/public/news?page&pageSize&category&q&featured
 *                                             -> Paginated<NewsArticle> | NewsArticle[]
 *   GET /api/public/news/:slug                -> NewsArticle
 *   GET /api/public/news-categories           -> NewsCategory[]
 *   GET /api/public/projects?status           -> Project[] | Paginated<Project>
 *   GET /api/public/projects/:slug            -> Project
 *   GET /api/public/events?status             -> PartyEvent[]
 *   GET /api/public/gallery?type&album        -> GalleryItem[]
 *   GET /api/public/testimonials              -> Testimonial[]
 *
 * A response may be the bare array/object, or wrapped as { data: ... } /
 * { items: ..., total, page }. Both are unwrapped here.
 *
 * If a request fails (endpoint missing, backend down, network error), the
 * bundled fallback content is returned so the site never renders empty.
 */
import {
  fallbackCategories,
  fallbackEvents,
  fallbackGallery,
  fallbackLeaders,
  fallbackNews,
  fallbackProjects,
  fallbackSettings,
  fallbackStats,
  fallbackTestimonials,
} from "./fallback";
import type {
  GalleryItem,
  Leader,
  NewsArticle,
  LiveTotals,
  NewsCategory,
  Paginated,
  PartyEvent,
  Project,
  SiteSettings,
  StatItem,
  Testimonial,
} from "./types";

export const API_BASE = (process.env.NEXT_PUBLIC_API_BASE || "").replace(/\/+$/, "");
export const REVALIDATE = Number(process.env.NEXT_PUBLIC_REVALIDATE || 300);

type Query = Record<string, string | number | boolean | undefined | null>;

function buildUrl(path: string, query?: Query): string | null {
  if (!API_BASE) return null;
  const url = new URL(`${API_BASE}/api/public/${path.replace(/^\/+/, "")}`);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null || value === "") continue;
      url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

/** Unwraps { data } / { items } envelopes and returns the payload. */
function unwrap<T>(payload: unknown): T | null {
  if (payload === null || payload === undefined) return null;
  if (typeof payload === "object" && !Array.isArray(payload)) {
    const record = payload as Record<string, unknown>;
    if ("data" in record) return record.data as T;
    if ("items" in record && !("pageSize" in record) && !("total" in record)) {
      return record.items as T;
    }
  }
  return payload as T;
}

async function request<T>(path: string, query?: Query): Promise<T | null> {
  const url = buildUrl(path, query);
  if (!url) return null;

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
      next: { revalidate: REVALIDATE },
    });
    clearTimeout(timer);

    if (!res.ok) return null;
    const contentType = res.headers.get("content-type") || "";
    if (!contentType.includes("json")) return null;

    return unwrap<T>(await res.json());
  } catch {
    // Backend unavailable or endpoint not implemented yet — use fallback.
    return null;
  }
}

/* ───────────────────────────── Settings ───────────────────────────── */

export async function getSettings(): Promise<SiteSettings> {
  // Site settings belong to THIS website, so they are read from its own
  // database — the same row the dashboard's Settings screen writes. An edit
  // there is live here on the next request.
  let stored: Partial<SiteSettings> | null = null;
  try {
    stored = (await content.publicSettings()) as Partial<SiteSettings> | null;
  } catch {
    stored = null;
  }
  if (!stored) return fallbackSettings;

  // Deep-merge the branches the UI always reads so a partial admin record
  // can never blank out the page.
  return {
    ...fallbackSettings,
    ...stored,
    about: { ...fallbackSettings.about, ...(stored.about ?? {}) },
    contact: { ...fallbackSettings.contact, ...(stored.contact ?? {}) },
    socials: { ...fallbackSettings.socials, ...(stored.socials ?? {}) },
  };
}

/** The announcement banner, when an administrator has switched it on. */
export interface Announcement {
  enabled: boolean;
  textSo: string;
  textEn: string;
  link: string;
}

export async function getAnnouncement(): Promise<Announcement | null> {
  let stored: Record<string, unknown> | null = null;
  try {
    stored = await content.publicSettings();
  } catch {
    return null;
  }
  const raw = stored?.announcement as Partial<Announcement> | undefined;
  if (!raw || raw.enabled === false) return null;
  const textSo = String(raw.textSo || "").trim();
  const textEn = String(raw.textEn || "").trim();
  if (!textSo && !textEn) return null;
  return {
    enabled: true,
    textSo: textSo || textEn,
    textEn: textEn || textSo,
    link: String(raw.link || "").trim(),
  };
}

/**
 * Live membership totals from the registration backend's single read-only
 * endpoint (`GET /api/public/stats`). Counts only — no personal data crosses
 * the boundary. Returns null when the backend is unreachable, so callers can
 * fall back to bundled figures rather than showing zeros.
 */
export async function getLiveTotals(): Promise<LiveTotals | null> {
  const data = await request<LiveTotals>("stats");
  if (!data || typeof data.totalMembers !== "number") return null;
  return {
    totalMembers: data.totalMembers,
    totalRegions: data.totalRegions,
    totalDistricts: data.totalDistricts,
  };
}

export async function getStats(): Promise<StatItem[]> {
  const totals = (await getLiveTotals()) ?? (await getOwnTotals());
  if (!totals) return fallbackStats;
  return [
    { id: "members", icon: "users", value: totals.totalMembers, label: { so: "Xubno Diiwaangashan", en: "Registered Members" } },
    { id: "regions", icon: "map", value: totals.totalRegions, label: { so: "Gobol", en: "Regions" } },
    { id: "districts", icon: "map", value: totals.totalDistricts, label: { so: "Degmo", en: "Districts" } },
  ];
}

/* ───────────────────────────── Leadership ───────────────────────────── */

export async function getLeaders(): Promise<Leader[]> {
  const list = await getContentLeaders();
  return [...list].sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
}

/* ───────────────────────────── News ───────────────────────────── */

export interface NewsQuery {
  page?: number;
  pageSize?: number;
  category?: string;
  q?: string;
  featured?: boolean;
}

export async function getNews(query: NewsQuery = {}): Promise<Paginated<NewsArticle>> {
  const page = Math.max(1, query.page ?? 1);
  const pageSize = query.pageSize ?? 9;

  // Articles come from this website's own database, written by its admin
  // dashboard. Bundled content is used only while the table is still empty.
  let all: NewsArticle[];
  try {
    const rows = (await content.publicNews(200)) as unknown as NewsArticle[];
    all = rows.length ? rows : fallbackNews;
  } catch {
    all = fallbackNews;
  }

  return paginate(filterNewsLocally(all, query), page, pageSize);
}

function filterNewsLocally(list: NewsArticle[], query: NewsQuery): NewsArticle[] {
  const term = query.q?.trim().toLowerCase();
  return list
    .filter((a) => (query.category ? a.categorySlug === query.category : true))
    .filter((a) => (query.featured ? Boolean(a.featured) : true))
    .filter((a) => {
      if (!term) return true;
      const haystack = JSON.stringify([a.title, a.excerpt, a.category, a.tags]).toLowerCase();
      return haystack.includes(term);
    })
    .sort((a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt));
}

function paginate<T>(items: T[], page: number, pageSize: number): Paginated<T> {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  return {
    items: items.slice((safePage - 1) * pageSize, safePage * pageSize),
    page: safePage,
    pageSize,
    total,
    totalPages,
  };
}

export async function getArticle(slug: string): Promise<NewsArticle | null> {
  try {
    const rows = (await content.publicNews(200)) as unknown as NewsArticle[];
    const found = rows.find((a) => a.slug === slug);
    if (found) return found;
  } catch {
    /* fall through to bundled content */
  }
  return fallbackNews.find((a) => a.slug === slug) ?? null;
}

export async function getNewsCategories(): Promise<NewsCategory[]> {
  // Derived from the articles themselves, so a category appears as soon as an
  // administrator uses it and disappears when the last article using it goes.
  try {
    const rows = await content.publicNews(200);
    const counts = new Map<string, { name: string; count: number }>();
    for (const article of rows) {
      const name = String(article.category || "").trim();
      if (!name) continue;
      const slug = article.categorySlug || name.toLowerCase();
      const entry = counts.get(slug);
      if (entry) entry.count++;
      else counts.set(slug, { name, count: 1 });
    }
    if (counts.size) {
      return [...counts.entries()].map(([slug, v]) => ({
        id: slug,
        slug,
        name: v.name,
        count: v.count,
      }));
    }
  } catch {
    /* fall through to bundled content */
  }
  return fallbackCategories;
}

/** Slugs used for generateStaticParams / sitemap. */
export async function getAllNewsSlugs(): Promise<string[]> {
  try {
    const rows = await content.publicNews(200);
    if (rows.length) return rows.map((a) => a.slug);
  } catch {
    /* fall through to bundled content */
  }
  return fallbackNews.map((a) => a.slug);
}

/* ───────────────────────────── Projects ───────────────────────────── */

export async function getProjects(status?: string): Promise<Project[]> {
  return getContentProjects(status);
}

export async function getProject(slug: string): Promise<Project | null> {
  const list = await getContentProjects();
  return list.find((p) => p.slug === slug) ?? null;
}

export async function getAllProjectSlugs(): Promise<string[]> {
  return (await getContentProjects()).map((p) => p.slug);
}

/* ───────────────────────────── Events ───────────────────────────── */

export async function getEvents(): Promise<PartyEvent[]> {
  const list = await getContentEvents();
  const now = Date.now();
  // Derive status when the admin panel doesn't supply it.
  return list.map((e) => ({
    ...e,
    status: e.status ?? (+new Date(e.endsAt ?? e.startsAt) >= now ? "upcoming" : "past"),
  }));
}

/* ───────────────────────────── Gallery ───────────────────────────── */

export async function getGallery(): Promise<GalleryItem[]> {
  return getContentGallery();
}

/* ───────────────────────────── Testimonials ───────────────────────────── */

export async function getTestimonials(): Promise<Testimonial[]> {
  return fromDb(() => content.publicTestimonials() as Promise<Testimonial[]>, fallbackTestimonials);
}


/* ═════════════ website content — read from our own database ═════════════
   The admin dashboard writes these tables, so an edit there is live here on
   the next request. Bundled fallback content is used only when the database
   is empty or unreachable, so the site never renders blank.
   ═══════════════════════════════════════════════════════════════════════ */

import * as content from "./server/content";

async function fromDb<T>(read: () => Promise<T[]>, fallback: T[]): Promise<T[]> {
  try {
    const rows = await read();
    return rows.length ? rows : fallback;
  } catch {
    return fallback;
  }
}

export async function getContentNews(limit = 50): Promise<NewsArticle[]> {
  return fromDb(() => content.publicNews(limit) as Promise<NewsArticle[]>, fallbackNews);
}

export async function getContentProjects(status?: string): Promise<Project[]> {
  return fromDb(() => content.publicProjects(status) as Promise<Project[]>, fallbackProjects);
}

export async function getContentEvents(): Promise<PartyEvent[]> {
  return fromDb(() => content.publicEvents() as Promise<PartyEvent[]>, fallbackEvents);
}

export async function getContentLeaders(): Promise<Leader[]> {
  return fromDb(() => content.publicLeaders() as Promise<Leader[]>, fallbackLeaders);
}

export async function getContentGallery(): Promise<GalleryItem[]> {
  return fromDb(() => content.publicGallery() as Promise<GalleryItem[]>, fallbackGallery);
}

/**
 * Membership figures from this website's own registry, used when the
 * registration system cannot be reached. Returns null when the registry is
 * empty, so the site shows nothing rather than zeros.
 */
export async function getOwnTotals(): Promise<LiveTotals | null> {
  try {
    const { memberStats } = await import("./server/members");
    const stats = await memberStats();
    if (!stats.total) return null;
    return {
      totalMembers: stats.total,
      totalRegions: stats.regions,
      totalDistricts: stats.districts,
    };
  } catch {
    return null;
  }
}
