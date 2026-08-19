"use client";

import { Image as ImageIcon } from "lucide-react";
import type { GalleryRow } from "@/lib/server/collections";
import { CollectionManager, PublishedTag, type FieldDef } from "../CollectionManager";

const FIELDS: FieldDef[] = [
  { key: "src", label: "Image", type: "image", span: 12, folder: "gallery" },
  { key: "type", label: "Type", type: "select", options: ["photo", "video"], span: 4 },
  { key: "album", label: "Album", span: 4, placeholder: "Olole, Bulsho…" },
  { key: "sortOrder", label: "Display order", type: "number", span: 4 },
  { key: "titleSo", label: "Caption — Somali", span: 6 },
  { key: "titleEn", label: "Caption — English", span: 6 },
  { key: "published", label: "Show on the website", type: "checkbox" },
];

const EMPTY: Partial<GalleryRow> = {
  src: "", type: "photo", album: "", titleSo: "", titleEn: "",
  sortOrder: 0, published: true,
};

export function GalleryManager({ initialItems }: { initialItems: GalleryRow[] }) {
  return (
    <CollectionManager<GalleryRow>
      collection="gallery"
      title="Gallery"
      icon={ImageIcon}
      initialItems={initialItems}
      fields={FIELDS}
      emptyDraft={EMPTY}
      primary={(g) => g.titleEn || g.titleSo || g.src.split("/").pop() || "Untitled"}
      searchable={(g) => [g.titleSo, g.titleEn, g.album, g.src].join(" ")}
      summary={(rows) =>
        `${rows.length} item${rows.length === 1 ? "" : "s"} · ` +
        `${rows.filter((r) => r.type === "photo").length} photos · ` +
        `${rows.filter((r) => r.type === "video").length} videos`
      }
      meta={(g) => (
        <>
          <span className="rounded bg-white/10 px-1.5 py-0.5 font-bold uppercase">{g.type}</span>
          {g.album && <span>· {g.album}</span>}
          <span>· order {g.sortOrder}</span>
          <PublishedTag on={g.published} />
        </>
      )}
    />
  );
}
