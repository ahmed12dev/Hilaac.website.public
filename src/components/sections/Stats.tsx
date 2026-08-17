"use client";

import { Briefcase, CalendarCheck, CheckCircle2, Map, MapPin, Users, type LucideIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Counter } from "@/components/ui/Counter";
import { StaggerGroup, StaggerItem } from "@/components/ui/Reveal";
import { useLanguage } from "@/lib/i18n/provider";
import type { LiveTotals, Localized, StatItem } from "@/lib/types";

const ICONS: Record<string, LucideIcon> = {
  users: Users,
  map: Map,
  pin: MapPin,
  briefcase: Briefcase,
  check: CheckCircle2,
  calendar: CalendarCheck,
};

interface Tile {
  id: string;
  icon: string;
  value: number;
  suffix?: string;
  label: Localized;
}

export interface ContentCounts {
  activeProjects: number;
  completedProjects: number;
  upcomingEvents: number;
}

function tilesFrom(
  totals: LiveTotals | null,
  counts: ContentCounts,
  stats: StatItem[],
): Tile[] {
  if (!totals) {
    return stats.map((stat) => ({
      id: stat.id,
      icon: stat.icon ?? "users",
      value: stat.value,
      suffix: stat.suffix,
      label: stat.label,
    }));
  }

  return [
    { id: "members", icon: "users", value: totals.totalMembers, label: { so: "Xubno Diiwaangashan", en: "Registered Members" } },
    { id: "regions", icon: "map", value: totals.totalRegions, label: { so: "Gobol", en: "Regions" } },
    { id: "districts", icon: "pin", value: totals.totalDistricts, label: { so: "Degmo", en: "Districts" } },
    { id: "active", icon: "briefcase", value: counts.activeProjects, label: { so: "Mashruuc Socda", en: "Active Projects" } },
    { id: "completed", icon: "check", value: counts.completedProjects, label: { so: "Mashruuc Dhammaystiran", en: "Completed Projects" } },
    { id: "events", icon: "calendar", value: counts.upcomingEvents, label: { so: "Munaasabado Soo Socda", en: "Upcoming Events" } },
  ];
}

export function Stats({
  stats,
  liveTotals: initialTotals,
  counts,
}: {
  stats: StatItem[];
  liveTotals?: LiveTotals | null;
  counts: ContentCounts;
}) {
  const { tr, tx } = useLanguage();
  const [currentTotals, setCurrentTotals] = useState<LiveTotals | null>(initialTotals ?? null);

  // Real-time live polling every 12 seconds
  useEffect(() => {
    let mounted = true;
    async function poll() {
      try {
        const res = await fetch("/api/public/stats", { cache: "no-store" });
        if (res.ok) {
          const json = await res.json();
          if (mounted && json.data) {
            setCurrentTotals((prev) => {
              if (
                !prev ||
                prev.totalMembers !== json.data.totalMembers ||
                prev.totalRegions !== json.data.totalRegions
              ) {
                return json.data;
              }
              return prev;
            });
          }
        }
      } catch {
        // keep existing
      }
    }

    const interval = setInterval(poll, 12000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const tiles = tilesFrom(currentTotals, counts, stats);
  if (!tiles.length) return null;

  return (
    <section
      id="stats"
      className="relative overflow-hidden bg-ink-950 py-20 lg:py-24"
      aria-label={tr("stats.title")}
    >
      {/* Gold ambience */}
      <div className="pointer-events-none absolute -left-32 top-0 h-96 w-96 rounded-full bg-gold-500/18 blur-[120px]" aria-hidden />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-antique-500/18 blur-[110px]" aria-hidden />
      <div className="hairline-gold absolute inset-x-0 top-0 h-px" aria-hidden />
      <div className="hairline-gold absolute inset-x-0 bottom-0 h-px" aria-hidden />

      <div className="container-page relative">
        <h2 className="mb-4 text-center font-display text-2xl font-extrabold text-white sm:text-3xl">
          <span className="text-gradient-gold">{tr("stats.title")}</span>
        </h2>

        <p className="mb-12 flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-ink-400">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          </span>
          {tr("stats.live")} · Real-time Synchronized
        </p>

        <StaggerGroup className="grid grid-cols-2 gap-5 lg:grid-cols-3 xl:grid-cols-6">
          {tiles.map((tile) => {
            const Icon = ICONS[tile.icon] ?? Users;
            return (
              <StaggerItem key={tile.id}>
                <div className="group relative h-full rounded-4xl border border-white/10 bg-white/[0.04] p-6 text-center backdrop-blur-sm transition-all duration-500 hover:-translate-y-1.5 hover:border-gold-500/45 hover:bg-white/[0.07]">
                  <span className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-gold-gradient text-ink-900 shadow-gold transition-transform duration-500 group-hover:scale-110">
                    <Icon className="h-5 w-5" />
                  </span>

                  <p className="font-display text-2xl font-extrabold text-white sm:text-3xl">
                    <Counter value={tile.value} suffix={tile.suffix} />
                  </p>

                  <p className="mt-2 text-[0.7rem] font-semibold uppercase leading-tight tracking-[0.12em] text-ink-400">
                    {tx(tile.label)}
                  </p>
                </div>
              </StaggerItem>
            );
          })}
        </StaggerGroup>
      </div>
    </section>
  );
}
