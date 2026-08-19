import type { Metadata } from "next";
import { AnalyticsView } from "./AnalyticsView";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Analytics",
  robots: { index: false, follow: false },
};

export default function AnalyticsPage() {
  return <AnalyticsView />;
}
