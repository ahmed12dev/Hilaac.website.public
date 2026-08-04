"use client";

import { ArrowRight } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { ProjectCard } from "@/components/ui/ProjectCard";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/ui/Reveal";
import { Section, SectionHeading } from "@/components/ui/Section";
import { useLanguage } from "@/lib/i18n/provider";
import type { Project } from "@/lib/types";

export function ProjectsPreview({ projects }: { projects: Project[] }) {
  const { tr } = useLanguage();
  if (!projects.length) return null;

  return (
    <Section id="projects">
      <div className="container-page">
        <SectionHeading
          eyebrow={tr("nav.projects")}
          title={tr("projects.title")}
          subtitle={tr("projects.subtitle")}
        />

        <StaggerGroup className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">
          {projects.slice(0, 3).map((project) => (
            <StaggerItem key={project.id}>
              <ProjectCard project={project} />
            </StaggerItem>
          ))}
        </StaggerGroup>

        <Reveal className="mt-12 text-center">
          <ButtonLink href="/projects" variant="outline" size="lg">
            {tr("cta.viewAll")}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </ButtonLink>
        </Reveal>
      </div>
    </Section>
  );
}
