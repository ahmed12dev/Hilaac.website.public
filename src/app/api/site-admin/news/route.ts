import { NextResponse } from "next/server";
import { currentAdmin } from "@/lib/server/auth";
import { createNews, deleteNews, listNews, updateNews, type NewsInput } from "@/lib/server/content";

export const dynamic = "force-dynamic";

/** Every method here requires a website-admin session. */
async function guard() {
  const admin = await currentAdmin();
  if (!admin) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

export async function GET() {
  const denied = await guard();
  if (denied) return denied;

  try {
    return NextResponse.json({ ok: true, items: await listNews() });
  } catch {
    return NextResponse.json({ ok: false, error: "Database unavailable." }, { status: 503 });
  }
}

export async function POST(request: Request) {
  const denied = await guard();
  if (denied) return denied;

  let body: NewsInput;
  try {
    body = (await request.json()) as NewsInput;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  if (!String(body.titleSo || "").trim() && !String(body.titleEn || "").trim()) {
    return NextResponse.json(
      { ok: false, error: "Cinwaanka waa loo baahan yahay. / A title is required." },
      { status: 400 },
    );
  }

  try {
    return NextResponse.json({ ok: true, item: await createNews(body) }, { status: 201 });
  } catch {
    return NextResponse.json({ ok: false, error: "Could not save." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const denied = await guard();
  if (denied) return denied;

  let body: NewsInput & { id?: number };
  try {
    body = (await request.json()) as NewsInput & { id?: number };
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const id = Number(body.id);
  if (!Number.isInteger(id) || id < 1) {
    return NextResponse.json({ ok: false, error: "Missing id." }, { status: 400 });
  }

  try {
    const item = await updateNews(id, body);
    if (!item) return NextResponse.json({ ok: false, error: "Not found." }, { status: 404 });
    return NextResponse.json({ ok: true, item });
  } catch {
    return NextResponse.json({ ok: false, error: "Could not save." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const denied = await guard();
  if (denied) return denied;

  const id = Number(new URL(request.url).searchParams.get("id"));
  if (!Number.isInteger(id) || id < 1) {
    return NextResponse.json({ ok: false, error: "Missing id." }, { status: 400 });
  }

  try {
    const removed = await deleteNews(id);
    if (!removed) return NextResponse.json({ ok: false, error: "Not found." }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "Could not delete." }, { status: 500 });
  }
}
