import type { Metadata } from "next";
import { Contact } from "@/components/sections/Contact";
import { getSettings } from "@/lib/api";
import { ContactHeader } from "./ContactHeader";

export const revalidate = 600;

export const metadata: Metadata = {
  title: "Nala Soo Xiriir — Contact",
  description: "Get in touch with Xisbiga Hilaac — address, phone, email and contact form.",
  alternates: { canonical: "/contact" },
};

export default async function ContactPage() {
  const settings = await getSettings();

  return (
    <>
      <ContactHeader />
      <Contact settings={settings} hideHeading />
    </>
  );
}
