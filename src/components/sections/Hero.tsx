"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, ChevronDown, Sparkles } from "lucide-react";
import Image from "next/image";
import { useRef } from "react";
import { ButtonLink } from "@/components/ui/Button";
import { HeroSlideshow } from "@/components/sections/HeroSlideshow";
import { useLanguage } from "@/lib/i18n/provider";
import type { SiteSettings, StatItem } from "@/lib/types";
import { formatNumber, joinUrl, mediaUrl } from "@/lib/utils";

export function Hero({ settings, stats }: { settings: SiteSettings; stats: StatItem[] }) {
  const { tr, tx, locale } = useLanguage();
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", reduce ? "0%" : "18%"]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 70]);
  const fade = useTransform(scrollYProgress, [0, 0.75], [1, 0]);

  const heroImage = mediaUrl(settings.heroImage) ?? "/images/flag.webp";
  const heroVideo = mediaUrl(settings.heroVideo);

  // Fall back to the single hero image when no slides have been configured,
  // so the section always has a background.
  const slides =
    settings.heroSlides && settings.heroSlides.length > 0
      ? settings.heroSlides
      : [{ src: settings.heroImage ?? "/images/flag.webp" }];

  return (
    <section
      ref={ref}
      className="relative flex min-h-[92vh] items-center overflow-hidden pt-28 pb-20 lg:min-h-screen"
      aria-label={tx(settings.heroHeadline)}
    >
      {/* Background media — a video wins if one is set, otherwise the
          admin-managed slideshow, otherwise the single hero image. */}
      {heroVideo ? (
        <motion.div style={{ y: bgY }} className="absolute inset-0 -z-20 scale-110">
          <video
            src={heroVideo}
            poster={heroImage}
            autoPlay
            muted
            loop
            playsInline
            className="h-full w-full object-cover"
          />
        </motion.div>
      ) : (
        <HeroSlideshow slides={slides} parallaxStyle={{ y: bgY }} />
      )}

      {/* Gold + ink overlay */}
      <div
        className="absolute inset-0 -z-10 bg-[linear-gradient(115deg,rgba(10,15,26,0.94)_0%,rgba(17,24,39,0.86)_42%,rgba(184,116,0,0.62)_100%)]"
        aria-hidden
      />
      <div
        className="absolute inset-0 -z-10 bg-[radial-gradient(1200px_600px_at_15%_0%,rgba(245,168,0,0.28),transparent_60%)]"
        aria-hidden
      />
      {/* Fine gold grid texture */}
      <div
        className="absolute inset-0 -z-10 opacity-[0.16]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(245,168,0,0.25) 1px, transparent 1px), linear-gradient(90deg, rgba(245,168,0,0.25) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
          maskImage: "radial-gradient(ellipse at 50% 40%, black 20%, transparent 78%)",
          WebkitMaskImage: "radial-gradient(ellipse at 50% 40%, black 20%, transparent 78%)",
        }}
        aria-hidden
      />
      {/* Floating gold orbs */}
      <div className="pointer-events-none absolute -left-24 top-24 -z-10 h-80 w-80 rounded-full bg-gold-500/25 blur-[110px] animate-float" aria-hidden />
      <div className="pointer-events-none absolute -right-16 bottom-10 -z-10 h-96 w-96 rounded-full bg-antique-500/20 blur-[130px] animate-float [animation-delay:-4s]" aria-hidden />

      <motion.div style={{ y: contentY, opacity: fade }} className="container-page relative">
        <div className="grid items-center gap-14 lg:grid-cols-12">
          {/* Copy */}
          <div className="lg:col-span-7">
            <motion.span
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-gold-500/40 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-gold-300 backdrop-blur-md"
            >
              <Sparkles className="h-3.5 w-3.5" aria-hidden />
              {tr("hero.badge")}
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-3xl text-4xl font-extrabold leading-[1.08] text-white sm:text-5xl lg:text-[3.6rem]"
            >
              {tx(settings.heroHeadline).split(" ").map((word, index, words) => (
                <span key={`${word}-${index}`}>
                  {index >= words.length - 2 ? (
                    <span className="text-gradient-gold">{word}</span>
                  ) : (
                    word
                  )}
                  {index < words.length - 1 ? " " : ""}
                </span>
              ))}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="mt-6 max-w-xl text-base leading-relaxed text-ink-200 sm:text-lg"
            >
              {tx(settings.heroSubheadline)}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.32 }}
              className="mt-10 flex flex-wrap items-center gap-4"
            >
              <ButtonLink href={joinUrl(settings.registerUrl)} size="lg">
                {tr("cta.join")}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </ButtonLink>
              <ButtonLink href="/about" size="lg" variant="outline" className="text-gold-200 border-gold-400/60">
                {tr("cta.learnMore")}
              </ButtonLink>
            </motion.div>

            {/* Inline stat strip */}
            {stats.length > 0 && (
              <motion.dl
                initial={{ opacity: 0, y: 26 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.45 }}
                className="mt-14 grid max-w-2xl grid-cols-2 gap-x-6 gap-y-7 border-t border-white/12 pt-8 sm:grid-cols-4"
              >
                {stats.slice(0, 4).map((stat) => (
                  <div key={stat.id}>
                    <dt className="sr-only">{tx(stat.label)}</dt>
                    <dd className="font-display text-2xl font-extrabold text-gradient-gold sm:text-3xl">
                      {formatNumber(stat.value, locale)}
                      {stat.suffix}
                    </dd>
                    <p className="mt-1 text-xs font-medium uppercase tracking-wider text-ink-300">
                      {tx(stat.label)}
                    </p>
                  </div>
                ))}
              </motion.dl>
            )}
          </div>

          {/* Emblem */}
          <motion.div
            initial={{ opacity: 0, scale: 0.86 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="relative hidden justify-center lg:col-span-5 lg:flex"
          >
            <div className="relative">
              <span className="absolute -inset-10 rounded-full bg-gold-500/25 blur-[80px]" aria-hidden />
              <span className="absolute inset-0 rounded-full border border-gold-400/40 animate-pulse-ring" aria-hidden />
              <motion.div
                animate={reduce ? undefined : { y: [0, -16, 0] }}
                transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
                className="relative grid h-72 w-72 place-items-center overflow-hidden rounded-full shadow-gold-lg ring-2 ring-gold-400/60 xl:h-80 xl:w-80"
              >
                <Image
                  src="/images/logo-circle.webp"
                  alt="Xisbiga Hilaac"
                  width={320}
                  height={320}
                  priority
                  className="h-full w-full object-cover"
                />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll cue */}
      <motion.a
        href="#about"
        aria-label={tr("hero.scroll")}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1 }}
        className="absolute inset-x-0 bottom-7 mx-auto flex w-fit flex-col items-center gap-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-ink-300 transition-colors hover:text-gold-400"
      >
        {tr("hero.scroll")}
        <motion.span
          animate={reduce ? undefined : { y: [0, 7, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown className="h-5 w-5" />
        </motion.span>
      </motion.a>
    </section>
  );
}
