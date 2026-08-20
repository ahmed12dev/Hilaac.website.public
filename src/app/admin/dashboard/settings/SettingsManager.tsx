"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  Bell,
  Check,
  Globe,
  Images,
  Info,
  Loader2,
  Phone,
  Plus,
  Save,
  Share2,
  Sparkles,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { MediaPicker } from "../MediaPicker";
import { cn } from "@/lib/utils";
import { useAdminText } from "../useAdminText";
import type { AdminKey } from "@/lib/i18n/admin";

/**
 * Everything on the public website that is not a content row.
 *
 * The whole record is one JSON blob in `site_settings`. The server merges what
 * this screen sends into the stored blob, so saving one tab never blanks
 * another, and the public pages read the same row on their next request.
 */

const FIELD =
  "w-full rounded-xl border border-white/12 bg-white/5 px-4 py-2.5 text-sm text-white outline-none " +
  "transition-all placeholder:text-ink-500 focus:border-gold-500/70 focus:bg-white/8";
const LABEL = "mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-ink-400";

interface Bilingual {
  so?: string;
  en?: string;
}

interface HeroSlide {
  src: string;
  captionSo?: string;
  captionEn?: string;
}

interface SettingsShape {
  partyName: Bilingual;
  tagline: Bilingual;
  heroHeadline: Bilingual;
  heroSubheadline: Bilingual;
  heroImage?: string | null;
  heroVideo?: string | null;
  heroSlides?: HeroSlide[];
  logo?: string;
  about: {
    history: Bilingual;
    vision: Bilingual;
    mission: Bilingual;
  };
  contact: {
    address: Bilingual;
    email: string;
    phone: string;
    hours?: Bilingual;
    mapEmbedUrl?: string;
    mapLink?: string;
  };
  socials: Record<string, string>;
  announcement: {
    enabled: boolean;
    textSo: string;
    textEn: string;
    link: string;
  };
  registerUrl?: string;
}

const TABS = [
  { id: "announcement", label: "settings.tab.announcement", icon: Bell },
  { id: "identity", label: "settings.tab.identity", icon: Sparkles },
  { id: "hero", label: "settings.tab.hero", icon: Images },
  { id: "about", label: "settings.tab.about", icon: Info },
  { id: "contact", label: "settings.tab.contact", icon: Phone },
  { id: "socials", label: "settings.tab.socials", icon: Share2 },
  { id: "advanced", label: "settings.tab.advanced", icon: Globe },
] as const satisfies readonly { id: string; label: AdminKey; icon: unknown }[];

type TabId = (typeof TABS)[number]["id"];

const SOCIAL_FIELDS: { key: string; label: string }[] = [
  { key: "facebook", label: "Facebook" },
  { key: "x", label: "X (Twitter)" },
  { key: "instagram", label: "Instagram" },
  { key: "youtube", label: "YouTube" },
  { key: "tiktok", label: "TikTok" },
  { key: "linkedin", label: "LinkedIn" },
  { key: "whatsapp", label: "WhatsApp" },
];

/** Shape guaranteed to have every branch the form reads. */
function normalise(raw: Partial<SettingsShape> | null): SettingsShape {
  return {
    partyName: raw?.partyName ?? {},
    tagline: raw?.tagline ?? {},
    heroHeadline: raw?.heroHeadline ?? {},
    heroSubheadline: raw?.heroSubheadline ?? {},
    heroImage: raw?.heroImage ?? "",
    heroVideo: raw?.heroVideo ?? "",
    heroSlides: Array.isArray(raw?.heroSlides) ? raw!.heroSlides! : [],
    logo: raw?.logo ?? "",
    about: {
      history: raw?.about?.history ?? {},
      vision: raw?.about?.vision ?? {},
      mission: raw?.about?.mission ?? {},
    },
    contact: {
      address: raw?.contact?.address ?? {},
      email: raw?.contact?.email ?? "",
      phone: raw?.contact?.phone ?? "",
      hours: raw?.contact?.hours ?? {},
      mapEmbedUrl: raw?.contact?.mapEmbedUrl ?? "",
      mapLink: raw?.contact?.mapLink ?? "",
    },
    socials: raw?.socials ?? {},
    announcement: {
      enabled: raw?.announcement?.enabled ?? false,
      textSo: raw?.announcement?.textSo ?? "",
      textEn: raw?.announcement?.textEn ?? "",
      link: raw?.announcement?.link ?? "",
    },
    registerUrl: raw?.registerUrl ?? "",
  };
}

/**
 * A Somali/English pair of inputs.
 *
 * Declared at module level on purpose: a component defined inside the render
 * body is a new type on every keystroke, which unmounts the input and loses
 * the caret mid-word.
 */
