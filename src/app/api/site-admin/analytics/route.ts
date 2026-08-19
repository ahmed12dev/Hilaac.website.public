import { NextResponse } from "next/server";
import { currentAdmin } from "@/lib/server/auth";
import { analyticsSnapshot, listActivity } from "@/lib/server/activity";
import { getLiveTotals } from "@/lib/api";

export const dynamic = "force-dynamic";

/** Numbers behind the Analytics screen. Everything is counted from the database. */
export async function GET(request: Request) {
  const admin = await currentAdmin();
  if (!admin) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

  const days = Number(new URL(request.url).searchParams.get("days") || 30);

  try {
    const [snapshot, activity, live] = await Promise.all([
      analyticsSnapshot(Number.isFinite(days) ? days : 30),
      listActivity(40).catch(() => []),
      getLiveTotals().catch(() => null),
    ]);
    return NextResponse.json({ ok: true, snapshot, activity, live });
  } catch {
    return NextResponse.json({ ok: false, error: "Database unavailable." }, { status: 503 });
  }
}
