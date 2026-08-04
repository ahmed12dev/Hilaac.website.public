"use client";

import { motion } from "framer-motion";
import { ArrowRight, CalendarDays, Clock, MapPin, Users } from "lucide-react";
import { useState } from "react";
import { ButtonLink } from "@/components/ui/Button";
import { MediaImage } from "@/components/ui/MediaImage";
import { StaggerGroup, StaggerItem } from "@/components/ui/Reveal";
import { Section, SectionHeading } from "@/components/ui/Section";
import { useLanguage } from "@/lib/i18n/provider";
import type { PartyEvent } from "@/lib/types";
import { cn, dateParts, formatTime, joinUrl } from "@/lib/utils";

type Tab = "upcoming" | "past";

export function Events({
  events,
  limit,
  hideHeading,
}: {
  events: PartyEvent[];
  limit?: number;
  /** Set on the dedicated page, where <PageHeader> already states the title. */
  hideHeading?: boolean;
}) {
  const { tr, tx, locale } = useLanguage();
  const [tab, setTab] = useState<Tab>("upcoming");

  const filtered = events
    .filter((event) => (tab === "upcoming" ? event.status !== "past" : event.status === "past"))
    .sort((a, b) =>
      tab === "upcoming"
        ? +new Date(a.startsAt) - +new Date(b.startsAt)
        : +new Date(b.startsAt) - +new Date(a.startsAt),
    );

  const list = limit ? filtered.slice(0, limit) : filtered;

  return (
    <Section id="events" muted>
      <div className="container-page">
        {!hideHeading && (
          <SectionHeading
            eyebrow={tr("nav.events")}
            title={tr("events.title")}
            subtitle={tr("events.subtitle")}
          />
        )}

        {/* Tabs */}
        <div className="mb-11 flex justify-center">
          <div
            role="tablist"
            aria-label={tr("events.title")}
            className="inline-flex rounded-full border border-ink-200/70 bg-white p-1.5 dark:border-ink-800 dark:bg-ink-900"
          >
            {(["upcoming", "past"] as Tab[]).map((value) => (
              <button
                key={value}
                role="tab"
                type="button"
                aria-selected={tab === value}
                onClick={() => setTab(value)}
                className={cn(
                  "relative rounded-full px-6 py-2.5 text-sm font-bold transition-colors",
                  tab === value ? "text-ink-900" : "text-ink-500 hover:text-gold-600 dark:text-ink-400",
                )}
              >
                {tab === value && (
                  <motion.span
                    layoutId="events-tab"
                    className="absolute inset-0 rounded-full bg-gold-gradient shadow-gold"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}
                <span className="relative">
                  {value === "upcoming" ? tr("events.upcoming") : tr("events.past")}
                </span>
              </button>
            ))}
          </div>
        </div>

        {list.length === 0 ? (
          <p className="py-14 text-center text-ink-500">{tr("events.empty")}</p>
        ) : (
          <StaggerGroup className="grid gap-6 lg:grid-cols-2">
            {list.map((event) => {
              const { day, month, year } = dateParts(event.startsAt, locale);
              const isPast = event.status === "past";

              return (
                <StaggerItem key={event.id}>
                  <article
                    id={event.slug}
                    className={cn(
                      "group relative flex h-full flex-col gap-5 overflow-hidden rounded-4xl border border-ink-200/70",
                      "bg-white p-5 transition-all duration-500 hover:-translate-y-1.5 hover:border-gold-500/50 hover:shadow-gold",
                      "dark:border-ink-800 dark:bg-ink-900 sm:flex-row sm:p-6",
                      isPast && "opacity-90",
                    )}
                  >
                    {/* Date chip */}
                    <div className="flex shrink-0 items-start gap-4 sm:block">
                      <div className="grid h-fit w-20 place-items-center rounded-3xl bg-gold-gradient px-3 py-4 text-ink-900 shadow-gold">
                        <span className="font-display text-2xl font-extrabold leading-none">{day}</span>
                        <span className="mt-1 text-[0.68rem] font-bold uppercase tracking-wider">
                          {month}
                        </span>
                        <span className="text-[0.62rem] font-semibold opacity-70">{year}</span>
                      </div>

                      <div className="relative hidden h-20 w-20 overflow-hidden rounded-2xl sm:mt-4 sm:block">
                        <MediaImage
                          src={event.cover}
                          alt={tx(event.title)}
                          className="absolute inset-0 h-full w-full"
                          sizes="80px"
                        />
                      </div>
                    </div>

                    {/* Details */}
                    <div className="flex min-w-0 flex-1 flex-col">
                      <h3 className="mb-2 font-display text-lg font-bold leading-snug transition-colors group-hover:text-gold-600 dark:group-hover:text-gold-400">
                        {tx(event.title)}
                      </h3>

                      <p className="line-clamp-2x mb-4 text-sm leading-relaxed text-ink-600 dark:text-ink-400">
                        {tx(event.description)}
                      </p>

                      <ul className="mb-5 space-y-2 text-sm text-ink-600 dark:text-ink-400">
                        <li className="flex items-center gap-2">
                          <Clock className="h-4 w-4 shrink-0 text-gold-500" aria-hidden />
                          {formatTime(event.startsAt, locale)}
                          {event.endsAt && ` – ${formatTime(event.endsAt, locale)}`}
                        </li>
                        <li className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 shrink-0 text-gold-500" aria-hidden />
                          <span className="truncate">{tx(event.location)}</span>
                        </li>
                        {event.capacity ? (
                          <li className="flex items-center gap-2">
                            <Users className="h-4 w-4 shrink-0 text-gold-500" aria-hidden />
                            {event.attending ?? 0} / {event.capacity} {tr("events.seats")}
                          </li>
                        ) : null}
                      </ul>

                      {/* Capacity meter */}
                      {event.capacity ? (
                        <div className="mb-5 h-1.5 w-full overflow-hidden rounded-full bg-ink-200/70 dark:bg-ink-700/60">
                          <div
                            className="h-full rounded-full bg-gold-gradient"
                            style={{
                              width: `${Math.min(100, ((event.attending ?? 0) / event.capacity) * 100)}%`,
                            }}
                          />
                        </div>
                      ) : null}

                      {!isPast && (
                        <ButtonLink
                          href={joinUrl(event.registerUrl)}
                          size="sm"
                          className="mt-auto w-fit"
                        >
                          {tr("events.register")}
                          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                        </ButtonLink>
                      )}

                      {isPast && (
                        <span className="mt-auto inline-flex w-fit items-center gap-1.5 rounded-full border border-ink-300/60 px-3 py-1.5 text-xs font-bold text-ink-500 dark:border-ink-700">
                          <CalendarDays className="h-3.5 w-3.5" aria-hidden />
                          {tr("events.past")}
                        </span>
                      )}
                    </div>
                  </article>
                </StaggerItem>
              );
            })}
          </StaggerGroup>
        )}
      </div>
    </Section>
  );
}
