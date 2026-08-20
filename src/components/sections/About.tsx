"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
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
import Link from "next/link";
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
    { icon: BookOpen, title: tr("about.history"), body: tx(about.history), topic: "history" },
    { icon: Compass, title: tr("about.vision"), body: tx(about.vision), topic: "vision" },
    { icon: Target, title: tr("about.mission"), body: tx(about.mission), topic: "mission" },
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

        {/* History / Vision / Mission — a card each, opening its own
            reading page. The card carries the short version; the full text
            lives at /about/<topic>. */}
        <StaggerGroup className="grid gap-6 md:grid-cols-3">
          {pillars.map(({ icon: Icon, title, body, topic }) => (
            <StaggerItem key={topic}>
              <Link
                href={`/about/${topic}`}
                className="group relative flex h-full flex-col overflow-hidden rounded-4xl border border-ink-200/70 bg-white p-8 transition-all duration-500 hover:-translate-y-1.5 hover:border-gold-500/40 hover:shadow-gold dark:border-ink-800 dark:bg-ink-900"
              >
                <span
                  className="absolute -right-14 -top-14 h-40 w-40 rounded-full bg-gold-500/10 blur-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  aria-hidden
                />
                <span className="relative mb-6 grid h-14 w-14 place-items-center rounded-2xl bg-gold-gradient text-ink-900 shadow-gold">
                  <Icon className="h-6 w-6" />
                </span>
                <h3 className="relative mb-3 font-display text-xl font-bold">{title}</h3>
                <p className="relative line-clamp-5 text-[0.95rem] leading-relaxed text-ink-600 dark:text-ink-400">
                  {body}
                </p>
                <span className="relative mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-gold-700 dark:text-gold-400">
                  {tr("cta.readMore")}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            </StaggerItem>
          ))}
        </StaggerGroup>

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
