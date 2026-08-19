import "server-only";
import { ensureSchema, getPool, newId } from "./db";

/**
 * Media library.
 *
 * Railway containers have no persistent disk — anything written to the
 * filesystem disappears on the next deploy — so uploads are stored as bytes in
 * PostgreSQL and served back through /api/media/:id with a long cache header.
 */

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5 MB

export const ALLOWED_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
};

// SVG is deliberately absent: it can carry script, and these files are served
// from this site's own origin.

export interface MediaRow {
  id: string;
  filename: string;
  mime: string;
  bytes: number;
  alt: string;
  folder: string;
  url: string;
  createdBy: string | null;
  createdAt: string;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function mapMedia(r: any): MediaRow {
  return {
    id: r.id,
    filename: r.filename,
    mime: r.mime,
    bytes: r.bytes,
    alt: r.alt,
    folder: r.folder,
    url: `/api/media/${r.id}`,
    createdBy: r.created_by,
    createdAt: r.created_at,
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

function clean(value: unknown, max: number): string {
  return String(value ?? "").trim().slice(0, max);
}

/** Keeps a user-supplied filename safe to echo back into a header. */
function safeFilename(name: string, mime: string): string {
  const base = clean(name, 120).replace(/[^\w.\- ]+/g, "_").replace(/^\.+/, "") || "upload";
  if (/\.[a-z0-9]{2,5}$/i.test(base)) return base;
  const ext = ALLOWED_MIME[mime] ?? "bin";
  return `${base}.${ext}`;
}

export async function listMedia(folder?: string): Promise<MediaRow[]> {
  await ensureSchema();
  const args: unknown[] = [];
  let where = "";
  const scope = clean(folder, 60);
  if (scope && scope !== "all") {
    args.push(scope);
    where = "WHERE folder = $1";
  }
  const res = await getPool().query(
    `SELECT id, filename, mime, bytes, alt, folder, created_by, created_at
       FROM site_media ${where} ORDER BY created_at DESC LIMIT 500`,
    args,
  );
  return res.rows.map(mapMedia);
}

export async function saveMedia(input: {
  filename: string;
  mime: string;
  data: Buffer;
  alt?: string;
  folder?: string;
  createdBy?: string | null;
}): Promise<MediaRow | { error: string }> {
  if (!ALLOWED_MIME[input.mime]) {
    return { error: "Only JPG, PNG, WebP, GIF and AVIF images can be uploaded." };
  }
  if (!input.data.length) return { error: "That file is empty." };
  if (input.data.length > MAX_UPLOAD_BYTES) {
    return { error: `Images must be ${Math.round(MAX_UPLOAD_BYTES / 1024 / 1024)} MB or smaller.` };
  }

  await ensureSchema();
  const res = await getPool().query(
    `INSERT INTO site_media (id, filename, mime, bytes, alt, folder, data, created_by)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
     RETURNING id, filename, mime, bytes, alt, folder, created_by, created_at`,
    [
      newId(),
      safeFilename(input.filename, input.mime),
      input.mime,
      input.data.length,
      clean(input.alt, 300),
      clean(input.folder, 60) || "general",
      input.data,
      input.createdBy ?? null,
    ],
  );
  return mapMedia(res.rows[0]);
}

export async function updateMedia(
  id: string,
  input: { alt?: string; folder?: string },
): Promise<MediaRow | null> {
  await ensureSchema();
  const res = await getPool().query(
    `UPDATE site_media SET
       alt = COALESCE($2, alt),
       folder = COALESCE(NULLIF($3, ''), folder)
     WHERE id = $1
     RETURNING id, filename, mime, bytes, alt, folder, created_by, created_at`,
    [
      id,
      input.alt === undefined ? null : clean(input.alt, 300),
      clean(input.folder, 60),
    ],
  );
  return res.rows[0] ? mapMedia(res.rows[0]) : null;
}

export async function deleteMedia(id: string): Promise<boolean> {
  await ensureSchema();
  const res = await getPool().query("DELETE FROM site_media WHERE id = $1", [id]);
  return (res.rowCount ?? 0) > 0;
}

/** Raw bytes for /api/media/:id. */
export async function readMedia(
  id: string,
): Promise<{ data: Buffer; mime: string; filename: string } | null> {
  await ensureSchema();
  const res = await getPool().query(
    "SELECT data, mime, filename FROM site_media WHERE id = $1",
    [clean(id, 40)],
  );
  const row = res.rows[0];
  if (!row) return null;
  return { data: row.data as Buffer, mime: row.mime, filename: row.filename };
}

export async function mediaFolders(): Promise<string[]> {
  await ensureSchema();
  const res = await getPool().query(
    "SELECT DISTINCT folder FROM site_media ORDER BY folder LIMIT 50",
  );
  return res.rows.map((r: { folder: string }) => r.folder);
}
