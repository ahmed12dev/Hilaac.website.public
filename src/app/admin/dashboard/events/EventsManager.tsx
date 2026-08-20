"use client";

import { CalendarDays } from "lucide-react";
import type { EventRow } from "@/lib/server/collections";
import { formatDate } from "@/lib/utils";
import { CollectionManager, PublishedTag, type FieldDef } from "../CollectionManager";

const FIELDS: FieldDef[] = [
  { key: "titleSo", label: "Title — Somali", labelSo: "Cinwaanka — Soomaali", span: 6 },
  { key: "titleEn", label: "Title — English", labelSo: "Cinwaanka — Ingiriisi", span: 6 },
  { key: "descriptionSo", label: "Description — Somali", labelSo: "Sharaxaad — Soomaali", type: "textarea", span: 6 },
  { key: "descriptionEn", label: "Description — English", labelSo: "Sharaxaad — Ingiriisi", type: "textarea", span: 6 },
  { key: "startsAt", label: "Starts", labelSo: "Bilaabmaya", type: "datetime-local", span: 4 },
  { key: "endsAt", label: "Ends", labelSo: "Dhammaanaya", type: "datetime-local", span: 4 },
  { key: "capacity", label: "Capacity", labelSo: "Tirada qaadi karta", type: "number", span: 4 },
  { key: "locationSo", label: "Location — Somali", labelSo: "Goobta — Soomaali", span: 6 },
  { key: "locationEn", label: "Location — English", labelSo: "Goobta — Ingiriisi", span: 6 },
  { key: "cover", label: "Cover image", labelSo: "Sawirka hore", type: "image", span: 12, folder: "events" },
  { key: "published", label: "Show on the website", labelSo: "Ka muuji websaydka", type: "checkbox" },
];

const EMPTY: Partial<EventRow> = {
  titleSo: "", titleEn: "", descriptionSo: "", descriptionEn: "",
  locationSo: "", locationEn: "", startsAt: "", published: true,
};

export function EventsManager({ initialItems }: { initialItems: EventRow[] }) {
  const upcoming = (e: EventRow) => new Date(e.endsAt || e.startsAt).getTime() >= Date.now();

  return (
    <CollectionManager<EventRow>
      collection="events"
      title="Events"
      titleSo="Munaasabadaha"
      icon={CalendarDays}
      initialItems={initialItems}
      fields={FIELDS}
      emptyDraft={EMPTY}
      primary={(e) => e.titleEn || e.titleSo || "Untitled event"}
      searchable={(e) => [e.titleSo, e.titleEn, e.locationEn, e.locationSo].join(" ")}
      summary={(rows) =>
        `${rows.length} event${rows.length === 1 ? "" : "s"} · ${rows.filter(upcoming).length} upcoming`
      }
      meta={(e) => (
        <>
          <span>{formatDate(e.startsAt, "en")}</span>
          {(e.locationEn || e.locationSo) && <span>· {e.locationEn || e.locationSo}</span>}
          <span
            className={
              upcoming(e)
                ? "rounded bg-gold-500/15 px-1.5 py-0.5 font-bold uppercase text-gold-300"
                : "rounded bg-white/10 px-1.5 py-0.5 font-bold uppercase text-ink-400"
            }
          >
            {upcoming(e) ? "Upcoming" : "Past"}
          </span>
          <PublishedTag on={e.published} />
        </>
      )}
    />
  );
}
