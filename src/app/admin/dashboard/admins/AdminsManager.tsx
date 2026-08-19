"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  CheckCircle2,
  KeyRound,
  Loader2,
  Pencil,
  Plus,
  ShieldCheck,
  Trash2,
  UserCog,
  X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import type { AdminAccount, SiteAdmin } from "@/lib/server/auth";
import { cn, formatDate } from "@/lib/utils";

const FIELD =
  "w-full rounded-xl border border-white/12 bg-white/5 px-4 py-2.5 text-sm text-white outline-none " +
  "transition-all placeholder:text-ink-500 focus:border-gold-500/70 focus:bg-white/8";
const LABEL = "mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-ink-400";

interface Draft {
  id?: string;
  email: string;
  name: string;
  role: string;
  password: string;
}

const EMPTY: Draft = { email: "", name: "", role: "editor", password: "" };

export function AdminsManager({ me }: { me: SiteAdmin }) {
  const [items, setItems] = useState<AdminAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  // Own-password form
  const [currentPassword, setCurrentPassword] = useState("");
  const [nextPassword, setNextPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  const isOwner = me.role === "owner";

  function flash(kind: "ok" | "err", text: string) {
    setNotice({ kind, text });
    window.setTimeout(() => setNotice(null), 5000);
  }

  const load = useCallback(async () => {
    if (!isOwner) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/site-admin/admins");
      const data = (await res.json()) as { ok?: boolean; items?: AdminAccount[]; error?: string };
      if (!res.ok || !data.ok) {
        flash("err", data.error ?? "Could not load accounts.");
        return;
      }
      setItems(data.items ?? []);
    } catch {
      flash("err", "Network error.");
    } finally {
      setLoading(false);
    }
  }, [isOwner]);

  useEffect(() => {
    load();
  }, [load]);

  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (!draft) return;

    setBusy(true);
    const editing = Boolean(draft.id);
    try {
      const res = await fetch("/api/site-admin/admins", {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      const data = (await res.json()) as { ok?: boolean; item?: AdminAccount; error?: string };
      if (!res.ok || !data.ok) {
        flash("err", data.error ?? "Could not save.");
        return;
      }
      setDraft(null);
      flash("ok", editing ? "Account updated." : "Administrator added.");
      load();
    } catch {
      flash("err", "Network error.");
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    setBusy(true);
    try {
      const res = await fetch(`/api/site-admin/admins?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        flash("err", data.error ?? "Could not delete.");
        return;
      }
      flash("ok", "Account removed.");
      load();
    } catch {
      flash("err", "Network error.");
    } finally {
      setConfirmId(null);
      setBusy(false);
    }
  }

  async function changePassword(event: React.FormEvent) {
    event.preventDefault();
    setChangingPassword(true);
    try {
      const res = await fetch("/api/site-admin/admins", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ self: true, currentPassword, password: nextPassword }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        flash("err", data.error ?? "Could not change the password.");
        return;
      }
      setCurrentPassword("");
      setNextPassword("");
      flash("ok", "Password changed. Other devices have been signed out.");
    } catch {
      flash("err", "Network error.");
    } finally {
      setChangingPassword(false);
    }
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold sm:text-3xl">Administrators</h1>
          <p className="mt-1.5 text-sm text-ink-400">
            {isOwner
              ? "Who can sign in to this dashboard, and what each of them may do."
              : "Change the password for your own account."}
          </p>
        </div>

        {isOwner && (
          <button
            type="button"
            onClick={() => setDraft({ ...EMPTY })}
            className="inline-flex items-center gap-2 rounded-xl bg-gold-gradient px-5 py-2.5 text-sm font-bold text-ink-900 shadow-gold transition-transform hover:-translate-y-0.5"
          >
            <Plus className="h-4 w-4" />
            Add administrator
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
            {notice.kind === "ok" ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            {notice.text}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Accounts */}
      {isOwner && (
        <section>
          {loading ? (
            <p className="py-14 text-center">
              <Loader2 className="mx-auto h-7 w-7 animate-spin text-gold-400" />
            </p>
          ) : items.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-white/12 py-14 text-center">
              <UserCog className="mx-auto mb-3 h-9 w-9 text-ink-600" />
              <p className="font-semibold">No stored accounts yet.</p>
              <p className="mt-1 text-sm text-ink-500">
                You are signed in with the credentials set in the server environment.
              </p>
            </div>
          ) : (
            <ul className="space-y-3">
              {items.map((account) => (
                <li
                  key={account.id}
                  className="flex flex-wrap items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4 transition-colors hover:border-gold-500/30"
                >
                  <span
                    className={cn(
                      "grid h-11 w-11 shrink-0 place-items-center rounded-xl",
                      account.role === "owner"
                        ? "bg-gold-gradient text-ink-900"
                        : "bg-white/8 text-ink-300",
                    )}
                  >
                    {account.role === "owner" ? (
                      <ShieldCheck className="h-5 w-5" />
                    ) : (
                      <UserCog className="h-5 w-5" />
                    )}
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">
                      {account.name || account.email}
                      {account.id === me.id && (
                        <span className="ml-2 rounded bg-white/10 px-1.5 py-0.5 text-[0.6rem] font-bold uppercase tracking-wide text-ink-300">
                          You
                        </span>
                      )}
                    </p>
                    <p className="mt-0.5 flex flex-wrap items-center gap-x-3 text-xs text-ink-500">
                      <span>{account.email}</span>
                      <span className="capitalize text-gold-400">· {account.role}</span>
                      {account.lastSeen && <span>· last seen {formatDate(account.lastSeen, "en")}</span>}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setDraft({
                          id: account.id,
                          email: account.email,
                          name: account.name ?? "",
                          role: account.role,
                          password: "",
                        })
                      }
                      aria-label={`Edit ${account.email}`}
                      className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 text-ink-300 transition hover:border-gold-500/50 hover:text-gold-300"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    {account.id !== me.id && (
                      <button
                        type="button"
                        onClick={() => setConfirmId(account.id)}
                        aria-label={`Remove ${account.email}`}
                        className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 text-ink-300 transition hover:border-red-500/50 hover:text-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {/* Own password */}
      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
        <div className="mb-5 flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-sky-500/15 text-sky-400">
            <KeyRound className="h-5 w-5" />
          </span>
          <div>
            <h2 className="font-display text-base font-bold">Change your password</h2>
            <p className="text-xs text-ink-400">
              Signs every other device out once the new password is saved.
            </p>
          </div>
        </div>

        <form onSubmit={changePassword} className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL} htmlFor="current-password">
              Current password
            </label>
            <input
              id="current-password"
              type="password"
              required
              autoComplete="current-password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className={FIELD}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="new-password">
              New password
            </label>
            <input
              id="new-password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={nextPassword}
              onChange={(e) => setNextPassword(e.target.value)}
              className={FIELD}
              placeholder="At least 8 characters"
            />
          </div>
          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={changingPassword}
              className="inline-flex items-center gap-2 rounded-xl bg-gold-gradient px-5 py-2.5 text-sm font-bold text-ink-900 shadow-gold transition-transform hover:-translate-y-0.5 disabled:opacity-60"
            >
              {changingPassword && <Loader2 className="h-4 w-4 animate-spin" />}
              {changingPassword ? "Saving…" : "Change password"}
            </button>
          </div>
        </form>
      </section>

      {/* Delete confirmation */}
      <AnimatePresence>
        {confirmId && (
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
              <h2 className="font-display text-lg font-bold">Remove this administrator?</h2>
              <p className="mt-2 text-sm text-ink-400">
                They will lose access to the dashboard immediately.
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
                  {busy ? "Removing…" : "Remove"}
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
            onClick={() => !busy && setDraft(null)}
            className="fixed inset-0 z-50 overflow-y-auto bg-ink-950/85 p-4 backdrop-blur-sm sm:p-8"
          >
            <motion.form
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.98 }}
              onClick={(e) => e.stopPropagation()}
              onSubmit={save}
              className="mx-auto w-full max-w-lg rounded-4xl border border-white/10 bg-ink-900 p-6 sm:p-8"
            >
              <div className="mb-6 flex items-center justify-between gap-4">
                <h2 className="font-display text-xl font-extrabold">
                  {draft.id ? "Edit administrator" : "New administrator"}
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

              <div className="space-y-4">
                <div>
                  <label className={LABEL} htmlFor="a-email">
                    Email
                  </label>
                  <input
                    id="a-email"
                    type="email"
                    required
                    disabled={Boolean(draft.id)}
                    value={draft.email}
                    onChange={(e) => setDraft({ ...draft, email: e.target.value })}
                    className={cn(FIELD, draft.id && "opacity-60")}
                  />
                  {draft.id && (
                    <p className="mt-1 text-[0.7rem] text-ink-500">
                      An account&rsquo;s email cannot be changed.
                    </p>
                  )}
                </div>

                <div>
                  <label className={LABEL} htmlFor="a-name">
                    Display name
                  </label>
                  <input
                    id="a-name"
                    value={draft.name}
                    onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                    className={FIELD}
                  />
                </div>

                <div>
                  <label className={LABEL} htmlFor="a-role">
                    Role
                  </label>
                  <select
                    id="a-role"
                    value={draft.role}
                    onChange={(e) => setDraft({ ...draft, role: e.target.value })}
                    className={FIELD}
                  >
                    <option value="editor" className="bg-ink-900">
                      Editor — manages content only
                    </option>
                    <option value="owner" className="bg-ink-900">
                      Owner — full access, including accounts
                    </option>
                  </select>
                </div>

                <div>
                  <label className={LABEL} htmlFor="a-password">
                    {draft.id ? "New password (leave blank to keep)" : "Password"}
                  </label>
                  <input
                    id="a-password"
                    type="password"
                    required={!draft.id}
                    minLength={8}
                    autoComplete="new-password"
                    value={draft.password}
                    onChange={(e) => setDraft({ ...draft, password: e.target.value })}
                    className={FIELD}
                    placeholder="At least 8 characters"
                  />
                </div>
              </div>

              <div className="mt-7 flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={busy}
                  className="inline-flex items-center gap-2 rounded-xl bg-gold-gradient px-6 py-2.5 text-sm font-bold text-ink-900 shadow-gold transition-transform hover:-translate-y-0.5 disabled:opacity-60"
                >
                  {busy && <Loader2 className="h-4 w-4 animate-spin" />}
                  {busy ? "Saving…" : "Save"}
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
