"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Newspaper,
  Pencil,
  Plus,
  Search,
  Star,
  Trash2,
  X,
} from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import type { NewsRow } from "@/lib/server/content";
import { cn, formatDate } from "@/lib/utils";

const FIELD =
  "w-full rounded-xl border border-white/12 bg-white/5 px-4 py-2.5 text-sm text-white outline-none " +
  "transition-all placeholder:text-ink-500 focus:border-gold-500/70 focus:bg-white/8 focus:ring-4 focus:ring-gold-500/12";
const LABEL = "mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-ink-400";

type Draft = Partial<NewsRow> & { id?: number };

const EMPTY: Draft = {
  titleSo: "", titleEn: "", excerptSo: "", excerptEn: "",
  bodySo: "", bodyEn: "", category: "", author: "",
  featured: false, published: true,
};

export function NewsManager({ initialItems }: { initialItems: NewsRow[] }) {
  const [items, setItems] = useState<NewsRow[]>(initialItems);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [confirmId, setConfirmId] = useState<number | null>(null);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((a) =>
      [a.titleSo, a.titleEn, a.category ?? "", a.author ?? ""].join(" ").toLowerCase().includes(q),
    );
  }, [items, query]);

  function flash(kind: "ok" | "err", text: string) {
    setNotice({ kind, text });
    window.setTimeout(() => setNotice(null), 4000);
  }

  async function save(event: FormEvent) {
    event.preventDefault();
    if (!draft) return;

    if (!String(draft.titleSo || "").trim() && !String(draft.titleEn || "").trim()) {
      flash("err", "Cinwaan baa loo baahan yahay. / A title is required.");
      return;
    }

    setBusy(true);
    const editing = typeof draft.id === "number";

    try {
      const res = await fetch("/api/site-admin/news", {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      const data = (await res.json()) as { ok?: boolean; item?: NewsRow; error?: string };

      if (!res.ok || !data.ok || !data.item) {
        flash("err", data.error ?? "Could not save.");
        setBusy(false);
        return;
      }

      const saved = data.item;
      setItems((list) =>
        editing ? list.map((a) => (a.id === saved.id ? saved : a)) : [saved, ...list],
      );
      setDraft(null);
      flash("ok", editing ? "Article updated." : "Article created.");
    } catch {
      flash("err", "Network error.");
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: number) {
    setBusy(true);
    try {
      const res = await fetch(`/api/site-admin/news?id=${id}`, { method: "DELETE" });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        flash("err", data.error ?? "Could not delete.");
        return;
      }
      setItems((list) => list.filter((a) => a.id !== id));
      flash("ok", "Article deleted.");
    } catch {
      flash("err", "Network error.");
    } finally {
      setConfirmId(null);
      setBusy(false);
    }
  }

  return (
    <div className="space-y-7">
      {/* Header */}
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold sm:text-3xl">News</h1>
          <p className="mt-1.5 text-sm text-ink-400">
            {items.length} article{items.length === 1 ? "" : "s"} ·{" "}
            {items.filter((a) => a.published).length} published
          </p>
        </div>

        <button
          type="button"
          onClick={() => setDraft({ ...EMPTY })}
          className="inline-flex items-center gap-2 rounded-xl bg-gold-gradient px-5 py-2.5 text-sm font-bold text-ink-900 shadow-gold transition-transform hover:-translate-y-0.5"
        >
          <Plus className="h-4 w-4" />
          New article
        </button>
      </header>

      {/* Notice */}
      <AnimatePresence>
        {notice && (
          <motion.p
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            role="status"
            className={cn(
              "flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold",
              notice.kind === "ok"
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                : "border-red-500/30 bg-red-500/10 text-red-300",
            )}
          >
            {notice.kind === "ok" ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
            {notice.text}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Search */}
      {items.length > 0 && (
        <div className="relative max-w-sm">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-[17px] w-[17px] -translate-y-1/2 text-ink-500" aria-hidden />
          <label htmlFor="news-search" className="sr-only">Search articles</label>
          <input
            id="news-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search articles…"
            className={cn(FIELD, "pl-11")}
          />
        </div>
      )}

      {/* List */}
      {visible.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-white/12 py-16 text-center">
          <Newspaper className="mx-auto mb-4 h-10 w-10 text-ink-600" />
          <p className="font-semibold">{items.length ? "No matches." : "No articles yet."}</p>
          <p className="mt-1 text-sm text-ink-500">
            {items.length ? "Try a different search." : "Create your first article to see it on the website."}
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {visible.map((a) => (
            <li
              key={a.id}
              className="flex flex-wrap items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4 transition-colors hover:border-gold-500/30"
            >
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gold-500/12 text-gold-400">
                <Newspaper className="h-5 w-5" />
              </span>

              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{a.titleEn || a.titleSo}</p>
                <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-500">
                  <span>{formatDate(a.publishedAt, "en")}</span>
                  {a.category && <span>· {a.category}</span>}
                  <span className="inline-flex items-center gap-1">
                    · {a.published ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                    {a.published ? "Published" : "Draft"}
                  </span>
                  {a.featured && (
                    <span className="inline-flex items-center gap-1 text-gold-400">
                      · <Star className="h-3 w-3 fill-current" /> Featured
                    </span>
                  )}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setDraft({ ...a })}
                  aria-label={`Edit ${a.titleEn || a.titleSo}`}
                  className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 text-ink-300 transition hover:border-gold-500/50 hover:text-gold-300"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmId(a.id)}
                  aria-label={`Delete ${a.titleEn || a.titleSo}`}
                  className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 text-ink-300 transition hover:border-red-500/50 hover:text-red-400"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Delete confirmation — destructive actions always ask first */}
      <AnimatePresence>
        {confirmId !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setConfirmId(null)}
            className="fixed inset-0 z-50 grid place-items-center bg-ink-950/80 p-5 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.96, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.96, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              className="w-full max-w-sm rounded-3xl border border-red-500/25 bg-ink-900 p-6 text-center"
            >
              <span className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-red-500/12 text-red-400">
                <Trash2 className="h-5 w-5" />
              </span>
              <h2 className="font-display text-lg font-bold">Delete this article?</h2>
              <p className="mt-2 text-sm text-ink-400">
                It will be removed from the website immediately. This cannot be undone.
              </p>
              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => setConfirmId(null)}
                  className="flex-1 rounded-xl border border-white/12 px-4 py-2.5 text-sm font-semibold text-ink-300 transition hover:bg-white/6"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => remove(confirmId)}
                  disabled={busy}
                  className="flex-1 rounded-xl bg-red-500/90 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-red-500 disabled:opacity-60"
                >
                  {busy ? "Deleting…" : "Delete"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Editor */}
      <AnimatePresence>
        {draft && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 overflow-y-auto bg-ink-950/85 p-4 backdrop-blur-sm sm:p-8"
            onClick={() => !busy && setDraft(null)}
          >
            <motion.form
              initial={{ opacity: 0, y: 22, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 22, scale: 0.98 }}
              onClick={(e) => e.stopPropagation()}
              onSubmit={save}
              className="mx-auto w-full max-w-3xl rounded-4xl border border-white/10 bg-ink-900 p-6 sm:p-8"
            >
              <div className="mb-6 flex items-center justify-between gap-4">
                <h2 className="font-display text-xl font-extrabold">
                  {typeof draft.id === "number" ? "Edit article" : "New article"}
                </h2>
                <button
                  type="button"
                  onClick={() => setDraft(null)}
                  aria-label="Close"
                  className="grid h-9 w-9 place-items-center rounded-lg text-ink-400 transition hover:bg-white/8 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className={LABEL} htmlFor="titleSo">Title — Somali</label>
                    <input id="titleSo" className={FIELD} value={draft.titleSo ?? ""}
                           onChange={(e) => setDraft({ ...draft, titleSo: e.target.value })} />
                  </div>
                  <div>
                    <label className={LABEL} htmlFor="titleEn">Title — English</label>
                    <input id="titleEn" className={FIELD} value={draft.titleEn ?? ""}
                           onChange={(e) => setDraft({ ...draft, titleEn: e.target.value })} />
                  </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className={LABEL} htmlFor="excerptSo">Summary — Somali</label>
                    <textarea id="excerptSo" rows={3} className={FIELD} value={draft.excerptSo ?? ""}
                              onChange={(e) => setDraft({ ...draft, excerptSo: e.target.value })} />
                  </div>
                  <div>
                    <label className={LABEL} htmlFor="excerptEn">Summary — English</label>
                    <textarea id="excerptEn" rows={3} className={FIELD} value={draft.excerptEn ?? ""}
                              onChange={(e) => setDraft({ ...draft, excerptEn: e.target.value })} />
                  </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className={LABEL} htmlFor="bodySo">Article — Somali</label>
                    <textarea id="bodySo" rows={7} className={FIELD} value={draft.bodySo ?? ""}
                              onChange={(e) => setDraft({ ...draft, bodySo: e.target.value })} />
                  </div>
                  <div>
                    <label className={LABEL} htmlFor="bodyEn">Article — English</label>
                    <textarea id="bodyEn" rows={7} className={FIELD} value={draft.bodyEn ?? ""}
                              onChange={(e) => setDraft({ ...draft, bodyEn: e.target.value })} />
                  </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-3">
                  <div>
                    <label className={LABEL} htmlFor="category">Category</label>
                    <input id="category" className={FIELD} value={draft.category ?? ""}
                           onChange={(e) => setDraft({ ...draft, category: e.target.value })} />
                  </div>
                  <div>
                    <label className={LABEL} htmlFor="author">Author</label>
                    <input id="author" className={FIELD} value={draft.author ?? ""}
                           onChange={(e) => setDraft({ ...draft, author: e.target.value })} />
                  </div>
                  <div>
                    <label className={LABEL} htmlFor="cover">Cover image URL</label>
                    <input id="cover" className={FIELD} value={draft.cover ?? ""}
                           onChange={(e) => setDraft({ ...draft, cover: e.target.value })} />
                  </div>
                </div>

                <div className="flex flex-wrap gap-6 pt-1">
                  <label className="inline-flex cursor-pointer items-center gap-2.5 text-sm">
                    <input type="checkbox" className="h-4 w-4 accent-gold-500"
                           checked={draft.published !== false}
                           onChange={(e) => setDraft({ ...draft, published: e.target.checked })} />
                    Published
                  </label>
                  <label className="inline-flex cursor-pointer items-center gap-2.5 text-sm">
                    <input type="checkbox" className="h-4 w-4 accent-gold-500"
                           checked={Boolean(draft.featured)}
                           onChange={(e) => setDraft({ ...draft, featured: e.target.checked })} />
                    Featured on the homepage
                  </label>
                </div>
              </div>

              <div className="mt-7 flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={busy}
                  className="inline-flex items-center gap-2 rounded-xl bg-gold-gradient px-6 py-2.5 text-sm font-bold text-ink-900 shadow-gold transition-transform hover:-translate-y-0.5 disabled:opacity-60"
                >
                  {busy && <Loader2 className="h-4 w-4 animate-spin" />}
                  {busy ? "Saving…" : "Save article"}
                </button>
                <button
                  type="button"
                  onClick={() => setDraft(null)}
                  className="rounded-xl border border-white/12 px-5 py-2.5 text-sm font-semibold text-ink-300 transition hover:bg-white/6"
                >
                  Cancel
                </button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
