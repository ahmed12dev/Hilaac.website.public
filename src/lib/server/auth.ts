import "server-only";
import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import {
  ensureSchema,
  getPool,
  hashPassword,
  newId,
  verifyPassword,
} from "./db";

/**
 * Authentication for the WEBSITE's own admin.
 *
 * Entirely separate from the registration system: accounts live in
 * `site_admins`, sessions in `site_sessions`. The registration system's
 * `admins` table is never consulted, so its administrators cannot sign in
 * here, and website administrators cannot reach registration data.
 */

export const SESSION_COOKIE = "hilaac_site_session";
const SESSION_DAYS = 7;

export interface SiteAdmin {
  id: string;
  email: string;
  name: string | null;
  role: string;
}

/**
 * Creates the first administrator from SITE_ADMIN_EMAIL / SITE_ADMIN_PASSWORD
 * when no account exists yet, so a fresh deployment can be signed into.
 * Does nothing once any account exists — it will never overwrite a password.
 */
export async function bootstrapFirstAdmin(): Promise<void> {
  const email = (process.env.SITE_ADMIN_EMAIL || "").trim().toLowerCase();
  const password = process.env.SITE_ADMIN_PASSWORD || "";
  if (!email || password.length < 8) return;

  await ensureSchema();
  const pool = getPool();

  const existing = await pool.query("SELECT count(*)::int AS n FROM site_admins");
  if (existing.rows[0].n > 0) return;

  await pool.query(
    `INSERT INTO site_admins (id, email, name, password_hash, role)
     VALUES ($1, $2, $3, $4, 'owner')
     ON CONFLICT (email) DO NOTHING`,
    [newId(), email, "Site Administrator", hashPassword(password)],
  );
}

/** Verifies credentials and issues a session. Returns null when they're wrong. */
export async function signIn(
  email: string,
  password: string,
): Promise<{ token: string; admin: SiteAdmin } | null> {
  await ensureSchema();
  await bootstrapFirstAdmin();
  const pool = getPool();

  const res = await pool.query(
    "SELECT id, email, name, role, password_hash FROM site_admins WHERE email = $1",
    [email.trim().toLowerCase()],
  );
  const row = res.rows[0];
  if (!row || !verifyPassword(password, row.password_hash)) return null;

  const token = randomBytes(32).toString("hex");
  await pool.query(
    `INSERT INTO site_sessions (token, admin_id, expires_at)
     VALUES ($1, $2, now() + ($3 || ' days')::interval)`,
    [token, row.id, String(SESSION_DAYS)],
  );

  // Opportunistically drop expired sessions; cheap and keeps the table small.
  pool.query("DELETE FROM site_sessions WHERE expires_at < now()").catch(() => undefined);
  pool.query("UPDATE site_admins SET last_seen = now() WHERE id = $1", [row.id]).catch(() => undefined);

  return {
    token,
    admin: { id: row.id, email: row.email, name: row.name, role: row.role },
  };
}

/** Resolves the signed-in website administrator, or null. */
export async function currentAdmin(): Promise<SiteAdmin | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  try {
    await ensureSchema();
    const res = await getPool().query(
      `SELECT a.id, a.email, a.name, a.role
         FROM site_sessions s
         JOIN site_admins a ON a.id = s.admin_id
        WHERE s.token = $1 AND s.expires_at > now()`,
      [token],
    );
    return res.rows[0] ?? null;
  } catch {
    return null;
  }
}

export async function signOut(): Promise<void> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) {
    await getPool()
      .query("DELETE FROM site_sessions WHERE token = $1", [token])
      .catch(() => undefined);
  }
}

/** Cookie options: httpOnly so client JavaScript can never read the session. */
export function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  };
}
