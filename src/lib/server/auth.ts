import "server-only";
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import {
  ensureSchema,
  getPool,
  hasDatabase,
  hashPassword,
  newId,
  verifyPassword,
} from "./db";

/**
 * Authentication for the WEBSITE's own admin.
 *
 * Accounts live in `site_admins`. There are no credentials in this file —
 * the first account is seeded from SITE_ADMIN_EMAIL / SITE_ADMIN_PASSWORD and
 * everything after that is created from the dashboard. A password has never
 * belonged in a public repository.
 */

export const SESSION_COOKIE = "hilaac_site_session";
const SESSION_DAYS = 7;

export type AdminRole = "owner" | "editor";

export const ADMIN_ROLES: AdminRole[] = ["owner", "editor"];

export interface SiteAdmin {
  id: string;
  email: string;
  name: string | null;
  role: AdminRole;
}

/**
 * Secret used to sign the standalone (no-database) session token.
 *
 * Falls back to the admin password rather than a literal, so a token can never
 * be forged from what is published in this repository. When neither is set the
 * standalone path is disabled entirely.
 */
function authSecret(): string | null {
  return process.env.AUTH_SECRET || process.env.SITE_ADMIN_PASSWORD || null;
}

/** Seed credentials, or null when the environment has not supplied them. */
function seedCredentials(): { email: string; password: string } | null {
  const email = (process.env.SITE_ADMIN_EMAIL || "").trim().toLowerCase();
  const password = process.env.SITE_ADMIN_PASSWORD || "";
  if (!email || !password) return null;
  return { email, password };
}

function normaliseRole(value: unknown): AdminRole {
  return value === "owner" ? "owner" : "editor";
}

/** Constant-time string compare, so a wrong password leaks nothing by timing. */
function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  return bufA.length === bufB.length && timingSafeEqual(bufA, bufB);
}

/* ───────────────────── standalone session token ───────────────────── */

function signSessionToken(adminId: string, email: string): string | null {
  const secret = authSecret();
  if (!secret) return null;
  const expiry = Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000;
  const payload = `${adminId}:${email}:${expiry}`;
  const signature = createHmac("sha256", secret).update(payload).digest("hex");
  return `std_${Buffer.from(payload).toString("base64url")}.${signature}`;
}

function verifySessionToken(token: string): { id: string; email: string } | null {
  const secret = authSecret();
  if (!secret || !token.startsWith("std_")) return null;
  try {
    const [payloadB64, signature] = token.slice(4).split(".");
    if (!payloadB64 || !signature) return null;

    const payload = Buffer.from(payloadB64, "base64url").toString("utf-8");
    const expected = createHmac("sha256", secret).update(payload).digest("hex");
    if (!safeEqual(signature, expected)) return null;

    const [id, email, expiryStr] = payload.split(":");
    if (!id || !email || !expiryStr) return null;
    if (Date.now() > Number(expiryStr)) return null;

    return { id, email };
  } catch {
    return null;
  }
}

/* ───────────────────────────── bootstrap ───────────────────────────── */

/** Creates the seed administrator when no account exists yet. */
export async function bootstrapFirstAdmin(): Promise<void> {
  const seed = seedCredentials();
  if (!seed || !hasDatabase()) return;

  try {
    await ensureSchema();
    const pool = getPool();
    const existing = await pool.query("SELECT count(*)::int AS n FROM site_admins");
    if (existing.rows[0]?.n > 0) return;

    await pool.query(
      `INSERT INTO site_admins (id, email, name, password_hash, role)
       VALUES ($1, $2, $3, $4, 'owner')
       ON CONFLICT (email) DO NOTHING`,
      [newId(), seed.email, "Lead Administrator", hashPassword(seed.password)],
    );
  } catch {
    // Database may be unreachable; the standalone path below still works.
  }
}

/* ───────────────────────────── sign in / out ───────────────────────────── */

