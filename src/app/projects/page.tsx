import type { Metadata } from "next";
import { getProjects } from "@/lib/api";
import { ProjectsBrowser } from "./ProjectsBrowser";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Mashruucyada — Projects",
  description:
    "Schools, clean water, health centres and youth training — the projects Xisbiga Hilaac is delivering across Somalia.",
  alternates: { canonical: "/projects" },
};

export default async function ProjectsPage() {
  const projects = await getProjects();
  return <ProjectsBrowser projects={projects} />;
}
