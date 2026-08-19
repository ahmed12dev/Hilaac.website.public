import { NextResponse } from "next/server";
import { currentAdmin } from "@/lib/server/auth";
import { logActivity } from "@/lib/server/activity";
import {
  allMembers,
  createMember,
  csvToMembers,
  deleteMember,
  importMembers,
  listMembers,
  memberStats,
  membersToCsv,
  setMemberStatus,
  updateMember,
  type MemberInput,
} from "@/lib/server/members";

export const dynamic = "force-dynamic";

/**
 * Members registry.
 *
 * Every record is stored in `site_members`, so the registry survives restarts
 * and redeploys. Filtering and counting happen in SQL rather than in the
 * browser, so the screen stays fast as the roster grows.
 */

async function guard() {
  const admin = await currentAdmin();
  return admin ?? null;
}

function unauthorized() {
  return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
}

export async function GET(request: Request) {
  const admin = await guard();
  if (!admin) return unauthorized();

  const params = new URL(request.url).searchParams;
  const query = {
    q: params.get("q") || "",
    region: params.get("region") || "",
    status: params.get("status") || "",
  };

  try {
    // ?format=csv streams the full filtered roster as a download.
    if (params.get("format") === "csv") {
      const rows = await allMembers(query);
      const stamp = new Date().toISOString().slice(0, 10);
      return new NextResponse(membersToCsv(rows), {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="xisbiga-hilaac-members-${stamp}.csv"`,
          "Cache-Control": "no-store",
        },
      });
    }

    const [{ items, total }, stats] = await Promise.all([
      listMembers({ ...query, limit: Number(params.get("limit") || 200) }),
      memberStats(),
    ]);
    return NextResponse.json({ ok: true, members: items, total, stats });
  } catch {
    return NextResponse.json({ ok: false, error: "Database unavailable." }, { status: 503 });
  }
}

export async function POST(request: Request) {
  const admin = await guard();
  if (!admin) return unauthorized();

  let body: (MemberInput & { csv?: string }) | null;
  try {
    body = (await request.json()) as MemberInput & { csv?: string };
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  try {
    // Bulk import from pasted CSV.
    if (body?.csv) {
      const parsed = csvToMembers(body.csv);
      if (!parsed.length) {
        return NextResponse.json(
          { ok: false, error: "No rows found. The first line must be a header row." },
          { status: 400 },
        );
      }
      const result = await importMembers(parsed);
      await logActivity(
        admin, "create", "member",
        `Imported ${result.added} member${result.added === 1 ? "" : "s"} from CSV`,
      );
      return NextResponse.json({ ok: true, ...result });
    }

    if (!String(body?.fullName || "").trim()) {
      return NextResponse.json(
        { ok: false, error: "Magaca waa loo baahan yahay. / A full name is required." },
        { status: 400 },
      );
    }

    const member = await createMember(body!);
    await logActivity(admin, "create", "member", `Added member ${member.fullName}`, member.id);
    return NextResponse.json({ ok: true, member }, { status: 201 });
  } catch {
    return NextResponse.json({ ok: false, error: "Could not save the member." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const admin = await guard();
  if (!admin) return unauthorized();

  let body: MemberInput & { id?: number };
  try {
    body = (await request.json()) as MemberInput & { id?: number };
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const id = Number(body.id);
  if (!Number.isInteger(id) || id < 1) {
    return NextResponse.json({ ok: false, error: "Missing id." }, { status: 400 });
  }

  try {
    const member = await updateMember(id, body);
    if (!member) return NextResponse.json({ ok: false, error: "Not found." }, { status: 404 });
    await logActivity(admin, "update", "member", `Updated member ${member.fullName}`, id);
    return NextResponse.json({ ok: true, member });
  } catch {
    return NextResponse.json({ ok: false, error: "Could not save the member." }, { status: 500 });
  }
}

/** Status-only change, used by the one-click verify button. */
export async function PATCH(request: Request) {
  const admin = await guard();
  if (!admin) return unauthorized();

  let body: { id?: number; status?: string };
  try {
    body = (await request.json()) as { id?: number; status?: string };
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const id = Number(body.id);
  if (!Number.isInteger(id) || id < 1) {
    return NextResponse.json({ ok: false, error: "Missing id." }, { status: 400 });
  }

  try {
    const member = await setMemberStatus(id, String(body.status || ""));
    if (!member) return NextResponse.json({ ok: false, error: "Not found." }, { status: 404 });
    await logActivity(
      admin, "update", "member",
      `Set ${member.fullName} to ${member.status}`, id,
    );
    return NextResponse.json({ ok: true, member });
  } catch {
    return NextResponse.json({ ok: false, error: "Could not update." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const admin = await guard();
  if (!admin) return unauthorized();

  // Accepts ?id= so the button works with a plain query string.
  const fromQuery = Number(new URL(request.url).searchParams.get("id"));
  let id = fromQuery;
  if (!Number.isInteger(id) || id < 1) {
    try {
      const body = (await request.json()) as { id?: number };
      id = Number(body.id);
    } catch {
      id = NaN;
    }
  }
  if (!Number.isInteger(id) || id < 1) {
    return NextResponse.json({ ok: false, error: "Missing id." }, { status: 400 });
  }

  try {
    const removed = await deleteMember(id);
    if (!removed) return NextResponse.json({ ok: false, error: "Not found." }, { status: 404 });
    await logActivity(admin, "delete", "member", `Removed member #${id}`, id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "Could not delete." }, { status: 500 });
  }
}
