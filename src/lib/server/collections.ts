import "server-only";
import { ensureSchema, getPool } from "./db";
import { slugify } from "./content";

/**
 * Admin CRUD for the remaining website collections: events, leadership,
 * gallery and contact messages.
 *
 * Kept alongside content.ts (news, projects) purely to keep each file
 * readable. Same rules apply: only `site_*` tables, all input validated and
 * bound as parameters.
 */

function clean(value: unknown, max: number): string {
  return String(value ?? "").trim().slice(0, max);
}

function parseJson<T>(text: string | null, fallback: T): T {
  try {
    const v = JSON.parse(text || "");
    return v === null ? fallback : (v as T);
  } catch {
    return fallback;
  }
}

/** Slug helper scoped to a fixed set of tables — never caller-supplied. */
async function uniqueSlug(table: "site_events", base: string, ignoreId?: number): Promise<string> {
  const pool = getPool();
  let slug = base;
  for (let n = 2; n < 100; n++) {
    const res = await pool.query(
      `SELECT id FROM ${table} WHERE slug = $1 AND ($2::int IS NULL OR id <> $2)`,
      [slug, ignoreId ?? null],
    );
    if (res.rowCount === 0) return slug;
    slug = `${base}-${n}`;
  }
  return `${base}-${Date.now()}`;
}

/* ═══════════════════════ events ═══════════════════════ */

export interface EventRow {
  id: number;
  slug: string;
  titleSo: string;
  titleEn: string;
  descriptionSo: string;
  descriptionEn: string;
  cover: string | null;
  startsAt: string;
  endsAt: string | null;
  locationSo: string;
  locationEn: string;
  capacity: number | null;
  published: boolean;
}

