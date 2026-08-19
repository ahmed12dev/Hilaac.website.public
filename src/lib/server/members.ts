import "server-only";
import { ensureSchema, getPool } from "./db";

/**
 * The website's own member registry.
 *
 * Records live in `site_members` — a real table, so a member added here is
 * still here after a redeploy. This is separate from the registration
 * system's own database, which this app never reads or writes.
 */

export const MEMBER_STATUSES = ["pending", "active", "verified"] as const;
export type MemberStatus = (typeof MEMBER_STATUSES)[number];

export const MEMBER_REGIONS = [
  "Banaadir",
  "Galmudug",
  "Puntland",
  "Hirshabelle",
  "South West",
  "Jubaland",
  "Somaliland",
  "Diaspora",
] as const;

export interface MemberRow {
  id: number;
  membershipNumber: string;
  fullName: string;
  phone: string;
  email: string;
  region: string;
  district: string;
  gender: string;
  status: MemberStatus;
  note: string;
  source: string;
  createdAt: string;
  updatedAt: string;
}

export interface MemberInput {
  membershipNumber?: string;
  fullName?: string;
  phone?: string;
  email?: string;
  region?: string;
  district?: string;
  gender?: string;
  status?: string;
  note?: string;
  source?: string;
}

export interface MemberStats {
  total: number;
  verified: number;
  active: number;
  pending: number;
  regions: number;
  districts: number;
  thisMonth: number;
}

function clean(value: unknown, max: number): string {
  return String(value ?? "").trim().slice(0, max);
}

