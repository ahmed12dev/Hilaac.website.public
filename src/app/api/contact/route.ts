import { NextResponse } from "next/server";
import { addMessage } from "@/lib/server/collections";

export const dynamic = "force-dynamic";

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
 * Contact form.
 *
 * Messages belong to this website, so they are stored in `site_messages` and
 * show up in the website admin's Messages screen. Nothing is sent to the
 * registration system.
 */
export async function POST(request: Request) {
  let payload: ContactPayload;
  try {
    payload = (await request.json()) as ContactPayload;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_body" }, { status: 400 });
  }

  // Silently accept bot submissions without storing them.
  if (payload.website) return NextResponse.json({ ok: true });

  const name = (payload.name || "").trim();
  const email = (payload.email || "").trim();
  const message = (payload.message || "").trim();

  if (!name || !message || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ ok: false, error: "validation_failed" }, { status: 400 });
  }

  try {
    const id = await addMessage({
      name,
      email,
      phone: (payload.phone || "").trim(),
      subject: (payload.subject || "").trim(),
      message,
    });
    return NextResponse.json({ ok: true, id }, { status: 201 });
  } catch {
    return NextResponse.json(
      { ok: false, error: "unavailable", message: "Fariinta lama kaydin. / Message could not be saved." },
      { status: 503 },
    );
  }
}
