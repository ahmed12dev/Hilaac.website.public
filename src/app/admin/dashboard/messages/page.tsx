import type { Metadata } from "next";
import { listMessages } from "@/lib/server/collections";
import { MessagesManager } from "./MessagesManager";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Messages", robots: { index: false, follow: false } };

export default async function MessagesAdminPage() {
  const items = await listMessages().catch(() => []);
  return <MessagesManager initialItems={items} />;
}
