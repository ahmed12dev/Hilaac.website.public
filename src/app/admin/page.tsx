import type { Metadata } from "next";
import { AdminGateway } from "./AdminGateway";

export const metadata: Metadata = {
  title: "Admin",
  description: "Administrator access for Xisbiga Hilaac.",
  robots: { index: false, follow: false },
};

/**
 * /admin — the door to the management dashboard.
 *
 * The dashboard is a separate application on its own host, so this page sends
 * administrators there rather than embedding a second login. NEXT_PUBLIC_ADMIN_URL
 * points at it; without that, it falls back to the registration system's own
 * admin panel.
 */
export default function AdminPage() {
  return <AdminGateway />;
}
