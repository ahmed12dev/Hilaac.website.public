"use client";

import { PageHeader } from "@/components/ui/PageHeader";
import { useLanguage } from "@/lib/i18n/provider";

export function JoinHeader() {
  const { tr } = useLanguage();
  return (
    <PageHeader
      eyebrow={tr("membership.badge")}
      title={tr("join.title")}
      subtitle={tr("join.subtitle")}
      breadcrumbs={[{ label: tr("cta.join") }]}
    />
  );
}
