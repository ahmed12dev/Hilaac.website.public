import type { Metadata } from "next";
import { listSubscribers } from "@/lib/server/collections";
import { SubscribersManager } from "./SubscribersManager";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Subscribers",
  robots: { index: false, follow: false },
};

export default async function SubscribersAdminPage() {
  const items = await listSubscribers().catch(() => []);
  return <SubscribersManager initialItems={items} />;
}
