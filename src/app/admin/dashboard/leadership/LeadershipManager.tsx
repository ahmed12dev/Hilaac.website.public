"use client";

import { UsersRound } from "lucide-react";
import type { LeaderRow } from "@/lib/server/collections";
import { CollectionManager, PublishedTag, type FieldDef } from "../CollectionManager";

const FIELDS: FieldDef[] = [
  { key: "name", label: "Full name", labelSo: "Magaca oo dhan", span: 6 },
  { key: "sortOrder", label: "Display order", labelSo: "Kala horreynta", type: "number", span: 6 },
  { key: "positionSo", label: "Position — Somali", labelSo: "Jagada — Soomaali", span: 6 },
  { key: "positionEn", label: "Position — English", labelSo: "Jagada — Ingiriisi", span: 6 },
  { key: "bioSo", label: "Biography — Somali", labelSo: "Taariikh nololeed — Soomaali", type: "textarea", rows: 5, span: 6 },
  { key: "bioEn", label: "Biography — English", labelSo: "Taariikh nololeed — Ingiriisi", type: "textarea", rows: 5, span: 6 },
  { key: "photo", label: "Photo", labelSo: "Sawirka", type: "image", span: 12, folder: "leadership" },
  { key: "published", label: "Show on the website", labelSo: "Ka muuji websaydka", type: "checkbox" },
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
      titleSo="Hoggaanka"
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
