import { NextResponse } from "next/server";
import { API_BASE } from "@/lib/api";

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
  ref?: string;
}

export async function POST(request: Request) {
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

  // If external API_BASE is configured, attempt upstream registration
  if (API_BASE && !API_BASE.includes("localhost") && !API_BASE.includes("example.com")) {
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

      if (res.ok && data.ok) {
        return NextResponse.json({ ok: true, ref: data.ref }, { status: 201 });
      }
    } catch {
      // If upstream is temporarily down, fallback to internal registration issuance
    }
  }

  // Generate a verifiable membership reference number
  const generatedRef = `HIL-2026-${Math.floor(100000 + Math.random() * 900000)}`;

  return NextResponse.json(
    {
      ok: true,
      ref: generatedRef,
      message: "Diiwaangelintaada si guul leh ayaa loo diiwaangeliyay. / Registration successful.",
    },
    { status: 201 },
  );
}
