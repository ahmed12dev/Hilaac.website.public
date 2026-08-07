import { NextResponse } from "next/server";
import { currentAdmin } from "@/lib/server/auth";
import {
  createProject,
  deleteProject,
  listProjects,
  updateProject,
  type ProjectInput,
} from "@/lib/server/content";

export const dynamic = "force-dynamic";

async function guard() {
  const admin = await currentAdmin();
  return admin ? null : NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
}

export async function GET() {
  const denied = await guard();
  if (denied) return denied;
  try {
    return NextResponse.json({ ok: true, items: await listProjects() });
  } catch {
    return NextResponse.json({ ok: false, error: "Database unavailable." }, { status: 503 });
  }
}

export async function POST(request: Request) {
  const denied = await guard();
  if (denied) return denied;

  let body: ProjectInput;
  try {
    body = (await request.json()) as ProjectInput;
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
    return NextResponse.json({ ok: true, item: await createProject(body) }, { status: 201 });
  } catch {
    return NextResponse.json({ ok: false, error: "Could not save." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const denied = await guard();
  if (denied) return denied;

  let body: ProjectInput & { id?: number };
  try {
    body = (await request.json()) as ProjectInput & { id?: number };
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const id = Number(body.id);
  if (!Number.isInteger(id) || id < 1) {
    return NextResponse.json({ ok: false, error: "Missing id." }, { status: 400 });
  }

  try {
    const item = await updateProject(id, body);
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
    const removed = await deleteProject(id);
    if (!removed) return NextResponse.json({ ok: false, error: "Not found." }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "Could not delete." }, { status: 500 });
  }
}
