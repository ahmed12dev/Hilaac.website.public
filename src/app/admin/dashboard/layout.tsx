import { redirect } from "next/navigation";
import { currentAdmin } from "@/lib/server/auth";
import { AdminNav } from "./AdminNav";

export const dynamic = "force-dynamic";

/**
 * Shell for every admin screen: the session guard lives here, so no page
 * beneath it can render without a valid website-admin session.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await currentAdmin();
  if (!admin) redirect("/admin");

  return (
    <div className="admin-theme min-h-screen bg-ink-950 text-white">
      <AdminNav admin={admin} />
      <div className="lg:pl-64">
        <main className="mx-auto max-w-6xl px-5 py-8 sm:px-8 lg:py-10">{children}</main>
      </div>
    </div>
  );
}
