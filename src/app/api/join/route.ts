import { NextResponse } from "next/server";
import { API_BASE } from "@/lib/api";

/**
 * Membership registration proxy.
 *
 * Forwards a join submission to the existing Xisbiga Hilaac registration
 * backend (`POST /api/register`), so anyone who joins from this website lands
 * in the SAME `registrations` table the admin dashboard manages. One member
 * list, one source of truth.
 *
 * This runs server-side, which matters: a server-to-server fetch sends no
 * `Origin` header, so the backend needs no CORS configuration and no code
 * change of any kind to accept it.
 *
 * All validation (phone format, 18+, region/district, registration open,
 * closed places, photo) stays in the backend — this proxy deliberately does
 * not duplicate those rules, so the two can never disagree.
 */

export const dynamic = "force-dynamic";

// Photos arrive as base64 data URLs and dominate the payload size.
const MAX_BODY_BYTES = 6 * 1024 * 1024;

interface JoinBody {
  fullName?: string;
  gender?: string;
  dob?: string;
  phone?: string;
  contactPhone?: string;
  email?: string;
  education?: string;
  placeType?: string;
  country?: string;
  region?: string;
  district?: string;
  photo?: string;
  consent?: boolean;
  /** Referral: an admin id, so the registration is credited to them. */
  ref?: string;
}

export async function POST(request: Request) {
  if (!API_BASE) {
    return NextResponse.json(
      { ok: false, error: "Registration is not configured. Set NEXT_PUBLIC_API_BASE." },
      { status: 503 },
    );
  }

  let body: JoinBody;
  try {
    const raw = await request.text();
    if (raw.length > MAX_BODY_BYTES) {
      return NextResponse.json(
        { ok: false, error: "Sawirku aad buu u weyn yahay. / The photo is too large." },
        { status: 413 },
      );
    }
    body = JSON.parse(raw) as JoinBody;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  try {
    const res = await fetch(`${API_BASE}/api/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: body.fullName,
        gender: body.gender,
        dob: body.dob,
        phone: body.phone,
        contactPhone: body.contactPhone,
        email: body.email,
        education: body.education,
        placeType: body.placeType,
        country: body.country,
        region: body.region,
        district: body.district,
        photo: body.photo,
        consent: body.consent,
        ref: body.ref,
      }),
      cache: "no-store",
    });

    const data = (await res.json()) as { ok?: boolean; ref?: string; error?: string };

    // Pass the backend's own status and message straight through, so the user
    // sees the real reason (wrong phone format, under 18, area closed…).
    if (!res.ok || !data.ok) {
      return NextResponse.json(
        { ok: false, error: data.error || "Diiwaangelintu ma guulaysan. / Registration failed." },
        { status: res.status === 200 ? 400 : res.status },
      );
    }

    return NextResponse.json({ ok: true, ref: data.ref }, { status: 201 });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Lama gaari karo server-ka. / Cannot reach the registration server." },
      { status: 502 },
    );
  }
}
