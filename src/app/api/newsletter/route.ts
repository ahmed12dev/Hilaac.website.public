import { NextResponse } from "next/server";
import { API_BASE } from "@/lib/api";
import { addSubscriber } from "@/lib/server/collections";

/**
 * Newsletter sign-ups.
 *
 * The address is stored in this website's own `site_subscribers` table so it
 * shows up on the dashboard's Subscribers screen, and is also forwarded to the
 * registration backend when one is configured.
 */
export async function POST(request: Request) {
  let email = "";
  try {
    const body = (await request.json()) as { email?: string };
    email = (body.email || "").trim();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_body" }, { status: 400 });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ ok: false, error: "invalid_email" }, { status: 400 });
  }

  // Stored locally first, so a sign-up is never lost when the upstream
  // backend is unreachable.
  let stored = false;
  try {
    stored = await addSubscriber(email);
  } catch {
    stored = false;
  }

  if (!API_BASE) return NextResponse.json({ ok: true, stored, forwarded: false });

  try {
    const res = await fetch(`${API_BASE}/api/public/newsletter`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    return NextResponse.json({ ok: true, stored, forwarded: res.ok });
  } catch {
    return NextResponse.json({ ok: true, stored, forwarded: false });
  }
}
