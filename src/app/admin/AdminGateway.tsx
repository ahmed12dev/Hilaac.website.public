"use client";

import { motion } from "framer-motion";
import { ArrowRight, Lock, ShieldCheck } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { ButtonLink } from "@/components/ui/Button";
import { useLanguage } from "@/lib/i18n/provider";
import { adminUrl } from "@/lib/utils";

const REDIRECT_AFTER_MS = 1600;

/**
 * Shows a brief branded hand-off, then sends the administrator to the
 * dashboard's login. The visible link means it still works if the automatic
 * redirect is blocked.
 */
export function AdminGateway() {
  const { tr } = useLanguage();
  const [target] = useState(adminUrl);
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setRedirecting(true);
      window.location.href = target;
    }, REDIRECT_AFTER_MS);
    return () => clearTimeout(timer);
  }, [target]);

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-ink-950 px-5 py-24">
      <div
        className="pointer-events-none absolute -left-32 -top-24 h-[28rem] w-[28rem] rounded-full bg-gold-500/14 blur-[140px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-28 -right-24 h-96 w-96 rounded-full bg-antique-500/12 blur-[130px]"
        aria-hidden
      />

      <motion.div
        initial={{ opacity: 0, y: 26, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-md rounded-4xl border border-gold-500/25 bg-ink-900/80 p-8 text-center shadow-gold-lg backdrop-blur-xl sm:p-10"
      >
        <span className="mx-auto mb-6 grid h-20 w-20 place-items-center overflow-hidden rounded-full shadow-gold ring-2 ring-gold-500/50">
          <Image
            src="/images/logo-circle.webp"
            alt="Xisbiga Hilaac"
            width={80}
            height={80}
            priority
            className="h-full w-full object-cover"
          />
        </span>

        <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-gold-500/30 bg-gold-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-gold-300">
          <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
          {tr("admin.badge")}
        </span>

        <h1 className="font-display text-2xl font-extrabold text-white">{tr("admin.title")}</h1>
        <p className="mt-3 text-sm leading-relaxed text-ink-400">{tr("admin.text")}</p>

        <ButtonLink href={target} size="lg" className="mt-8 w-full" external>
          <Lock className="h-4 w-4" />
          {tr("admin.cta")}
          <ArrowRight className="h-4 w-4" />
        </ButtonLink>

        <p className="mt-5 flex items-center justify-center gap-2 text-xs text-ink-500" role="status">
          {redirecting && (
            <span className="h-3 w-3 animate-spin rounded-full border border-gold-500/40 border-t-gold-400" aria-hidden />
          )}
          {redirecting ? tr("admin.redirecting") : tr("admin.autoRedirect")}
        </p>
      </motion.div>
    </main>
  );
}
