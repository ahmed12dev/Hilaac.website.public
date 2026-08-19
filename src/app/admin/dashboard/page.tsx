import type { Metadata } from "next";
import { currentAdmin } from "@/lib/server/auth";
import { listActivity } from "@/lib/server/activity";
import { contentCounts } from "@/lib/server/content";
import { memberStats } from "@/lib/server/members";
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
  // counts, the local registry and the activity log come from this website's
  // own tables. Each is allowed to fail on its own without blanking the page.
  const [totals, counts, members, activity] = await Promise.all([
    getLiveTotals(),
    contentCounts().catch(() => null),
    memberStats().catch(() => null),
    listActivity(8).catch(() => []),
  ]);

  return (
    <Overview
      adminName={admin?.name || admin?.email || ""}
      totals={totals}
      counts={counts}
      memberCount={members?.total ?? null}
      activity={activity}
    />
  );
}
