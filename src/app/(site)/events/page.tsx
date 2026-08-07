import type { Metadata } from "next";
import { Events } from "@/components/sections/Events";
import { MembershipCTA } from "@/components/sections/MembershipCTA";
import { getContentEvents, getSettings } from "@/lib/api";
import { EventsHeader } from "./EventsHeader";

export const revalidate = 180;

export const metadata: Metadata = {
  title: "Munaasabadaha — Events",
  description:
    "Upcoming and previous events, conventions, forums and registration drives from Xisbiga Hilaac.",
  alternates: { canonical: "/events" },
};

export default async function EventsPage() {
  const [events, settings] = await Promise.all([getContentEvents(), getSettings()]);

  return (
    <>
      <EventsHeader />
      <Events events={events} hideHeading />
      <MembershipCTA settings={settings} />
    </>
  );
}
