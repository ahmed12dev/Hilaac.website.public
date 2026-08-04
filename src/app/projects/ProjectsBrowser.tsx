"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { ProjectCard } from "@/components/ui/ProjectCard";
import { Section } from "@/components/ui/Section";
import { useLanguage } from "@/lib/i18n/provider";
import type { Project, ProjectStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

type Filter = "all" | ProjectStatus;

const FILTERS: Filter[] = ["all", "ongoing", "completed", "planned", "paused"];

export function ProjectsBrowser({ projects }: { projects: Project[] }) {
  const { tr } = useLanguage();
  const [filter, setFilter] = useState<Filter>("all");

  const visible = useMemo(
    () => (filter === "all" ? projects : projects.filter((p) => p.status === filter)),
    [projects, filter],
  );

  const counts = useMemo(() => {
    const map = new Map<Filter, number>([["all", projects.length]]);
    for (const project of projects) {
      map.set(project.status, (map.get(project.status) ?? 0) + 1);
    }
    return map;
  }, [projects]);

  return (
    <>
      <PageHeader
        eyebrow={tr("nav.projects")}
        title={tr("projects.title")}
        subtitle={tr("projects.subtitle")}
        breadcrumbs={[{ label: tr("nav.projects") }]}
      />

      <Section>
        <div className="container-page">
          <div className="mb-12 flex flex-wrap justify-center gap-2.5">
            {FILTERS.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setFilter(value)}
                aria-pressed={filter === value}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-bold transition-all",
                  filter === value
                    ? "border-transparent bg-gold-gradient text-ink-900 shadow-gold"
                    : "border-ink-200/70 text-ink-600 hover:border-gold-500 hover:text-gold-600 dark:border-ink-700 dark:text-ink-300",
                )}
              >
                {value === "all" ? tr("news.all") : tr(`projects.status.${value}`)}
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[0.68rem]",
                    filter === value ? "bg-ink-900/15" : "bg-ink-500/10",
                  )}
                >
                  {counts.get(value) ?? 0}
                </span>
              </button>
            ))}
          </div>

          {visible.length === 0 ? (
            <p className="py-20 text-center text-ink-500">{tr("projects.empty")}</p>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={filter}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35 }}
                className="grid gap-7 md:grid-cols-2 lg:grid-cols-3"
              >
                {visible.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </Section>
    </>
  );
}
