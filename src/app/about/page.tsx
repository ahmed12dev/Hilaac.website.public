import type { Metadata } from "next";
import { About } from "@/components/sections/About";
import { MembershipCTA } from "@/components/sections/MembershipCTA";
import { Stats } from "@/components/sections/Stats";
import { AboutHeader } from "./AboutHeader";
import { getSettings, getStats } from "@/lib/api";
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
  const [settings, stats] = await Promise.all([getSettings(), getStats()]);

  return (
    <>
      <AboutHeader />
      <About settings={settings} hideHeading />
      <Stats stats={stats} />
      <MembershipCTA settings={settings} />
    </>
  );
}
