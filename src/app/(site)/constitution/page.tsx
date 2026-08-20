import type { Metadata } from "next";
import { publicConstitution } from "@/lib/server/content";
import { getSettings } from "@/lib/api";
import { MembershipCTA } from "@/components/sections/MembershipCTA";
import { ConstitutionHeader } from "./ConstitutionHeader";
import { ConstitutionReader, type ConstitutionChapter } from "./ConstitutionReader";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Dastuurka — Constitution",
  description:
    "The official constitution of Xisbiga Hilaac, published in full and readable chapter by chapter in Somali and English.",
  alternates: { canonical: "/constitution" },
};

export default async function ConstitutionPage() {
  const [chapters, settings] = await Promise.all([
    publicConstitution().catch(() => []),
    getSettings(),
  ]);

  return (
    <>
      <ConstitutionHeader />
      <ConstitutionReader chapters={chapters as ConstitutionChapter[]} />
      <MembershipCTA settings={settings} />
    </>
  );
}
