"use client";

import { PageHeader } from "@/components/ui/PageHeader";
import { useLanguage } from "@/lib/i18n/provider";

export function GalleryHeader() {
  const { tr } = useLanguage();
  return (
    <PageHeader
      eyebrow={tr("nav.gallery")}
      title={tr("gallery.title")}
      subtitle={tr("gallery.subtitle")}
      breadcrumbs={[{ label: tr("nav.gallery") }]}
    />
  );
}
