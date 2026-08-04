"use client";

import { ArrowUpRight, CalendarRange, MapPin, Wallet } from "lucide-react";
import Link from "next/link";
import { StatusBadge } from "@/components/ui/Badge";
import { MediaImage } from "@/components/ui/MediaImage";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useLanguage } from "@/lib/i18n/provider";
import type { Project } from "@/lib/types";
import { cn, formatDate, formatMoney } from "@/lib/utils";

export function ProjectCard({ project, className }: { project: Project; className?: string }) {
  const { tr, tx, locale } = useLanguage();

  return (
    <article
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-4xl border border-ink-200/70 bg-white",
        "transition-all duration-500 hover:-translate-y-2 hover:border-gold-500/50 hover:shadow-gold-lg",
        "dark:border-ink-800 dark:bg-ink-900",
        className,
      )}
    >
      <div className="relative aspect-16/10 overflow-hidden">
        <MediaImage
          src={project.cover}
          alt={tx(project.title)}
          className="absolute inset-0 h-full w-full"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        <div className="absolute inset-x-4 top-4 flex items-start justify-between gap-3">
          <StatusBadge status={project.status} className="backdrop-blur-md" />
          {project.category && (
            <span className="rounded-full bg-ink-900/80 px-3 py-1 text-xs font-bold text-white backdrop-blur-sm">
              {project.category}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <h3 className="line-clamp-2x mb-3 font-display text-lg font-bold leading-snug transition-colors group-hover:text-gold-600 dark:group-hover:text-gold-400">
          {tx(project.title)}
        </h3>

        <p className="line-clamp-3x mb-6 text-sm leading-relaxed text-ink-600 dark:text-ink-400">
          {tx(project.description)}
        </p>

        <ProgressBar value={project.progress} label={tr("projects.progress")} className="mb-6" />

        <dl className="mb-6 grid grid-cols-2 gap-4 border-t border-ink-200/70 pt-5 text-sm dark:border-ink-800">
          <div>
            <dt className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-ink-400">
              <Wallet className="h-3.5 w-3.5 text-gold-500" aria-hidden />
              {tr("projects.budget")}
            </dt>
            <dd className="font-display font-bold text-gold-700 dark:text-gold-400">
              {formatMoney(project.budget, project.currency)}
            </dd>
          </div>
          <div>
            <dt className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-ink-400">
              <CalendarRange className="h-3.5 w-3.5 text-gold-500" aria-hidden />
              {tr("projects.start")}
            </dt>
            <dd className="font-medium">{formatDate(project.startDate, locale) || "—"}</dd>
          </div>
          <div>
            <dt className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-ink-400">
              <CalendarRange className="h-3.5 w-3.5 text-gold-500" aria-hidden />
              {tr("projects.end")}
            </dt>
            <dd className="font-medium">{formatDate(project.endDate, locale) || "—"}</dd>
          </div>
          {project.location && (
            <div>
              <dt className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-ink-400">
                <MapPin className="h-3.5 w-3.5 text-gold-500" aria-hidden />
                {tr("contact.address")}
              </dt>
              <dd className="font-medium">{project.location}</dd>
            </div>
          )}
        </dl>

        <Link
          href={`/projects/${project.slug}`}
          className="mt-auto inline-flex w-fit items-center gap-1.5 text-sm font-bold text-gold-600 transition-all hover:gap-2.5 dark:text-gold-400"
        >
          <span className="absolute inset-0" aria-hidden />
          {tr("cta.readMore")}
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}
