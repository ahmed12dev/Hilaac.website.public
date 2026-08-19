"use client";

import {
  Facebook,
  Globe,
  Instagram,
  Linkedin,
  Mail,
  Twitter,
  Youtube,
  type LucideIcon,
} from "lucide-react";
import { MediaImage } from "@/components/ui/MediaImage";
import { StaggerGroup, StaggerItem } from "@/components/ui/Reveal";
import { Section, SectionHeading } from "@/components/ui/Section";
import { useLanguage } from "@/lib/i18n/provider";
import type { Leader } from "@/lib/types";

const SOCIAL_ICONS: Record<string, LucideIcon> = {
  facebook: Facebook,
  x: Twitter,
  twitter: Twitter,
  instagram: Instagram,
  linkedin: Linkedin,
  youtube: Youtube,
  website: Globe,
  email: Mail,
};

export function Leadership({
  leaders,
  limit,
  hideHeading,
}: {
  leaders: Leader[];
  limit?: number;
  /** Set on the dedicated page, where <PageHeader> already states the title. */
  hideHeading?: boolean;
}) {
  const { tr, tx } = useLanguage();
  const list = limit ? leaders.slice(0, limit) : leaders;

  // On the homepage an empty section is worse than no section at all; the
  // dedicated page says so in words instead.
  if (!list.length && !hideHeading) return null;

  return (
    <Section id="leadership">
      <div className="container-page">
        {!hideHeading && (
          <SectionHeading
            eyebrow={tr("nav.leadership")}
            title={tr("leadership.title")}
            subtitle={tr("leadership.subtitle")}
          />
        )}

        {list.length === 0 && (
          <p className="py-14 text-center text-ink-500">{tr("leadership.empty")}</p>
        )}

        <StaggerGroup className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((leader) => (
            <StaggerItem key={leader.id}>
              <article className="group relative h-full overflow-hidden rounded-4xl border border-ink-200/70 bg-white transition-all duration-500 hover:-translate-y-2 hover:border-gold-500/50 hover:shadow-gold-lg dark:border-ink-800 dark:bg-ink-900">
                {/* Portrait */}
                <div className="relative aspect-4/5 overflow-hidden">
                  <MediaImage
                    src={leader.photo}
                    alt={leader.name}
                    className="absolute inset-0 h-full w-full"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  {/* Gradient scrim */}
                  <div
                    className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-ink-950/92 via-ink-950/45 to-transparent"
                    aria-hidden
                  />

                  {/* Socials — slide up on hover */}
                  {leader.socials && Object.values(leader.socials).some(Boolean) && (
                    <div className="absolute inset-x-0 bottom-0 flex translate-y-full justify-center gap-2 p-5 opacity-0 transition-all duration-400 group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100">
                      {Object.entries(leader.socials)
                        .filter(([, url]) => Boolean(url))
                        .map(([key, url]) => {
                          const Icon = SOCIAL_ICONS[key] ?? Globe;
                          const href = key === "email" ? `mailto:${url}` : (url as string);
                          return (
                            <a
                              key={key}
                              href={href}
                              target={key === "email" ? undefined : "_blank"}
                              rel="noopener noreferrer"
                              aria-label={`${leader.name} — ${key}`}
                              className="grid h-9 w-9 place-items-center rounded-full border border-white/25 bg-white/15 text-white backdrop-blur transition-all hover:scale-110 hover:border-gold-500 hover:bg-gold-500 hover:text-ink-900"
                            >
                              <Icon className="h-4 w-4" />
                            </a>
                          );
                        })}
                    </div>
                  )}

                  {/* Name plate over the scrim */}
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 p-5 transition-all duration-400 group-hover:-translate-y-14 group-focus-within:-translate-y-14">
                    <h3 className="font-display text-xl font-extrabold text-white">{leader.name}</h3>
                    <p className="mt-1 text-sm font-semibold text-gold-400">{tx(leader.position)}</p>
                  </div>
                </div>

                {/* Bio */}
                <div className="p-6">
                  <p className="line-clamp-3x text-sm leading-relaxed text-ink-600 dark:text-ink-400">
                    {tx(leader.bio)}
                  </p>
                  {leader.region && (
                    <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-gold-600 dark:text-gold-400">
                      {leader.region}
                    </p>
                  )}
                </div>
              </article>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>
    </Section>
  );
}