function Pair({
  label,
  value,
  onChange,
  textarea,
  rows = 4,
}: {
  label: string;
  value: Bilingual;
  onChange: (next: Bilingual) => void;
  textarea?: boolean;
  rows?: number;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {(["so", "en"] as const).map((lang) => {
        const id = `${label.replace(/\W/g, "")}-${lang}`;
        return (
          <div key={lang}>
            <label className={LABEL} htmlFor={id}>
              {label} — {lang === "so" ? "Somali" : "English"}
            </label>
            {textarea ? (
              <textarea
                id={id}
                rows={rows}
                className={FIELD}
                value={value[lang] ?? ""}
                onChange={(e) => onChange({ ...value, [lang]: e.target.value })}
              />
            ) : (
              <input
                id={id}
                className={FIELD}
                value={value[lang] ?? ""}
                onChange={(e) => onChange({ ...value, [lang]: e.target.value })}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export function SettingsManager() {
  const { at } = useAdminText();
  const [settings, setSettings] = useState<SettingsShape | null>(null);
  const [tab, setTab] = useState<TabId>("announcement");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  function flash(kind: "ok" | "err", text: string) {
    setNotice({ kind, text });
    window.setTimeout(() => setNotice(null), 5000);
  }

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/site-admin/settings");
        const data = (await res.json()) as {
          ok?: boolean;
          settings?: Partial<SettingsShape>;
          error?: string;
        };
        if (!res.ok || !data.ok) {
          flash("err", data.error ?? at("common.couldNotSave"));
          setSettings(normalise(null));
          return;
        }
        setSettings(normalise(data.settings ?? null));
      } catch {
        flash("err", at("common.networkError"));
        setSettings(normalise(null));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (!settings) return;

    setSaving(true);
    try {
      const res = await fetch("/api/site-admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        flash("err", data.error ?? at("common.couldNotSave"));
        return;
      }
      flash("ok", at("settings.saved"));
    } catch {
      flash("err", at("common.networkError"));
    } finally {
      setSaving(false);
    }
  }

  if (loading || !settings) {
    return (
      <div className="py-24 text-center text-ink-500">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-gold-400" />
        <p className="mt-3 text-sm font-medium">{at("settings.loading")}</p>
      </div>
    );
  }

  const s = settings;
  const patch = (next: Partial<SettingsShape>) => setSettings({ ...s, ...next });

  return (
    <form onSubmit={save} className="space-y-7">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold sm:text-3xl">{at("settings.title")}</h1>
          <p className="mt-1.5 text-sm text-ink-400">
            {at("settings.subtitle")}
          </p>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="inline-flex h-11 items-center gap-2 rounded-2xl bg-gold-gradient px-5 text-sm font-bold text-ink-900 shadow-gold transition-transform hover:-translate-y-0.5 disabled:opacity-60"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? at("common.saving") : at("settings.save")}
        </button>
      </header>

      <AnimatePresence>
        {notice && (
          <motion.p
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            role="status"
            className={cn(
              "flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold",
              notice.kind === "ok"
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                : "border-red-500/30 bg-red-500/10 text-red-300",
            )}
          >
            {notice.kind === "ok" ? (
              <Check className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            {notice.text}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            aria-pressed={tab === item.id}
            className={cn(
              "inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-all",
              tab === item.id
                ? "bg-gold-gradient text-ink-900 shadow-gold"
                : "border border-white/10 text-ink-300 hover:bg-white/6 hover:text-gold-300",
            )}
          >
            <item.icon className="h-3.5 w-3.5" />
            {at(item.label)}
          </button>
        ))}
      </div>

      {/* ── Announcement ── */}
      {tab === "announcement" && (
        <section className="space-y-5 rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-base font-bold">Announcement banner</h2>
              <p className="text-xs text-ink-400">
                A strip across the very top of every public page.
              </p>
            </div>
            <label className="relative inline-flex cursor-pointer items-center">
              <span className="sr-only">Show the announcement banner</span>
              <input
                type="checkbox"
                checked={s.announcement.enabled}
                onChange={(e) =>
                  patch({ announcement: { ...s.announcement, enabled: e.target.checked } })
                }
                className="peer sr-only"
              />
              <span className="peer h-6 w-11 rounded-full bg-white/10 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-gold-500 peer-checked:after:translate-x-full peer-checked:after:bg-ink-950" />
            </label>
          </div>

          {s.announcement.enabled && (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={LABEL} htmlFor="ann-so">
                    Text — Somali
                  </label>
                  <input
                    id="ann-so"
                    className={FIELD}
                    value={s.announcement.textSo}
                    onChange={(e) =>
                      patch({ announcement: { ...s.announcement, textSo: e.target.value } })
                    }
                  />
                </div>
                <div>
                  <label className={LABEL} htmlFor="ann-en">
                    Text — English
                  </label>
                  <input
                    id="ann-en"
                    className={FIELD}
                    value={s.announcement.textEn}
                    onChange={(e) =>
                      patch({ announcement: { ...s.announcement, textEn: e.target.value } })
                    }
                  />
                </div>
              </div>
              <div>
                <label className={LABEL} htmlFor="ann-link">
                  Where the banner links to
                </label>
                <input
                  id="ann-link"
                  className={FIELD}
                  placeholder="/join"
                  value={s.announcement.link}
                  onChange={(e) =>
                    patch({ announcement: { ...s.announcement, link: e.target.value } })
                  }
                />
              </div>
            </div>
          )}
        </section>
      )}

      {/* ── Identity ── */}
      {tab === "identity" && (
        <section className="space-y-6 rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="font-display text-base font-bold">Party identity</h2>
          <Pair
            label="Party name"
            value={s.partyName}
            onChange={(partyName) => patch({ partyName })}
          />
          <Pair label="Tagline" value={s.tagline} onChange={(tagline) => patch({ tagline })} />
          <MediaPicker
            label="Party logo"
            folder="brand"
            value={s.logo ?? ""}
            onChange={(logo) => patch({ logo })}
          />
        </section>
      )}

      {/* ── Hero ── */}
      {tab === "hero" && (
        <section className="space-y-6 rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          <div>
            <h2 className="font-display text-base font-bold">Homepage hero</h2>
            <p className="text-xs text-ink-400">
              The headline, background and rotating images at the top of the homepage.
            </p>
          </div>

          <Pair
            label="Headline"
            value={s.heroHeadline}
            onChange={(heroHeadline) => patch({ heroHeadline })}
          />
          <Pair
            label="Subheadline"
            value={s.heroSubheadline}
            onChange={(heroSubheadline) => patch({ heroSubheadline })}
            textarea
            rows={3}
          />

          <MediaPicker
            label="Hero background image"
            folder="hero"
            value={s.heroImage ?? ""}
            onChange={(heroImage) => patch({ heroImage })}
          />

          <div>
            <label className={LABEL} htmlFor="hero-video">
              Hero video URL (optional)
            </label>
            <input
              id="hero-video"
              className={FIELD}
              placeholder="https://…"
              value={s.heroVideo ?? ""}
              onChange={(e) => patch({ heroVideo: e.target.value })}
            />
          </div>

          {/* Slideshow */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold">Hero slideshow</h3>
                <p className="text-xs text-ink-400">
                  Shown in order. Leave empty to use the single hero image instead.
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  patch({
                    heroSlides: [...(s.heroSlides ?? []), { src: "", captionSo: "", captionEn: "" }],
                  })
                }
                className="inline-flex items-center gap-2 rounded-xl border border-white/12 px-3.5 py-2 text-xs font-bold text-ink-200 transition hover:border-gold-500/50 hover:text-gold-300"
              >
                <Plus className="h-3.5 w-3.5" />
                Add slide
              </button>
            </div>

            {(s.heroSlides ?? []).length === 0 ? (
              <p className="py-6 text-center text-xs text-ink-500">No slides yet.</p>
            ) : (
              <ul className="space-y-4">
                {(s.heroSlides ?? []).map((slide, index) => (
                  <li
                    key={index}
                    className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wide text-ink-400">
                        Slide {index + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          patch({
                            heroSlides: (s.heroSlides ?? []).filter((_, i) => i !== index),
                          })
                        }
                        aria-label={`Remove slide ${index + 1}`}
                        className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 text-ink-300 transition hover:border-red-500/50 hover:text-red-400"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <MediaPicker
                      folder="hero"
                      value={slide.src}
                      onChange={(src) =>
                        patch({
                          heroSlides: (s.heroSlides ?? []).map((sl, i) =>
                            i === index ? { ...sl, src } : sl,
                          ),
                        })
                      }
                    />

                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <input
                        className={FIELD}
                        placeholder="Caption — Somali"
                        aria-label={`Slide ${index + 1} caption in Somali`}
                        value={slide.captionSo ?? ""}
                        onChange={(e) =>
                          patch({
                            heroSlides: (s.heroSlides ?? []).map((sl, i) =>
                              i === index ? { ...sl, captionSo: e.target.value } : sl,
                            ),
                          })
                        }
                      />
                      <input
                        className={FIELD}
                        placeholder="Caption — English"
                        aria-label={`Slide ${index + 1} caption in English`}
                        value={slide.captionEn ?? ""}
                        onChange={(e) =>
                          patch({
                            heroSlides: (s.heroSlides ?? []).map((sl, i) =>
                              i === index ? { ...sl, captionEn: e.target.value } : sl,
                            ),
                          })
                        }
                      />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      )}

      {/* ── About ── */}
      {tab === "about" && (
        <section className="space-y-6 rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          <div>
            <h2 className="font-display text-base font-bold">About the party</h2>
            <p className="text-xs text-ink-400">The text shown on the About page.</p>
          </div>

          <Pair
            label="History"
            value={s.about.history}
            onChange={(history) => patch({ about: { ...s.about, history } })}
            textarea
            rows={6}
          />
          <Pair
            label="Vision"
            value={s.about.vision}
            onChange={(vision) => patch({ about: { ...s.about, vision } })}
            textarea
            rows={4}
          />
          <Pair
            label="Mission"
            value={s.about.mission}
            onChange={(mission) => patch({ about: { ...s.about, mission } })}
            textarea
            rows={4}
          />
        </section>
      )}

      {/* ── Contact ── */}
      {tab === "contact" && (
        <section className="space-y-6 rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          <div>
            <h2 className="font-display text-base font-bold">Contact & headquarters</h2>
            <p className="text-xs text-ink-400">
              Shown on the Contact page and in the footer of every page.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={LABEL} htmlFor="c-email">
                Official email
              </label>
              <input
                id="c-email"
                type="email"
                className={FIELD}
                value={s.contact.email}
                onChange={(e) => patch({ contact: { ...s.contact, email: e.target.value } })}
              />
            </div>
            <div>
              <label className={LABEL} htmlFor="c-phone">
                Phone / hotline
              </label>
              <input
                id="c-phone"
                className={FIELD}
                value={s.contact.phone}
                onChange={(e) => patch({ contact: { ...s.contact, phone: e.target.value } })}
              />
            </div>
          </div>

          <Pair
            label="Address"
            value={s.contact.address}
            onChange={(address) => patch({ contact: { ...s.contact, address } })}
          />
          <Pair
            label="Opening hours"
            value={s.contact.hours ?? {}}
            onChange={(hours) => patch({ contact: { ...s.contact, hours } })}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={LABEL} htmlFor="c-map-embed">
                Map embed URL
              </label>
              <input
                id="c-map-embed"
                className={FIELD}
                placeholder="https://www.google.com/maps/embed?…"
                value={s.contact.mapEmbedUrl ?? ""}
                onChange={(e) => patch({ contact: { ...s.contact, mapEmbedUrl: e.target.value } })}
              />
            </div>
            <div>
              <label className={LABEL} htmlFor="c-map-link">
                Map link
              </label>
              <input
                id="c-map-link"
                className={FIELD}
                placeholder="https://maps.app.goo.gl/…"
                value={s.contact.mapLink ?? ""}
                onChange={(e) => patch({ contact: { ...s.contact, mapLink: e.target.value } })}
              />
            </div>
          </div>
        </section>
      )}

      {/* ── Socials ── */}
      {tab === "socials" && (
        <section className="space-y-5 rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          <div>
            <h2 className="font-display text-base font-bold">Social links</h2>
            <p className="text-xs text-ink-400">
              Leave a field empty to hide that icon from the website.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {SOCIAL_FIELDS.map((field) => (
              <div key={field.key}>
                <label className={LABEL} htmlFor={`social-${field.key}`}>
                  {field.label}
                </label>
                <input
                  id={`social-${field.key}`}
                  type="url"
                  className={FIELD}
                  placeholder="https://…"
                  value={s.socials[field.key] ?? ""}
                  onChange={(e) =>
                    patch({ socials: { ...s.socials, [field.key]: e.target.value } })
                  }
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Advanced ── */}
      {tab === "advanced" && (
        <section className="space-y-5 rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          <div>
            <h2 className="font-display text-base font-bold">Advanced</h2>
            <p className="text-xs text-ink-400">
              Only change these if you know where they point.
            </p>
          </div>

          <div>
            <label className={LABEL} htmlFor="register-url">
              Membership registration URL
            </label>
            <input
              id="register-url"
              className={FIELD}
              placeholder="https://www.xisbiga-hilaac.com/register.html"
              value={s.registerUrl ?? ""}
              onChange={(e) => patch({ registerUrl: e.target.value })}
            />
            <p className="mt-1.5 text-[0.7rem] text-ink-500">
              Used only when the NEXT_PUBLIC_REGISTER_URL environment variable is set. Otherwise
              &ldquo;Join the party&rdquo; goes to this site&rsquo;s own /join page.
            </p>
          </div>
        </section>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex h-11 items-center gap-2 rounded-2xl bg-gold-gradient px-6 text-sm font-bold text-ink-900 shadow-gold transition-transform hover:-translate-y-0.5 disabled:opacity-60"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? at("common.saving") : at("settings.save")}
        </button>
      </div>
    </form>
  );
}
