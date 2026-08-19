import { NextResponse } from "next/server";
import {
  changeOwnPassword,
  createAdmin,
  currentAdmin,
  deleteAdmin,
  listAdmins,
  updateAdmin,
} from "@/lib/server/auth";
import { logActivity } from "@/lib/server/activity";

export const dynamic = "force-dynamic";

/**
 * Administrator accounts.
 *
 * Only an `owner` may add, edit or remove accounts. An `editor` can still
 * change their own password — that path is checked separately below.
 */

function unauthorized() {
  return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
}

function forbidden() {
  return NextResponse.json(
    { ok: false, error: "Only an owner can manage administrator accounts." },
    { status: 403 },
  );
}

export async function GET() {
  const admin = await currentAdmin();
  if (!admin) return unauthorized();
  if (admin.role !== "owner") return forbidden();

  try {
    return NextResponse.json({ ok: true, items: await listAdmins(), me: admin });
  } catch {
    return NextResponse.json({ ok: false, error: "Database unavailable." }, { status: 503 });
  }
}

export async function POST(request: Request) {
  const admin = await currentAdmin();
  if (!admin) return unauthorized();
  if (admin.role !== "owner") return forbidden();

  let body: { email?: string; name?: string; password?: string; role?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  try {
    const result = await createAdmin({
      email: String(body.email || ""),
      name: body.name,
      password: String(body.password || ""),
      role: body.role,
    });
    if ("error" in result) {
      return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
    }
    await logActivity(admin, "create", "admin", `Added administrator ${result.email}`, result.id);
    return NextResponse.json({ ok: true, item: result }, { status: 201 });
  } catch {
    return NextResponse.json({ ok: false, error: "Could not create the account." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const admin = await currentAdmin();
  if (!admin) return unauthorized();

  let body: {
    id?: string;
    name?: string;
    role?: string;
    password?: string;
    currentPassword?: string;
    self?: boolean;
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  // Anyone may change their own password, but only by proving the current one.
  if (body.self) {
    try {
      const result = await changeOwnPassword(
        admin,
        String(body.currentPassword || ""),
        String(body.password || ""),
      );
      if ("error" in result) {
        return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
      }
      await logActivity(admin, "update", "admin", "Changed their own password", admin.id);
      return NextResponse.json({ ok: true });
    } catch {
      return NextResponse.json({ ok: false, error: "Could not change the password." }, { status: 500 });
    }
  }

  if (admin.role !== "owner") return forbidden();

  const id = String(body.id || "");
  if (!id) return NextResponse.json({ ok: false, error: "Missing id." }, { status: 400 });

  // Removing your own owner role would lock you out of this screen.
  if (id === admin.id && body.role && body.role !== "owner") {
    return NextResponse.json(
      { ok: false, error: "You cannot remove your own owner role." },
      { status: 400 },
    );
  }

  try {
    const result = await updateAdmin(id, body);
    if ("error" in result) {
      return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
    }
    await logActivity(admin, "update", "admin", `Updated administrator ${result.email}`, id);
    return NextResponse.json({ ok: true, item: result });
  } catch {
    return NextResponse.json({ ok: false, error: "Could not save." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const admin = await currentAdmin();
  if (!admin) return unauthorized();
  if (admin.role !== "owner") return forbidden();

  const id = new URL(request.url).searchParams.get("id") || "";
  if (!id) return NextResponse.json({ ok: false, error: "Missing id." }, { status: 400 });
  if (id === admin.id) {
    return NextResponse.json(
      { ok: false, error: "You cannot delete the account you are signed in with." },
      { status: 400 },
    );
  }

  try {
    const result = await deleteAdmin(id);
    if ("error" in result) {
      return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
    }
    await logActivity(admin, "delete", "admin", `Removed an administrator account`, id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "Could not delete." }, { status: 500 });
  }
}
