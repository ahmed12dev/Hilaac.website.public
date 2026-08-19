import { NextResponse } from "next/server";
import { SESSION_COOKIE, sessionCookieOptions, signIn, signOut } from "@/lib/server/auth";
import { logActivity } from "@/lib/server/activity";

export const dynamic = "force-dynamic";

/**
 * The WEBSITE's own admin sign-in.
 *
 * Deliberately not the registration system's /api/admin/login — these are two
 * independent systems with separate accounts. A registration-system admin
 * cannot sign in here.
 */
export async function POST(request: Request) {
  let email = "";
  let password = "";
  try {
    const body = (await request.json()) as { email?: string; password?: string };
    email = String(body.email || "");
    password = String(body.password || "");
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  if (!email || !password) {
    return NextResponse.json(
      { ok: false, error: "Email iyo password waa loo baahan yahay. / Email and password are required." },
      { status: 400 },
    );
  }

  try {
    const result = await signIn(email, password);
    if (!result) {
      // Same message whether the account is missing or the password is wrong,
      // so this can't be used to discover which emails exist.
      return NextResponse.json(
        { ok: false, error: "Email ama password waa qaldan yahay. / Email or password is incorrect." },
        { status: 401 },
      );
    }

    await logActivity(result.admin, "login", "session", "Signed in", result.admin.id);

    const res = NextResponse.json({ ok: true, admin: result.admin });
    res.cookies.set(SESSION_COOKIE, result.token, sessionCookieOptions());
    return res;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Lama gaari karo database-ka. / Cannot reach the database." },
      { status: 503 },
    );
  }
}

/** Sign out — clears the session both server-side and in the browser. */
export async function DELETE() {
  await signOut();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, "", { ...sessionCookieOptions(), maxAge: 0 });
  return res;
}
