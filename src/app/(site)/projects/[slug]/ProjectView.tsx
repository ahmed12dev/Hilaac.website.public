"use client";

import { ArrowLeft, CalendarRange, MapPin, Tag, Wallet } from "lucide-react";
import Link from "next/link";
import { StatusBadge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { MediaImage } from "@/components/ui/MediaImage";
import { PageHeader } from "@/components/ui/PageHeader";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { ProjectCard } from "@/components/ui/ProjectCard";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { useLanguage } from "@/lib/i18n/provider";
import type { Project } from "@/lib/types";
import { formatDate, formatMoney, joinUrl } from "@/lib/utils";

export function ProjectView({ project, related }: { project: Project; related: Project[] }) {
  const { tr, tx, locale } = useLanguage();
  const body = tx(project.body) || tx(project.description);

  const facts = [
    {
      icon: Wallet,
      label: tr("projects.budget"),
      value: formatMoney(project.budget, project.currency),
    },
    {
      icon: CalendarRange,
      label: tr("projects.start"),
      value: formatDate(project.startDate, locale) || "—",
    },
    {
      icon: CalendarRange,
      label: tr("projects.end"),
      value: formatDate(project.endDate, locale) || "—",
    },
    ...(project.location
      ? [{ icon: MapPin, label: tr("contact.address"), value: project.location }]
      : []),
    ...(project.category ? [{ icon: Tag, label: "Category", value: project.category }] : []),
  ];

  return (
    <>
      <PageHeader
        eyebrow={project.category}
        title={tx(project.title)}
        breadcrumbs={[
          { label: tr("nav.projects"), href: "/projects" },
          { label: tx(project.title).slice(0, 42) },
        ]}
      />

      <Section>
        <div className="container-page">
          <div className="grid gap-10 lg:grid-cols-12">
            {/* Main */}
            <div className="lg:col-span-8">
              <Reveal className="mb-9">
                <div className="relative aspect-16/9 overflow-hidden rounded-4xl border border-ink-200/70 dark:border-ink-800">
                  <MediaImage
                    src={project.cover}
                    alt={tx(project.title)}
                    className="absolute inset-0 h-full w-full"
                    sizes="(max-width: 1024px) 100vw, 66vw"
                    priority
                  />
                  <StatusBadge status={project.status} className="absolute left-5 top-5 backdrop-blur-md" />
                </div>
              </Reveal>

              <Reveal>
                <p className="mb-8 border-l-4 border-gold-500 pl-5 font-display text-lg leading-relaxed text-ink-700 dark:text-ink-200">
                  {tx(project.description)}
                </p>

                <div className="space-y-5 text-[1.02rem] leading-[1.85] text-ink-700 dark:text-ink-300">
                  {body
                    .split(/\n{2,}/)
                    .filter(Boolean)
                    .map((paragraph, index) => (
                      <p key={index}>{paragraph}</p>
                    ))}
                </div>
              </Reveal>

              <Reveal className="mt-12">
                <Link
                  href="/projects"
                  className="inline-flex items-center gap-2 rounded-full border border-ink-200/70 px-5 py-3 text-sm font-bold transition-all hover:-translate-x-0.5 hover:border-gold-500 hover:text-gold-600 dark:border-ink-700"
                >
                  <ArrowLeft className="h-4 w-4" />
                  {tr("nav.projects")}
                </Link>
              </Reveal>
            </div>

            {/* Sidebar */}
            <aside className="lg:col-span-4">
              <Reveal direction="left" className="lg:sticky lg:top-28">
                <div className="rounded-4xl border border-ink-200/70 bg-white p-7 shadow-soft dark:border-ink-800 dark:bg-ink-900">
                  <ProgressBar
                    value={project.progress}
                    label={tr("projects.progress")}
                    className="mb-7"
                  />

                  <dl className="space-y-5">
                    {facts.map(({ icon: Icon, label, value }) => (
                      <div key={label} className="flex items-start gap-3.5">
                        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gold-500/12 text-gold-600 dark:text-gold-400">
                          <Icon className="h-[18px] w-[18px]" />
                        </span>
                        <span className="min-w-0">
                          <dt className="text-xs font-bold uppercase tracking-wider text-ink-400">
                            {label}
                          </dt>
                          <dd className="font-semibold">{value}</dd>
                        </span>
                      </div>
                    ))}
                  </dl>

                  <ButtonLink href={joinUrl(null)} className="mt-8 w-full">
                    {tr("cta.join")}
                  </ButtonLink>
                </div>
              </Reveal>
            </aside>
          </div>

          {related.length > 0 && (
            <div className="mt-20">
              <Reveal className="mb-8">
                <h2 className="font-display text-2xl font-bold">{tr("projects.title")}</h2>
                <div className="hairline-gold mt-4 h-px w-24" aria-hidden />
              </Reveal>
              <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">
                {related.map((item) => (
                  <ProjectCard key={item.id} project={item} />
                ))}
              </div>
            </div>
          )}
        </div>
      </Section>
    </>
  );
}
