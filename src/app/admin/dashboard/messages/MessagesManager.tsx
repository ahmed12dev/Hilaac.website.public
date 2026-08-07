"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Mail, MailOpen, MessageSquare, Phone, Trash2 } from "lucide-react";
import { useState } from "react";
import type { MessageRow } from "@/lib/server/collections";
import { cn, formatDate } from "@/lib/utils";

/**
 * Contact-form submissions from the public website.
 *
 * Read, mark read/unread and delete — nothing is created here, since messages
 * only ever arrive from visitors.
 */
export function MessagesManager({ initialItems }: { initialItems: MessageRow[] }) {
  const [items, setItems] = useState<MessageRow[]>(initialItems);
  const [openId, setOpenId] = useState<number | null>(null);
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);

  const unread = items.filter((m) => !m.isRead).length;

  async function toggleRead(m: MessageRow) {
    const next = !m.isRead;
    // Optimistic — reverted if the request fails.
    setItems((list) => list.map((x) => (x.id === m.id ? { ...x, isRead: next } : x)));
    try {
      const res = await fetch("/api/site-admin/messages", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: m.id, read: next }),
      });
      if (!res.ok) throw new Error();
    } catch {
      setItems((list) => list.map((x) => (x.id === m.id ? { ...x, isRead: m.isRead } : x)));
    }
  }

  async function remove(id: number) {
    setBusy(true);
    try {
      const res = await fetch(`/api/site-admin/messages?id=${id}`, { method: "DELETE" });
      if (res.ok) setItems((list) => list.filter((m) => m.id !== id));
    } finally {
      setConfirmId(null);
      setOpenId(null);
      setBusy(false);
    }
  }

  return (
    <div className="space-y-7">
      <header>
        <h1 className="font-display text-2xl font-extrabold sm:text-3xl">Messages</h1>
        <p className="mt-1.5 text-sm text-ink-400">
          {items.length} message{items.length === 1 ? "" : "s"} · {unread} unread
        </p>
      </header>

      {items.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-white/12 py-16 text-center">
          <MessageSquare className="mx-auto mb-4 h-10 w-10 text-ink-600" />
          <p className="font-semibold">No messages yet.</p>
          <p className="mt-1 text-sm text-ink-500">
            Submissions from the website&apos;s contact form appear here.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {items.map((m) => {
            const open = openId === m.id;
            return (
              <li
                key={m.id}
                className={cn(
                  "rounded-2xl border bg-white/[0.04] p-4 transition-colors",
                  m.isRead ? "border-white/10" : "border-gold-500/35 bg-gold-500/[0.05]",
                )}
              >
                <div className="flex flex-wrap items-center gap-4">
                  <span
                    className={cn(
                      "grid h-11 w-11 shrink-0 place-items-center rounded-xl",
                      m.isRead ? "bg-white/8 text-ink-400" : "bg-gold-500/15 text-gold-400",
                    )}
                  >
                    {m.isRead ? <MailOpen className="h-5 w-5" /> : <Mail className="h-5 w-5" />}
                  </span>

                  <button
                    type="button"
                    onClick={() => setOpenId(open ? null : m.id)}
                    aria-expanded={open}
                    className="min-w-0 flex-1 text-left"
                  >
                    <p className="truncate font-semibold">
                      {m.subject || m.name}
                      {!m.isRead && (
                        <span className="ml-2 rounded bg-gold-500/20 px-1.5 py-0.5 text-[0.6rem] font-bold uppercase text-gold-300">
                          New
                        </span>
                      )}
                    </p>
                    <p className="mt-0.5 flex flex-wrap items-center gap-x-3 text-xs text-ink-500">
                      <span>{m.name}</span>
                      <span>· {m.email}</span>
                      <span>· {formatDate(m.createdAt, "en")}</span>
                    </p>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => toggleRead(m)}
                      aria-label={m.isRead ? "Mark unread" : "Mark read"}
                      className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 text-ink-300 transition hover:border-gold-500/50 hover:text-gold-300"
                    >
                      {m.isRead ? <Mail className="h-4 w-4" /> : <MailOpen className="h-4 w-4" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmId(m.id)}
                      aria-label="Delete message"
                      className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 text-ink-300 transition hover:border-red-500/50 hover:text-red-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <AnimatePresence>
                  {open && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-4 space-y-3 border-t border-white/8 pt-4">
                        <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink-300">
                          {m.message}
                        </p>
                        <div className="flex flex-wrap gap-3 text-sm">
                          <a
                            href={`mailto:${m.email}`}
                            className="inline-flex items-center gap-2 rounded-lg border border-white/12 px-3 py-2 font-semibold text-ink-300 transition hover:border-gold-500/50 hover:text-gold-300"
                          >
                            <Mail className="h-4 w-4" />
                            Reply
                          </a>
                          {m.phone && (
                            <a
                              href={`tel:${m.phone.replace(/\s/g, "")}`}
                              className="inline-flex items-center gap-2 rounded-lg border border-white/12 px-3 py-2 font-semibold text-ink-300 transition hover:border-gold-500/50 hover:text-gold-300"
                            >
                              <Phone className="h-4 w-4" />
                              {m.phone}
                            </a>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            );
          })}
        </ul>
      )}

      <AnimatePresence>
        {confirmId !== null && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setConfirmId(null)}
            className="fixed inset-0 z-50 grid place-items-center bg-ink-950/80 p-5 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.96, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.96, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              role="dialog" aria-modal="true"
              className="w-full max-w-sm rounded-3xl border border-red-500/25 bg-ink-900 p-6 text-center"
            >
              <span className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-red-500/12 text-red-400">
                <Trash2 className="h-5 w-5" />
              </span>
              <h2 className="font-display text-lg font-bold">Delete this message?</h2>
              <p className="mt-2 text-sm text-ink-400">This cannot be undone.</p>
              <div className="mt-6 flex gap-3">
                <button type="button" onClick={() => setConfirmId(null)}
                        className="flex-1 rounded-xl border border-white/12 px-4 py-2.5 text-sm font-semibold text-ink-300 transition hover:bg-white/6">
                  Cancel
                </button>
                <button type="button" onClick={() => remove(confirmId)} disabled={busy}
                        className="flex-1 rounded-xl bg-red-500/90 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-red-500 disabled:opacity-60">
                  {busy ? "Deleting…" : "Delete"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
