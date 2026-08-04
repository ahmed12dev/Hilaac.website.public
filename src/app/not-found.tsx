"use client";

import { Home, Search } from "lucide-react";
import Image from "next/image";
import { ButtonLink } from "@/components/ui/Button";
import { useLanguage } from "@/lib/i18n/provider";

export default function NotFound() {
  const { tr } = useLanguage();

  return (
    <section className="relative grid min-h-screen place-items-center overflow-hidden bg-ink-950 px-5 py-32">
      <div className="pointer-events-none absolute -left-24 top-10 h-96 w-96 rounded-full bg-gold-500/20 blur-[120px]" aria-hidden />
      <div className="pointer-events-none absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-antique-500/18 blur-[110px]" aria-hidden />

      <div className="relative text-center">
        <span className="mx-auto mb-8 grid h-24 w-24 place-items-center rounded-full bg-white shadow-gold ring-2 ring-gold-500/50">
          <Image
            src="/images/logo.webp"
            alt=""
            width={96}
            height={96}
            className="h-18 w-18 object-contain"
            aria-hidden
          />
        </span>

        <p className="font-display text-7xl font-extrabold text-gradient-gold sm:text-8xl">404</p>

        <h1 className="mt-6 font-display text-2xl font-bold text-white sm:text-3xl">
          {tr("common.notFound")}
        </h1>

        <p className="mx-auto mt-4 max-w-md text-ink-400">{tr("common.notFoundText")}</p>

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <ButtonLink href="/" size="lg">
            <Home className="h-4 w-4" />
            {tr("common.backHome")}
          </ButtonLink>
          <ButtonLink href="/news" size="lg" variant="outline" className="border-gold-400/60 text-gold-200">
            <Search className="h-4 w-4" />
            {tr("nav.news")}
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
