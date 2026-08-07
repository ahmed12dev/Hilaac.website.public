import { NextResponse } from "next/server";
import { currentAdmin } from "@/lib/server/auth";
import {
  createEvent,
  createGallery,
  createLeader,
  deleteRow,
  listEventsAdmin,
  listGalleryAdmin,
  listLeadersAdmin,
  listMessages,
  markMessageRead,
  updateEvent,
  updateGallery,
  updateLeader,
  type DeletableTable,
} from "@/lib/server/collections";

/**
 * Admin CRUD for events, leadership, gallery and messages.
 *
 * One route rather than four near-identical files. The collection name is
 * matched against a fixed map — an unknown name is a 404, and the table name
 * itself is never taken from the URL.
 *
 * Every method requires a website-admin session.
 */

export const dynamic = "force-dynamic";

/* eslint-disable @typescript-eslint/no-explicit-any */
interface Handlers {
  table: DeletableTable;
  list: () => Promise<any[]>;
  create?: (input: any) => Promise<any>;
  update?: (id: number, input: any) => Promise<any | null>;
  /** Field that must be non-empty to create a row. */
  required?: string[];
}

const COLLECTIONS: Record<string, Handlers> = {
  events: {
    table: "site_events",
    list: listEventsAdmin,
    create: createEvent,
    update: updateEvent,
    required: ["titleSo", "titleEn"],
  },
  leadership: {
    table: "site_leaders",
    list: listLeadersAdmin,
    create: createLeader,
    update: updateLeader,
    required: ["name"],
  },
  gallery: {
    table: "site_gallery",
    list: listGalleryAdmin,
    create: createGallery,
    update: updateGallery,
    required: ["src"],
  },
  // Messages arrive from the public contact form; the admin reads, marks and
  // deletes them, but never creates one.
  messages: { table: "site_messages", list: listMessages },
};
/* eslint-enable @typescript-eslint/no-explicit-any */

async function resolve(params: Promise<{ collection: string }>) {
  const admin = await currentAdmin();
  if (!admin) {
    return { error: NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 }) };
  }
  const { collection } = await params;
  const handlers = COLLECTIONS[collection];
  if (!handlers) {
    return { error: NextResponse.json({ ok: false, error: "Unknown collection." }, { status: 404 }) };
  }
  return { handlers };
}

type Ctx = { params: Promise<{ collection: string }> };

export async function GET(_request: Request, { params }: Ctx) {
  const { error, handlers } = await resolve(params);
  if (error) return error;

  try {
    return NextResponse.json({ ok: true, items: await handlers!.list() });
  } catch {
    return NextResponse.json({ ok: false, error: "Database unavailable." }, { status: 503 });
  }
}

export async function POST(request: Request, { params }: Ctx) {
  const { error, handlers } = await resolve(params);
  if (error) return error;
  if (!handlers!.create) {
    return NextResponse.json({ ok: false, error: "Not supported." }, { status: 405 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  // At least one of the required fields must carry a value.
  const required = handlers!.required ?? [];
  if (required.length && !required.some((f) => String(body[f] ?? "").trim())) {
    return NextResponse.json(
      { ok: false, error: `Waa loo baahan yahay: ${required.join(" / ")}` },
      { status: 400 },
    );
  }

  try {
    return NextResponse.json({ ok: true, item: await handlers!.create(body) }, { status: 201 });
  } catch {
    return NextResponse.json({ ok: false, error: "Could not save." }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: Ctx) {
  const { error, handlers } = await resolve(params);
  if (error) return error;

  let body: Record<string, unknown> & { id?: number; read?: boolean };
  try {
    body = (await request.json()) as Record<string, unknown> & { id?: number; read?: boolean };
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const id = Number(body.id);
  if (!Number.isInteger(id) || id < 1) {
    return NextResponse.json({ ok: false, error: "Missing id." }, { status: 400 });
  }

  try {
    // Messages support only a read/unread toggle.
    if (!handlers!.update) {
      const changed = await markMessageRead(id, body.read !== false);
      if (!changed) return NextResponse.json({ ok: false, error: "Not found." }, { status: 404 });
      return NextResponse.json({ ok: true });
    }

    const item = await handlers!.update(id, body);
    if (!item) return NextResponse.json({ ok: false, error: "Not found." }, { status: 404 });
    return NextResponse.json({ ok: true, item });
  } catch {
    return NextResponse.json({ ok: false, error: "Could not save." }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: Ctx) {
  const { error, handlers } = await resolve(params);
  if (error) return error;

  const id = Number(new URL(request.url).searchParams.get("id"));
  if (!Number.isInteger(id) || id < 1) {
    return NextResponse.json({ ok: false, error: "Missing id." }, { status: 400 });
  }

  try {
    const removed = await deleteRow(handlers!.table, id);
    if (!removed) return NextResponse.json({ ok: false, error: "Not found." }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "Could not delete." }, { status: 500 });
  }
}
