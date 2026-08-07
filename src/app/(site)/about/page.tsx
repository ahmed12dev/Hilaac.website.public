import type { Metadata } from "next";
import { About } from "@/components/sections/About";
import { MembershipCTA } from "@/components/sections/MembershipCTA";
import { Stats } from "@/components/sections/Stats";
import { AboutHeader } from "./AboutHeader";
import { getContentEvents, getLiveTotals, getContentProjects, getSettings, getStats } from "@/lib/api";
import { t } from "@/lib/utils";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return {
    title: "Ku Saabsan Hilaac — About",
    description: t(settings.about.vision, "en") || t(settings.about.vision, "so"),
    alternates: { canonical: "/about" },
  };
}

export default async function AboutPage() {
  const [settings, stats, liveTotals, projects, events] = await Promise.all([
    getSettings(),
    getStats(),
    getLiveTotals(),
    getContentProjects(),
    getContentEvents(),
  ]);

  return (
    <>
      <AboutHeader />
      <About settings={settings} hideHeading />
      <Stats
        stats={stats}
        liveTotals={liveTotals}
        counts={{
          activeProjects: projects.filter((p) => p.status === "ongoing").length,
          completedProjects: projects.filter((p) => p.status === "completed").length,
          upcomingEvents: events.filter((e) => e.status !== "past").length,
        }}
      />
      <MembershipCTA settings={settings} />
    </>
  );
}