export async function signIn(
  emailInput: string,
  passwordInput: string,
): Promise<{ token: string; admin: SiteAdmin } | null> {
  const email = emailInput.trim().toLowerCase();
  const password = passwordInput;

  if (hasDatabase()) {
    try {
      await ensureSchema();
      await bootstrapFirstAdmin();
      const pool = getPool();

      const res = await pool.query(
        "SELECT id, email, name, role, password_hash FROM site_admins WHERE email = $1",
        [email],
      );
      const row = res.rows[0];

      if (row && verifyPassword(password, row.password_hash)) {
        const token = randomBytes(32).toString("hex");
        await pool.query(
          `INSERT INTO site_sessions (token, admin_id, expires_at)
           VALUES ($1, $2, now() + ($3 || ' days')::interval)`,
          [token, row.id, String(SESSION_DAYS)],
        );
        pool.query("DELETE FROM site_sessions WHERE expires_at < now()").catch(() => undefined);
        pool
          .query("UPDATE site_admins SET last_seen = now() WHERE id = $1", [row.id])
          .catch(() => undefined);

        return {
          token,
          admin: {
            id: row.id,
            email: row.email,
            name: row.name,
            role: normaliseRole(row.role),
          },
        };
      }

      // The account exists in the database and the password did not match.
      // Do not fall through to the seed credentials in that case.
      if (row) return null;
    } catch {
      // Database unreachable — fall through to the standalone seed check.
    }
  }

  // Standalone mode: the seed account can sign in without a database, so the
  // dashboard stays reachable if PostgreSQL is down.
  const seed = seedCredentials();
  if (seed && safeEqual(email, seed.email) && safeEqual(password, seed.password)) {
    const admin: SiteAdmin = {
      id: "seed-owner",
      email: seed.email,
      name: "Lead Administrator",
      role: "owner",
    };
    const token = signSessionToken(admin.id, admin.email);
    if (token) return { token, admin };
  }

  return null;
}

/** Resolves the signed-in website administrator, or null. */
export async function currentAdmin(): Promise<SiteAdmin | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const standalone = verifySessionToken(token);
  if (standalone) {
    const seed = seedCredentials();
    return {
      id: standalone.id,
      email: standalone.email || seed?.email || "",
      name: "Lead Administrator",
      role: "owner",
    };
  }

  if (hasDatabase()) {
    try {
      await ensureSchema();
      const res = await getPool().query(
        `SELECT a.id, a.email, a.name, a.role
           FROM site_sessions s
           JOIN site_admins a ON a.id = s.admin_id
          WHERE s.token = $1 AND s.expires_at > now()`,
        [token],
      );
      const row = res.rows[0];
      if (!row) return null;
      return { id: row.id, email: row.email, name: row.name, role: normaliseRole(row.role) };
    } catch {
      return null;
    }
  }

  return null;
}

