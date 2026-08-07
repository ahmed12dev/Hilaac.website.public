"use client";

import { UsersRound } from "lucide-react";
import type { LeaderRow } from "@/lib/server/collections";
import { CollectionManager, PublishedTag, type FieldDef } from "../CollectionManager";

const FIELDS: FieldDef[] = [
  { key: "name", label: "Full name", span: 6 },
  { key: "sortOrder", label: "Display order", type: "number", span: 6 },
  { key: "positionSo", label: "Position — Somali", span: 6 },
  { key: "positionEn", label: "Position — English", span: 6 },
  { key: "bioSo", label: "Biography — Somali", type: "textarea", rows: 5, span: 6 },
  { key: "bioEn", label: "Biography — English", type: "textarea", rows: 5, span: 6 },
  { key: "photo", label: "Photo URL", span: 12, placeholder: "/images/…" },
  { key: "published", label: "Show on the website", type: "checkbox" },
];

const EMPTY: Partial<LeaderRow> = {
  name: "", positionSo: "", positionEn: "", bioSo: "", bioEn: "",
  sortOrder: 0, published: true,
};

export function LeadershipManager({ initialItems }: { initialItems: LeaderRow[] }) {
  return (
    <CollectionManager<LeaderRow>
      collection="leadership"
      title="Leadership"
      icon={UsersRound}
      initialItems={initialItems}
      fields={FIELDS}
      emptyDraft={EMPTY}
      primary={(l) => l.name || "Unnamed"}
      searchable={(l) => [l.name, l.positionEn, l.positionSo].join(" ")}
      summary={(rows) =>
        `${rows.length} profile${rows.length === 1 ? "" : "s"} · ${rows.filter((r) => r.published).length} shown`
      }
      meta={(l) => (
        <>
          {(l.positionEn || l.positionSo) && <span>{l.positionEn || l.positionSo}</span>}
          <span>· order {l.sortOrder}</span>
          <PublishedTag on={l.published} />
        </>
      )}
    />
  );
}
