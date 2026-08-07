import "server-only";
import { Pool } from "pg";
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

/**
 * The website's OWN database layer.
 *
 * Every table here is prefixed `site_` and belongs to this website alone. The
 * registration system's tables (`admins`, `registrations`, `cards`, `settings`,
 * `activity_log`) are NEVER read or written from here — they stay entirely
 * under that system's control.
 *
 * The only contact between the two systems is over HTTPS:
 *   - read  member totals  -> GET  <SYSTEM>/api/public/stats
 *   - write join requests  -> POST <SYSTEM>/api/register
 *
 * A website administrator therefore has no access to registration data, and a
 * registration-system administrator has no access to the website admin.
 */

let pool: Pool | null = null;
let ready: Promise<void> | null = null;

function connectionConfig() {
  const url = process.env.DATABASE_URL;
  if (url) {
    // Managed Postgres (Railway/Render/Neon) generally requires SSL; a local
    // or private-network host generally does not.
    const local = /localhost|127\.0\.0\.1|\.internal([:/]|$)/.test(url);
    return { connectionString: url, ssl: local ? undefined : { rejectUnauthorized: false } };
  }
  return {
    host: process.env.PGHOST || "localhost",
    port: Number(process.env.PGPORT || 5432),
    user: process.env.PGUSER || "postgres",
    password: process.env.PGPASSWORD || "",
    database: process.env.PGDATABASE || "hilaac",
  };
}

export function getPool(): Pool {
  if (!pool) pool = new Pool(connectionConfig());
  return pool;
}

/** True when a database is configured at all. */
export function hasDatabase(): boolean {
  return Boolean(process.env.DATABASE_URL || process.env.PGHOST || process.env.PGPASSWORD);
}

