import "server-only";
import { ensureSchema, getPool } from "./db";

/**
 * Content queries for the website's own tables.
 *
 * Only `site_*` tables are touched here. The registration system's tables are
 * never referenced — its data reaches this app solely over HTTPS.
 */

export interface NewsRow {
  id: number;
  slug: string;
  titleSo: string;
  titleEn: string;
  excerptSo: string;
  excerptEn: string;
  bodySo: string;
  bodyEn: string;
  cover: string | null;
  category: string | null;
  author: string | null;
  featured: boolean;
  published: boolean;
  publishedAt: string;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function mapNews(r: any): NewsRow {
  return {
    id: r.id,
    slug: r.slug,
    titleSo: r.title_so,
    titleEn: r.title_en,
    excerptSo: r.excerpt_so,
    excerptEn: r.excerpt_en,
    bodySo: r.body_so,
    bodyEn: r.body_en,
    cover: r.cover,
    category: r.category,
    author: r.author,
    featured: r.featured,
    published: r.published,
    publishedAt: r.published_at,
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

/** Turns a title into a URL-safe slug, keeping Somali letters readable. */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90) || "article";
}

/** Appends -2, -3 … until the slug is free (ignoring the row being edited). */
async function uniqueSlug(base: string, ignoreId?: number): Promise<string> {
  const pool = getPool();
  let slug = base;
  for (let n = 2; n < 100; n++) {
    const res = await pool.query(
      "SELECT id FROM site_news WHERE slug = $1 AND ($2::int IS NULL OR id <> $2)",
      [slug, ignoreId ?? null],
    );
    if (res.rowCount === 0) return slug;
    slug = `${base}-${n}`;
  }
  return `${base}-${Date.now()}`;
}

export async function listNews(): Promise<NewsRow[]> {
  await ensureSchema();
  const res = await getPool().query(
    "SELECT * FROM site_news ORDER BY featured DESC, published_at DESC LIMIT 200",
  );
  return res.rows.map(mapNews);
}

export async function getNewsById(id: number): Promise<NewsRow | null> {
  await ensureSchema();
  const res = await getPool().query("SELECT * FROM site_news WHERE id = $1", [id]);
  return res.rows[0] ? mapNews(res.rows[0]) : null;
}

export interface NewsInput {
  titleSo: string;
  titleEn: string;
  excerptSo?: string;
  excerptEn?: string;
  bodySo?: string;
  bodyEn?: string;
  cover?: string | null;
  category?: string | null;
  author?: string | null;
  featured?: boolean;
  published?: boolean;
}

function clean(value: unknown, max: number): string {
  return String(value ?? "").trim().slice(0, max);
}

export async function createNews(input: NewsInput): Promise<NewsRow> {
  await ensureSchema();
  const titleSo = clean(input.titleSo, 300);
  const titleEn = clean(input.titleEn, 300);
  const slug = await uniqueSlug(slugify(titleEn || titleSo));

  const res = await getPool().query(
    `INSERT INTO site_news
       (slug, title_so, title_en, excerpt_so, excerpt_en, body_so, body_en,
        cover, category, author, featured, published)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
     RETURNING *`,
    [
      slug, titleSo, titleEn,
      clean(input.excerptSo, 1000), clean(input.excerptEn, 1000),
      clean(input.bodySo, 20000), clean(input.bodyEn, 20000),
      clean(input.cover, 500) || null,
      clean(input.category, 80) || null,
      clean(input.author, 120) || null,
      Boolean(input.featured), input.published !== false,
    ],
  );
  return mapNews(res.rows[0]);
}

export async function updateNews(id: number, input: NewsInput): Promise<NewsRow | null> {
  await ensureSchema();
  const titleSo = clean(input.titleSo, 300);
  const titleEn = clean(input.titleEn, 300);
  const slug = await uniqueSlug(slugify(titleEn || titleSo), id);

  const res = await getPool().query(
    `UPDATE site_news SET
       slug=$2, title_so=$3, title_en=$4, excerpt_so=$5, excerpt_en=$6,
       body_so=$7, body_en=$8, cover=$9, category=$10, author=$11,
       featured=$12, published=$13, updated_at=now()
     WHERE id=$1 RETURNING *`,
    [
      id, slug, titleSo, titleEn,
      clean(input.excerptSo, 1000), clean(input.excerptEn, 1000),
      clean(input.bodySo, 20000), clean(input.bodyEn, 20000),
      clean(input.cover, 500) || null,
      clean(input.category, 80) || null,
      clean(input.author, 120) || null,
      Boolean(input.featured), input.published !== false,
    ],
  );
  return res.rows[0] ? mapNews(res.rows[0]) : null;
}

export async function deleteNews(id: number): Promise<boolean> {
  await ensureSchema();
  const res = await getPool().query("DELETE FROM site_news WHERE id = $1", [id]);
  return (res.rowCount ?? 0) > 0;
}

export interface ContentCounts {
  news: number;
  news_published: number;
  projects: number;
  events: number;
  leaders: number;
  gallery: number;
  testimonials: number;
  media: number;
  members: number;
  subscribers: number;
  messages: number;
  unread_messages: number;
}

/** Counts for the dashboard overview. */
export async function contentCounts(): Promise<ContentCounts> {
  await ensureSchema();
  const res = await getPool().query(`
    SELECT
      (SELECT count(*)::int FROM site_news)                        AS news,
      (SELECT count(*)::int FROM site_news WHERE published)        AS news_published,
      (SELECT count(*)::int FROM site_projects)                    AS projects,
      (SELECT count(*)::int FROM site_events)                      AS events,
      (SELECT count(*)::int FROM site_leaders)                     AS leaders,
      (SELECT count(*)::int FROM site_gallery)                     AS gallery,
      (SELECT count(*)::int FROM site_testimonials)                AS testimonials,
      (SELECT count(*)::int FROM site_media)                       AS media,
      (SELECT count(*)::int FROM site_members)                     AS members,
      (SELECT count(*)::int FROM site_subscribers)                 AS subscribers,
      (SELECT count(*)::int FROM site_messages)                    AS messages,
      (SELECT count(*)::int FROM site_messages WHERE NOT is_read)  AS unread_messages
  `);
  return res.rows[0];
}

/* ═════════════════════ public reads ═════════════════════
   Used by the public REST endpoints and by the site's own pages.
   Only published rows are ever returned — the filter lives in the query,
   so no caller can accidentally expose a draft.
   ═══════════════════════════════════════════════════════ */

/** Bilingual pair -> { so, en }, each falling back to the other. */
function L(so: string | null, en: string | null) {
  const s = so || "";
  const e = en || "";
  return { so: s || e, en: e || s };
}

function parse<T>(text: string | null, fallback: T): T {
  try {
    const v = JSON.parse(text || "");
    return v === null ? fallback : (v as T);
  } catch {
    return fallback;
  }
}

export async function publicNews(limit = 50) {
  await ensureSchema();
  const res = await getPool().query(
    `SELECT * FROM site_news
      WHERE published AND published_at <= now()
      ORDER BY featured DESC, published_at DESC LIMIT $1`,
    [Math.min(Math.max(limit, 1), 200)],
  );
  /* eslint-disable @typescript-eslint/no-explicit-any */
  return res.rows.map((r: any) => ({
    id: String(r.id),
    slug: r.slug,
    title: L(r.title_so, r.title_en),
    excerpt: L(r.excerpt_so, r.excerpt_en),
    body: L(r.body_so, r.body_en),
    cover: r.cover,
    category: r.category,
    categorySlug: r.category ? slugify(r.category) : null,
    author: r.author,
    featured: r.featured,
    publishedAt: r.published_at,
  }));
  /* eslint-enable @typescript-eslint/no-explicit-any */
}

export async function publicProjects(status?: string) {
  await ensureSchema();
  const args: unknown[] = [];
  let where = "WHERE published";
  if (status && status !== "all") {
    args.push(status);
    where += " AND status = $1";
  }
  const res = await getPool().query(
    `SELECT * FROM site_projects ${where} ORDER BY updated_at DESC LIMIT 200`,
    args,
  );
  /* eslint-disable @typescript-eslint/no-explicit-any */
  return res.rows.map((r: any) => ({
    id: String(r.id),
    slug: r.slug,
    title: L(r.title_so, r.title_en),
    description: L(r.description_so, r.description_en),
    cover: r.cover,
    status: r.status,
    progress: Number(r.progress) || 0,
    budget: r.budget === null ? null : Number(r.budget),
    currency: r.currency,
    startDate: r.start_date,
    endDate: r.end_date,
    location: r.location,
  }));
  /* eslint-enable @typescript-eslint/no-explicit-any */
}

export async function publicEvents() {
  await ensureSchema();
  const res = await getPool().query(
    "SELECT * FROM site_events WHERE published ORDER BY starts_at DESC LIMIT 200",
  );
  /* eslint-disable @typescript-eslint/no-explicit-any */
  return res.rows.map((r: any) => ({
    id: String(r.id),
    slug: r.slug,
    title: L(r.title_so, r.title_en),
    description: L(r.description_so, r.description_en),
    cover: r.cover,
    startsAt: r.starts_at,
    endsAt: r.ends_at,
    location: L(r.location_so, r.location_en),
    capacity: r.capacity,
    status: new Date(r.ends_at || r.starts_at).getTime() >= Date.now() ? "upcoming" : "past",
  }));
  /* eslint-enable @typescript-eslint/no-explicit-any */
}

export async function publicLeaders() {
  await ensureSchema();
  const res = await getPool().query(
    "SELECT * FROM site_leaders WHERE published ORDER BY sort_order, id LIMIT 100",
  );
  /* eslint-disable @typescript-eslint/no-explicit-any */
  return res.rows.map((r: any) => ({
    id: String(r.id),
    name: r.name,
    position: L(r.position_so, r.position_en),
    bio: L(r.bio_so, r.bio_en),
    photo: r.photo,
    order: r.sort_order,
    socials: parse<Record<string, string>>(r.socials, {}),
  }));
  /* eslint-enable @typescript-eslint/no-explicit-any */
}

export async function publicGallery(type?: string) {
  await ensureSchema();
  const args: unknown[] = [];
  let where = "WHERE published";
  if (type === "photo" || type === "video") {
    args.push(type);
    where += " AND type = $1";
  }
  const res = await getPool().query(
    `SELECT * FROM site_gallery ${where} ORDER BY sort_order, created_at DESC LIMIT 300`,
    args,
  );
  /* eslint-disable @typescript-eslint/no-explicit-any */
  return res.rows.map((r: any) => ({
    id: String(r.id),
    type: r.type === "video" ? "video" : "photo",
    title: L(r.title_so, r.title_en),
    src: r.src,
    thumb: r.src,
    album: r.album,
  }));
  /* eslint-enable @typescript-eslint/no-explicit-any */
}

export async function publicTestimonials() {
  await ensureSchema();
  const res = await getPool().query(
    "SELECT * FROM site_testimonials WHERE published ORDER BY sort_order, id LIMIT 100",
  );
  /* eslint-disable @typescript-eslint/no-explicit-any */
  return res.rows.map((r: any) => ({
    id: String(r.id),
    name: r.name,
    role: L(r.role_so, r.role_en),
    quote: L(r.quote_so, r.quote_en),
    avatar: r.avatar,
    rating: Number(r.rating) || 5,
  }));
  /* eslint-enable @typescript-eslint/no-explicit-any */
}

/** Site settings blob (hero, about, contact, socials). */
export async function publicSettings(): Promise<Record<string, unknown> | null> {
  await ensureSchema();
  const res = await getPool().query("SELECT data FROM site_settings WHERE id = 1");
  if (!res.rows[0]) return null;
  const data = parse<Record<string, unknown>>(res.rows[0].data, {});
  return Object.keys(data).length ? data : null;
}

export async function saveSettings(data: Record<string, unknown>): Promise<void> {
  await ensureSchema();
  await getPool().query(
    "UPDATE site_settings SET data = $1, updated_at = now() WHERE id = 1",
    [JSON.stringify(data)],
  );
}

/* ═══════════════ projects: admin CRUD ═══════════════ */

export interface ProjectRow {
  id: number;
  slug: string;
  titleSo: string; titleEn: string;
  descriptionSo: string; descriptionEn: string;
  cover: string | null;
  status: string;
  progress: number;
  budget: number | null;
  currency: string;
  startDate: string | null;
  endDate: string | null;
  location: string | null;
  published: boolean;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function mapProject(r: any): ProjectRow {
  return {
    id: r.id, slug: r.slug,
    titleSo: r.title_so, titleEn: r.title_en,
    descriptionSo: r.description_so, descriptionEn: r.description_en,
    cover: r.cover, status: r.status,
    progress: Number(r.progress) || 0,
    budget: r.budget === null ? null : Number(r.budget),
    currency: r.currency,
    startDate: r.start_date, endDate: r.end_date,
    location: r.location, published: r.published,
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export const PROJECT_STATUSES = ["planned", "ongoing", "completed", "paused"] as const;

export interface ProjectInput {
  titleSo?: string; titleEn?: string;
  descriptionSo?: string; descriptionEn?: string;
  cover?: string | null;
  status?: string;
  progress?: number;
  budget?: number | null;
  currency?: string;
  startDate?: string | null;
  endDate?: string | null;
  location?: string | null;
  published?: boolean;
}

async function uniqueProjectSlug(base: string, ignoreId?: number): Promise<string> {
  const pool = getPool();
  let slug = base;
  for (let n = 2; n < 100; n++) {
    const res = await pool.query(
      "SELECT id FROM site_projects WHERE slug = $1 AND ($2::int IS NULL OR id <> $2)",
      [slug, ignoreId ?? null],
    );
    if (res.rowCount === 0) return slug;
    slug = `${base}-${n}`;
  }
  return `${base}-${Date.now()}`;
}

/** Normalises input; the status enum and progress range are enforced here. */
function projectValues(input: ProjectInput) {
  const status = PROJECT_STATUSES.includes(input.status as never) ? input.status! : "planned";
  const progress = Math.max(0, Math.min(100, Math.round(Number(input.progress) || 0)));
  const budget =
    input.budget === null || input.budget === undefined || input.budget === ("" as never)
      ? null
      : Number(input.budget);
  const date = (v: string | null | undefined) => (v && String(v).trim() ? String(v).trim() : null);

  return {
    titleSo: clean(input.titleSo, 300),
    titleEn: clean(input.titleEn, 300),
    descriptionSo: clean(input.descriptionSo, 4000),
    descriptionEn: clean(input.descriptionEn, 4000),
    cover: clean(input.cover, 500) || null,
    status,
    progress,
    budget: budget !== null && Number.isFinite(budget) ? budget : null,
    currency: clean(input.currency, 8) || "USD",
    startDate: date(input.startDate),
    endDate: date(input.endDate),
    location: clean(input.location, 200) || null,
    published: input.published !== false,
  };
}

export async function listProjects(): Promise<ProjectRow[]> {
  await ensureSchema();
  const res = await getPool().query("SELECT * FROM site_projects ORDER BY updated_at DESC LIMIT 200");
  return res.rows.map(mapProject);
}

export async function createProject(input: ProjectInput): Promise<ProjectRow> {
  await ensureSchema();
  const v = projectValues(input);
  const slug = await uniqueProjectSlug(slugify(v.titleEn || v.titleSo));
  const res = await getPool().query(
    `INSERT INTO site_projects
       (slug, title_so, title_en, description_so, description_en, cover, status,
        progress, budget, currency, start_date, end_date, location, published)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) RETURNING *`,
    [slug, v.titleSo, v.titleEn, v.descriptionSo, v.descriptionEn, v.cover, v.status,
     v.progress, v.budget, v.currency, v.startDate, v.endDate, v.location, v.published],
  );
  return mapProject(res.rows[0]);
}

export async function updateProject(id: number, input: ProjectInput): Promise<ProjectRow | null> {
  await ensureSchema();
  const v = projectValues(input);
  const slug = await uniqueProjectSlug(slugify(v.titleEn || v.titleSo), id);
  const res = await getPool().query(
    `UPDATE site_projects SET
       slug=$2, title_so=$3, title_en=$4, description_so=$5, description_en=$6,
       cover=$7, status=$8, progress=$9, budget=$10, currency=$11,
       start_date=$12, end_date=$13, location=$14, published=$15, updated_at=now()
     WHERE id=$1 RETURNING *`,
    [id, slug, v.titleSo, v.titleEn, v.descriptionSo, v.descriptionEn, v.cover, v.status,
     v.progress, v.budget, v.currency, v.startDate, v.endDate, v.location, v.published],
  );
  return res.rows[0] ? mapProject(res.rows[0]) : null;
}

export async function deleteProject(id: number): Promise<boolean> {
  await ensureSchema();
  const res = await getPool().query("DELETE FROM site_projects WHERE id = $1", [id]);
  return (res.rowCount ?? 0) > 0;
}