export interface EventInput {
  titleSo?: string;
  titleEn?: string;
  descriptionSo?: string;
  descriptionEn?: string;
  cover?: string | null;
  startsAt?: string;
  endsAt?: string | null;
  locationSo?: string;
  locationEn?: string;
  capacity?: number | null;
  published?: boolean;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function mapEvent(r: any): EventRow {
  return {
    id: r.id,
    slug: r.slug,
    titleSo: r.title_so,
    titleEn: r.title_en,
    descriptionSo: r.description_so,
    descriptionEn: r.description_en,
    cover: r.cover,
    startsAt: r.starts_at,
    endsAt: r.ends_at,
    locationSo: r.location_so,
    locationEn: r.location_en,
    capacity: r.capacity,
    published: r.published,
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

function eventValues(i: EventInput) {
  const raw = i.capacity;
  const cap = raw === null || raw === undefined || String(raw) === "" ? null : Number(raw);
  return {
    titleSo: clean(i.titleSo, 300),
    titleEn: clean(i.titleEn, 300),
    descriptionSo: clean(i.descriptionSo, 4000),
    descriptionEn: clean(i.descriptionEn, 4000),
    cover: clean(i.cover, 500) || null,
    // starts_at is NOT NULL; default to now rather than rejecting the save.
    startsAt: clean(i.startsAt, 40) || new Date().toISOString(),
    endsAt: clean(i.endsAt, 40) || null,
    locationSo: clean(i.locationSo, 200),
    locationEn: clean(i.locationEn, 200),
    capacity: cap !== null && Number.isFinite(cap) && cap >= 0 ? Math.round(cap) : null,
    published: i.published !== false,
  };
}

export async function listEventsAdmin(): Promise<EventRow[]> {
  await ensureSchema();
  const res = await getPool().query("SELECT * FROM site_events ORDER BY starts_at DESC LIMIT 200");
  return res.rows.map(mapEvent);
}

export async function createEvent(input: EventInput): Promise<EventRow> {
  await ensureSchema();
  const v = eventValues(input);
  const slug = await uniqueSlug("site_events", slugify(v.titleEn || v.titleSo));
  const res = await getPool().query(
    `INSERT INTO site_events
       (slug, title_so, title_en, description_so, description_en, cover,
        starts_at, ends_at, location_so, location_en, capacity, published)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
    [slug, v.titleSo, v.titleEn, v.descriptionSo, v.descriptionEn, v.cover,
     v.startsAt, v.endsAt, v.locationSo, v.locationEn, v.capacity, v.published],
  );
  return mapEvent(res.rows[0]);
}

export async function updateEvent(id: number, input: EventInput): Promise<EventRow | null> {
  await ensureSchema();
  const v = eventValues(input);
  const slug = await uniqueSlug("site_events", slugify(v.titleEn || v.titleSo), id);
  const res = await getPool().query(
    `UPDATE site_events SET
       slug=$2, title_so=$3, title_en=$4, description_so=$5, description_en=$6,
       cover=$7, starts_at=$8, ends_at=$9, location_so=$10, location_en=$11,
       capacity=$12, published=$13, updated_at=now()
     WHERE id=$1 RETURNING *`,
    [id, slug, v.titleSo, v.titleEn, v.descriptionSo, v.descriptionEn, v.cover,
     v.startsAt, v.endsAt, v.locationSo, v.locationEn, v.capacity, v.published],
  );
  return res.rows[0] ? mapEvent(res.rows[0]) : null;
}

/* ═══════════════════════ leadership ═══════════════════════ */

export interface LeaderRow {
  id: number;
  name: string;
  positionSo: string;
  positionEn: string;
  bioSo: string;
  bioEn: string;
  photo: string | null;
  socials: Record<string, string>;
  sortOrder: number;
  published: boolean;
}

export interface LeaderInput {
  name?: string;
  positionSo?: string;
  positionEn?: string;
  bioSo?: string;
  bioEn?: string;
  photo?: string | null;
  socials?: Record<string, string>;
  sortOrder?: number;
  published?: boolean;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function mapLeader(r: any): LeaderRow {
  return {
    id: r.id,
    name: r.name,
    positionSo: r.position_so,
    positionEn: r.position_en,
    bioSo: r.bio_so,
    bioEn: r.bio_en,
    photo: r.photo,
    socials: parseJson<Record<string, string>>(r.socials, {}),
    sortOrder: r.sort_order,
    published: r.published,
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

function leaderValues(i: LeaderInput) {
  const socials: Record<string, string> = {};
  for (const [key, value] of Object.entries(i.socials ?? {})) {
    const url = clean(value, 300);
    if (url) socials[clean(key, 20)] = url;
  }
  return {
    name: clean(i.name, 160),
    positionSo: clean(i.positionSo, 200),
    positionEn: clean(i.positionEn, 200),
    bioSo: clean(i.bioSo, 3000),
    bioEn: clean(i.bioEn, 3000),
    photo: clean(i.photo, 500) || null,
    socials: JSON.stringify(socials),
    sortOrder: Math.max(0, Math.round(Number(i.sortOrder) || 0)),
    published: i.published !== false,
  };
}

export async function listLeadersAdmin(): Promise<LeaderRow[]> {
  await ensureSchema();
  const res = await getPool().query("SELECT * FROM site_leaders ORDER BY sort_order, id LIMIT 200");
  return res.rows.map(mapLeader);
}

export async function createLeader(input: LeaderInput): Promise<LeaderRow> {
  await ensureSchema();
  const v = leaderValues(input);
  const res = await getPool().query(
    `INSERT INTO site_leaders
       (name, position_so, position_en, bio_so, bio_en, photo, socials, sort_order, published)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
    [v.name, v.positionSo, v.positionEn, v.bioSo, v.bioEn, v.photo, v.socials, v.sortOrder, v.published],
  );
  return mapLeader(res.rows[0]);
}

export async function updateLeader(id: number, input: LeaderInput): Promise<LeaderRow | null> {
  await ensureSchema();
  const v = leaderValues(input);
  const res = await getPool().query(
    `UPDATE site_leaders SET
       name=$2, position_so=$3, position_en=$4, bio_so=$5, bio_en=$6,
       photo=$7, socials=$8, sort_order=$9, published=$10
     WHERE id=$1 RETURNING *`,
    [id, v.name, v.positionSo, v.positionEn, v.bioSo, v.bioEn, v.photo, v.socials, v.sortOrder, v.published],
  );
  return res.rows[0] ? mapLeader(res.rows[0]) : null;
}

/* ═══════════════════════ gallery ═══════════════════════ */

export interface GalleryRow {
  id: number;
  type: string;
  titleSo: string;
  titleEn: string;
  src: string;
  album: string | null;
  sortOrder: number;
  published: boolean;
}

export interface GalleryInput {
  type?: string;
  titleSo?: string;
  titleEn?: string;
  src?: string;
  album?: string | null;
  sortOrder?: number;
  published?: boolean;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function mapGallery(r: any): GalleryRow {
  return {
    id: r.id,
    type: r.type,
    titleSo: r.title_so,
    titleEn: r.title_en,
    src: r.src,
    album: r.album,
    sortOrder: r.sort_order,
    published: r.published,
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

function galleryValues(i: GalleryInput) {
  return {
    type: i.type === "video" ? "video" : "photo",
    titleSo: clean(i.titleSo, 200),
    titleEn: clean(i.titleEn, 200),
    src: clean(i.src, 500),
    album: clean(i.album, 120) || null,
    sortOrder: Math.max(0, Math.round(Number(i.sortOrder) || 0)),
    published: i.published !== false,
  };
}

export async function listGalleryAdmin(): Promise<GalleryRow[]> {
  await ensureSchema();
  const res = await getPool().query("SELECT * FROM site_gallery ORDER BY sort_order, id LIMIT 500");
  return res.rows.map(mapGallery);
}

export async function createGallery(input: GalleryInput): Promise<GalleryRow> {
  await ensureSchema();
  const v = galleryValues(input);
  const res = await getPool().query(
    `INSERT INTO site_gallery (type, title_so, title_en, src, album, sort_order, published)
     VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
    [v.type, v.titleSo, v.titleEn, v.src, v.album, v.sortOrder, v.published],
  );
  return mapGallery(res.rows[0]);
}

export async function updateGallery(id: number, input: GalleryInput): Promise<GalleryRow | null> {
  await ensureSchema();
  const v = galleryValues(input);
  const res = await getPool().query(
    `UPDATE site_gallery SET
       type=$2, title_so=$3, title_en=$4, src=$5, album=$6, sort_order=$7, published=$8
     WHERE id=$1 RETURNING *`,
    [id, v.type, v.titleSo, v.titleEn, v.src, v.album, v.sortOrder, v.published],
  );
  return res.rows[0] ? mapGallery(res.rows[0]) : null;
}

/* ═══════════════════════ messages ═══════════════════════ */

export interface MessageRow {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export async function listMessages(): Promise<MessageRow[]> {
  await ensureSchema();
  const res = await getPool().query(
    "SELECT * FROM site_messages ORDER BY is_read, created_at DESC LIMIT 300",
  );
  /* eslint-disable @typescript-eslint/no-explicit-any */
  return res.rows.map((r: any) => ({
    id: r.id,
    name: r.name,
    email: r.email,
    phone: r.phone,
    subject: r.subject,
    message: r.message,
    isRead: r.is_read,
    createdAt: r.created_at,
  }));
  /* eslint-enable @typescript-eslint/no-explicit-any */
}

export async function markMessageRead(id: number, read: boolean): Promise<boolean> {
  await ensureSchema();
  const res = await getPool().query("UPDATE site_messages SET is_read = $2 WHERE id = $1", [id, read]);
  return (res.rowCount ?? 0) > 0;
}

/** Stores a contact-form submission from the public website. */
export async function addMessage(m: {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
}): Promise<number> {
  await ensureSchema();
  const res = await getPool().query(
    `INSERT INTO site_messages (name, email, phone, subject, message)
     VALUES ($1,$2,$3,$4,$5) RETURNING id`,
    [
      clean(m.name, 160),
      clean(m.email, 254),
      clean(m.phone, 40) || null,
      clean(m.subject, 200) || null,
      clean(m.message, 5000),
    ],
  );
  return res.rows[0].id;
}

/* ═══════════════════════ testimonials ═══════════════════════ */

export interface TestimonialRow {
  id: number;
  name: string;
  roleSo: string;
  roleEn: string;
  quoteSo: string;
  quoteEn: string;
  avatar: string | null;
  rating: number;
  sortOrder: number;
  published: boolean;
}

export interface TestimonialInput {
  name?: string;
  roleSo?: string;
  roleEn?: string;
  quoteSo?: string;
  quoteEn?: string;
  avatar?: string | null;
  rating?: number;
  sortOrder?: number;
  published?: boolean;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function mapTestimonial(r: any): TestimonialRow {
  return {
    id: r.id,
    name: r.name,
    roleSo: r.role_so,
    roleEn: r.role_en,
    quoteSo: r.quote_so,
    quoteEn: r.quote_en,
    avatar: r.avatar,
    rating: Number(r.rating) || 5,
    sortOrder: r.sort_order,
    published: r.published,
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

function testimonialValues(i: TestimonialInput) {
  const rating = Math.round(Number(i.rating));
  return {
    name: clean(i.name, 160),
    roleSo: clean(i.roleSo, 160),
    roleEn: clean(i.roleEn, 160),
    quoteSo: clean(i.quoteSo, 1200),
    quoteEn: clean(i.quoteEn, 1200),
    avatar: clean(i.avatar, 500) || null,
    rating: Number.isFinite(rating) ? Math.max(1, Math.min(5, rating)) : 5,
    sortOrder: Math.max(0, Math.round(Number(i.sortOrder) || 0)),
    published: i.published !== false,
  };
}

export async function listTestimonialsAdmin(): Promise<TestimonialRow[]> {
  await ensureSchema();
  const res = await getPool().query(
    "SELECT * FROM site_testimonials ORDER BY sort_order, id LIMIT 200",
  );
  return res.rows.map(mapTestimonial);
}

export async function createTestimonial(input: TestimonialInput): Promise<TestimonialRow> {
  await ensureSchema();
  const v = testimonialValues(input);
  const res = await getPool().query(
    `INSERT INTO site_testimonials
       (name, role_so, role_en, quote_so, quote_en, avatar, rating, sort_order, published)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
    [v.name, v.roleSo, v.roleEn, v.quoteSo, v.quoteEn, v.avatar, v.rating, v.sortOrder, v.published],
  );
  return mapTestimonial(res.rows[0]);
}

export async function updateTestimonial(
  id: number,
  input: TestimonialInput,
): Promise<TestimonialRow | null> {
  await ensureSchema();
  const v = testimonialValues(input);
  const res = await getPool().query(
    `UPDATE site_testimonials SET
       name=$2, role_so=$3, role_en=$4, quote_so=$5, quote_en=$6,
       avatar=$7, rating=$8, sort_order=$9, published=$10
     WHERE id=$1 RETURNING *`,
    [id, v.name, v.roleSo, v.roleEn, v.quoteSo, v.quoteEn, v.avatar, v.rating, v.sortOrder, v.published],
  );
  return res.rows[0] ? mapTestimonial(res.rows[0]) : null;
}

/* ═══════════════════════ newsletter subscribers ═══════════════════════ */

export interface SubscriberRow {
  id: number;
  email: string;
  confirmed: boolean;
  createdAt: string;
}

export async function listSubscribers(): Promise<SubscriberRow[]> {
  await ensureSchema();
  const res = await getPool().query(
    "SELECT * FROM site_subscribers ORDER BY created_at DESC LIMIT 2000",
  );
  /* eslint-disable @typescript-eslint/no-explicit-any */
  return res.rows.map((r: any) => ({
    id: r.id,
    email: r.email,
    confirmed: r.confirmed,
    createdAt: r.created_at,
  }));
  /* eslint-enable @typescript-eslint/no-explicit-any */
}

/** Stores a newsletter sign-up. Re-subscribing is not an error. */
export async function addSubscriber(email: string): Promise<boolean> {
  await ensureSchema();
  const res = await getPool().query(
    `INSERT INTO site_subscribers (email) VALUES ($1)
     ON CONFLICT (email) DO NOTHING RETURNING id`,
    [clean(email, 254).toLowerCase()],
  );
  return (res.rowCount ?? 0) > 0;
}

/* ═══════════════════════ shared delete ═══════════════════════ */

export type DeletableTable =
  | "site_events"
  | "site_leaders"
  | "site_gallery"
  | "site_messages"
  | "site_testimonials"
  | "site_subscribers";

/** Table name is a closed union, so it can never come from user input. */
export async function deleteRow(table: DeletableTable, id: number): Promise<boolean> {
  await ensureSchema();
  const res = await getPool().query(`DELETE FROM ${table} WHERE id = $1`, [id]);
  return (res.rowCount ?? 0) > 0;
}
