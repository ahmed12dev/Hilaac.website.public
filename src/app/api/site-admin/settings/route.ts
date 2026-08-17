import { NextResponse } from "next/server";
import { currentAdmin } from "@/lib/server/auth";
import { fallbackSettings } from "@/lib/fallback";
import { hasDatabase, getPool, ensureSchema } from "@/lib/server/db";

export const dynamic = "force-dynamic";

let inMemorySettings = {
  ...fallbackSettings,
  announcement: {
    enabled: true,
    textSo: "Kusoo dhawow Xisbiga Hilaac — Iska diiwaangeli xubinimada dhijitaalka ah maanta!",
    textEn: "Welcome to Hilaac Political Party — Register for digital party membership today!",
    link: "/join",
  },
};

export async function GET() {
  const admin = await currentAdmin();
  if (!admin) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  if (hasDatabase()) {
    try {
      await ensureSchema();
      const pool = getPool();
      const res = await pool.query("SELECT * FROM site_settings WHERE id = 'main' LIMIT 1");
      if (res.rows[0]?.data) {
        return NextResponse.json({ ok: true, settings: res.rows[0].data });
      }
    } catch {
      // Fallback to inMemorySettings
    }
  }

  return NextResponse.json({ ok: true, settings: inMemorySettings });
}

export async function PUT(request: Request) {
  const admin = await currentAdmin();
  if (!admin) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const updated = await request.json();
    inMemorySettings = { ...inMemorySettings, ...updated };

    if (hasDatabase()) {
      try {
        await ensureSchema();
        const pool = getPool();
        await pool.query(
          `INSERT INTO site_settings (id, data, updated_at)
           VALUES ('main', $1, now())
           ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = now()`,
          [JSON.stringify(inMemorySettings)],
        );
      } catch {
        // Continue
      }
    }

    return NextResponse.json({ ok: true, settings: inMemorySettings });
  } catch {
    return NextResponse.json({ ok: false, error: "Failed to update settings" }, { status: 400 });
  }
}
