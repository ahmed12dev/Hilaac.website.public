import type { Metadata } from "next";
import { Leadership } from "@/components/sections/Leadership";
import { MembershipCTA } from "@/components/sections/MembershipCTA";
import { getLeaders, getSettings } from "@/lib/api";
import { LeadershipHeader } from "./LeadershipHeader";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Hoggaanka — Leadership",
  description:
    "Meet the leadership of Xisbiga Hilaac — the people guiding the party's national programme.",
  alternates: { canonical: "/leadership" },
};

export default async function LeadershipPage() {
  const [leaders, settings] = await Promise.all([getLeaders(), getSettings()]);

  return (
    <>
      <LeadershipHeader />
      <Leadership leaders={leaders} hideHeading />
      <MembershipCTA settings={settings} />
    </>
  );
}
