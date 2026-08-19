import { NextResponse } from "next/server";
import { currentAdmin } from "@/lib/server/auth";
import { logActivity } from "@/lib/server/activity";
import { publicSettings, saveSettings } from "@/lib/server/content";
import { fallbackSettings } from "@/lib/fallback";

export const dynamic = "force-dynamic";

/**
 * Site settings, stored as one JSON blob in `site_settings` (a single row with
 * id = 1). The public website reads the same row through getSettings(), so a
 * save here is live on the next page request.
 */

type Blob = Record<string, unknown>;

function isPlainObject(value: unknown): value is Blob {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Recursive merge, so saving one screen's fields never blanks out the fields
 * another screen owns. Arrays are replaced wholesale — that is what an editor
 * reordering hero slides expects.
 */
function merge(base: Blob, patch: Blob): Blob {
  const out: Blob = { ...base };
  for (const [key, value] of Object.entries(patch)) {
    if (value === undefined) continue;
    out[key] = isPlainObject(value) && isPlainObject(out[key])
      ? merge(out[key] as Blob, value)
      : value;
  }
  return out;
}

export async function GET() {
  const admin = await currentAdmin();
  if (!admin) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

  try {
    const stored = await publicSettings();
    // Merged over the defaults so every field the editor renders has a value.
    return NextResponse.json({
      ok: true,
      settings: merge(fallbackSettings as unknown as Blob, stored ?? {}),
    });
  } catch {
    return NextResponse.json({ ok: false, error: "Database unavailable." }, { status: 503 });
  }
}

export async function PUT(request: Request) {
  const admin = await currentAdmin();
  if (!admin) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

  let patch: Blob;
  try {
    patch = (await request.json()) as Blob;
    if (!isPlainObject(patch)) throw new Error("not an object");
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  try {
    const stored = (await publicSettings()) ?? {};
    const next = merge(stored, patch);
    await saveSettings(next);
    await logActivity(admin, "settings", "settings", "Updated site settings");
    return NextResponse.json({
      ok: true,
      settings: merge(fallbackSettings as unknown as Blob, next),
    });
  } catch {
    return NextResponse.json({ ok: false, error: "Could not save settings." }, { status: 500 });
  }
}