function normaliseStatus(value: unknown): MemberStatus {
  return MEMBER_STATUSES.includes(value as MemberStatus) ? (value as MemberStatus) : "pending";
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function mapMember(r: any): MemberRow {
  return {
    id: r.id,
    membershipNumber: r.membership_number,
    fullName: r.full_name,
    phone: r.phone,
    email: r.email,
    region: r.region,
    district: r.district,
    gender: r.gender,
    status: normaliseStatus(r.status),
    note: r.note,
    source: r.source,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

function memberValues(input: MemberInput) {
  return {
    membershipNumber: clean(input.membershipNumber, 40),
    fullName: clean(input.fullName, 160),
    phone: clean(input.phone, 40),
    email: clean(input.email, 254),
    region: clean(input.region, 80),
    district: clean(input.district, 80),
    gender: clean(input.gender, 30),
    status: normaliseStatus(input.status),
    note: clean(input.note, 1000),
    source: clean(input.source, 40) || "admin",
  };
}

export interface MemberQuery {
  q?: string;
  region?: string;
  status?: string;
  limit?: number;
  offset?: number;
}

/** Filtering happens in SQL, so the registry stays fast as it grows. */
function buildFilter(query: MemberQuery) {
  const args: unknown[] = [];
  const clauses: string[] = [];

  const term = clean(query.q, 120).toLowerCase();
  if (term) {
    args.push(`%${term}%`);
    const p = `$${args.length}`;
    clauses.push(
      `(lower(full_name) LIKE ${p} OR lower(membership_number) LIKE ${p} OR ` +
        `lower(email) LIKE ${p} OR phone LIKE ${p} OR lower(district) LIKE ${p})`,
    );
  }

  const region = clean(query.region, 80);
  if (region && region !== "All") {
    args.push(region);
    clauses.push(`region = $${args.length}`);
  }

  const status = clean(query.status, 20);
  if (status && status !== "All" && MEMBER_STATUSES.includes(status as MemberStatus)) {
    args.push(status);
    clauses.push(`status = $${args.length}`);
  }

  return { where: clauses.length ? `WHERE ${clauses.join(" AND ")}` : "", args };
}

export async function listMembers(
  query: MemberQuery = {},
): Promise<{ items: MemberRow[]; total: number }> {
  await ensureSchema();
  const pool = getPool();
  const { where, args } = buildFilter(query);

  const limit = Math.min(Math.max(query.limit ?? 100, 1), 500);
  const offset = Math.max(query.offset ?? 0, 0);

  const [rows, count] = await Promise.all([
    pool.query(
      `SELECT * FROM site_members ${where} ORDER BY created_at DESC LIMIT $${args.length + 1} OFFSET $${args.length + 2}`,
      [...args, limit, offset],
    ),
    pool.query(`SELECT count(*)::int AS n FROM site_members ${where}`, args),
  ]);

  return { items: rows.rows.map(mapMember), total: count.rows[0]?.n ?? 0 };
}

/** Every matching row, unpaginated — used by the CSV export. */
export async function allMembers(query: MemberQuery = {}): Promise<MemberRow[]> {
  await ensureSchema();
  const { where, args } = buildFilter(query);
  const res = await getPool().query(
    `SELECT * FROM site_members ${where} ORDER BY created_at DESC LIMIT 20000`,
    args,
  );
  return res.rows.map(mapMember);
}

export async function memberStats(): Promise<MemberStats> {
  await ensureSchema();
  const res = await getPool().query(`
    SELECT
      CAST(count(*) AS int)                                                     AS total,
      CAST(count(*) FILTER (WHERE status = 'verified') AS int)                  AS verified,
      CAST(count(*) FILTER (WHERE status = 'active') AS int)                    AS active,
      CAST(count(*) FILTER (WHERE status = 'pending') AS int)                   AS pending,
      CAST(count(DISTINCT NULLIF(region, '')) AS int)                           AS regions,
      CAST(count(DISTINCT NULLIF(district, '')) AS int)                         AS districts,
      CAST(count(*) FILTER (WHERE created_at > date_trunc('month', now())) AS int) AS this_month
    FROM site_members
  `);
  const r = res.rows[0];
  return {
    total: r.total,
    verified: r.verified,
    active: r.active,
    pending: r.pending,
    regions: r.regions,
    districts: r.districts,
    thisMonth: r.this_month,
  };
}

/**
 * Membership numbers come from a dedicated sequence when the administrator
 * doesn't supply one, so two people saved at the same moment can never collide.
 */
const NEXT_NUMBER =
  `'HIL-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('site_member_seq')::text, 5, '0')`;

export async function createMember(input: MemberInput): Promise<MemberRow> {
  await ensureSchema();
  const v = memberValues(input);
  const res = await getPool().query(
    `INSERT INTO site_members
       (membership_number, full_name, phone, email, region, district, gender, status, note, source)
     VALUES (COALESCE(NULLIF($1::text, ''), ${NEXT_NUMBER}), $2,$3,$4,$5,$6,$7,$8,$9,$10)
     RETURNING *`,
    [
      v.membershipNumber, v.fullName, v.phone, v.email, v.region,
      v.district, v.gender, v.status, v.note, v.source,
    ],
  );
  return mapMember(res.rows[0]);
}

export async function updateMember(id: number, input: MemberInput): Promise<MemberRow | null> {
  await ensureSchema();
  const v = memberValues(input);
  const res = await getPool().query(
    `UPDATE site_members SET
       membership_number = COALESCE(NULLIF($2::text, ''), membership_number),
       full_name=$3, phone=$4, email=$5, region=$6, district=$7,
       gender=$8, status=$9, note=$10, updated_at=now()
     WHERE id=$1 RETURNING *`,
    [
      id, v.membershipNumber, v.fullName, v.phone, v.email,
      v.region, v.district, v.gender, v.status, v.note,
    ],
  );
  return res.rows[0] ? mapMember(res.rows[0]) : null;
}

/** Status-only change, used by the one-click verify button. */
export async function setMemberStatus(id: number, status: string): Promise<MemberRow | null> {
  await ensureSchema();
  const res = await getPool().query(
    "UPDATE site_members SET status = $2, updated_at = now() WHERE id = $1 RETURNING *",
    [id, normaliseStatus(status)],
  );
  return res.rows[0] ? mapMember(res.rows[0]) : null;
}

export async function deleteMember(id: number): Promise<boolean> {
  await ensureSchema();
  const res = await getPool().query("DELETE FROM site_members WHERE id = $1", [id]);
  return (res.rowCount ?? 0) > 0;
}

/** Bulk import from a pasted CSV. Returns how many rows were stored. */
export async function importMembers(rows: MemberInput[]): Promise<{ added: number; failed: number }> {
  let added = 0;
  let failed = 0;
  for (const row of rows.slice(0, 2000)) {
    if (!clean(row.fullName, 160)) {
      failed++;
      continue;
    }
    try {
      await createMember({ ...row, source: row.source || "import" });
      added++;
    } catch {
      failed++;
    }
  }
  return { added, failed };
}

/* ═══════════════════════ CSV ═══════════════════════ */

/** Escapes a value for CSV: quotes doubled, whole field quoted. */
function csvCell(value: unknown): string {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

/** Postgres hands back a Date for timestamptz; a spreadsheet wants an ISO day. */
function isoDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
}

export function membersToCsv(rows: MemberRow[]): string {
  const header = [
    "Membership Number", "Full Name", "Phone", "Email",
    "Region", "District", "Gender", "Status", "Source", "Joined",
  ];
  const lines = rows.map((m) =>
    [
      m.membershipNumber, m.fullName, m.phone, m.email, m.region,
      m.district, m.gender, m.status, m.source, isoDate(m.createdAt),
    ].map(csvCell).join(","),
  );
  // The BOM makes Excel open Somali characters correctly.
  return "﻿" + [header.map(csvCell).join(","), ...lines].join("\r\n");
}

/** Parses a pasted CSV into member inputs, matching columns by header name. */
export function csvToMembers(text: string): MemberInput[] {
  const lines = text.trim().split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return [];

  const splitRow = (line: string): string[] => {
    const cells: string[] = [];
    let cell = "";
    let quoted = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (quoted) {
        if (ch === '"' && line[i + 1] === '"') { cell += '"'; i++; }
        else if (ch === '"') quoted = false;
        else cell += ch;
      } else if (ch === '"') quoted = true;
      else if (ch === ",") { cells.push(cell); cell = ""; }
      else cell += ch;
    }
    cells.push(cell);
    return cells.map((c) => c.trim());
  };

  const headers = splitRow(lines[0].replace(/^﻿/, "")).map((h) => h.toLowerCase());
  const at = (cells: string[], ...names: string[]): string => {
    for (const name of names) {
      const index = headers.indexOf(name);
      if (index >= 0 && cells[index] !== undefined) return cells[index];
    }
    return "";
  };

  return lines.slice(1).map((line) => {
    const cells = splitRow(line);
    return {
      membershipNumber: at(cells, "membership number", "membership_number", "membership id", "id"),
      fullName: at(cells, "full name", "full_name", "name", "magaca"),
      phone: at(cells, "phone", "telefoon", "mobile"),
      email: at(cells, "email", "e-mail"),
      region: at(cells, "region", "gobolka", "gobol"),
      district: at(cells, "district", "degmada", "degmo"),
      gender: at(cells, "gender", "jinsiga"),
      status: at(cells, "status") || "pending",
      note: at(cells, "note", "notes"),
      source: "import",
    };
  });
}
