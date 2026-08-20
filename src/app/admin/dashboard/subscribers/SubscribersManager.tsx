"use client";

import { Mail } from "lucide-react";
import type { SubscriberRow } from "@/lib/server/collections";
import { formatDate } from "@/lib/utils";
import { CollectionManager } from "../CollectionManager";

/**
 * Newsletter sign-ups collected by the public site. They are only ever read
 * and removed here — nobody is added to a mailing list from the dashboard.
 */
export function SubscribersManager({ initialItems }: { initialItems: SubscriberRow[] }) {
  return (
    <CollectionManager<SubscriberRow>
      collection="subscribers"
      title="Subscribers"
      titleSo="Isdiiwaangeliyayaasha"
      icon={Mail}
      initialItems={initialItems}
      fields={[]}
      emptyDraft={{}}
      canCreate={false}
      primary={(s) => s.email}
      searchable={(s) => s.email}
      summary={(rows) =>
        `${rows.length} newsletter subscriber${rows.length === 1 ? "" : "s"}`
      }
      meta={(s) => <span>Joined {formatDate(s.createdAt, "en")}</span>}
    />
  );
}
