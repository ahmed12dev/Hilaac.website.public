"use client";

import { motion } from "framer-motion";
import {
  Activity,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  FolderKanban,
  Image as ImageIcon,
  HardDrive,
  Mail,
  MessageSquare,
  Newspaper,
  Quote,
  Radio,
  Settings,
  Sparkles,
  UsersRound,
  Users,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import type { ActivityRow } from "@/lib/server/activity";
import type { ContentCounts } from "@/lib/server/content";
import type { LiveTotals } from "@/lib/types";
import { formatDate, formatNumber } from "@/lib/utils";

function Card({
  icon: Icon,
  value,
  label,
  hint,
  index,
  tone = "gold",
  href,
}: {
  icon: LucideIcon;
  value: string;
  label: string;
  hint?: string;
  index: number;
  tone?: "gold" | "muted" | "emerald" | "sky";
  href?: string;
}) {
  const content = (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.05 }}
      className="group relative rounded-3xl border border-white/10 bg-white/[0.04] p-5 transition-all hover:border-gold-500/35 hover:bg-white/[0.06]"
    >
      <div className="flex items-center justify-between">
        <span
          className={
            tone === "gold"
              ? "grid h-11 w-11 place-items-center rounded-2xl bg-gold-gradient text-ink-900 shadow-gold"
              : tone === "emerald"
                ? "grid h-11 w-11 place-items-center rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                : tone === "sky"
                  ? "grid h-11 w-11 place-items-center rounded-2xl bg-sky-500/20 text-sky-400 border border-sky-500/30"
                  : "grid h-11 w-11 place-items-center rounded-2xl bg-white/8 text-ink-300"
          }
        >
          <Icon className="h-5 w-5" />
        </span>
        {href && (
          <ArrowRight className="h-4 w-4 text-ink-500 transition-transform group-hover:translate-x-1 group-hover:text-gold-400" />
        )}
      </div>
      <p className="mt-4 font-display text-2xl font-extrabold sm:text-3xl">{value}</p>
      <p className="mt-1 text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-ink-400">
        {label}
      </p>
      {hint && <p className="mt-1.5 text-xs text-ink-500">{hint}</p>}
    </motion.div>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}

