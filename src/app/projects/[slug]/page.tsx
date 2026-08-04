import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllProjectSlugs, getProject, getProjects } from "@/lib/api";
import { t } from "@/lib/utils";
import { ProjectView } from "./ProjectView";

export const revalidate = 300;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = await getAllProjectSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) return { title: "Not found" };

  return {
    title: t(project.title, "so"),
    description: t(project.description, "so"),
    alternates: { canonical: `/projects/${slug}` },
    openGraph: {
      title: t(project.title, "so"),
      description: t(project.description, "so"),
      images: project.cover ? [{ url: project.cover }] : undefined,
    },
  };
}

export default async function ProjectPage({ params }: PageProps) {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) notFound();

  const all = await getProjects();
  const related = all.filter((item) => item.slug !== slug).slice(0, 3);

  return <ProjectView project={project} related={related} />;
}