/* ───────────────────────────── schema ───────────────────────────── */

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS site_admins (
    id            TEXT PRIMARY KEY,
    email         TEXT UNIQUE NOT NULL,
    name          TEXT,
    password_hash TEXT NOT NULL,
    role          TEXT NOT NULL DEFAULT 'editor',
    last_seen     TIMESTAMPTZ,
    created_at    TIMESTAMPTZ DEFAULT now()
  );

  CREATE TABLE IF NOT EXISTS site_sessions (
    token      TEXT PRIMARY KEY,
    admin_id   TEXT NOT NULL REFERENCES site_admins(id) ON DELETE CASCADE,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
  );

  CREATE TABLE IF NOT EXISTS site_news (
    id           SERIAL PRIMARY KEY,
    slug         TEXT UNIQUE NOT NULL,
    title_so     TEXT NOT NULL DEFAULT '',
    title_en     TEXT NOT NULL DEFAULT '',
    excerpt_so   TEXT NOT NULL DEFAULT '',
    excerpt_en   TEXT NOT NULL DEFAULT '',
    body_so      TEXT NOT NULL DEFAULT '',
    body_en      TEXT NOT NULL DEFAULT '',
    cover        TEXT,
    category     TEXT,
    author       TEXT,
    featured     BOOLEAN NOT NULL DEFAULT FALSE,
    published    BOOLEAN NOT NULL DEFAULT TRUE,
    published_at TIMESTAMPTZ DEFAULT now(),
    updated_at   TIMESTAMPTZ DEFAULT now()
  );

  CREATE TABLE IF NOT EXISTS site_projects (
    id             SERIAL PRIMARY KEY,
    slug           TEXT UNIQUE NOT NULL,
    title_so       TEXT NOT NULL DEFAULT '',
    title_en       TEXT NOT NULL DEFAULT '',
    description_so TEXT NOT NULL DEFAULT '',
    description_en TEXT NOT NULL DEFAULT '',
    cover          TEXT,
    status         TEXT NOT NULL DEFAULT 'planned',
    progress       INTEGER NOT NULL DEFAULT 0,
    budget         NUMERIC(14,2),
    currency       TEXT NOT NULL DEFAULT 'USD',
    start_date     DATE,
    end_date       DATE,
    location       TEXT,
    published      BOOLEAN NOT NULL DEFAULT TRUE,
    updated_at     TIMESTAMPTZ DEFAULT now()
  );

  CREATE TABLE IF NOT EXISTS site_events (
    id             SERIAL PRIMARY KEY,
    slug           TEXT UNIQUE NOT NULL,
    title_so       TEXT NOT NULL DEFAULT '',
    title_en       TEXT NOT NULL DEFAULT '',
    description_so TEXT NOT NULL DEFAULT '',
    description_en TEXT NOT NULL DEFAULT '',
    cover          TEXT,
    starts_at      TIMESTAMPTZ NOT NULL,
    ends_at        TIMESTAMPTZ,
    location_so    TEXT NOT NULL DEFAULT '',
    location_en    TEXT NOT NULL DEFAULT '',
    capacity       INTEGER,
    published      BOOLEAN NOT NULL DEFAULT TRUE,
    updated_at     TIMESTAMPTZ DEFAULT now()
  );

  CREATE TABLE IF NOT EXISTS site_leaders (
    id          SERIAL PRIMARY KEY,
    name        TEXT NOT NULL,
    position_so TEXT NOT NULL DEFAULT '',
    position_en TEXT NOT NULL DEFAULT '',
    bio_so      TEXT NOT NULL DEFAULT '',
    bio_en      TEXT NOT NULL DEFAULT '',
    photo       TEXT,
    socials     TEXT NOT NULL DEFAULT '{}',
    sort_order  INTEGER NOT NULL DEFAULT 0,
    published   BOOLEAN NOT NULL DEFAULT TRUE
  );

  CREATE TABLE IF NOT EXISTS site_gallery (
    id         SERIAL PRIMARY KEY,
    type       TEXT NOT NULL DEFAULT 'photo',
    title_so   TEXT NOT NULL DEFAULT '',
    title_en   TEXT NOT NULL DEFAULT '',
    src        TEXT NOT NULL,
    album      TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    published  BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT now()
  );

  CREATE TABLE IF NOT EXISTS site_settings (
    id      INTEGER PRIMARY KEY DEFAULT 1,
    data    TEXT NOT NULL DEFAULT '{}',
    updated_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT site_settings_singleton CHECK (id = 1)
  );
  INSERT INTO site_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

  CREATE TABLE IF NOT EXISTS site_messages (
    id         SERIAL PRIMARY KEY,
    name       TEXT NOT NULL,
    email      TEXT NOT NULL,
    phone      TEXT,
    subject    TEXT,
    message    TEXT NOT NULL,
    is_read    BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT now()
  );

  CREATE INDEX IF NOT EXISTS idx_site_news_pub ON site_news (published, published_at DESC);
  CREATE INDEX IF NOT EXISTS idx_site_proj_pub ON site_projects (published, status);
  CREATE INDEX IF NOT EXISTS idx_site_evt_pub  ON site_events (published, starts_at DESC);
  CREATE INDEX IF NOT EXISTS idx_site_sess_exp ON site_sessions (expires_at);
`;

/** Creates the site_* tables once per process. Never touches other tables. */
export function ensureSchema(): Promise<void> {
  if (!ready) {
    ready = getPool()
      .query(SCHEMA)
      .then(() => undefined)
      .catch((err) => {
        // Let the next call retry rather than caching a failure forever.
        ready = null;
        throw err;
      });
  }
  return ready;
}

/* ───────────────────────── password hashing ───────────────────────── */

/** scrypt with a per-password salt, stored as `salt:hash`. */
export function hashPassword(password: string, salt = randomBytes(16).toString("hex")): string {
  return `${salt}:${scryptSync(password, salt, 32).toString("hex")}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, expected] = String(stored || "").split(":");
  if (!salt || !expected) return false;
  const actual = scryptSync(password, salt, 32).toString("hex");
  const a = Buffer.from(actual, "hex");
  const b = Buffer.from(expected, "hex");
  // Constant-time compare so a wrong password can't be narrowed by timing.
  return a.length === b.length && timingSafeEqual(a, b);
}

export function newId(): string {
  return randomBytes(6).toString("hex");
}
