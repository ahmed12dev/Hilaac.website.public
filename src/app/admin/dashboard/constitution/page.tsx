import type { Metadata } from "next";
import { listConstitutionAdmin } from "@/lib/server/collections";
import { ConstitutionManager } from "./ConstitutionManager";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Constitution",
  robots: { index: false, follow: false },
};

export default async function ConstitutionAdminPage() {
  const items = await listConstitutionAdmin().catch(() => []);
  return <ConstitutionManager initialItems={items} />;
}
