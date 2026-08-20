"use client";

import { motion } from "framer-motion";
import {
  Activity,
  CalendarDays,
  FolderKanban,
  Image as ImageIcon,
  Loader2,
  Mail,
  MessageSquare,
  Newspaper,
  RefreshCw,
  ShieldCheck,
  TrendingUp,
  UsersRound,
  Users,
  type LucideIcon,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import type { ActivityRow, AnalyticsSnapshot, DayCount } from "@/lib/server/activity";
import type { LiveTotals } from "@/lib/types";
import { cn, formatDate, formatNumber } from "@/lib/utils";
import { useAdminText } from "../useAdminText";

/* ───────────────────────────── charts ───────────────────────────── */

/**
 * Area chart drawn as a plain SVG path — no charting library, so the admin
 * bundle stays small and the chart inherits the dashboard's colours.
 */
function AreaChart({
  data,
  tone = "gold",
  label,
  emptyText,
  periodText,
}: {
  data: DayCount[];
  tone?: "gold" | "sky";
  label: string;
  emptyText: string;
  periodText: string;
}) {
  const width = 640;
  const height = 160;
  const pad = 6;

  if (data.length < 2) {
    return (
      <p className="grid h-40 place-items-center text-xs text-ink-500">
        {emptyText} {label}.
      </p>
    );
  }

  const max = Math.max(1, ...data.map((d) => d.count));
  const step = (width - pad * 2) / (data.length - 1);
  const y = (value: number) => height - pad - (value / max) * (height - pad * 2);

  const points = data.map((d, i) => `${pad + i * step},${y(d.count)}`);
  const line = `M ${points.join(" L ")}`;
  const area = `${line} L ${pad + (data.length - 1) * step},${height - pad} L ${pad},${height - pad} Z`;

  const stroke = tone === "gold" ? "#f5a800" : "#38bdf8";
  const gradientId = `grad-${tone}-${label.replace(/\W/g, "")}`;
  const total = data.reduce((sum, d) => sum + d.count, 0);

  return (
    <div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-40 w-full"
        role="img"
        aria-label={`${label}: ${total} over ${data.length} days`}
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={stroke} stopOpacity="0.35" />
            <stop offset="100%" stopColor={stroke} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill={`url(#${gradientId})`} />
        <path d={line} fill="none" stroke={stroke} strokeWidth="2" strokeLinejoin="round" />
      </svg>
      <div className="mt-2 flex justify-between text-[0.65rem] text-ink-500">
        <span>{formatDate(data[0].day, "en")}</span>
        <span className="font-semibold text-ink-300">{total} {periodText}</span>
        <span>{formatDate(data[data.length - 1].day, "en")}</span>
      </div>
    </div>
  );
}

/** Horizontal bars, used for the regional breakdown. */
function BarList({
  rows,
  emptyText,
}: {
  rows: { region: string; count: number }[];
  emptyText: string;
}) {
  if (!rows.length) {
    return <p className="py-8 text-center text-xs text-ink-500">{emptyText}</p>;
  }
  const max = Math.max(...rows.map((r) => r.count));

  return (
    <ul className="space-y-2.5">
      {rows.map((row) => (
        <li key={row.region}>
          <div className="mb-1 flex justify-between text-xs">
            <span className="font-semibold text-ink-200">{row.region}</span>
            <span className="text-ink-400">{row.count}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/6">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(row.count / max) * 100}%` }}
              transition={{ duration: 0.6 }}
              className="h-full rounded-full bg-gold-gradient"
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

function Tile({
  icon: Icon,
  value,
  label,
  tone = "muted",
}: {
  icon: LucideIcon;
  value: string;
  label: string;
  tone?: "gold" | "emerald" | "sky" | "muted";
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <span
        className={cn(
          "grid h-9 w-9 place-items-center rounded-xl",
          tone === "gold" && "bg-gold-gradient text-ink-900",
          tone === "emerald" && "border border-emerald-500/30 bg-emerald-500/15 text-emerald-400",
          tone === "sky" && "border border-sky-500/30 bg-sky-500/15 text-sky-400",
          tone === "muted" && "bg-white/8 text-ink-300",
        )}
      >
        <Icon className="h-4 w-4" />
      </span>
      <p className="mt-3 font-display text-xl font-extrabold">{value}</p>
      <p className="mt-0.5 text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-ink-500">
        {label}
      </p>
    </div>
  );
}

const ACTION_TONE: Record<string, string> = {
  create: "text-emerald-400",
  update: "text-sky-400",
  delete: "text-rose-400",
  login: "text-gold-400",
  upload: "text-violet-400",
  settings: "text-amber-400",
};

/* ───────────────────────────── the screen ───────────────────────────── */

export function AnalyticsView() {
  const { at } = useAdminText();
  const [snapshot, setSnapshot] = useState<AnalyticsSnapshot | null>(null);
  const [activity, setActivity] = useState<ActivityRow[]>([]);
  const [live, setLive] = useState<LiveTotals | null>(null);
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/site-admin/analytics?days=${days}`);
      const data = (await res.json()) as {
        ok?: boolean;
        snapshot?: AnalyticsSnapshot;
        activity?: ActivityRow[];
        live?: LiveTotals | null;
        error?: string;
      };
      if (!res.ok || !data.ok || !data.snapshot) {
        setError(data.error ?? at("common.couldNotSave"));
        return;
      }
      setSnapshot(data.snapshot);
      setActivity(data.activity ?? []);
      setLive(data.live ?? null);
    } catch {
      setError(at("common.networkError"));
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading && !snapshot) {
    return (
      <div className="py-24 text-center text-ink-500">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-gold-400" />
        <p className="mt-3 text-sm font-medium">{at("analytics.counting")}</p>
      </div>
    );
  }

  if (error && !snapshot) {
    return (
      <div className="rounded-3xl border border-red-500/25 bg-red-500/10 p-8 text-center">
        <p className="font-semibold text-red-300">{error}</p>
        <button
          type="button"
          onClick={load}
          className="mt-4 rounded-xl border border-white/12 px-4 py-2 text-sm font-semibold text-ink-200 hover:bg-white/6"
        >
          {at("analytics.tryAgain")}
        </button>
      </div>
    );
  }

  const s = snapshot!;

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold sm:text-3xl">{at("analytics.title")}</h1>
          <p className="mt-1.5 text-sm text-ink-400">
            {at("analytics.subtitle")}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="rounded-xl border border-white/12 bg-white/5 px-3">
            <label htmlFor="range" className="sr-only">
              {at("analytics.title")}
            </label>
            <select
              id="range"
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="bg-transparent py-2.5 text-sm text-white outline-none"
            >
              <option value={7} className="bg-ink-900">
                {at("analytics.last7")}
              </option>
              <option value={30} className="bg-ink-900">
                {at("analytics.last30")}
              </option>
              <option value={90} className="bg-ink-900">
                {at("analytics.last90")}
              </option>
            </select>
          </div>
          <button
            type="button"
            onClick={load}
            disabled={loading}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 text-xs font-semibold text-ink-300 transition hover:bg-white/10 hover:text-white"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
            {at("common.refresh")}
          </button>
        </div>
      </header>

      {/* Headline numbers */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Tile
          icon={Users}
          tone="gold"
          value={formatNumber(s.members.total, "en")}
          label={at("analytics.membersInRegistry")}
        />
        <Tile
          icon={ShieldCheck}
          tone="emerald"
          value={formatNumber(s.members.verified, "en")}
          label={at("analytics.verified")}
        />
        <Tile
          icon={MessageSquare}
          tone="sky"
          value={`${s.messages.unread} / ${s.messages.total}`}
          label={at("analytics.unreadMessages")}
        />
        <Tile
          icon={Mail}
          value={formatNumber(s.subscribers, "en")}
          label={at("analytics.subscribers")}
        />
      </section>

      {live && (
        <p className="flex items-center gap-2 rounded-2xl border border-gold-500/20 bg-gold-500/[0.06] px-4 py-3 text-xs text-ink-300">
          <TrendingUp className="h-4 w-4 shrink-0 text-gold-400" />
          {at("analytics.upstream")} {formatNumber(live.totalMembers, "en")} · {live.totalRegions}{" "}
          {at("members.regionsWord")} · {live.totalDistricts} {at("members.district")}
        </p>
      )}

      {/* Trends */}
      <section className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
          <h2 className="mb-4 text-xs font-bold uppercase tracking-[0.16em] text-ink-500">
            {at("analytics.newMembers")}
          </h2>
          <AreaChart
            data={s.memberGrowth}
            tone="gold"
            label={at("analytics.newMembers").toLowerCase()}
            emptyText={at("analytics.notEnough")}
            periodText={at("analytics.inPeriod")}
          />
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
          <h2 className="mb-4 text-xs font-bold uppercase tracking-[0.16em] text-ink-500">
            {at("analytics.contactMessages")}
          </h2>
          <AreaChart
            data={s.messagesByDay}
            tone="sky"
            label={at("analytics.contactMessages").toLowerCase()}
            emptyText={at("analytics.notEnough")}
            periodText={at("analytics.inPeriod")}
          />
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
          <h2 className="mb-4 text-xs font-bold uppercase tracking-[0.16em] text-ink-500">
            {at("analytics.byRegion")}
          </h2>
          <BarList rows={s.membersByRegion} emptyText={at("analytics.noMembers")} />
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
          <h2 className="mb-4 text-xs font-bold uppercase tracking-[0.16em] text-ink-500">
            {at("analytics.publishedContent")}
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Tile icon={Newspaper} value={String(s.content.news)} label={at("analytics.articles")} />
            <Tile icon={FolderKanban} value={String(s.content.projects)} label={at("analytics.projects")} />
            <Tile icon={CalendarDays} value={String(s.content.events)} label={at("analytics.events")} />
            <Tile icon={UsersRound} value={String(s.content.leaders)} label={at("analytics.leaders")} />
            <Tile icon={ImageIcon} value={String(s.content.gallery)} label={at("analytics.gallery")} />
            <Tile
              icon={ImageIcon}
              value={String(s.mediaCount)}
              label={`${at("analytics.media")} · ${(s.mediaBytes / 1024 / 1024).toFixed(1)} MB`}
            />
          </div>
        </div>
      </section>

      {/* Audit trail */}
      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
        <h2 className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-ink-500">
          <Activity className="h-3.5 w-3.5" />
          {at("analytics.activityLog")}
        </h2>

        {activity.length === 0 ? (
          <p className="py-8 text-center text-xs text-ink-500">
            {at("analytics.noActivity")}
          </p>
        ) : (
          <ul className="divide-y divide-white/6">
            {activity.map((row) => (
              <li key={row.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2.5 text-xs">
                <span
                  className={cn(
                    "w-16 shrink-0 font-bold uppercase tracking-wide",
                    ACTION_TONE[row.action] ?? "text-ink-400",
                  )}
                >
                  {row.action}
                </span>
                <span className="min-w-0 flex-1 truncate text-ink-200">{row.summary}</span>
                <span className="text-ink-500">{row.adminName}</span>
                <span className="text-ink-600">{formatDate(row.createdAt, "en")}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
