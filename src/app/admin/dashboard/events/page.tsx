import type { Metadata } from "next";
import { listEventsAdmin } from "@/lib/server/collections";
import { EventsManager } from "./EventsManager";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Events", robots: { index: false, follow: false } };

export default async function EventsAdminPage() {
  const items = await listEventsAdmin().catch(() => []);
  return <EventsManager initialItems={items} />;
}