export async function signOut(): Promise<void> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token && hasDatabase() && !token.startsWith("std_")) {
    try {
      await getPool().query("DELETE FROM site_sessions WHERE token = $1", [token]);
    } catch {
      // ignore
    }
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

/* ═════════════════════ administrator accounts ═════════════════════ */

export interface AdminAccount {
  id: string;
  email: string;
  name: string | null;
  role: AdminRole;
  lastSeen: string | null;
  createdAt: string;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function mapAdmin(r: any): AdminAccount {
  return {
    id: r.id,
    email: r.email,
    name: r.name,
    role: normaliseRole(r.role),
    lastSeen: r.last_seen,
    createdAt: r.created_at,
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export async function listAdmins(): Promise<AdminAccount[]> {
  await ensureSchema();
  const res = await getPool().query(
    "SELECT id, email, name, role, last_seen, created_at FROM site_admins ORDER BY created_at LIMIT 100",
  );
  return res.rows.map(mapAdmin);
}

export async function createAdmin(input: {
  email: string;
  name?: string;
  password: string;
  role?: string;
}): Promise<AdminAccount | { error: string }> {
  await ensureSchema();
  const email = String(input.email || "").trim().toLowerCase();
  const password = String(input.password || "");

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "A valid email is required." };
  if (password.length < 8) return { error: "Password must be at least 8 characters." };

  try {
    const res = await getPool().query(
      `INSERT INTO site_admins (id, email, name, password_hash, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, email, name, role, last_seen, created_at`,
      [
        newId(),
        email,
        String(input.name || "").trim().slice(0, 120) || null,
        hashPassword(password),
        normaliseRole(input.role),
      ],
    );
    return mapAdmin(res.rows[0]);
  } catch {
    return { error: "That email already has an account." };
  }
}

/**
 * Owner-level edit of any account, including the owner's own.
 *
 * An owner is already authenticated, so they may set an email or password
 * outright without re-entering the old one. `keepSessionToken` is the session
 * doing the editing: every OTHER session for that account is signed out after
 * a password change, but the editor is not thrown out of their own dashboard.
 */
export async function updateAdmin(
  id: string,
  input: { name?: string; email?: string; role?: string; password?: string },
  keepSessionToken?: string,
): Promise<AdminAccount | { error: string }> {
  await ensureSchema();

  const password = String(input.password || "");
  if (password && password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  let email: string | null = null;
  if (input.email !== undefined) {
    email = String(input.email).trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return { error: "That is not a valid email address." };
    }
    // Postgres would raise a unique violation; this gives a clearer message.
    const taken = await getPool().query(
      "SELECT 1 FROM site_admins WHERE email = $1 AND id <> $2",
      [email, id],
    );
    if (taken.rowCount) return { error: "Another account already uses that email." };
  }

  const pool = getPool();
  let res;
  try {
    res = await pool.query(
      `UPDATE site_admins SET
         name = COALESCE($2, name),
         email = COALESCE($3, email),
         role = COALESCE($4, role),
         password_hash = COALESCE($5, password_hash)
       WHERE id = $1
       RETURNING id, email, name, role, last_seen, created_at`,
      [
        id,
        input.name === undefined ? null : String(input.name).trim().slice(0, 120),
        email,
        input.role === undefined ? null : normaliseRole(input.role),
        password ? hashPassword(password) : null,
      ],
    );
  } catch {
    return { error: "That email is already in use." };
  }

  if (!res.rows[0]) return { error: "Account not found." };

  // A new password invalidates sessions on other devices.
  if (password) {
    await pool
      .query(
        `DELETE FROM site_sessions
          WHERE admin_id = $1 AND ($2::text IS NULL OR token <> $2)`,
        [id, keepSessionToken ?? null],
      )
      .catch(() => undefined);
  }

  return mapAdmin(res.rows[0]);
}

export async function deleteAdmin(id: string): Promise<{ ok: true } | { error: string }> {
  await ensureSchema();
  const pool = getPool();

  // Never leave the site without an owner who can manage accounts.
  const owners = await pool.query(
    "SELECT count(*)::int AS n FROM site_admins WHERE role = 'owner' AND id <> $1",
    [id],
  );
  if ((owners.rows[0]?.n ?? 0) === 0) {
    return { error: "This is the last owner account — it cannot be removed." };
  }

  const res = await pool.query("DELETE FROM site_admins WHERE id = $1", [id]);
  return (res.rowCount ?? 0) > 0 ? { ok: true } : { error: "Account not found." };
}

/** Password change for the signed-in administrator. */
export async function changeOwnPassword(
  admin: SiteAdmin,
  currentPassword: string,
  nextPassword: string,
): Promise<{ ok: true } | { error: string }> {
  if (String(nextPassword || "").length < 8) {
    return { error: "New password must be at least 8 characters." };
  }
  if (!hasDatabase()) {
    return { error: "A database is required to change your password." };
  }

  await ensureSchema();
  const pool = getPool();
  const res = await pool.query("SELECT password_hash FROM site_admins WHERE id = $1", [admin.id]);
  const row = res.rows[0];
  if (!row) {
    return { error: "This session is not backed by a stored account." };
  }
  if (!verifyPassword(currentPassword, row.password_hash)) {
    return { error: "Your current password is not correct." };
  }

  await pool.query("UPDATE site_admins SET password_hash = $2 WHERE id = $1", [
    admin.id,
    hashPassword(nextPassword),
  ]);
  // Sign every other device out after a password change.
  await pool.query("DELETE FROM site_sessions WHERE admin_id = $1", [admin.id]).catch(() => undefined);
  return { ok: true };
}
