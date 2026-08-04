"use client";

import { PageHeader } from "@/components/ui/PageHeader";
import { useLanguage } from "@/lib/i18n/provider";

export function AboutHeader() {
  const { tr } = useLanguage();
  return (
    <PageHeader
      eyebrow={tr("nav.about")}
      title={tr("about.title")}
      subtitle={tr("about.subtitle")}
      breadcrumbs={[{ label: tr("nav.about") }]}
    />
  );
}
