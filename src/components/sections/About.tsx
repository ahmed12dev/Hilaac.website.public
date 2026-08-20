"use client";

import { motion } from "framer-motion";
import {
  BookOpen,
  Compass,
  Heart,
  Scale,
  Shield,
  Sprout,
  Target,
  Users,
  type LucideIcon,
} from "lucide-react";
import { BookProse } from "@/components/ui/BookProse";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/ui/Reveal";
import { Section, SectionHeading } from "@/components/ui/Section";
import { useLanguage } from "@/lib/i18n/provider";
import type { SiteSettings } from "@/lib/types";

const VALUE_ICONS: Record<string, LucideIcon> = {
  shield: Shield,
  users: Users,
  scale: Scale,
  sprout: Sprout,
  heart: Heart,
  compass: Compass,
};

export function About({
  settings,
  compact = false,
  hideHeading,
}: {
  settings: SiteSettings;
  /** Drops the timeline — used where the page shows it elsewhere. */
  compact?: boolean;
  /** Set on the dedicated page, where <PageHeader> already states the title. */
  hideHeading?: boolean;
}) {
  const { tr, tx } = useLanguage();
  const { about } = settings;

  const pillars = [
    { icon: BookOpen, title: tr("about.history"), body: tx(about.history) },
    { icon: Compass, title: tr("about.vision"), body: tx(about.vision) },
    { icon: Target, title: tr("about.mission"), body: tx(about.mission) },
  ];

  return (
    <Section id="about" muted>
      <div className="container-page">
        {!hideHeading && (
          <SectionHeading
            eyebrow={tr("nav.about")}
            title={tr("about.title")}
            subtitle={tr("about.subtitle")}
          />
        )}

        {/* History / Vision / Mission — set as one page of a book, the same
            way the constitution reads. */}
        <Reveal>
          <article className="book-paper mx-auto max-w-3xl rounded-4xl border border-ink-200/70 p-7 shadow-soft dark:border-ink-800 sm:p-12 lg:p-16">
            {pillars.map(({ icon: Icon, title, body }, index) => (
              <section
                key={title}
                id={`about-${index}`}
                className={index > 0 ? "mt-14 scroll-mt-28" : "scroll-mt-28"}
              >
                {/* An ornamental rule separates one passage from the next. */}
                {index > 0 && (
                  <div className="mb-12 flex items-center justify-center gap-3" aria-hidden>
                    <span className="h-px w-16 bg-gradient-to-r from-transparent to-gold-500/50" />
                    <span className="h-1.5 w-1.5 rotate-45 bg-gold-500/60" />
                    <span className="h-px w-16 bg-gradient-to-l from-transparent to-gold-500/50" />
                  </div>
                )}

                <header className="mb-7 text-center">
                  <span className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-gold-gradient text-ink-900 shadow-gold">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="font-display text-2xl font-extrabold sm:text-3xl">{title}</h3>
                  <div className="hairline-gold mx-auto mt-4 h-px w-20" />
                </header>

                <BookProse text={body} dropCap={index === 0} />
              </section>
            ))}
          </article>
        </Reveal>

        {/* Core values */}
        {about.values?.length > 0 && (
          <div className="mt-20">
            <Reveal className="mb-10 text-center">
              <h3 className="font-display text-2xl font-bold sm:text-3xl">{tr("about.values")}</h3>
              <div className="hairline-gold mx-auto mt-4 h-px w-20" aria-hidden />
            </Reveal>

            <StaggerGroup className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {about.values.map((value) => {
                const Icon = VALUE_ICONS[value.icon ?? "shield"] ?? Shield;
                return (
                  <StaggerItem key={value.id}>
                    <div className="glass h-full rounded-3xl p-6 transition-all duration-500 hover:-translate-y-1 hover:border-gold-500/40">
                      <span className="mb-4 grid h-12 w-12 place-items-center rounded-2xl border border-gold-500/30 bg-gold-500/10 text-gold-600 dark:text-gold-400">
                        <Icon className="h-5 w-5" />
                      </span>
                      <h4 className="mb-2 font-display text-lg font-bold">{tx(value.title)}</h4>
                      <p className="text-sm leading-relaxed text-ink-600 dark:text-ink-400">
                        {tx(value.description)}
                      </p>
                    </div>
                  </StaggerItem>
                );
              })}
            </StaggerGroup>
          </div>
        )}

        {/* Timeline */}
        {!compact && about.timeline?.length > 0 && (
          <div className="mt-24">
            <Reveal className="mb-12 text-center">
              <h3 className="font-display text-2xl font-bold sm:text-3xl">{tr("about.timeline")}</h3>
              <div className="hairline-gold mx-auto mt-4 h-px w-20" aria-hidden />
            </Reveal>

            <ol className="relative mx-auto max-w-3xl">
              {/* Spine */}
              <span
                className="absolute left-[19px] top-2 bottom-2 w-px bg-gradient-to-b from-gold-500 via-gold-500/40 to-transparent sm:left-1/2"
                aria-hidden
              />

              {about.timeline.map((entry, index) => (
                <li key={entry.id} className="relative mb-10 last:mb-0">
                  <div
                    className={
                      "flex flex-col gap-4 pl-14 sm:grid sm:grid-cols-2 sm:gap-10 sm:pl-0 " +
                      (index % 2 === 0 ? "" : "sm:[&>*:first-child]:col-start-2")
                    }
                  >
                    <motion.div
                      initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, margin: "-60px" }}
                      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                      className={
                        "rounded-3xl border border-ink-200/70 bg-white p-6 shadow-soft transition-all hover:border-gold-500/40 dark:border-ink-800 dark:bg-ink-900 " +
                        (index % 2 === 0 ? "sm:text-right" : "")
                      }
                    >
                      <span className="mb-2 inline-block rounded-full bg-gold-500/12 px-3 py-1 font-display text-sm font-extrabold text-gold-700 dark:text-gold-300">
                        {entry.year}
                      </span>
                      <h4 className="mb-1.5 font-display text-lg font-bold">{tx(entry.title)}</h4>
                      <p className="text-sm leading-relaxed text-ink-600 dark:text-ink-400">
                        {tx(entry.description)}
                      </p>
                    </motion.div>
                  </div>

                  {/* Node */}
                  <span
                    className="absolute left-[11px] top-7 grid h-[18px] w-[18px] place-items-center rounded-full bg-gold-gradient ring-4 ring-white shadow-gold dark:ring-ink-950 sm:left-1/2 sm:-translate-x-1/2"
                    aria-hidden
                  />
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </Section>
  );
}
