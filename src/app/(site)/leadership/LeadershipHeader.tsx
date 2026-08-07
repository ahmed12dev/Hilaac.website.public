"use client";

import { PageHeader } from "@/components/ui/PageHeader";
import { useLanguage } from "@/lib/i18n/provider";

export function LeadershipHeader() {
  const { tr } = useLanguage();
  return (
    <PageHeader
      eyebrow={tr("nav.leadership")}
      title={tr("leadership.title")}
      subtitle={tr("leadership.subtitle")}
      breadcrumbs={[{ label: tr("nav.leadership") }]}
    />
  );
}
