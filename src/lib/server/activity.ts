import "server-only";
import { ensureSchema, getPool } from "./db";
import type { SiteAdmin } from "./auth";

/**
 * Audit trail for the admin dashboard.
 *
 * Every create/update/delete records who did it and when, so the Analytics
 * screen can show real activity rather than a guess. Logging must never break
 * the operation it is describing, so every write here swallows its own errors.
 */

export type ActivityAction = "create" | "update" | "delete" | "login" | "upload" | "settings";

export interface ActivityRow {
  id: number;
  adminId: string | null;
  adminName: string;
  action: ActivityAction;
  entity: string;
  entityId: string | null;
  summary: string;
  createdAt: string;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function mapActivity(r: any): ActivityRow {
  return {
    id: r.id,
    adminId: r.admin_id,
    adminName: r.admin_name,
    action: r.action,
    entity: r.entity,
    entityId: r.entity_id,
    summary: r.summary,
    createdAt: r.created_at,
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

/** Records one admin action. Never throws — a failed log is not a failed edit. */
export async function logActivity(
  admin: SiteAdmin | null,
  action: ActivityAction,
  entity: string,
  summary: string,
  entityId?: string | number | null,
): Promise<void> {
  try {
    await ensureSchema();
    await getPool().query(
      `INSERT INTO site_activity (admin_id, admin_name, action, entity, entity_id, summary)
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [
        admin?.id ?? null,
        (admin?.name || admin?.email || "system").slice(0, 160),
        action,
        entity.slice(0, 40),
        entityId === null || entityId === undefined ? null : String(entityId).slice(0, 40),
        summary.slice(0, 400),
      ],
    );
  } catch {
    // Logging is best-effort by design.
  }
}

export async function listActivity(limit = 60): Promise<ActivityRow[]> {
  await ensureSchema();
  const res = await getPool().query(
    "SELECT * FROM site_activity ORDER BY created_at DESC LIMIT $1",
    [Math.min(Math.max(limit, 1), 200)],
  );
  return res.rows.map(mapActivity);
}

/** Trims the log so it cannot grow without limit. */
export async function pruneActivity(keep = 2000): Promise<void> {
  try {
    await ensureSchema();
    await getPool().query(
      `DELETE FROM site_activity
        WHERE id < (SELECT min(id) FROM (
          SELECT id FROM site_activity ORDER BY id DESC LIMIT $1
        ) AS recent)`,
      [keep],
    );
  } catch {
    // best effort
  }
}

/* ═══════════════════════ analytics ═══════════════════════ */

export interface DayCount {
  day: string;
  count: number;
}

export interface AnalyticsSnapshot {
  members: { total: number; verified: number; active: number; pending: number };
  memberGrowth: DayCount[];
  membersByRegion: { region: string; count: number }[];
  content: { news: number; projects: number; events: number; leaders: number; gallery: number };
  newsByMonth: DayCount[];
  messages: { total: number; unread: number };
  messagesByDay: DayCount[];
  subscribers: number;
  mediaCount: number;
  mediaBytes: number;
  recentActivity: ActivityRow[];
}

/** Fills gaps so a chart always has one point per day across the window. */
function fillDays(rows: DayCount[], days: number): DayCount[] {
  const byDay = new Map(rows.map((r) => [r.day, r.count]));
  const out: DayCount[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setUTCHours(0, 0, 0, 0);
    date.setUTCDate(date.getUTCDate() - i);
    const key = date.toISOString().slice(0, 10);
    out.push({ day: key, count: byDay.get(key) ?? 0 });
  }
  return out;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export async function analyticsSnapshot(days = 30): Promise<AnalyticsSnapshot> {
  await ensureSchema();
  const pool = getPool();
  const window = Math.min(Math.max(days, 7), 90);

  const [totals, growth, byRegion, newsMonths, msgDays, activity] = await Promise.all([
    pool.query(`
      SELECT
        (SELECT count(*)::int FROM site_members)                          AS members,
        (SELECT count(*)::int FROM site_members WHERE status='verified')  AS verified,
        (SELECT count(*)::int FROM site_members WHERE status='active')    AS active,
        (SELECT count(*)::int FROM site_members WHERE status='pending')   AS pending,
        (SELECT count(*)::int FROM site_news)                             AS news,
        (SELECT count(*)::int FROM site_projects)                         AS projects,
        (SELECT count(*)::int FROM site_events)                           AS events,
        (SELECT count(*)::int FROM site_leaders)                          AS leaders,
        (SELECT count(*)::int FROM site_gallery)                          AS gallery,
        (SELECT count(*)::int FROM site_messages)                         AS messages,
        (SELECT count(*)::int FROM site_messages WHERE NOT is_read)       AS unread,
        (SELECT count(*)::int FROM site_subscribers)                      AS subscribers,
        (SELECT count(*)::int FROM site_media)                            AS media_count,
        (SELECT CAST(COALESCE(sum(bytes), 0) AS bigint) FROM site_media)  AS media_bytes
    `),
    pool.query(
      `SELECT to_char(date_trunc('day', created_at), 'YYYY-MM-DD') AS day, count(*)::int AS count
         FROM site_members
        WHERE created_at > now() - ($1 || ' days')::interval
        GROUP BY 1 ORDER BY 1`,
      [String(window)],
    ),
    pool.query(`
      SELECT COALESCE(NULLIF(region, ''), 'Unspecified') AS region, count(*)::int AS count
        FROM site_members GROUP BY 1 ORDER BY count DESC LIMIT 12
    `),
    pool.query(`
      SELECT to_char(date_trunc('month', published_at), 'YYYY-MM') AS day, count(*)::int AS count
        FROM site_news
       WHERE published_at > now() - interval '12 months'
       GROUP BY 1 ORDER BY 1
    `),
    pool.query(
      `SELECT to_char(date_trunc('day', created_at), 'YYYY-MM-DD') AS day, count(*)::int AS count
         FROM site_messages
        WHERE created_at > now() - ($1 || ' days')::interval
        GROUP BY 1 ORDER BY 1`,
      [String(window)],
    ),
    listActivity(12).catch(() => [] as ActivityRow[]),
  ]);

  const t = totals.rows[0];

  return {
    members: {
      total: t.members,
      verified: t.verified,
      active: t.active,
      pending: t.pending,
    },
    memberGrowth: fillDays(growth.rows as DayCount[], window),
    membersByRegion: byRegion.rows as { region: string; count: number }[],
    content: {
      news: t.news,
      projects: t.projects,
      events: t.events,
      leaders: t.leaders,
      gallery: t.gallery,
    },
    newsByMonth: (newsMonths.rows as DayCount[]).map((r) => ({ day: r.day, count: r.count })),
    messages: { total: t.messages, unread: t.unread },
    messagesByDay: fillDays(msgDays.rows as DayCount[], window),
    subscribers: t.subscribers,
    mediaCount: t.media_count,
    mediaBytes: Number(t.media_bytes) || 0,
    recentActivity: activity,
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */
