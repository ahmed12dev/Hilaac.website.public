"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  CalendarDays,
  FolderKanban,
  Image as ImageIcon,
  Lock,
  MapPin,
  MessageSquare,
  Newspaper,
  UsersRound,
  Users,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import type { ContentCounts } from "@/lib/server/content";
import type { LiveTotals } from "@/lib/types";
import { formatNumber } from "@/lib/utils";

function Card({
  icon: Icon,
  value,
  label,
  hint,
  index,
  tone = "gold",
}: {
  icon: LucideIcon;
  value: string;
  label: string;
  hint?: string;
  index: number;
  tone?: "gold" | "muted";
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.05 }}
      className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 transition-colors hover:border-gold-500/35"
    >
      <span
        className={
          tone === "gold"
            ? "grid h-11 w-11 place-items-center rounded-2xl bg-gold-gradient text-ink-900 shadow-gold"
            : "grid h-11 w-11 place-items-center rounded-2xl bg-white/8 text-ink-300"
        }
      >
        <Icon className="h-5 w-5" />
      </span>
      <p className="mt-4 font-display text-2xl font-extrabold sm:text-3xl">{value}</p>
      <p className="mt-1 text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-ink-400">
        {label}
      </p>
      {hint && <p className="mt-1.5 text-xs text-ink-500">{hint}</p>}
    </motion.div>
  );
}

export function Overview({
  adminName,
  totals,
  counts,
}: {
  adminName: string;
  totals: LiveTotals | null;
  counts: ContentCounts | null;
}) {
  const firstName = adminName.split(/[\s@]/)[0] || "there";
  const n = (v: number | undefined) => (typeof v === "number" ? formatNumber(v, "en") : "—");

  return (
    <div className="space-y-10">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="font-display text-2xl font-extrabold sm:text-3xl">
          Welcome back, {firstName}
        </h1>
        <p className="mt-2 text-sm text-ink-400">
          Manage everything visitors see on the website.
        </p>
      </motion.header>

      {/* Read-only figures from the registration system */}
      <section>
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-ink-500">
            Membership
          </h2>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[0.62rem] font-bold uppercase tracking-wide text-ink-400">
            <Lock className="h-3 w-3" />
            Read-only · from the registration system
          </span>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Card index={0} icon={Users} value={n(totals?.totalMembers)} label="Registered Members" />
          <Card index={1} icon={MapPin} value={n(totals?.totalRegions)} label="Regions" />
          <Card index={2} icon={MapPin} value={n(totals?.totalDistricts)} label="Districts" />
        </div>

        <p className="mt-3 text-xs leading-relaxed text-ink-500">
          {totals
            ? "Individual member records stay inside the registration system. Joins made on this website are sent there automatically."
            : "Could not reach the registration system — figures will appear once it responds."}
        </p>
      </section>

      {/* This website's own content */}
      <section>
        <h2 className="mb-4 text-xs font-bold uppercase tracking-[0.16em] text-ink-500">
          Website content
        </h2>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card
            index={0}
            icon={Newspaper}
            value={n(counts?.news)}
            label="News articles"
            hint={counts ? `${counts.news_published} published` : undefined}
          />
          <Card index={1} icon={FolderKanban} value={n(counts?.projects)} label="Projects" />
          <Card index={2} icon={CalendarDays} value={n(counts?.events)} label="Events" />
          <Card index={3} icon={UsersRound} value={n(counts?.leaders)} label="Leadership profiles" />
          <Card index={4} icon={ImageIcon} value={n(counts?.gallery)} label="Gallery items" />
          <Card
            index={5}
            icon={MessageSquare}
            value={n(counts?.unread_messages)}
            label="Unread messages"
           
          />
        </div>
      </section>

      {/* Quick actions */}
      <section>
        <h2 className="mb-4 text-xs font-bold uppercase tracking-[0.16em] text-ink-500">
          Quick actions
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Link
            href="/admin/dashboard/news"
            className="group flex items-center justify-between gap-4 rounded-3xl border border-gold-500/25 bg-gold-500/[0.07] p-5 transition-all hover:-translate-y-0.5 hover:border-gold-500/50"
          >
            <span>
              <span className="block font-display font-bold">Manage news</span>
              <span className="block text-sm text-ink-400">Write, edit and publish articles</span>
            </span>
            <ArrowRight className="h-5 w-5 text-gold-400 transition-transform group-hover:translate-x-1" />
          </Link>

          <Link
            href="/"
            className="group flex items-center justify-between gap-4 rounded-3xl border border-white/10 bg-white/[0.04] p-5 transition-all hover:-translate-y-0.5 hover:border-gold-500/35"
          >
            <span>
              <span className="block font-display font-bold">View the website</span>
              <span className="block text-sm text-ink-400">See it as visitors do</span>
            </span>
            <ArrowRight className="h-5 w-5 text-ink-400 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </section>
    </div>
  );
}
