import { NextResponse } from "next/server";
import { currentAdmin, type SiteAdmin } from "@/lib/server/auth";
import { logActivity } from "@/lib/server/activity";
import { createNews, deleteNews, listNews, updateNews, type NewsInput } from "@/lib/server/content";

export const dynamic = "force-dynamic";

/** Every method here requires a website-admin session. */
async function guard(): Promise<{ admin: SiteAdmin } | { denied: NextResponse }> {
  const admin = await currentAdmin();
  if (!admin) {
    return { denied: NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 }) };
  }
  return { admin };
}

export async function GET() {
  const session = await guard();
  if ("denied" in session) return session.denied;

  try {
    return NextResponse.json({ ok: true, items: await listNews() });
  } catch {
    return NextResponse.json({ ok: false, error: "Database unavailable." }, { status: 503 });
  }
}

export async function POST(request: Request) {
  const session = await guard();
  if ("denied" in session) return session.denied;

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
    const item = await createNews(body);
    await logActivity(
      session.admin, "create", "article",
      `Published article “${item.titleEn || item.titleSo}”`, item.id,
    );
    return NextResponse.json({ ok: true, item }, { status: 201 });
  } catch {
    return NextResponse.json({ ok: false, error: "Could not save." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const session = await guard();
  if ("denied" in session) return session.denied;

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
    await logActivity(
      session.admin, "update", "article",
      `Updated article “${item.titleEn || item.titleSo}”`, id,
    );
    return NextResponse.json({ ok: true, item });
  } catch {
    return NextResponse.json({ ok: false, error: "Could not save." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await guard();
  if ("denied" in session) return session.denied;

  const id = Number(new URL(request.url).searchParams.get("id"));
  if (!Number.isInteger(id) || id < 1) {
    return NextResponse.json({ ok: false, error: "Missing id." }, { status: 400 });
  }

  try {
    const removed = await deleteNews(id);
    if (!removed) return NextResponse.json({ ok: false, error: "Not found." }, { status: 404 });
    await logActivity(session.admin, "delete", "article", `Deleted article #${id}`, id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "Could not delete." }, { status: 500 });
  }
}
