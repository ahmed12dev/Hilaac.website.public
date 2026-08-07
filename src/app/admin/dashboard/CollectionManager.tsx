"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
  type LucideIcon,
} from "lucide-react";
import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import { cn } from "@/lib/utils";

const FIELD =
  "w-full rounded-xl border border-white/12 bg-white/5 px-4 py-2.5 text-sm text-white outline-none " +
  "transition-all placeholder:text-ink-500 focus:border-gold-500/70 focus:bg-white/8 focus:ring-4 focus:ring-gold-500/12";
const LABEL = "mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-ink-400";

export interface FieldDef {
  key: string;
  label: string;
  type?: "text" | "textarea" | "number" | "date" | "datetime-local" | "select" | "checkbox";
  options?: string[];
  rows?: number;
  /** Grid width out of 12 on desktop. */
  span?: 4 | 6 | 12;
  placeholder?: string;
}

/** Every collection row just needs an id; fields are read dynamically. */
export interface Row {
  id: number;
}

interface Props<T extends Row> {
  /** URL segment: events | leadership | gallery | messages */
  collection: string;
  title: string;
  icon: LucideIcon;
  initialItems: T[];
  fields: FieldDef[];
  emptyDraft: Partial<T>;
  /** Primary label shown in the list. */
  primary: (row: T) => string;
  /** Secondary line shown under the title. */
  meta?: (row: T) => ReactNode;
  /** Words to match when searching. */
  searchable?: (row: T) => string;
  /** Extra summary line under the header. */
  summary?: (rows: T[]) => string;
  /** Messages can't be created, only read and deleted. */
  canCreate?: boolean;
}

