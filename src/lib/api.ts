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
  NewsCategory,
  Overview,
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

/** Accepts an array or a Paginated envelope and always yields an array. */
function toArray<T>(value: unknown): T[] | null {
  if (Array.isArray(value)) return value as T[];
  if (value && typeof value === "object" && Array.isArray((value as Paginated<T>).items)) {
    return (value as Paginated<T>).items;
  }
  return null;
}

function nonEmpty<T>(value: T[] | null, fallback: T[]): T[] {
  return value && value.length ? value : fallback;
}

/* ───────────────────────────── Settings ───────────────────────────── */

export async function getSettings(): Promise<SiteSettings> {
  const remote = await request<Partial<SiteSettings>>("settings");
  if (!remote) return fallbackSettings;
  // Deep-merge the branches the UI always reads so a partial admin record
  // can never blank out the page.
  return {
    ...fallbackSettings,
    ...remote,
    about: { ...fallbackSettings.about, ...(remote.about ?? {}) },
    contact: { ...fallbackSettings.contact, ...(remote.contact ?? {}) },
    socials: { ...fallbackSettings.socials, ...(remote.socials ?? {}) },
  };
}

export async function getStats(): Promise<StatItem[]> {
  return nonEmpty(toArray<StatItem>(await request("stats")), fallbackStats);
}

/**
 * Live homepage figures. Member/region/district counts are computed by the
 * backend from the `registrations` table the dashboard manages, so they always
 * reflect how many people have actually joined.
 *
 * `revalidate: 30` keeps them near-real-time without hammering the database.
 */
export async function getOverview(): Promise<Overview | null> {
  return await request<Overview>("overview");
}

/* ───────────────────────────── Leadership ───────────────────────────── */

export async function getLeaders(): Promise<Leader[]> {
  const list = nonEmpty(toArray<Leader>(await request("leadership")), fallbackLeaders);
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

  const remote = await request<unknown>("news", { ...query, page, pageSize });
  const remoteArray = toArray<NewsArticle>(remote);

  // Backend already paginated for us.
  if (remote && typeof remote === "object" && "totalPages" in (remote as object)) {
    return remote as Paginated<NewsArticle>;
  }

  const all = remoteArray?.length ? remoteArray : filterNewsLocally(fallbackNews, query);
  return paginate(all, page, pageSize);
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
  const remote = await request<NewsArticle>(`news/${encodeURIComponent(slug)}`);
  if (remote?.slug) return remote;
  return fallbackNews.find((a) => a.slug === slug) ?? null;
}

export async function getNewsCategories(): Promise<NewsCategory[]> {
  return nonEmpty(toArray<NewsCategory>(await request("news-categories")), fallbackCategories);
}

/** Slugs used for generateStaticParams / sitemap. */
export async function getAllNewsSlugs(): Promise<string[]> {
  const remote = toArray<NewsArticle>(await request("news", { pageSize: 200 }));
  return (remote?.length ? remote : fallbackNews).map((a) => a.slug);
}

/* ───────────────────────────── Projects ───────────────────────────── */

export async function getProjects(status?: string): Promise<Project[]> {
  const remote = toArray<Project>(await request("projects", { status }));
  const list = nonEmpty(remote, fallbackProjects);
  if (remote || !status || status === "all") return list;
  return list.filter((p) => p.status === status);
}

export async function getProject(slug: string): Promise<Project | null> {
  const remote = await request<Project>(`projects/${encodeURIComponent(slug)}`);
  if (remote?.slug) return remote;
  return fallbackProjects.find((p) => p.slug === slug) ?? null;
}

export async function getAllProjectSlugs(): Promise<string[]> {
  const remote = toArray<Project>(await request("projects"));
  return (remote?.length ? remote : fallbackProjects).map((p) => p.slug);
}

/* ───────────────────────────── Events ───────────────────────────── */

export async function getEvents(): Promise<PartyEvent[]> {
  const list = nonEmpty(toArray<PartyEvent>(await request("events")), fallbackEvents);
  const now = Date.now();
  // Derive status when the admin panel doesn't supply it.
  return list.map((e) => ({
    ...e,
    status: e.status ?? (+new Date(e.endsAt ?? e.startsAt) >= now ? "upcoming" : "past"),
  }));
}

/* ───────────────────────────── Gallery ───────────────────────────── */

export async function getGallery(): Promise<GalleryItem[]> {
  return nonEmpty(toArray<GalleryItem>(await request("gallery")), fallbackGallery);
}

/* ───────────────────────────── Testimonials ───────────────────────────── */

export async function getTestimonials(): Promise<Testimonial[]> {
  return nonEmpty(toArray<Testimonial>(await request("testimonials")), fallbackTestimonials);
}
