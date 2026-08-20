"use client";

import { PageHeader } from "@/components/ui/PageHeader";
import { useLanguage } from "@/lib/i18n/provider";

export function ConstitutionHeader() {
  const { tr } = useLanguage();
  return (
    <PageHeader
      eyebrow={tr("nav.constitution")}
      title={tr("constitution.title")}
      subtitle={tr("constitution.subtitle")}
      breadcrumbs={[{ label: tr("nav.constitution") }]}
    />
  );
}
