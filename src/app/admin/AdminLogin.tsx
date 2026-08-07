"use client";

import { motion } from "framer-motion";
import { AlertCircle, ArrowRight, Eye, EyeOff, Loader2, Lock, Mail, ShieldCheck } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useLanguage } from "@/lib/i18n/provider";

const FIELD =
  "h-12 w-full rounded-2xl border border-white/12 bg-white/5 pl-11 pr-4 text-[0.95rem] text-white " +
  "outline-none transition-all placeholder:text-ink-500 " +
  "focus:border-gold-500/70 focus:bg-white/8 focus:ring-4 focus:ring-gold-500/12";

/**
 * The website's own administrator sign-in.
 *
 * Separate accounts from the registration system — a registration admin's
 * credentials will not work here, and vice versa.
 */
export function AdminLogin() {
  const { tr } = useLanguage();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [reveal, setReveal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setPending(true);

    try {
      const res = await fetch("/api/site-admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };

      if (!res.ok || !data.ok) {
        setError(data.error ?? "Sign-in failed.");
        setPending(false);
        return;
      }
      router.replace("/admin/dashboard");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
      setPending(false);
    }
  }

  return (
    <main className="admin-theme relative grid min-h-screen place-items-center overflow-hidden bg-ink-950 px-5 py-20">
      <div className="pointer-events-none absolute -left-32 -top-24 h-[28rem] w-[28rem] rounded-full bg-gold-500/14 blur-[140px]" aria-hidden />
      <div className="pointer-events-none absolute -bottom-28 -right-24 h-96 w-96 rounded-full bg-antique-500/12 blur-[130px]" aria-hidden />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(245,168,0,.4) 1px, transparent 1px), linear-gradient(90deg, rgba(245,168,0,.4) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
          maskImage: "radial-gradient(ellipse at 50% 45%, black 0%, transparent 68%)",
          WebkitMaskImage: "radial-gradient(ellipse at 50% 45%, black 0%, transparent 68%)",
        }}
        aria-hidden
      />

      <motion.div
        initial={{ opacity: 0, y: 28, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-md rounded-4xl border border-gold-500/25 bg-ink-900/85 p-8 shadow-gold-lg backdrop-blur-xl sm:p-10"
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

        <div className="mb-8 text-center">
          <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-gold-500/30 bg-gold-500/10 px-3.5 py-1.5 text-[0.68rem] font-bold uppercase tracking-[0.16em] text-gold-300">
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
            {tr("admin.badge")}
          </span>
          <h1 className="font-display text-2xl font-extrabold text-white">
            Xisbiga <span className="text-gradient-gold">Hilaac</span>
          </h1>
          <p className="mt-2 text-sm text-ink-400">{tr("admin.subtitle")}</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-5">
          <div>
            <label htmlFor="admin-email" className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-ink-400">
              {tr("contact.email")}
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-ink-500" aria-hidden />
              <input
                id="admin-email"
                type="email"
                required
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={FIELD}
              />
            </div>
          </div>

          <div>
            <label htmlFor="admin-password" className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-ink-400">
              Password
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-ink-500" aria-hidden />
              <input
                id="admin-password"
                type={reveal ? "text" : "password"}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`${FIELD} pr-12`}
              />
              <button
                type="button"
                onClick={() => setReveal((v) => !v)}
                aria-label={reveal ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-ink-400 transition hover:bg-white/8 hover:text-gold-300"
              >
                {reveal ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {error && (
            <p role="alert" className="flex items-start gap-2 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-300">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="inline-flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-gold-gradient px-6 font-bold text-ink-900 shadow-gold transition-all hover:-translate-y-0.5 hover:shadow-gold-lg disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {tr("contact.sending")}
              </>
            ) : (
              <>
                {tr("admin.cta")}
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <p className="mt-7 text-center text-xs leading-relaxed text-ink-500">
          {tr("admin.note")}
        </p>
      </motion.div>
    </main>
  );
}
