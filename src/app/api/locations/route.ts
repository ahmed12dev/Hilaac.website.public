import { NextResponse } from "next/server";
import { API_BASE } from "@/lib/api";

/**
 * Region → district list for the join form.
 *
 * Proxies the backend's `/api/locations` so the dropdowns always match exactly
 * what `handleRegister` validates against — no second copy of the geography
 * data to drift out of sync.
 *
 * Server-side, so no CORS and no backend change.
 */

export const revalidate = 3600;

/** Backend shape: { State: { Region: [District, …] } } */
type LocationsPayload = Record<string, Record<string, string[]>>;

export async function GET() {
  if (!API_BASE) return NextResponse.json({ regions: {} });

  try {
    const res = await fetch(`${API_BASE}/api/locations`, {
      headers: { Accept: "application/json" },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return NextResponse.json({ regions: {} });

    const data = (await res.json()) as LocationsPayload;

    // Flatten states away — region names are unique, and the registration
    // endpoint validates on region+district alone.
    const regions: Record<string, string[]> = {};
    for (const state of Object.values(data)) {
      for (const [region, districts] of Object.entries(state)) {
        regions[region] = districts;
      }
    }

    return NextResponse.json({ regions });
  } catch {
    return NextResponse.json({ regions: {} });
  }
}
