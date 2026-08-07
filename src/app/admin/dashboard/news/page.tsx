import type { Metadata } from "next";
import { listNews } from "@/lib/server/content";
import { NewsManager } from "./NewsManager";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "News",
  robots: { index: false, follow: false },
};

export default async function NewsPage() {
  const items = await listNews().catch(() => []);
  return <NewsManager initialItems={items} />;
}
