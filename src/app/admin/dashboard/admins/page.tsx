import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { currentAdmin } from "@/lib/server/auth";
import { AdminsManager } from "./AdminsManager";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Administrators",
  robots: { index: false, follow: false },
};

export default async function AdminsPage() {
  const admin = await currentAdmin();
  if (!admin) redirect("/admin");
  return <AdminsManager me={admin} />;
}
