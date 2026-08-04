import { NextResponse } from "next/server";
import { getEvents, getNews, getProjects } from "@/lib/api";
import { t } from "@/lib/utils";
import type { Locale } from "@/lib/types";

export const revalidate = 120;

export interface SearchHit {
  id: string;
  type: "news" | "project" | "event";
  title: string;
  excerpt: string;
  href: string;
  meta?: string;
}

/**
 * Site-wide search across news, projects and events. Content is pulled through
 * the same API layer the pages use, so it works with the admin backend or the
 * bundled fallback content.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = (searchParams.get("q") || "").trim().toLowerCase();
  const locale = (searchParams.get("locale") === "en" ? "en" : "so") as Locale;

  if (query.length < 2) return NextResponse.json({ hits: [] });

  const [news, projects, events] = await Promise.all([
    getNews({ pageSize: 100 }),
    getProjects(),
    getEvents(),
  ]);

  const matches = (...fields: string[]) =>
    fields.some((field) => field.toLowerCase().includes(query));

  const hits: SearchHit[] = [
    ...news.items
      .filter((a) => matches(t(a.title, locale), t(a.excerpt, locale), a.category ?? ""))
      .map<SearchHit>((a) => ({
        id: a.id,
        type: "news",
        title: t(a.title, locale),
        excerpt: t(a.excerpt, locale),
        href: `/news/${a.slug}`,
        meta: a.category,
      })),
    ...projects
      .filter((p) => matches(t(p.title, locale), t(p.description, locale), p.category ?? ""))
      .map<SearchHit>((p) => ({
        id: p.id,
        type: "project",
        title: t(p.title, locale),
        excerpt: t(p.description, locale),
        href: `/projects/${p.slug}`,
        meta: p.status,
      })),
    ...events
      .filter((e) => matches(t(e.title, locale), t(e.description, locale)))
      .map<SearchHit>((e) => ({
        id: e.id,
        type: "event",
        title: t(e.title, locale),
        excerpt: t(e.description, locale),
        href: `/events#${e.slug}`,
        meta: e.status,
      })),
  ];

  return NextResponse.json({ hits: hits.slice(0, 12) });
}
