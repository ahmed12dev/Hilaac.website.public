import type { Metadata } from "next";
import { getContentProjects } from "@/lib/api";
import { ProjectsBrowser } from "./ProjectsBrowser";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Mashruucyada — Projects",
  description:
    "Schools, clean water, health centres and youth training — the projects Xisbiga Hilaac is delivering across Somalia.",
  alternates: { canonical: "/projects" },
};

export default async function ProjectsPage() {
  const projects = await getContentProjects();
  return <ProjectsBrowser projects={projects} />;
}
