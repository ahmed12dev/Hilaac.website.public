"use client";

import { BookOpen, ExternalLink } from "lucide-react";
import Link from "next/link";
import type { ConstitutionRow } from "@/lib/server/collections";
import { CollectionManager, PublishedTag, type FieldDef } from "../CollectionManager";
import { useAdminText } from "../useAdminText";

/**
 * The party constitution, one chapter per row.
 *
 * Chapters are written here and read on /constitution, where they are laid
 * out as a book with its own contents list and page-by-page navigation.
 */
const FIELDS: FieldDef[] = [
  {
    key: "chapterNo",
    label: "Chapter number",
    labelSo: "Lambarka cutubka",
    span: 4,
    placeholder: "1",
    hint: "Shown above the chapter title, e.g. 1, I, or Cutubka 1.",
    hintSo: "Waxay ka kor muuqataa cinwaanka, tusaale: 1, I, ama Cutubka 1.",
  },
  {
    key: "sortOrder",
    label: "Reading order",
    labelSo: "Kala horreynta akhriska",
    type: "number",
    span: 4,
    hint: "Lowest first. Chapters with the same number fall back to when they were added.",
    hintSo: "Kan ugu yar ayaa horreeya. Haddii ay isku mid yihiin, waxaa lagu kala horreeyaa markii la daray.",
  },
  { key: "titleSo", label: "Chapter title — Somali", labelSo: "Cinwaanka cutubka — Soomaali", span: 6 },
  { key: "titleEn", label: "Chapter title — English", labelSo: "Cinwaanka cutubka — Ingiriisi", span: 6 },
  {
    key: "bodySo",
    label: "Chapter text — Somali",
    labelSo: "Qoraalka cutubka — Soomaali",
    type: "textarea",
    rows: 14,
    span: 12,
    hint: "Leave a blank line between paragraphs — readers see them spaced exactly as you write them here.",
    hintSo: "Sadar bannaan ka dhig u dhexeeya baaraggaraafyada — sidaad u kala qaybiso ayay akhristayaashu u arki doonaan.",
  },
  {
    key: "bodyEn",
    label: "Chapter text — English",
    labelSo: "Qoraalka cutubka — Ingiriisi",
    type: "textarea",
    rows: 14,
    span: 12,
  },
  { key: "published", label: "Show on the website", labelSo: "Ka muuji websaydka", type: "checkbox" },
];

const EMPTY: Partial<ConstitutionRow> = {
  chapterNo: "",
  titleSo: "",
  titleEn: "",
  bodySo: "",
  bodyEn: "",
  sortOrder: 0,
  published: true,
};

/** Rough reading length, so an editor can see a chapter is not empty. */
function wordCount(row: ConstitutionRow): number {
  const text = row.bodyEn || row.bodySo || "";
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

export function ConstitutionManager({ initialItems }: { initialItems: ConstitutionRow[] }) {
  const { at, locale } = useAdminText();

  return (
    <div className="space-y-5">
      <Link
        href="/constitution"
        target="_blank"
        className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-semibold text-ink-200 transition-colors hover:bg-white/10 hover:text-white"
      >
        <ExternalLink className="h-3.5 w-3.5 text-gold-400" />
        {at("constitution.openReader")}
      </Link>

      <CollectionManager<ConstitutionRow>
        collection="constitution"
        title="Constitution"
        titleSo="Dastuurka"
        icon={BookOpen}
        initialItems={initialItems}
        fields={FIELDS}
        emptyDraft={EMPTY}
        primary={(c) =>
          [c.chapterNo, (locale === "so" ? c.titleSo : c.titleEn) || c.titleEn || c.titleSo]
            .filter(Boolean)
            .join(" · ") || "—"
        }
        searchable={(c) => [c.chapterNo, c.titleSo, c.titleEn, c.bodySo, c.bodyEn].join(" ")}
        summary={(rows) =>
          `${rows.length} ${
            rows.length === 1 ? at("constitution.summaryOne") : at("constitution.summaryMany")
          } · ${rows.filter((r) => r.published).length} ${at("constitution.readable")}`
        }
        meta={(c) => (
          <>
            <span>
              {at("common.displayOrder")} {c.sortOrder}
            </span>
            <span>· {wordCount(c)} {locale === "so" ? "eray" : "words"}</span>
            <PublishedTag on={c.published} />
          </>
        )}
      />
    </div>
  );
}
