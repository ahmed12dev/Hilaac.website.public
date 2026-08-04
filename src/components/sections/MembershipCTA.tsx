"use client";

import { ArrowRight, BadgeCheck, ShieldCheck, Zap } from "lucide-react";
import Image from "next/image";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { useLanguage } from "@/lib/i18n/provider";
import type { SiteSettings } from "@/lib/types";
import { joinUrl } from "@/lib/utils";

export function MembershipCTA({ settings }: { settings: SiteSettings }) {
  const { tr } = useLanguage();

  const points = [
    { icon: Zap, label: tr("membership.point1") },
    { icon: BadgeCheck, label: tr("membership.point2") },
    { icon: ShieldCheck, label: tr("membership.point3") },
  ];

  return (
    <section id="join" className="relative overflow-hidden py-20 lg:py-28">
      <div className="container-page">
        <Reveal>
          <div className="relative overflow-hidden rounded-5xl bg-gold-gradient p-8 shadow-gold-lg sm:p-12 lg:p-16">
            {/* Sheen + texture */}
            <span
              className="pointer-events-none absolute inset-0 opacity-25"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(115deg, rgba(255,255,255,0.35) 0 1px, transparent 1px 24px)",
              }}
              aria-hidden
            />
            <span
              className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-white/25 blur-3xl"
              aria-hidden
            />
            <span
              className="pointer-events-none absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-ink-900/15 blur-3xl"
              aria-hidden
            />

            <div className="relative grid items-center gap-10 lg:grid-cols-12">
              <div className="lg:col-span-8">
                <span className="mb-5 inline-flex items-center gap-2 rounded-full bg-ink-900/15 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-ink-900 backdrop-blur-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-ink-900" aria-hidden />
                  {tr("membership.badge")}
                </span>

                <h2 className="max-w-2xl font-display text-3xl font-extrabold leading-tight text-ink-900 sm:text-4xl lg:text-[2.85rem]">
                  {tr("membership.title")}
                </h2>

                <p className="mt-5 max-w-xl text-base leading-relaxed text-ink-900/80 sm:text-lg">
                  {tr("membership.text")}
                </p>

                <ul className="mt-8 flex flex-wrap gap-x-7 gap-y-3">
                  {points.map(({ icon: Icon, label }) => (
                    <li key={label} className="flex items-center gap-2 text-sm font-semibold text-ink-900">
                      <Icon className="h-[18px] w-[18px]" aria-hidden />
                      {label}
                    </li>
                  ))}
                </ul>

                <div className="mt-10 flex flex-wrap gap-4">
                  <ButtonLink
                    href={joinUrl(settings.registerUrl)}
                    variant="dark"
                    size="lg"
                  >
                    {tr("cta.register")}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </ButtonLink>
                  <ButtonLink
                    href="/contact"
                    size="lg"
                    className="bg-white/90 text-ink-900 shadow-none hover:bg-white"
                  >
                    {tr("nav.contact")}
                  </ButtonLink>
                </div>
              </div>

              {/* Emblem */}
              <div className="hidden justify-center lg:col-span-4 lg:flex">
                <div className="relative grid h-56 w-56 place-items-center rounded-full bg-white/95 shadow-2xl ring-8 ring-white/30">
                  <Image
                    src="/images/logo.webp"
                    alt="Xisbiga Hilaac"
                    width={224}
                    height={224}
                    className="h-44 w-44 object-contain"
                  />
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
