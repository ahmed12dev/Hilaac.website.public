"use client";

import { Quote } from "lucide-react";
import type { TestimonialRow } from "@/lib/server/collections";
import { CollectionManager, PublishedTag, type FieldDef } from "../CollectionManager";

const FIELDS: FieldDef[] = [
  { key: "name", label: "Name", span: 6 },
  { key: "rating", label: "Rating (1–5)", type: "number", span: 3 },
  { key: "sortOrder", label: "Display order", type: "number", span: 3 },
  { key: "roleSo", label: "Role — Somali", span: 6, placeholder: "Beeraley, Shabeellaha" },
  { key: "roleEn", label: "Role — English", span: 6, placeholder: "Farmer, Shabelle" },
  { key: "quoteSo", label: "Quote — Somali", type: "textarea", rows: 4, span: 6 },
  { key: "quoteEn", label: "Quote — English", type: "textarea", rows: 4, span: 6 },
  { key: "avatar", label: "Photo", type: "image", span: 12, folder: "testimonials" },
  { key: "published", label: "Show on the website", type: "checkbox" },
];

const EMPTY: Partial<TestimonialRow> = {
  name: "", roleSo: "", roleEn: "", quoteSo: "", quoteEn: "",
  rating: 5, sortOrder: 0, published: true,
};

export function TestimonialsManager({ initialItems }: { initialItems: TestimonialRow[] }) {
  return (
    <CollectionManager<TestimonialRow>
      collection="testimonials"
      title="Testimonials"
      icon={Quote}
      initialItems={initialItems}
      fields={FIELDS}
      emptyDraft={EMPTY}
      primary={(t) => t.name || "Unnamed"}
      searchable={(t) => [t.name, t.roleEn, t.roleSo, t.quoteEn, t.quoteSo].join(" ")}
      summary={(rows) =>
        `${rows.length} quote${rows.length === 1 ? "" : "s"} · ${rows.filter((r) => r.published).length} shown`
      }
      meta={(t) => (
        <>
          {(t.roleEn || t.roleSo) && <span>{t.roleEn || t.roleSo}</span>}
          <span>· {"★".repeat(Math.max(1, Math.min(5, t.rating)))}</span>
          <span>· order {t.sortOrder}</span>
          <PublishedTag on={t.published} />
        </>
      )}
    />
  );
}
