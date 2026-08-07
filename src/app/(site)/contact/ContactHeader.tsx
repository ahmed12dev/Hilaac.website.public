"use client";

import { PageHeader } from "@/components/ui/PageHeader";
import { useLanguage } from "@/lib/i18n/provider";

export function ContactHeader() {
  const { tr } = useLanguage();
  return (
    <PageHeader
      eyebrow={tr("nav.contact")}
      title={tr("contact.title")}
      subtitle={tr("contact.subtitle")}
      breadcrumbs={[{ label: tr("nav.contact") }]}
    />
  );
}
