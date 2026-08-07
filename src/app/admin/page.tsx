import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { currentAdmin } from "@/lib/server/auth";
import { AdminLogin } from "./AdminLogin";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin",
  description: "Website administration for Xisbiga Hilaac.",
  robots: { index: false, follow: false },
};

/**
 * /admin — the WEBSITE's own sign-in.
 *
 * This is not the registration system's admin panel. It has its own accounts
 * (`site_admins`) and manages website content only. Registration data stays
 * entirely inside the registration system.
 */
export default async function AdminPage() {
  const admin = await currentAdmin();
  if (admin) redirect("/admin/dashboard");
  return <AdminLogin />;
}
