import type { Metadata } from "next";
import { currentAdmin } from "@/lib/server/auth";
import { contentCounts } from "@/lib/server/content";
import { getLiveTotals } from "@/lib/api";
import { Overview } from "./Overview";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
};

export default async function DashboardPage() {
  const admin = await currentAdmin();

  // Member figures are READ over HTTPS from the registration system; content
  // counts come from this website's own tables.
  const [totals, counts] = await Promise.all([
    getLiveTotals(),
    contentCounts().catch(() => null),
  ]);

  return <Overview adminName={admin?.name || admin?.email || ""} totals={totals} counts={counts} />;
}
