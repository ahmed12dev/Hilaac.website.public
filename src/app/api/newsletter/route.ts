import { NextResponse } from "next/server";
import { API_BASE } from "@/lib/api";

/**
 * Forwards newsletter sign-ups to the admin dashboard
 * (POST <API_BASE>/api/public/newsletter). Accepts the address locally when
 * the backend endpoint isn't available yet so the UI never dead-ends.
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

  if (!API_BASE) return NextResponse.json({ ok: true, forwarded: false });

  try {
    const res = await fetch(`${API_BASE}/api/public/newsletter`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    return NextResponse.json({ ok: true, forwarded: res.ok });
  } catch {
    return NextResponse.json({ ok: true, forwarded: false });
  }
}
