import type { Metadata } from "next";
import { Gallery } from "@/components/sections/Gallery";
import { getGallery } from "@/lib/api";
import { GalleryHeader } from "./GalleryHeader";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Sawirada — Media Gallery",
  description: "Photos and videos from Xisbiga Hilaac campaigns, events and community work.",
  alternates: { canonical: "/gallery" },
};

export default async function GalleryPage() {
  const items = await getGallery();

  return (
    <>
      <GalleryHeader />
      <Gallery items={items} hideHeading />
    </>
  );
}
