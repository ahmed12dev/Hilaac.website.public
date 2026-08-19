"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  BarChart3,
  CalendarDays,
  ExternalLink,
  FolderKanban,
  HardDrive,
  Image as ImageIcon,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  MessageSquare,
  Newspaper,
  Quote,
  Settings,
  UserCog,
  Users,
  UsersRound,
  X,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { SiteAdmin } from "@/lib/server/auth";
import { cn } from "@/lib/utils";

interface Item {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Screens only an owner may open. */
  ownerOnly?: boolean;
}

const GROUPS: { title: string; items: Item[] }[] = [
  {
    title: "Overview",
    items: [
      { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/admin/dashboard/analytics", label: "Analytics", icon: BarChart3 },
    ],
  },
  {
    title: "Content",
    items: [
      { href: "/admin/dashboard/news", label: "News", icon: Newspaper },
      { href: "/admin/dashboard/projects", label: "Projects", icon: FolderKanban },
      { href: "/admin/dashboard/events", label: "Events", icon: CalendarDays },
      { href: "/admin/dashboard/leadership", label: "Leadership", icon: UsersRound },
      { href: "/admin/dashboard/gallery", label: "Gallery", icon: ImageIcon },
      { href: "/admin/dashboard/testimonials", label: "Testimonials", icon: Quote },
      { href: "/admin/dashboard/media", label: "Media Library", icon: HardDrive },
    ],
  },
  {
    title: "People",
    items: [
      { href: "/admin/dashboard/members", label: "Members Registry", icon: Users },
      { href: "/admin/dashboard/messages", label: "Messages", icon: MessageSquare },
      { href: "/admin/dashboard/subscribers", label: "Subscribers", icon: Mail },
    ],
  },
  {
    title: "Administration",
    items: [
      { href: "/admin/dashboard/settings", label: "Site Settings", icon: Settings },
      { href: "/admin/dashboard/admins", label: "Administrators", icon: UserCog },
    ],
  },
];

export function AdminNav({ admin }: { admin: SiteAdmin }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const isActive = (href: string) =>
    href === "/admin/dashboard" ? pathname === href : pathname.startsWith(href);

  async function onSignOut() {
    setSigningOut(true);
    await fetch("/api/site-admin/login", { method: "DELETE" }).catch(() => undefined);
    router.replace("/admin");
    router.refresh();
  }

  const initials = (admin.name || admin.email)
    .split(/[\s@.]/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");

  const panel = (
    <div className="flex h-full flex-col">
      {/* Brand */}
      <div className="flex h-[4.5rem] items-center gap-3 border-b border-white/6 px-5">
        <span className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full ring-2 ring-gold-500/50">
          <Image src="/images/logo-circle.webp" alt="" width={40} height={40} className="h-full w-full object-cover" />
        </span>
        <span className="leading-tight">
          <span className="block font-display text-[0.95rem] font-extrabold">
            Xisbiga <span className="text-gradient-gold">Hilaac</span>
          </span>
          <span className="block text-[0.6rem] font-bold uppercase tracking-[0.16em] text-ink-500">
            Website Admin
          </span>
        </span>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close menu"
          className="ml-auto grid h-9 w-9 place-items-center rounded-lg text-ink-400 transition hover:bg-white/6 hover:text-gold-300 lg:hidden"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-5" aria-label="Admin sections">
        {GROUPS.filter((group) =>
          group.items.some((item) => !item.ownerOnly || admin.role === "owner"),
        ).map((group) => (
          <div key={group.title} className="mb-6 last:mb-0">
            <p className="mb-2 px-3 text-[0.6rem] font-bold uppercase tracking-[0.16em] text-ink-600">
              {group.title}
            </p>
            <ul className="space-y-1">
              {group.items
                .filter((item) => !item.ownerOnly || admin.role === "owner")
                .map((item) => {
                  const active = isActive(item.href);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all",
                          active
                            ? "bg-gold-gradient text-ink-900 shadow-gold"
                            : "text-ink-300 hover:bg-white/6 hover:text-gold-300",
                        )}
                      >
                        <item.icon className="h-[18px] w-[18px] shrink-0" />
                        <span className="flex-1">{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="space-y-2 border-t border-white/6 p-3">
        <div className="flex items-center gap-3 rounded-xl bg-white/4 px-3 py-2.5">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-gold-gradient text-[0.7rem] font-extrabold text-ink-900">
            {initials}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold">{admin.name || admin.email}</span>
            <span className="block text-xs capitalize text-gold-400">{admin.role}</span>
          </span>
        </div>

        <Link
          href="/"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-ink-300 transition hover:bg-white/6 hover:text-gold-300"
        >
          <ExternalLink className="h-[18px] w-[18px]" />
          View website
        </Link>

        <button
          type="button"
          onClick={onSignOut}
          disabled={signingOut}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-ink-300 transition hover:bg-red-500/12 hover:text-red-400 disabled:opacity-60"
        >
          <LogOut className="h-[18px] w-[18px]" />
          Sign out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile bar */}
      <div className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-white/6 bg-ink-950/85 px-4 backdrop-blur-xl lg:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          aria-expanded={open}
          className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 text-ink-300 transition hover:border-gold-500/50 hover:text-gold-300"
        >
          <Menu className="h-[18px] w-[18px]" />
        </button>
        <span className="font-display text-sm font-extrabold">
          Website <span className="text-gradient-gold">Admin</span>
        </span>
      </div>

      {/* Desktop rail */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-white/6 bg-ink-900/60 backdrop-blur-xl lg:block">
        {panel}
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-40 bg-ink-950/75 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 34 }}
              className="fixed inset-y-0 left-0 z-50 w-72 border-r border-white/8 bg-ink-900 lg:hidden"
            >
              {panel}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