export function Overview({
  adminName,
  totals,
  counts,
  activity = [],
  memberCount = null,
}: {
  adminName: string;
  totals: LiveTotals | null;
  counts: ContentCounts | null;
  activity?: ActivityRow[];
  /** Members in this website's own registry. */
  memberCount?: number | null;
}) {
  const firstName = adminName.split(/[\s@]/)[0] || "there";
  const n = (v: number | null | undefined) =>
    typeof v === "number" ? formatNumber(v, "en") : "—";
  const live = Boolean(totals);

  return (
    <div className="space-y-10">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"
      >
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span
              className={
                live
                  ? "inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider text-emerald-400"
                  : "inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider text-amber-400"
              }
            >
              <span
                className={
                  live
                    ? "h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400"
                    : "h-1.5 w-1.5 rounded-full bg-amber-400"
                }
              />
              {live ? "Registration system connected" : "Registration system offline"}
            </span>
            <span className="text-xs text-ink-500">Xisbiga Hilaac Console</span>
          </div>
          <h1 className="font-display text-2xl font-extrabold sm:text-3xl">
            Welcome back, {firstName}
          </h1>
          <p className="mt-1 text-sm text-ink-400">
            Real-time management dashboard for content, party members, announcements, and analytics.
          </p>
        </div>

        <Link
          href="/"
          target="_blank"
          className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 text-xs font-semibold text-ink-200 transition-colors hover:bg-white/10 hover:text-white"
        >
          <Radio className="h-3.5 w-3.5 text-gold-400" />
          View Live Website
        </Link>
      </motion.header>

      {/* Real-time Party Figures */}
      <section>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-ink-500">
              Party Membership & Reach
            </h2>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-gold-500/20 bg-gold-500/5 px-2.5 py-0.5 text-[0.62rem] font-bold uppercase tracking-wide text-gold-400">
              <Sparkles className="h-3 w-3" />
              {live ? "From the registration system" : "Awaiting the registration system"}
            </span>
          </div>
          <Link
            href="/admin/dashboard/members"
            className="text-xs font-semibold text-gold-400 hover:text-gold-300 transition-colors"
          >
            Open Registry →
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Card
            index={0}
            icon={Users}
            value={n(totals?.totalMembers)}
            label="Total Members"
            hint={
              memberCount === null
                ? "Read from the registration system"
                : `${formatNumber(memberCount, "en")} in your own registry`
            }
            tone="gold"
            href="/admin/dashboard/members"
          />
          <Card
            index={1}
            icon={Activity}
            value={n(totals?.totalRegions)}
            label="Active Regions"
            hint="Nationwide presence"
            tone="emerald"
            href="/admin/dashboard/members"
          />
          <Card
            index={2}
            icon={CheckCircle2}
            value={n(totals?.totalDistricts)}
            label="Covered Districts"
            hint="Local branches established"
            tone="sky"
            href="/admin/dashboard/members"
          />
        </div>
      </section>

      {/* Website Content Management */}
      <section>
        <h2 className="mb-4 text-xs font-bold uppercase tracking-[0.16em] text-ink-500">
          Website Content & Media
        </h2>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card
            index={0}
            icon={Newspaper}
            value={n(counts?.news)}
            label="News articles"
            hint={counts ? `${counts.news_published} published` : "Manage articles"}
            href="/admin/dashboard/news"
          />
          <Card
            index={1}
            icon={FolderKanban}
            value={n(counts?.projects)}
            label="Projects & Initiatives"
            hint="Party manifesto tracks"
            href="/admin/dashboard/projects"
          />
          <Card
            index={2}
            icon={CalendarDays}
            value={n(counts?.events)}
            label="Upcoming Events"
            hint="Town halls & rallies"
            href="/admin/dashboard/events"
          />
          <Card
            index={3}
            icon={UsersRound}
            value={n(counts?.leaders)}
            label="Leadership profiles"
            hint="Party committee & chair"
            href="/admin/dashboard/leadership"
          />
          <Card
            index={4}
            icon={ImageIcon}
            value={n(counts?.gallery)}
            label="Photo Gallery"
            hint="Press & event photos"
            href="/admin/dashboard/gallery"
          />
          <Card
            index={5}
            icon={MessageSquare}
            value={n(counts?.unread_messages)}
            label="Unread messages"
            hint={counts ? `${counts.messages} received in total` : "Contact submissions"}
            href="/admin/dashboard/messages"
          />
          <Card
            index={6}
            icon={Quote}
            value={n(counts?.testimonials)}
            label="Testimonials"
            hint="Quotes shown on the homepage"
            href="/admin/dashboard/testimonials"
          />
          <Card
            index={7}
            icon={HardDrive}
            value={n(counts?.media)}
            label="Media library"
            hint="Uploaded images"
            href="/admin/dashboard/media"
          />
          <Card
            index={8}
            icon={Mail}
            value={n(counts?.subscribers)}
            label="Newsletter subscribers"
            hint="Collected from the public site"
            href="/admin/dashboard/subscribers"
          />
        </div>
      </section>

      {/* Quick actions */}
      <section>
        <h2 className="mb-4 text-xs font-bold uppercase tracking-[0.16em] text-ink-500">
          Quick Control Hub
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            href="/admin/dashboard/members"
            className="group flex flex-col justify-between rounded-3xl border border-gold-500/25 bg-gold-500/[0.07] p-5 transition-all hover:-translate-y-0.5 hover:border-gold-500/50"
          >
            <div>
              <Users className="h-6 w-6 text-gold-400 mb-3" />
              <span className="block font-display font-bold text-white">Members Registry</span>
              <span className="block text-xs text-ink-400 mt-1">
                Filter by Somali region & export roster to CSV
              </span>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs font-bold text-gold-400">
              Open Registry <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

          <Link
            href="/admin/dashboard/settings"
            className="group flex flex-col justify-between rounded-3xl border border-white/10 bg-white/[0.04] p-5 transition-all hover:-translate-y-0.5 hover:border-gold-500/35"
          >
            <div>
              <Settings className="h-6 w-6 text-sky-400 mb-3" />
              <span className="block font-display font-bold text-white">Site Settings</span>
              <span className="block text-xs text-ink-400 mt-1">
                Update party info, hotline, and live banner
              </span>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs font-bold text-sky-400">
              Edit Settings <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

          <Link
            href="/admin/dashboard/media"
            className="group flex flex-col justify-between rounded-3xl border border-white/10 bg-white/[0.04] p-5 transition-all hover:-translate-y-0.5 hover:border-gold-500/35"
          >
            <div>
              <HardDrive className="mb-3 h-6 w-6 text-violet-400" />
              <span className="block font-display font-bold text-white">Media Library</span>
              <span className="mt-1 block text-xs text-ink-400">
                Upload photos once, then use them anywhere on the site
              </span>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs font-bold text-violet-400">
              Open Library <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

          <Link
            href="/admin/dashboard/news"
            className="group flex flex-col justify-between rounded-3xl border border-white/10 bg-white/[0.04] p-5 transition-all hover:-translate-y-0.5 hover:border-gold-500/35"
          >
            <div>
              <Newspaper className="h-6 w-6 text-emerald-400 mb-3" />
              <span className="block font-display font-bold text-white">Publish Article</span>
              <span className="block text-xs text-ink-400 mt-1">
                Post bilingual news in Somali and English
              </span>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs font-bold text-emerald-400">
              Manage News <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>
        </div>
      </section>

      {/* Recent activity */}
      <section>
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-ink-500">
            Recent activity
          </h2>
          <Link
            href="/admin/dashboard/analytics"
            className="text-xs font-semibold text-gold-400 transition-colors hover:text-gold-300"
          >
            Open analytics →
          </Link>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
          {activity.length === 0 ? (
            <p className="py-6 text-center text-xs text-ink-500">
              Nothing yet. Every change you make from this dashboard is recorded here.
            </p>
          ) : (
            <ul className="divide-y divide-white/6">
              {activity.map((row) => (
                <li
                  key={row.id}
                  className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2.5 text-xs"
                >
                  <span className="w-16 shrink-0 font-bold uppercase tracking-wide text-ink-500">
                    {row.action}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-ink-200">{row.summary}</span>
                  <span className="text-ink-500">{row.adminName}</span>
                  <span className="text-ink-600">{formatDate(row.createdAt, "en")}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
