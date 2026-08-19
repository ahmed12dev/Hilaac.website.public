import type { Metadata } from "next";
import { MediaManager } from "./MediaManager";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Media library",
  robots: { index: false, follow: false },
};

export default function MediaAdminPage() {
  return <MediaManager />;
}
