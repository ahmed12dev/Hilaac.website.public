"use client";

import { PageHeader } from "@/components/ui/PageHeader";
import { useLanguage } from "@/lib/i18n/provider";

export function EventsHeader() {
  const { tr } = useLanguage();
  return (
    <PageHeader
      eyebrow={tr("nav.events")}
      title={tr("events.title")}
      subtitle={tr("events.subtitle")}
      breadcrumbs={[{ label: tr("nav.events") }]}
    />
  );
}