export function CollectionManager<T extends Row>({
  collection,
  title,
  icon: Icon,
  initialItems,
  fields,
  emptyDraft,
  primary,
  meta,
  searchable,
  summary,
  canCreate = true,
}: Props<T>) {
  const [items, setItems] = useState<T[]>(initialItems);
  const [draft, setDraft] = useState<Partial<T> | null>(null);
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [confirmId, setConfirmId] = useState<number | null>(null);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q || !searchable) return items;
    return items.filter((row) => searchable(row).toLowerCase().includes(q));
  }, [items, query, searchable]);

  function flash(kind: "ok" | "err", text: string) {
    setNotice({ kind, text });
    window.setTimeout(() => setNotice(null), 4000);
  }

  async function save(event: FormEvent) {
    event.preventDefault();
    if (!draft) return;

    setBusy(true);
    const editing = typeof draft.id === "number";
    try {
      const res = await fetch(`/api/site-admin/${collection}`, {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      const data = (await res.json()) as { ok?: boolean; item?: T; error?: string };

      if (!res.ok || !data.ok || !data.item) {
        flash("err", data.error ?? "Could not save.");
        return;
      }
      const saved = data.item;
      setItems((list) =>
        editing ? list.map((r) => (r.id === saved.id ? saved : r)) : [saved, ...list],
      );
      setDraft(null);
      flash("ok", editing ? `${title} updated.` : `${title} added.`);
    } catch {
      flash("err", "Network error.");
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: number) {
    setBusy(true);
    try {
      const res = await fetch(`/api/site-admin/${collection}?id=${id}`, { method: "DELETE" });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        flash("err", data.error ?? "Could not delete.");
        return;
      }
      setItems((list) => list.filter((r) => r.id !== id));
      flash("ok", "Deleted.");
    } catch {
      flash("err", "Network error.");
    } finally {
      setConfirmId(null);
      setBusy(false);
    }
  }

  function setField(key: string, value: unknown) {
    setDraft((d) => (d ? ({ ...d, [key]: value } as Partial<T>) : d));
  }

  return (
    <div className="space-y-7">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold sm:text-3xl">{title}</h1>
          <p className="mt-1.5 text-sm text-ink-400">
            {summary ? summary(items) : `${items.length} item${items.length === 1 ? "" : "s"}`}
          </p>
        </div>

        {canCreate && (
          <button
            type="button"
            onClick={() => setDraft({ ...emptyDraft })}
            className="inline-flex items-center gap-2 rounded-xl bg-gold-gradient px-5 py-2.5 text-sm font-bold text-ink-900 shadow-gold transition-transform hover:-translate-y-0.5"
          >
            <Plus className="h-4 w-4" />
            Add {title.replace(/s$/, "")}
          </button>
        )}
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

      {searchable && items.length > 0 && (
        <div className="relative max-w-sm">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-[17px] w-[17px] -translate-y-1/2 text-ink-500" aria-hidden />
          <label htmlFor={`${collection}-search`} className="sr-only">Search</label>
          <input
            id={`${collection}-search`}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search ${title.toLowerCase()}…`}
            className={cn(FIELD, "pl-11")}
          />
        </div>
      )}

      {visible.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-white/12 py-16 text-center">
          <Icon className="mx-auto mb-4 h-10 w-10 text-ink-600" />
          <p className="font-semibold">{items.length ? "No matches." : `No ${title.toLowerCase()} yet.`}</p>
          {!items.length && canCreate && (
            <p className="mt-1 text-sm text-ink-500">Add one to show it on the website.</p>
          )}
        </div>
      ) : (
        <ul className="space-y-3">
          {visible.map((row) => (
            <li
              key={row.id}
              className="flex flex-wrap items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4 transition-colors hover:border-gold-500/30"
            >
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gold-500/12 text-gold-400">
                <Icon className="h-5 w-5" />
              </span>

              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{primary(row)}</p>
                {meta && (
                  <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-500">
                    {meta(row)}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                {canCreate && (
                  <button
                    type="button"
                    onClick={() => setDraft({ ...row })}
                    aria-label={`Edit ${primary(row)}`}
                    className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 text-ink-300 transition hover:border-gold-500/50 hover:text-gold-300"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setConfirmId(row.id)}
                  aria-label={`Delete ${primary(row)}`}
                  className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 text-ink-300 transition hover:border-red-500/50 hover:text-red-400"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
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
              <h2 className="font-display text-lg font-bold">Delete this item?</h2>
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
                  {typeof draft.id === "number" ? `Edit ${title.replace(/s$/, "").toLowerCase()}` : `New ${title.replace(/s$/, "").toLowerCase()}`}
                </h2>
                <button type="button" onClick={() => setDraft(null)} aria-label="Close"
                        className="grid h-9 w-9 place-items-center rounded-lg text-ink-400 transition hover:bg-white/8 hover:text-white">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="grid grid-cols-12 gap-5">
                {fields.map((f) => {
                  const span = f.span ?? 12;
                  const cls = span === 4 ? "col-span-12 sm:col-span-4" : span === 6 ? "col-span-12 sm:col-span-6" : "col-span-12";
                  const id = `${collection}-${f.key}`;
                  const value = (draft as Record<string, unknown>)[f.key];

                  if (f.type === "checkbox") {
                    return (
                      <div key={f.key} className={cls}>
                        <label className="inline-flex cursor-pointer items-center gap-2.5 text-sm">
                          <input
                            type="checkbox"
                            className="h-4 w-4 accent-gold-500"
                            checked={value !== false}
                            onChange={(e) => setField(f.key, e.target.checked)}
                          />
                          {f.label}
                        </label>
                      </div>
                    );
                  }

                  return (
                    <div key={f.key} className={cls}>
                      <label className={LABEL} htmlFor={id}>{f.label}</label>
                      {f.type === "textarea" ? (
                        <textarea id={id} rows={f.rows ?? 4} className={FIELD}
                                  placeholder={f.placeholder}
                                  value={String(value ?? "")}
                                  onChange={(e) => setField(f.key, e.target.value)} />
                      ) : f.type === "select" ? (
                        <select id={id} className={FIELD} value={String(value ?? "")}
                                onChange={(e) => setField(f.key, e.target.value)}>
                          {(f.options ?? []).map((o) => <option key={o} value={o}>{o}</option>)}
                        </select>
                      ) : (
                        <input
                          id={id}
                          type={f.type ?? "text"}
                          className={FIELD}
                          placeholder={f.placeholder}
                          value={
                            f.type === "date" || f.type === "datetime-local"
                              ? String(value ?? "").slice(0, f.type === "date" ? 10 : 16)
                              : String(value ?? "")
                          }
                          onChange={(e) =>
                            setField(f.key, f.type === "number" ? (e.target.value === "" ? null : Number(e.target.value)) : e.target.value)
                          }
                        />
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="mt-7 flex flex-wrap gap-3">
                <button type="submit" disabled={busy}
                        className="inline-flex items-center gap-2 rounded-xl bg-gold-gradient px-6 py-2.5 text-sm font-bold text-ink-900 shadow-gold transition-transform hover:-translate-y-0.5 disabled:opacity-60">
                  {busy && <Loader2 className="h-4 w-4 animate-spin" />}
                  {busy ? "Saving…" : "Save"}
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

/** Small published/hidden pill used by several collections. */
export function PublishedTag({ on }: { on: boolean }) {
  return (
    <span className="inline-flex items-center gap-1">
      · {on ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
      {on ? "Published" : "Hidden"}
    </span>
  );
}
