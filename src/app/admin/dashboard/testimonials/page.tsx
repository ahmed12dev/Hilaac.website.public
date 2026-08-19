import type { Metadata } from "next";
import { listTestimonialsAdmin } from "@/lib/server/collections";
import { TestimonialsManager } from "./TestimonialsManager";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Testimonials",
  robots: { index: false, follow: false },
};

export default async function TestimonialsAdminPage() {
  const items = await listTestimonialsAdmin().catch(() => []);
  return <TestimonialsManager initialItems={items} />;
}
