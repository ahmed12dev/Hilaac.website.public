"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  FolderKanban,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { useState, type FormEvent } from "react";
import type { ProjectRow } from "@/lib/server/content";
import { cn, formatDate, formatMoney } from "@/lib/utils";
import { MediaPicker } from "../MediaPicker";

const FIELD =
  "w-full rounded-xl border border-white/12 bg-white/5 px-4 py-2.5 text-sm text-white outline-none " +
  "transition-all placeholder:text-ink-500 focus:border-gold-500/70 focus:bg-white/8 focus:ring-4 focus:ring-gold-500/12";
const LABEL = "mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-ink-400";

const STATUSES = ["planned", "ongoing", "completed", "paused"] as const;

const STATUS_STYLE: Record<string, string> = {
  ongoing: "bg-gold-500/15 text-gold-300",
  completed: "bg-emerald-500/15 text-emerald-300",
  planned: "bg-sky-500/15 text-sky-300",
  paused: "bg-white/10 text-ink-400",
};

type Draft = Partial<ProjectRow> & { id?: number };

const EMPTY: Draft = {
  titleSo: "", titleEn: "", descriptionSo: "", descriptionEn: "",
  status: "planned", progress: 0, currency: "USD", published: true,
};

export function ProjectsManager({ initialItems }: { initialItems: ProjectRow[] }) {
  const [items, setItems] = useState<ProjectRow[]>(initialItems);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [confirmId, setConfirmId] = useState<number | null>(null);

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
      const res = await fetch("/api/site-admin/projects", {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      const data = (await res.json()) as { ok?: boolean; item?: ProjectRow; error?: string };
      if (!res.ok || !data.ok || !data.item) {
        flash("err", data.error ?? "Could not save.");
        return;
      }
      const saved = data.item;
      setItems((list) =>
        editing ? list.map((p) => (p.id === saved.id ? saved : p)) : [saved, ...list],
      );
      setDraft(null);
      flash("ok", editing ? "Project updated." : "Project created.");
    } catch {
      flash("err", "Network error.");
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: number) {
    setBusy(true);
    try {
      const res = await fetch(`/api/site-admin/projects?id=${id}`, { method: "DELETE" });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        flash("err", data.error ?? "Could not delete.");
        return;
      }
      setItems((list) => list.filter((p) => p.id !== id));
      flash("ok", "Project deleted.");
    } catch {
      flash("err", "Network error.");
    } finally {
      setConfirmId(null);
      setBusy(false);
    }
  }

  return (
    <div className="space-y-7">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold sm:text-3xl">Projects</h1>
          <p className="mt-1.5 text-sm text-ink-400">
            {items.length} project{items.length === 1 ? "" : "s"} ·{" "}
            {items.filter((p) => p.status === "ongoing").length} active ·{" "}
            {items.filter((p) => p.status === "completed").length} completed
          </p>
        </div>
        <button
          type="button"
          onClick={() => setDraft({ ...EMPTY })}
          className="inline-flex items-center gap-2 rounded-xl bg-gold-gradient px-5 py-2.5 text-sm font-bold text-ink-900 shadow-gold transition-transform hover:-translate-y-0.5"
        >
          <Plus className="h-4 w-4" />
          New project
        </button>
      </header>

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

      {items.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-white/12 py-16 text-center">
          <FolderKanban className="mx-auto mb-4 h-10 w-10 text-ink-600" />
          <p className="font-semibold">No projects yet.</p>
          <p className="mt-1 text-sm text-ink-500">Add one to show it on the website.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {items.map((p) => (
            <li
              key={p.id}
              className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 transition-colors hover:border-gold-500/30"
            >
              <div className="flex flex-wrap items-center gap-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gold-500/12 text-gold-400">
                  <FolderKanban className="h-5 w-5" />
                </span>

                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{p.titleEn || p.titleSo}</p>
                  <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-500">
                    <span className={cn("rounded px-1.5 py-0.5 font-bold uppercase", STATUS_STYLE[p.status])}>
                      {p.status}
                    </span>
                    <span>· {formatMoney(p.budget ?? undefined, p.currency)}</span>
                    {p.startDate && <span>· {formatDate(p.startDate, "en")}</span>}
                    <span className="inline-flex items-center gap-1">
                      · {p.published ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                      {p.published ? "Published" : "Hidden"}
                    </span>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setDraft({ ...p })}
                    aria-label={`Edit ${p.titleEn || p.titleSo}`}
                    className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 text-ink-300 transition hover:border-gold-500/50 hover:text-gold-300"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmId(p.id)}
                    aria-label={`Delete ${p.titleEn || p.titleSo}`}
                    className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 text-ink-300 transition hover:border-red-500/50 hover:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Progress */}
              <div className="mt-3 flex items-center gap-3">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/8">
                  <div className="h-full rounded-full bg-gold-gradient" style={{ width: `${p.progress}%` }} />
                </div>
                <span className="w-10 text-right text-xs font-bold text-gold-400">{p.progress}%</span>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Delete confirmation */}
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
              <h2 className="font-display text-lg font-bold">Delete this project?</h2>
              <p className="mt-2 text-sm text-ink-400">
                It will disappear from the website immediately. This cannot be undone.
              </p>
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

      {/* Editor */}
      <AnimatePresence>
        {draft && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
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
                  {typeof draft.id === "number" ? "Edit project" : "New project"}
                </h2>
                <button type="button" onClick={() => setDraft(null)} aria-label="Close"
                        className="grid h-9 w-9 place-items-center rounded-lg text-ink-400 transition hover:bg-white/8 hover:text-white">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className={LABEL} htmlFor="p-titleSo">Title — Somali</label>
                    <input id="p-titleSo" className={FIELD} value={draft.titleSo ?? ""}
                           onChange={(e) => setDraft({ ...draft, titleSo: e.target.value })} />
                  </div>
                  <div>
                    <label className={LABEL} htmlFor="p-titleEn">Title — English</label>
                    <input id="p-titleEn" className={FIELD} value={draft.titleEn ?? ""}
                           onChange={(e) => setDraft({ ...draft, titleEn: e.target.value })} />
                  </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className={LABEL} htmlFor="p-descSo">Description — Somali</label>
                    <textarea id="p-descSo" rows={4} className={FIELD} value={draft.descriptionSo ?? ""}
                              onChange={(e) => setDraft({ ...draft, descriptionSo: e.target.value })} />
                  </div>
                  <div>
                    <label className={LABEL} htmlFor="p-descEn">Description — English</label>
                    <textarea id="p-descEn" rows={4} className={FIELD} value={draft.descriptionEn ?? ""}
                              onChange={(e) => setDraft({ ...draft, descriptionEn: e.target.value })} />
                  </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-3">
                  <div>
                    <label className={LABEL} htmlFor="p-status">Status</label>
                    <select id="p-status" className={FIELD} value={draft.status ?? "planned"}
                            onChange={(e) => setDraft({ ...draft, status: e.target.value })}>
                      {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={LABEL} htmlFor="p-progress">Progress %</label>
                    <input id="p-progress" type="number" min={0} max={100} className={FIELD}
                           value={draft.progress ?? 0}
                           onChange={(e) => setDraft({ ...draft, progress: Number(e.target.value) })} />
                  </div>
                  <div>
                    <label className={LABEL} htmlFor="p-location">Location</label>
                    <input id="p-location" className={FIELD} value={draft.location ?? ""}
                           onChange={(e) => setDraft({ ...draft, location: e.target.value })} />
                  </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-4">
                  <div>
                    <label className={LABEL} htmlFor="p-budget">Budget</label>
                    <input id="p-budget" type="number" min={0} className={FIELD}
                           value={draft.budget ?? ""}
                           onChange={(e) => setDraft({ ...draft, budget: e.target.value === "" ? null : Number(e.target.value) })} />
                  </div>
                  <div>
                    <label className={LABEL} htmlFor="p-currency">Currency</label>
                    <input id="p-currency" className={FIELD} value={draft.currency ?? "USD"}
                           onChange={(e) => setDraft({ ...draft, currency: e.target.value })} />
                  </div>
                  <div>
                    <label className={LABEL} htmlFor="p-start">Start date</label>
                    <input id="p-start" type="date" className={FIELD}
                           value={(draft.startDate ?? "").slice(0, 10)}
                           onChange={(e) => setDraft({ ...draft, startDate: e.target.value })} />
                  </div>
                  <div>
                    <label className={LABEL} htmlFor="p-end">End date</label>
                    <input id="p-end" type="date" className={FIELD}
                           value={(draft.endDate ?? "").slice(0, 10)}
                           onChange={(e) => setDraft({ ...draft, endDate: e.target.value })} />
                  </div>
                </div>

                <MediaPicker
                  id="p-cover"
                  label="Cover image"
                  folder="projects"
                  value={draft.cover ?? ""}
                  onChange={(url) => setDraft({ ...draft, cover: url })}
                />

                <label className="inline-flex cursor-pointer items-center gap-2.5 text-sm">
                  <input type="checkbox" className="h-4 w-4 accent-gold-500"
                         checked={draft.published !== false}
                         onChange={(e) => setDraft({ ...draft, published: e.target.checked })} />
                  Show on the website
                </label>
              </div>

              <div className="mt-7 flex flex-wrap gap-3">
                <button type="submit" disabled={busy}
                        className="inline-flex items-center gap-2 rounded-xl bg-gold-gradient px-6 py-2.5 text-sm font-bold text-ink-900 shadow-gold transition-transform hover:-translate-y-0.5 disabled:opacity-60">
                  {busy && <Loader2 className="h-4 w-4 animate-spin" />}
                  {busy ? "Saving…" : "Save project"}
                </button>
                <button type="button" onClick={() => setDraft(null)}
                        className="rounded-xl border border-white/12 px-5 py-2.5 text-sm font-semibold text-ink-300 transition hover:bg-white/6">
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
