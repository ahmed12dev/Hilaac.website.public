"use client";

import { ArrowRight, Megaphone, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useLanguage } from "@/lib/i18n/provider";

/**
 * The banner an administrator switches on from Settings → Announcement.
 *
 * Dismissing it is remembered per message, so a visitor who closes it is not
 * shown the same text again — but a new announcement always reappears.
 */
export function AnnouncementBar({
  textSo,
  textEn,
  link,
}: {
  textSo: string;
  textEn: string;
  link?: string;
}) {
  const { locale } = useLanguage();
  const [dismissed, setDismissed] = useState(true);

  const text = locale === "en" ? textEn || textSo : textSo || textEn;
  // A short stable key for this exact message.
  const key = `hilaac.announcement.${textSo.length}-${textEn.length}-${textSo.slice(0, 24)}`;

  useEffect(() => {
    setDismissed(window.localStorage.getItem(key) === "1");
  }, [key]);

  if (dismissed || !text) return null;

  const body = (
    <span className="flex min-w-0 items-center gap-2">
      <Megaphone className="h-4 w-4 shrink-0" aria-hidden />
      <span className="truncate">{text}</span>
      {link && <ArrowRight className="h-3.5 w-3.5 shrink-0" aria-hidden />}
    </span>
  );

  return (
    <div className="relative z-40 bg-gold-gradient text-ink-900">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-2 text-xs font-bold sm:px-6 sm:text-sm">
        {link ? (
          <Link href={link} className="min-w-0 flex-1 hover:underline">
            {body}
          </Link>
        ) : (
          <span className="min-w-0 flex-1">{body}</span>
        )}

        <button
          type="button"
          onClick={() => {
            window.localStorage.setItem(key, "1");
            setDismissed(true);
          }}
          aria-label="Dismiss announcement"
          className="grid h-7 w-7 shrink-0 place-items-center rounded-lg transition hover:bg-ink-900/10"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
