"use client";

import { AlertCircle, CheckCircle2, Clock, Loader2, Mail, MapPin, Phone, Send } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { Section, SectionHeading } from "@/components/ui/Section";
import { useLanguage } from "@/lib/i18n/provider";
import type { SiteSettings } from "@/lib/types";
import { cn } from "@/lib/utils";

type Status = "idle" | "sending" | "success" | "error";

const FIELD =
  "w-full rounded-2xl border border-ink-200/80 bg-white px-4 py-3 text-[0.95rem] outline-none transition-all " +
  "placeholder:text-ink-400 focus:border-gold-500 focus:ring-4 focus:ring-gold-500/15 " +
  "dark:border-ink-700 dark:bg-ink-900";

const LABEL = "mb-2 block text-sm font-semibold";

export function Contact({
  settings,
  hideHeading,
}: {
  settings: SiteSettings;
  /** Set on the dedicated page, where <PageHeader> already states the title. */
  hideHeading?: boolean;
}) {
  const { tr, tx } = useLanguage();
  const [status, setStatus] = useState<Status>("idle");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());

    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = (await res.json()) as { ok?: boolean };
      if (!res.ok || !json.ok) throw new Error("failed");
      setStatus("success");
      form.reset();
    } catch {
      setStatus("error");
    }
  }

  const details = [
    {
      icon: MapPin,
      label: tr("contact.address"),
      value: tx(settings.contact.address),
      href: settings.contact.mapLink,
    },
    {
      icon: Mail,
      label: tr("contact.email"),
      value: settings.contact.email,
      href: `mailto:${settings.contact.email}`,
    },
    {
      icon: Phone,
      label: tr("contact.phone"),
      value: settings.contact.phone,
      href: `tel:${settings.contact.phone.replace(/\s/g, "")}`,
    },
    {
      icon: Clock,
      label: tr("contact.hours"),
      value: tx(settings.contact.hours),
    },
  ].filter((item) => Boolean(item.value));

  return (
    <Section id="contact">
      <div className="container-page">
        {!hideHeading && (
          <SectionHeading
            eyebrow={tr("nav.contact")}
            title={tr("contact.title")}
            subtitle={tr("contact.subtitle")}
          />
        )}

        <div className="grid gap-8 lg:grid-cols-12">
          {/* Details + map */}
          <Reveal direction="right" className="lg:col-span-5">
            <div className="flex h-full flex-col gap-6">
              <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                {details.map(({ icon: Icon, label, value, href }) => {
                  const content = (
                    <>
                      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gold-gradient text-ink-900 shadow-gold">
                        <Icon className="h-5 w-5" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-xs font-bold uppercase tracking-wider text-ink-400">
                          {label}
                        </span>
                        <span className="block break-words font-semibold">{value}</span>
                      </span>
                    </>
                  );

                  return (
                    <li key={label}>
                      {href ? (
                        <a
                          href={href}
                          target={href.startsWith("http") ? "_blank" : undefined}
                          rel="noopener noreferrer"
                          className="flex items-center gap-4 rounded-3xl border border-ink-200/70 bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-gold-500/50 hover:shadow-gold dark:border-ink-800 dark:bg-ink-900"
                        >
                          {content}
                        </a>
                      ) : (
                        <div className="flex items-center gap-4 rounded-3xl border border-ink-200/70 bg-white p-4 dark:border-ink-800 dark:bg-ink-900">
                          {content}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>

              {settings.contact.mapEmbedUrl && (
                <div className="relative min-h-64 flex-1 overflow-hidden rounded-4xl border border-ink-200/70 dark:border-ink-800">
                  <iframe
                    src={settings.contact.mapEmbedUrl}
                    title={tx(settings.contact.address)}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    allowFullScreen
                    className="absolute inset-0 h-full w-full grayscale-[0.35] transition-all duration-500 hover:grayscale-0"
                  />
                </div>
              )}
            </div>
          </Reveal>

          {/* Form */}
          <Reveal direction="left" className="lg:col-span-7">
            <form
              onSubmit={onSubmit}
              className="h-full rounded-4xl border border-ink-200/70 bg-white p-7 shadow-soft dark:border-ink-800 dark:bg-ink-900 sm:p-9"
              noValidate={false}
            >
              {/* Honeypot */}
              <label className="sr-only" htmlFor="website">
                Website
              </label>
              <input
                id="website"
                name="website"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                className="hidden"
                aria-hidden
              />

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className={LABEL} htmlFor="name">
                    {tr("contact.name")} <span className="text-gold-600">*</span>
                  </label>
                  <input id="name" name="name" type="text" required autoComplete="name" className={FIELD} />
                </div>

                <div>
                  <label className={LABEL} htmlFor="email">
                    {tr("contact.email")} <span className="text-gold-600">*</span>
                  </label>
                  <input id="email" name="email" type="email" required autoComplete="email" className={FIELD} />
                </div>

                <div>
                  <label className={LABEL} htmlFor="phone">
                    {tr("contact.phone")}
                  </label>
                  <input id="phone" name="phone" type="tel" autoComplete="tel" className={FIELD} />
                </div>

                <div>
                  <label className={LABEL} htmlFor="subject">
                    {tr("contact.subject")}
                  </label>
                  <input id="subject" name="subject" type="text" className={FIELD} />
                </div>

                <div className="sm:col-span-2">
                  <label className={LABEL} htmlFor="message">
                    {tr("contact.message")} <span className="text-gold-600">*</span>
                  </label>
                  <textarea id="message" name="message" required rows={6} className={cn(FIELD, "resize-y")} />
                </div>
              </div>

              <div className="mt-7 flex flex-wrap items-center gap-4">
                <Button type="submit" size="lg" disabled={status === "sending"}>
                  {status === "sending" ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {tr("contact.sending")}
                    </>
                  ) : (
                    <>
                      {tr("cta.send")}
                      <Send className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </>
                  )}
                </Button>

                {status === "success" && (
                  <p role="status" className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="h-4 w-4" />
                    {tr("contact.success")}
                  </p>
                )}

                {status === "error" && (
                  <p role="alert" className="inline-flex items-center gap-2 text-sm font-semibold text-red-600 dark:text-red-400">
                    <AlertCircle className="h-4 w-4" />
                    {tr("contact.error")}
                  </p>
                )}
              </div>
            </form>
          </Reveal>
        </div>
      </div>
    </Section>
  );
}
