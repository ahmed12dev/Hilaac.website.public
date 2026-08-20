"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Download,
  FileUp,
  Filter,
  Loader2,
  MapPin,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
  UserCheck,
  Users,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { MemberRow, MemberStats } from "@/lib/server/members";
import { cn, formatDate } from "@/lib/utils";
import { useAdminText } from "../useAdminText";

const REGIONS = [
  "Banaadir",
  "Galmudug",
  "Puntland",
  "Hirshabelle",
  "South West",
  "Jubaland",
  "Somaliland",
  "Diaspora",
];

const STATUSES = ["pending", "active", "verified"] as const;

const FIELD =
  "h-10 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-xs text-white outline-none " +
  "placeholder:text-ink-500 focus:border-gold-500/70";
const LABEL = "mb-1 block text-xs font-semibold text-ink-300";

type Draft = Partial<MemberRow>;

const EMPTY: Draft = {
  fullName: "",
  phone: "",
  email: "",
  region: "Banaadir",
  district: "",
  gender: "Male",
  status: "pending",
  note: "",
};

export function MembersManager() {
  const { at } = useAdminText();
  const [members, setMembers] = useState<MemberRow[]>([]);
  const [stats, setStats] = useState<MemberStats | null>(null);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  const [search, setSearch] = useState("");
  const [region, setRegion] = useState("All");
  const [status, setStatus] = useState("All");

  const [draft, setDraft] = useState<Draft | null>(null);
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [importing, setImporting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function flash(kind: "ok" | "err", text: string) {
    setNotice({ kind, text });
    window.setTimeout(() => setNotice(null), 4500);
  }

  /** Filtering runs in SQL, so the roster stays fast however long it gets. */
  const filterQuery = useCallback(() => {
    const params = new URLSearchParams();
    if (search.trim()) params.set("q", search.trim());
    if (region !== "All") params.set("region", region);
    if (status !== "All") params.set("status", status);
    return params;
  }, [search, region, status]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/site-admin/members?${filterQuery().toString()}`);
      const data = (await res.json()) as {
        ok?: boolean;
        members?: MemberRow[];
        total?: number;
        stats?: MemberStats;
        error?: string;
      };
      if (!res.ok || !data.ok) {
        flash("err", data.error ?? at("common.couldNotSave"));
        return;
      }
      setMembers(data.members ?? []);
      setTotal(data.total ?? 0);
      if (data.stats) setStats(data.stats);
    } catch {
      flash("err", at("common.networkError"));
    } finally {
      setLoading(false);
    }
  }, [filterQuery]);

  // Search is debounced so typing doesn't fire a request per keystroke.
  useEffect(() => {
    const timer = window.setTimeout(load, search ? 300 : 0);
    return () => window.clearTimeout(timer);
  }, [load, search]);

  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (!draft || !String(draft.fullName || "").trim()) return;

    setBusy(true);
    const editing = typeof draft.id === "number";
    try {
      const res = await fetch("/api/site-admin/members", {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      const data = (await res.json()) as { ok?: boolean; member?: MemberRow; error?: string };
      if (!res.ok || !data.ok || !data.member) {
        flash("err", data.error ?? at("common.couldNotSave"));
        return;
      }
      setDraft(null);
      flash("ok", editing ? at("members.editMember") : at("members.newMember"));
      load();
    } catch {
      flash("err", at("common.networkError"));
    } finally {
      setBusy(false);
    }
  }

  async function setStatusOf(id: number, next: string) {
    setMembers((list) =>
      list.map((m) => (m.id === id ? { ...m, status: next as MemberRow["status"] } : m)),
    );
    try {
      await fetch("/api/site-admin/members", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: next }),
      });
      load();
    } catch {
      flash("err", at("common.couldNotSave"));
    }
  }

  async function remove(id: number) {
    setBusy(true);
    try {
      const res = await fetch(`/api/site-admin/members?id=${id}`, { method: "DELETE" });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        flash("err", data.error ?? at("common.couldNotDelete"));
        return;
      }
      flash("ok", at("common.deleted"));
      load();
    } catch {
      flash("err", at("common.networkError"));
    } finally {
      setConfirmId(null);
      setBusy(false);
    }
  }

  /** The export is generated by the server, so it covers every filtered row. */
  function exportCsv() {
    const params = filterQuery();
    params.set("format", "csv");
    window.location.href = `/api/site-admin/members?${params.toString()}`;
  }

  async function importCsv(file: File) {
    setImporting(true);
    try {
      const csv = await file.text();
      const res = await fetch("/api/site-admin/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csv }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        added?: number;
        failed?: number;
        error?: string;
      };
      if (!res.ok || !data.ok) {
        flash("err", data.error ?? at("common.couldNotSave"));
        return;
      }
      flash(
        "ok",
        `Imported ${data.added} member${data.added === 1 ? "" : "s"}` +
          (data.failed ? ` · ${data.failed} row${data.failed === 1 ? "" : "s"} skipped` : ""),
      );
      load();
    } catch {
      flash("err", at("common.couldNotSave"));
    } finally {
      setImporting(false);
    }
  }

  const kpis = [
    { label: at("members.totalRegistered"), value: stats?.total ?? 0, icon: Users, tone: "gold" },
    { label: at("members.verified"), value: stats?.verified ?? 0, icon: ShieldCheck, tone: "emerald" },
    { label: at("members.active"), value: stats?.active ?? 0, icon: UserCheck, tone: "sky" },
    { label: at("members.pending"), value: stats?.pending ?? 0, icon: Clock, tone: "amber" },
  ] as const;

  return (
    <div className="space-y-8">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2xl font-extrabold sm:text-3xl">{at("members.title")}</h1>
          <p className="mt-1 text-sm text-ink-400">
            {stats
              ? `${stats.total} · ${stats.regions} ${at("members.regionsWord")} · ${stats.thisMonth} ${at("members.joinedThisMonth")}`
              : at("members.subtitle")}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={load}
            disabled={loading}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 text-xs font-semibold text-ink-300 transition-colors hover:bg-white/10 hover:text-white"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
            {at("common.refresh")}
          </button>

          <input
            ref={fileRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) importCsv(file);
              e.target.value = "";
            }}
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={importing}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3.5 text-xs font-semibold text-ink-200 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-60"
          >
            {importing ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-gold-400" />
            ) : (
              <FileUp className="h-3.5 w-3.5 text-gold-400" />
            )}
            {at("members.importCsv")}
          </button>

          <button
            type="button"
            onClick={exportCsv}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3.5 text-xs font-semibold text-ink-200 transition-colors hover:bg-white/10 hover:text-white"
          >
            <Download className="h-3.5 w-3.5 text-gold-400" />
            {at("members.exportCsv")}
          </button>

          <button
            type="button"
            onClick={() => setDraft({ ...EMPTY })}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-gold-gradient px-4 text-xs font-bold text-ink-900 shadow-gold transition-transform hover:-translate-y-0.5"
          >
            <Plus className="h-4 w-4" />
            {at("members.addMember")}
          </button>
        </div>
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

      {/* Totals */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className={cn(
              "rounded-2xl border p-4",
              kpi.tone === "gold" && "border-white/10 bg-white/[0.03]",
              kpi.tone === "emerald" && "border-emerald-500/20 bg-emerald-500/[0.03]",
              kpi.tone === "sky" && "border-sky-500/20 bg-sky-500/[0.03]",
              kpi.tone === "amber" && "border-amber-500/20 bg-amber-500/[0.03]",
            )}
          >
            <div
              className={cn(
                "flex items-center justify-between",
                kpi.tone === "gold" && "text-ink-400",
                kpi.tone === "emerald" && "text-emerald-400",
                kpi.tone === "sky" && "text-sky-400",
                kpi.tone === "amber" && "text-amber-400",
              )}
            >
              <span className="text-xs font-semibold uppercase tracking-wider">{kpi.label}</span>
              <kpi.icon className="h-4 w-4" />
            </div>
            <p className="mt-2 font-display text-2xl font-bold">{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.02] p-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500" />
          <label htmlFor="member-search" className="sr-only">
            {at("common.search")}
          </label>
          <input
            id="member-search"
            type="search"
            placeholder={at("members.searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={cn(FIELD, "pl-10")}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-2.5 py-1">
            <Filter className="h-3.5 w-3.5 text-ink-400" />
            <label htmlFor="member-region" className="sr-only">
              {at("members.region")}
            </label>
            <select
              id="member-region"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="bg-transparent py-1.5 text-xs text-white outline-none"
            >
              <option value="All" className="bg-ink-900">
                {at("members.allRegions")}
              </option>
              {REGIONS.map((r) => (
                <option key={r} value={r} className="bg-ink-900">
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 px-2.5 py-1">
            <label htmlFor="member-status" className="sr-only">
              {at("members.status")}
            </label>
            <select
              id="member-status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="bg-transparent py-1.5 text-xs text-white outline-none"
            >
              <option value="All" className="bg-ink-900">
                {at("members.allStatuses")}
              </option>
              {STATUSES.map((s) => (
                <option key={s} value={s} className="bg-ink-900">
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Roster */}
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.03] font-semibold uppercase tracking-wider text-ink-400">
                <th className="px-5 py-3.5">{at("members.colId")}</th>
                <th className="px-5 py-3.5">{at("members.colName")}</th>
                <th className="px-5 py-3.5">{at("members.colContact")}</th>
                <th className="px-5 py-3.5">{at("members.colLocation")}</th>
                <th className="px-5 py-3.5">{at("members.colStatus")}</th>
                <th className="px-5 py-3.5">{at("members.colJoined")}</th>
                <th className="px-5 py-3.5 text-right">{at("members.colActions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-ink-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-ink-500">
                    <Loader2 className="mx-auto h-6 w-6 animate-spin text-gold-400" />
                    <p className="mt-2 font-medium">{at("members.loadingRegistry")}</p>
                  </td>
                </tr>
              ) : members.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-14 text-center text-ink-500">
                    <Users className="mx-auto h-8 w-8 text-ink-600" />
                    <p className="mt-2 font-semibold">
                      {stats?.total ? at("members.noneMatch") : at("members.noneYet")}
                    </p>
                    {!stats?.total && (
                      <p className="mt-1 text-xs">
                        {at("members.emptyHint")}
                      </p>
                    )}
                  </td>
                </tr>
              ) : (
                members.map((m) => (
                  <tr key={m.id} className="transition-colors hover:bg-white/[0.02]">
                    <td className="px-5 py-4 font-mono font-bold text-gold-300">
                      {m.membershipNumber}
                    </td>
                    <td className="px-5 py-4 font-semibold text-white">
                      {m.fullName}
                      {m.gender && (
                        <span className="block text-[0.7rem] font-normal text-ink-400">
                          {m.gender}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div>{m.phone || "—"}</div>
                      {m.email && <div className="text-[0.7rem] text-ink-400">{m.email}</div>}
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-medium text-white">{m.region || "—"}</span>
                      {m.district && (
                        <span className="block text-[0.7rem] text-ink-400">{m.district}</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider",
                          m.status === "verified" &&
                            "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
                          m.status === "active" && "border-sky-500/20 bg-sky-500/10 text-sky-400",
                          m.status === "pending" &&
                            "border-amber-500/20 bg-amber-500/10 text-amber-400",
                        )}
                      >
                        {m.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-ink-400">{formatDate(m.createdAt, "en")}</td>
                    <td className="px-5 py-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        {m.status !== "verified" && (
                          <button
                            type="button"
                            onClick={() => setStatusOf(m.id, "verified")}
                            title={at("members.verify")}
                            aria-label={`${at("members.verify")} ${m.fullName}`}
                            className="rounded-lg p-1.5 text-emerald-400 transition-colors hover:bg-emerald-500/10"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setDraft({ ...m })}
                          title={at("common.edit")}
                          aria-label={`${at("common.edit")} ${m.fullName}`}
                          className="rounded-lg p-1.5 text-ink-300 transition-colors hover:bg-white/8 hover:text-gold-300"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmId(m.id)}
                          title={at("common.delete")}
                          aria-label={`${at("common.delete")} ${m.fullName}`}
                          className="rounded-lg p-1.5 text-rose-400 transition-colors hover:bg-rose-500/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {members.length > 0 && (
        <p className="text-xs text-ink-500">
          {at("members.showing")} {members.length} {at("members.ofMatching")} {total} {at("members.records")}.
        </p>
      )}

      {/* Delete confirmation */}
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
              <h2 className="font-display text-lg font-bold">{at("members.removeTitle")}</h2>
              <p className="mt-2 text-sm text-ink-400">
                {at("members.removeText")}
              </p>
              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => setConfirmId(null)}
                  className="flex-1 rounded-xl border border-white/12 px-4 py-2.5 text-sm font-semibold text-ink-300 transition hover:bg-white/6"
                >
                  {at("common.cancel")}
                </button>
                <button
                  type="button"
                  onClick={() => remove(confirmId)}
                  disabled={busy}
                  className="flex-1 rounded-xl bg-red-500/90 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-red-500 disabled:opacity-60"
                >
                  {busy ? at("members.removing") : at("members.remove")}
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
              className="mx-auto w-full max-w-2xl rounded-4xl border border-white/10 bg-ink-900 p-6 sm:p-8"
            >
              <div className="mb-6 flex items-center justify-between gap-4">
                <h2 className="font-display text-xl font-extrabold">
                  {typeof draft.id === "number" ? at("members.editMember") : at("members.newMember")}
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

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className={LABEL} htmlFor="m-name">
                    {at("members.fullName")} *
                  </label>
                  <input
                    id="m-name"
                    required
                    className={FIELD}
                    value={draft.fullName ?? ""}
                    onChange={(e) => setDraft({ ...draft, fullName: e.target.value })}
                    placeholder="e.g. Axmed Cali Maxamed"
                  />
                </div>

                <div>
                  <label className={LABEL} htmlFor="m-phone">
                    {at("members.phone")}
                  </label>
                  <input
                    id="m-phone"
                    className={FIELD}
                    value={draft.phone ?? ""}
                    onChange={(e) => setDraft({ ...draft, phone: e.target.value })}
                    placeholder="+252 …"
                  />
                </div>

                <div>
                  <label className={LABEL} htmlFor="m-email">
                    {at("members.email")}
                  </label>
                  <input
                    id="m-email"
                    type="email"
                    className={FIELD}
                    value={draft.email ?? ""}
                    onChange={(e) => setDraft({ ...draft, email: e.target.value })}
                  />
                </div>

                <div>
                  <label className={LABEL} htmlFor="m-region">
                    {at("members.region")}
                  </label>
                  <select
                    id="m-region"
                    className={cn(FIELD, "bg-ink-800")}
                    value={draft.region ?? ""}
                    onChange={(e) => setDraft({ ...draft, region: e.target.value })}
                  >
                    <option value="">—</option>
                    {REGIONS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={LABEL} htmlFor="m-district">
                    {at("members.district")}
                  </label>
                  <input
                    id="m-district"
                    className={FIELD}
                    value={draft.district ?? ""}
                    onChange={(e) => setDraft({ ...draft, district: e.target.value })}
                  />
                </div>

                <div>
                  <label className={LABEL} htmlFor="m-gender">
                    {at("members.gender")}
                  </label>
                  <select
                    id="m-gender"
                    className={cn(FIELD, "bg-ink-800")}
                    value={draft.gender ?? ""}
                    onChange={(e) => setDraft({ ...draft, gender: e.target.value })}
                  >
                    <option value="">—</option>
                    <option value="Male">Male / Lab</option>
                    <option value="Female">Female / Dheddig</option>
                  </select>
                </div>

                <div>
                  <label className={LABEL} htmlFor="m-status">
                    {at("members.status")}
                  </label>
                  <select
                    id="m-status"
                    className={cn(FIELD, "bg-ink-800")}
                    value={draft.status ?? "pending"}
                    onChange={(e) =>
                      setDraft({ ...draft, status: e.target.value as MemberRow["status"] })
                    }
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className={LABEL} htmlFor="m-number">
                    {at("members.number")}
                  </label>
                  <input
                    id="m-number"
                    className={FIELD}
                    value={draft.membershipNumber ?? ""}
                    onChange={(e) => setDraft({ ...draft, membershipNumber: e.target.value })}
                    placeholder={at("members.numberHint")}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className={LABEL} htmlFor="m-note">
                    {at("members.note")}
                  </label>
                  <textarea
                    id="m-note"
                    rows={3}
                    className={cn(FIELD, "h-auto py-2.5")}
                    value={draft.note ?? ""}
                    onChange={(e) => setDraft({ ...draft, note: e.target.value })}
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
                  {busy ? at("common.saving") : at("members.saveMember")}
                </button>
                <button
                  type="button"
                  onClick={() => setDraft(null)}
                  className="rounded-xl border border-white/12 px-5 py-2.5 text-sm font-semibold text-ink-300 transition hover:bg-white/6"
                >
                  {at("common.cancel")}
                </button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>

      <p className="flex items-start gap-2 text-xs text-ink-500">
        <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        {at("members.csvHint")}
      </p>
    </div>
  );
}
