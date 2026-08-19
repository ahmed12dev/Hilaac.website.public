import { NextResponse } from "next/server";
import { currentAdmin } from "@/lib/server/auth";
import { logActivity } from "@/lib/server/activity";
import {
  deleteMedia,
  listMedia,
  MAX_UPLOAD_BYTES,
  mediaFolders,
  saveMedia,
  updateMedia,
} from "@/lib/server/media";

export const dynamic = "force-dynamic";

/**
 * Media library.
 *
 * Uploads arrive as multipart/form-data and are stored in PostgreSQL, because
 * Railway gives a container no disk that survives a redeploy. Each saved image
 * is addressable at /api/media/:id, which is what goes into a cover or photo
 * field elsewhere in the dashboard.
 */

function unauthorized() {
  return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
}

export async function GET(request: Request) {
  const admin = await currentAdmin();
  if (!admin) return unauthorized();

  const folder = new URL(request.url).searchParams.get("folder") || "";
  try {
    const [items, folders] = await Promise.all([listMedia(folder), mediaFolders()]);
    return NextResponse.json({ ok: true, items, folders, maxBytes: MAX_UPLOAD_BYTES });
  } catch {
    return NextResponse.json({ ok: false, error: "Database unavailable." }, { status: 503 });
  }
}

export async function POST(request: Request) {
  const admin = await currentAdmin();
  if (!admin) return unauthorized();

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid upload." }, { status: 400 });
  }

  const files = form.getAll("file").filter((f): f is File => f instanceof File);
  if (!files.length) {
    return NextResponse.json({ ok: false, error: "No file was attached." }, { status: 400 });
  }

  const folder = String(form.get("folder") || "general");
  const alt = String(form.get("alt") || "");

  const saved = [];
  const failed: string[] = [];

  for (const file of files.slice(0, 12)) {
    if (file.size > MAX_UPLOAD_BYTES) {
      failed.push(`${file.name} is larger than ${Math.round(MAX_UPLOAD_BYTES / 1024 / 1024)} MB`);
      continue;
    }
    try {
      const result = await saveMedia({
        filename: file.name,
        mime: file.type,
        data: Buffer.from(await file.arrayBuffer()),
        alt,
        folder,
        createdBy: admin.id,
      });
      if ("error" in result) failed.push(`${file.name}: ${result.error}`);
      else saved.push(result);
    } catch {
      failed.push(`${file.name} could not be stored`);
    }
  }

  if (!saved.length) {
    return NextResponse.json(
      { ok: false, error: failed[0] ?? "Nothing was uploaded." },
      { status: 400 },
    );
  }

  await logActivity(
    admin, "upload", "media",
    `Uploaded ${saved.length} image${saved.length === 1 ? "" : "s"} to ${folder}`,
  );
  return NextResponse.json({ ok: true, items: saved, failed }, { status: 201 });
}

export async function PUT(request: Request) {
  const admin = await currentAdmin();
  if (!admin) return unauthorized();

  let body: { id?: string; alt?: string; folder?: string };
  try {
    body = (await request.json()) as { id?: string; alt?: string; folder?: string };
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const id = String(body.id || "");
  if (!id) return NextResponse.json({ ok: false, error: "Missing id." }, { status: 400 });

  try {
    const item = await updateMedia(id, body);
    if (!item) return NextResponse.json({ ok: false, error: "Not found." }, { status: 404 });
    return NextResponse.json({ ok: true, item });
  } catch {
    return NextResponse.json({ ok: false, error: "Could not save." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const admin = await currentAdmin();
  if (!admin) return unauthorized();

  const id = new URL(request.url).searchParams.get("id") || "";
  if (!id) return NextResponse.json({ ok: false, error: "Missing id." }, { status: 400 });

  try {
    const removed = await deleteMedia(id);
    if (!removed) return NextResponse.json({ ok: false, error: "Not found." }, { status: 404 });
    await logActivity(admin, "delete", "media", `Deleted an image`, id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "Could not delete." }, { status: 500 });
  }
}
