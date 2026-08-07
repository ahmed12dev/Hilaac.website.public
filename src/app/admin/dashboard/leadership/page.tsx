import type { Metadata } from "next";
import { listLeadersAdmin } from "@/lib/server/collections";
import { LeadershipManager } from "./LeadershipManager";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Leadership", robots: { index: false, follow: false } };

export default async function LeadershipAdminPage() {
  const items = await listLeadersAdmin().catch(() => []);
  return <LeadershipManager initialItems={items} />;
}
