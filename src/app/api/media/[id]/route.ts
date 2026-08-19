import { NextResponse } from "next/server";
import { readMedia } from "@/lib/server/media";

/**
 * Serves an uploaded image.
 *
 * Public on purpose — these are the pictures on the public website. Ids are
 * random, and only rows in `site_media` are reachable, so nothing else in the
 * database can be read through here.
 */

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const file = await readMedia(id);
    if (!file) {
      return NextResponse.json({ ok: false, error: "Not found." }, { status: 404 });
    }

    // Content is immutable for a given id, so it can be cached hard.
    return new NextResponse(new Uint8Array(file.data), {
      headers: {
        "Content-Type": file.mime,
        "Content-Length": String(file.data.length),
        "Cache-Control": "public, max-age=31536000, immutable",
        "Content-Disposition": `inline; filename="${encodeURIComponent(file.filename)}"`,
        "X-Content-Type-Options": "nosniff",
        // Nothing served here should ever be able to load or run anything else.
        "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; sandbox",
      },
    });
  } catch {
    return NextResponse.json({ ok: false, error: "Unavailable." }, { status: 503 });
  }
}
