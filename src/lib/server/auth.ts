import "server-only";
import { createHmac, randomBytes } from "node:crypto";
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
 * Accounts live in `site_admins` when PostgreSQL is connected.
 * In standalone or fallback mode, authentication falls back to verified master credentials.
 */

export const SESSION_COOKIE = "hilaac_site_session";
const SESSION_DAYS = 7;
const AUTH_SECRET = process.env.AUTH_SECRET || "xisbiga-hilaac-admin-secure-auth-secret-key-2026";

export interface SiteAdmin {
  id: string;
  email: string;
  name: string | null;
  role: string;
}

const DEFAULT_MASTER_EMAIL = "devahmed12a@gmail.com";
const DEFAULT_MASTER_PASSWORD = "KHAdar1234k@";

function getMasterCredentials() {
  const email = (process.env.SITE_ADMIN_EMAIL || DEFAULT_MASTER_EMAIL).trim().toLowerCase();
  const password = process.env.SITE_ADMIN_PASSWORD || DEFAULT_MASTER_PASSWORD;
  return { email, password };
}

function signSessionToken(adminId: string, email: string): string {
  const expiry = Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000;
  const payload = `${adminId}:${email}:${expiry}`;
  const signature = createHmac("sha256", AUTH_SECRET).update(payload).digest("hex");
  return `std_${Buffer.from(payload).toString("base64url")}.${signature}`;
}

function verifySessionToken(token: string): { id: string; email: string } | null {
  if (!token.startsWith("std_")) return null;
  try {
    const raw = token.slice(4);
    const [payloadB64, signature] = raw.split(".");
    if (!payloadB64 || !signature) return null;
    const payload = Buffer.from(payloadB64, "base64url").toString("utf-8");
    const expectedSig = createHmac("sha256", AUTH_SECRET).update(payload).digest("hex");
    if (signature !== expectedSig) return null;

    const [id, email, expiryStr] = payload.split(":");
    if (!id || !email || !expiryStr) return null;
    if (Date.now() > Number(expiryStr)) return null;

    return { id, email };
  } catch {
    return null;
  }
}

/**
 * Creates the master administrator when no account exists yet.
 */
export async function bootstrapFirstAdmin(): Promise<void> {
  const { email, password } = getMasterCredentials();
  if (!hasDatabase()) return;

  try {
    await ensureSchema();
    const pool = getPool();
    const existing = await pool.query("SELECT count(*)::int AS n FROM site_admins");
    if (existing.rows[0]?.n > 0) return;

    await pool.query(
      `INSERT INTO site_admins (id, email, name, password_hash, role)
       VALUES ($1, $2, $3, $4, 'owner')
       ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash`,
      [newId(), email, "Ahmed Ali (Lead Admin)", hashPassword(password)],
    );
  } catch {
    // Database may be unreachable; standalone credentials will handle auth.
  }
}

/** Verifies credentials and issues a session. */
export async function signIn(
  emailInput: string,
  passwordInput: string,
): Promise<{ token: string; admin: SiteAdmin } | null> {
  const email = emailInput.trim().toLowerCase();
  const password = passwordInput;
  const { email: masterEmail, password: masterPassword } = getMasterCredentials();

  // Check master credentials match
  const isMaster = email === masterEmail && password === masterPassword;

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
        pool.query("UPDATE site_admins SET last_seen = now() WHERE id = $1", [row.id]).catch(() => undefined);

        return {
          token,
          admin: { id: row.id, email: row.email, name: row.name, role: row.role },
        };
      }
    } catch {
      // Fall through to standalone master check if DB fails
    }
  }

  if (isMaster) {
    const admin: SiteAdmin = {
      id: "admin-lead",
      email: masterEmail,
      name: "Ahmed Ali (Lead Admin)",
      role: "owner",
    };
    const token = signSessionToken(admin.id, admin.email);
    return { token, admin };
  }

  return null;
}

/** Resolves the signed-in website administrator, or null. */
export async function currentAdmin(): Promise<SiteAdmin | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  // Check standalone signed token
  const verified = verifySessionToken(token);
  if (verified) {
    const { email: masterEmail } = getMasterCredentials();
    return {
      id: verified.id,
      email: verified.email || masterEmail,
      name: "Ahmed Ali (Lead Admin)",
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
      return res.rows[0] ?? null;
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
