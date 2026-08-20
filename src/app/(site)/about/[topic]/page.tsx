import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MembershipCTA } from "@/components/sections/MembershipCTA";
import { getSettings } from "@/lib/api";
import type { TranslationKey } from "@/lib/i18n/dictionary";
import type { Localized, SiteSettings } from "@/lib/types";
import { t } from "@/lib/utils";
import { AboutTopicReader } from "./AboutTopicReader";

export const revalidate = 300;

/**
 * The three About passages, each on its own page.
 *
 * `short` is what the card on /about shows; `full` is the longer text an
 * administrator writes in Settings -> About. When no full text has been
 * written yet the page falls back to the short version, so a card never
 * opens onto an empty page.
 */
const TOPICS = {
  history: { titleKey: "about.history", short: "history", full: "historyFull" },
  vision: { titleKey: "about.vision", short: "vision", full: "visionFull" },
  mission: { titleKey: "about.mission", short: "mission", full: "missionFull" },
} as const satisfies Record<
  string,
  { titleKey: TranslationKey; short: keyof SiteSettings["about"]; full: keyof SiteSettings["about"] }
>;

type Topic = keyof typeof TOPICS;

function isTopic(value: string): value is Topic {
  return Object.prototype.hasOwnProperty.call(TOPICS, value);
}

/** Prerenders all three at build time. */
export function generateStaticParams() {
  return Object.keys(TOPICS).map((topic) => ({ topic }));
}

function readPassage(settings: SiteSettings, topic: Topic): Localized {
  const { full, short } = TOPICS[topic];
  const long = settings.about[full] as Localized | undefined;
  const hasLong = typeof long === "string" ? long.trim() : long?.so?.trim() || long?.en?.trim();
  return hasLong ? (long as Localized) : (settings.about[short] as Localized);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ topic: string }>;
}): Promise<Metadata> {
  const { topic } = await params;
  if (!isTopic(topic)) return {};

  const settings = await getSettings();
  const heading = { history: "Taariikhda", vision: "Aragtida", mission: "Himilada" }[topic];
  const english = { history: "Our History", vision: "Our Vision", mission: "Our Mission" }[topic];

  return {
    title: `${heading} — ${english}`,
    description: t(readPassage(settings, topic), "en").slice(0, 300),
    alternates: { canonical: `/about/${topic}` },
  };
}

export default async function AboutTopicPage({
  params,
}: {
  params: Promise<{ topic: string }>;
}) {
  const { topic } = await params;
  if (!isTopic(topic)) notFound();

  const settings = await getSettings();

  return (
    <>
      <AboutTopicReader titleKey={TOPICS[topic].titleKey} text={readPassage(settings, topic)} />
      <MembershipCTA settings={settings} />
    </>
  );
}
