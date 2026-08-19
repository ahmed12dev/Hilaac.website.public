"use client";

import { CalendarDays } from "lucide-react";
import type { EventRow } from "@/lib/server/collections";
import { formatDate } from "@/lib/utils";
import { CollectionManager, PublishedTag, type FieldDef } from "../CollectionManager";

const FIELDS: FieldDef[] = [
  { key: "titleSo", label: "Title — Somali", span: 6 },
  { key: "titleEn", label: "Title — English", span: 6 },
  { key: "descriptionSo", label: "Description — Somali", type: "textarea", span: 6 },
  { key: "descriptionEn", label: "Description — English", type: "textarea", span: 6 },
  { key: "startsAt", label: "Starts", type: "datetime-local", span: 4 },
  { key: "endsAt", label: "Ends", type: "datetime-local", span: 4 },
  { key: "capacity", label: "Capacity", type: "number", span: 4 },
  { key: "locationSo", label: "Location — Somali", span: 6 },
  { key: "locationEn", label: "Location — English", span: 6 },
  { key: "cover", label: "Cover image", type: "image", span: 12, folder: "events" },
  { key: "published", label: "Show on the website", type: "checkbox" },
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
