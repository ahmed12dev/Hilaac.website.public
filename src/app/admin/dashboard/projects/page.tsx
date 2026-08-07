import type { Metadata } from "next";
import { listProjects } from "@/lib/server/content";
import { ProjectsManager } from "./ProjectsManager";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Projects",
  robots: { index: false, follow: false },
};

export default async function ProjectsAdminPage() {
  const items = await listProjects().catch(() => []);
  return <ProjectsManager initialItems={items} />;
}
