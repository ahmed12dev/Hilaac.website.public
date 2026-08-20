import { NextResponse } from "next/server";
import { currentAdmin, type SiteAdmin } from "@/lib/server/auth";
import { logActivity } from "@/lib/server/activity";
import {
  createConstitutionChapter,
  createEvent,
  createGallery,
  createLeader,
  createTestimonial,
  deleteRow,
  listEventsAdmin,
  listGalleryAdmin,
  listLeadersAdmin,
  listConstitutionAdmin,
  listMessages,
  listSubscribers,
  listTestimonialsAdmin,
  markMessageRead,
  updateConstitutionChapter,
  updateEvent,
  updateGallery,
  updateLeader,
  updateTestimonial,
  type DeletableTable,
} from "@/lib/server/collections";

/**
 * Admin CRUD for events, leadership, gallery, testimonials, messages and
 * newsletter subscribers.
 *
 * One route rather than six near-identical files. The collection name is
 * matched against a fixed map — an unknown name is a 404, and the table name
 * itself is never taken from the URL.
 *
 * Every method requires a website-admin session, and every change is written
 * to the activity log.
 */

export const dynamic = "force-dynamic";

/* eslint-disable @typescript-eslint/no-explicit-any */
interface Handlers {
  table: DeletableTable;
  /** Singular noun used in the activity log. */
  entity: string;
  list: () => Promise<any[]>;
  create?: (input: any) => Promise<any>;
  update?: (id: number, input: any) => Promise<any | null>;
  /** At least one of these must carry a value to create a row. */
  required?: string[];
  /** How a row is described in the activity log. */
  label?: (row: any) => string;
}

const COLLECTIONS: Record<string, Handlers> = {
  events: {
    table: "site_events",
    entity: "event",
    list: listEventsAdmin,
    create: createEvent,
    update: updateEvent,
    required: ["titleSo", "titleEn"],
    label: (r) => r.titleEn || r.titleSo,
  },
  leadership: {
    table: "site_leaders",
    entity: "leader",
    list: listLeadersAdmin,
    create: createLeader,
    update: updateLeader,
    required: ["name"],
    label: (r) => r.name,
  },
  gallery: {
    table: "site_gallery",
    entity: "gallery item",
    list: listGalleryAdmin,
    create: createGallery,
    update: updateGallery,
    required: ["src"],
    label: (r) => r.titleEn || r.titleSo || r.filename || "image",
  },
  testimonials: {
    table: "site_testimonials",
    entity: "testimonial",
    list: listTestimonialsAdmin,
    create: createTestimonial,
    update: updateTestimonial,
    required: ["name"],
    label: (r) => r.name,
  },
  constitution: {
    table: "site_constitution",
    entity: "constitution chapter",
    list: listConstitutionAdmin,
    create: createConstitutionChapter,
    update: updateConstitutionChapter,
    required: ["titleSo", "titleEn"],
    label: (r) => [r.chapterNo, r.titleEn || r.titleSo].filter(Boolean).join(" · "),
  },
  // Messages arrive from the public contact form; the admin reads, marks and
  // deletes them, but never creates one.
  messages: { table: "site_messages", entity: "message", list: listMessages },
  // Subscribers arrive from the newsletter form; they can be listed and removed.
  subscribers: { table: "site_subscribers", entity: "subscriber", list: listSubscribers },
};
/* eslint-enable @typescript-eslint/no-explicit-any */

interface Resolved {
  error?: NextResponse;
  handlers?: Handlers;
  admin?: SiteAdmin;
}

async function resolve(params: Promise<{ collection: string }>): Promise<Resolved> {
  const admin = await currentAdmin();
  if (!admin) {
    return { error: NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 }) };
  }
  const { collection } = await params;
  const handlers = COLLECTIONS[collection];
  if (!handlers) {
    return { error: NextResponse.json({ ok: false, error: "Unknown collection." }, { status: 404 }) };
  }
  return { admin, handlers };
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
  const { error, handlers, admin } = await resolve(params);
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
    const item = await handlers!.create(body);
    await logActivity(
      admin!, "create", handlers!.entity,
      `Added ${handlers!.entity} “${handlers!.label?.(item) ?? item.id}”`,
      item.id,
    );
    return NextResponse.json({ ok: true, item }, { status: 201 });
  } catch {
    return NextResponse.json({ ok: false, error: "Could not save." }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: Ctx) {
  const { error, handlers, admin } = await resolve(params);
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
    // Messages support only a read/unread toggle; subscribers are read-only.
    if (!handlers!.update) {
      if (handlers!.table !== "site_messages") {
        return NextResponse.json({ ok: false, error: "Not supported." }, { status: 405 });
      }
      const changed = await markMessageRead(id, body.read !== false);
      if (!changed) return NextResponse.json({ ok: false, error: "Not found." }, { status: 404 });
      return NextResponse.json({ ok: true });
    }

    const item = await handlers!.update(id, body);
    if (!item) return NextResponse.json({ ok: false, error: "Not found." }, { status: 404 });
    await logActivity(
      admin!, "update", handlers!.entity,
      `Updated ${handlers!.entity} “${handlers!.label?.(item) ?? id}”`,
      id,
    );
    return NextResponse.json({ ok: true, item });
  } catch {
    return NextResponse.json({ ok: false, error: "Could not save." }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: Ctx) {
  const { error, handlers, admin } = await resolve(params);
  if (error) return error;

  const id = Number(new URL(request.url).searchParams.get("id"));
  if (!Number.isInteger(id) || id < 1) {
    return NextResponse.json({ ok: false, error: "Missing id." }, { status: 400 });
  }

  try {
    const removed = await deleteRow(handlers!.table, id);
    if (!removed) return NextResponse.json({ ok: false, error: "Not found." }, { status: 404 });
    await logActivity(admin!, "delete", handlers!.entity, `Deleted ${handlers!.entity} #${id}`, id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "Could not delete." }, { status: 500 });
  }
}
