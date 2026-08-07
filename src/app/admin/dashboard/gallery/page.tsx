import type { Metadata } from "next";
import { listGalleryAdmin } from "@/lib/server/collections";
import { GalleryManager } from "./GalleryManager";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Gallery", robots: { index: false, follow: false } };

export default async function GalleryAdminPage() {
  const items = await listGalleryAdmin().catch(() => []);
  return <GalleryManager initialItems={items} />;
}
