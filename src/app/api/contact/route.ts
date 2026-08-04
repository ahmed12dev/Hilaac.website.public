import { NextResponse } from "next/server";
import { API_BASE } from "@/lib/api";

interface ContactPayload {
  name?: string;
  email?: string;
  phone?: string;
  subject?: string;
  message?: string;
  /** Honeypot — real users never fill this. */
  website?: string;
}

/**
 * Forwards contact-form submissions to the admin dashboard
 * (POST <API_BASE>/api/public/contact) so messages land in the inbox there.
 */
export async function POST(request: Request) {
  let payload: ContactPayload;
  try {
    payload = (await request.json()) as ContactPayload;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_body" }, { status: 400 });
  }

  // Silently accept bot submissions without forwarding them.
  if (payload.website) return NextResponse.json({ ok: true });

  const name = (payload.name || "").trim();
  const email = (payload.email || "").trim();
  const message = (payload.message || "").trim();

  if (!name || !message || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ ok: false, error: "validation_failed" }, { status: 400 });
  }

  if (!API_BASE) {
    // No backend configured — accept so the form gives useful feedback in dev.
    return NextResponse.json({ ok: true, forwarded: false });
  }

  try {
    const res = await fetch(`${API_BASE}/api/public/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        email,
        phone: (payload.phone || "").trim(),
        subject: (payload.subject || "").trim(),
        message,
      }),
    });

    if (!res.ok) {
      return NextResponse.json({ ok: false, error: "upstream_failed" }, { status: 502 });
    }
    return NextResponse.json({ ok: true, forwarded: true });
  } catch {
    return NextResponse.json({ ok: false, error: "upstream_unreachable" }, { status: 502 });
  }
}
