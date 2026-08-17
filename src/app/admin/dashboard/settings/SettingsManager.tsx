"use client";

import { motion } from "framer-motion";
import {
  Bell,
  Check,
  Globe,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Save,
  Share2,
  Sparkles,
} from "lucide-react";
import { useEffect, useState } from "react";
import { fallbackSettings } from "@/lib/fallback";

export function SettingsManager() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Settings State
  const [partyNameSo, setPartyNameSo] = useState("Xisbiga Hilaac");
  const [partyNameEn, setPartyNameEn] = useState("Hilaac Political Party");
  const [taglineSo, setTaglineSo] = useState("Midnimo, Horumar iyo Caddaalad");
  const [taglineEn, setTaglineEn] = useState("Unity, Progress and Justice");
  const [email, setEmail] = useState("info@xisbiga-hilaac.com");
  const [phone, setPhone] = useState("+252 61 000 0000");
  const [addressSo, setAddressSo] = useState("Muqdisho, Soomaaliya");
  const [addressEn, setAddressEn] = useState("Mogadishu, Somalia");
  const [facebook, setFacebook] = useState("https://facebook.com/");
  const [twitter, setTwitter] = useState("https://x.com/");
  const [youtube, setYoutube] = useState("https://youtube.com/");
  const [tiktok, setTiktok] = useState("https://tiktok.com/");

  // Announcement bar
  const [announcementEnabled, setAnnouncementEnabled] = useState(true);
  const [announcementSo, setAnnouncementSo] = useState(
    "Kusoo dhawow Xisbiga Hilaac — Iska diiwaangeli xubinimada dhijitaalka ah maanta!",
  );
  const [announcementEn, setAnnouncementEn] = useState(
    "Welcome to Hilaac Political Party — Register for digital party membership today!",
  );
  const [announcementLink, setAnnouncementLink] = useState("/join");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/site-admin/settings");
        const data = await res.json();
        if (data.ok && data.settings) {
          const s = data.settings;
          if (s.partyName?.so) setPartyNameSo(s.partyName.so);
          if (s.partyName?.en) setPartyNameEn(s.partyName.en);
          if (s.tagline?.so) setTaglineSo(s.tagline.so);
          if (s.tagline?.en) setTaglineEn(s.tagline.en);
          if (s.contact?.email) setEmail(s.contact.email);
          if (s.contact?.phone) setPhone(s.contact.phone);
          if (s.contact?.address?.so) setAddressSo(s.contact.address.so);
          if (s.contact?.address?.en) setAddressEn(s.contact.address.en);
          if (s.socials?.facebook) setFacebook(s.socials.facebook);
          if (s.socials?.x) setTwitter(s.socials.x);
          if (s.socials?.youtube) setYoutube(s.socials.youtube);
          if (s.socials?.tiktok) setTiktok(s.socials.tiktok);
          if (s.announcement) {
            setAnnouncementEnabled(s.announcement.enabled ?? true);
            setAnnouncementSo(s.announcement.textSo || "");
            setAnnouncementEn(s.announcement.textEn || "");
            setAnnouncementLink(s.announcement.link || "/join");
          }
        }
      } catch {
        // fallback values used
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

    const payload = {
      partyName: { so: partyNameSo, en: partyNameEn },
      tagline: { so: taglineSo, en: taglineEn },
      contact: {
        email,
        phone,
        address: { so: addressSo, en: addressEn },
      },
      socials: {
        facebook,
        x: twitter,
        youtube,
        tiktok,
      },
      announcement: {
        enabled: announcementEnabled,
        textSo: announcementSo,
        textEn: announcementEn,
        link: announcementLink,
      },
    };

    try {
      const res = await fetch("/api/site-admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 4000);
      }
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="py-20 text-center text-ink-500">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-gold-400" />
        <p className="mt-3 text-sm font-medium">Loading party settings...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-8 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2xl font-extrabold sm:text-3xl">Site Settings</h1>
          <p className="mt-1 text-sm text-ink-400">
            Configure party branding, contact channels, social profiles, and announcements.
          </p>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="inline-flex h-11 items-center gap-2 rounded-2xl bg-gold-gradient px-5 text-xs font-bold text-ink-950 shadow-gold transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : savedSuccess ? (
            <Check className="h-4 w-4" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {saving ? "Saving Changes..." : savedSuccess ? "Saved Successfully!" : "Save Settings"}
        </button>
      </div>

      {savedSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs font-semibold text-emerald-300 flex items-center gap-2"
        >
          <Check className="h-4 w-4" />
          All settings have been updated and are now live across the website.
        </motion.div>
      )}

      {/* 1. Announcement Banner */}
      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-gold-500/15 text-gold-400">
              <Bell className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-display text-base font-bold text-white">
                Live Announcement Banner
              </h2>
              <p className="text-xs text-ink-400">
                Puts a high-visibility banner at the very top of all public pages.
              </p>
            </div>
          </div>

          <label className="relative inline-flex cursor-pointer items-center">
            <input
              type="checkbox"
              checked={announcementEnabled}
              onChange={(e) => setAnnouncementEnabled(e.target.checked)}
              className="peer sr-only"
            />
            <div className="peer h-6 w-11 rounded-full bg-white/10 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-gold-500 peer-checked:after:translate-x-full peer-checked:after:bg-ink-950"></div>
          </label>
        </div>

        {announcementEnabled && (
          <div className="grid gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-ink-300 mb-1">
                Announcement Text (Somali)
              </label>
              <input
                type="text"
                value={announcementSo}
                onChange={(e) => setAnnouncementSo(e.target.value)}
                className="h-10 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-xs text-white outline-none focus:border-gold-500/70"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-ink-300 mb-1">
                Announcement Text (English)
              </label>
              <input
                type="text"
                value={announcementEn}
                onChange={(e) => setAnnouncementEn(e.target.value)}
                className="h-10 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-xs text-white outline-none focus:border-gold-500/70"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-ink-300 mb-1">
                Banner Click URL / Path
              </label>
              <input
                type="text"
                value={announcementLink}
                onChange={(e) => setAnnouncementLink(e.target.value)}
                placeholder="/join"
                className="h-10 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-xs text-white outline-none focus:border-gold-500/70"
              />
            </div>
          </div>
        )}
      </div>

      {/* 2. Party Identity & Slogan */}
      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 space-y-5">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-sky-500/15 text-sky-400">
            <Sparkles className="h-5 w-5" />
          </span>
          <div>
            <h2 className="font-display text-base font-bold text-white">Party Identity & Slogans</h2>
            <p className="text-xs text-ink-400">Official names and party mottos.</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold text-ink-300 mb-1">Party Name (Somali)</label>
            <input
              type="text"
              value={partyNameSo}
              onChange={(e) => setPartyNameSo(e.target.value)}
              className="h-10 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-xs text-white outline-none focus:border-gold-500/70"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-ink-300 mb-1">Party Name (English)</label>
            <input
              type="text"
              value={partyNameEn}
              onChange={(e) => setPartyNameEn(e.target.value)}
              className="h-10 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-xs text-white outline-none focus:border-gold-500/70"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-ink-300 mb-1">Tagline (Somali)</label>
            <input
              type="text"
              value={taglineSo}
              onChange={(e) => setTaglineSo(e.target.value)}
              className="h-10 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-xs text-white outline-none focus:border-gold-500/70"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-ink-300 mb-1">Tagline (English)</label>
            <input
              type="text"
              value={taglineEn}
              onChange={(e) => setTaglineEn(e.target.value)}
              className="h-10 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-xs text-white outline-none focus:border-gold-500/70"
            />
          </div>
        </div>
      </div>

      {/* 3. Official Contact Info */}
      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 space-y-5">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-500/15 text-emerald-400">
            <Phone className="h-5 w-5" />
          </span>
          <div>
            <h2 className="font-display text-base font-bold text-white">Contact & Headquarters</h2>
            <p className="text-xs text-ink-400">Public hotline, official inbox, and headquarters address.</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold text-ink-300 mb-1">Official Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-10 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-xs text-white outline-none focus:border-gold-500/70"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-ink-300 mb-1">Official Phone / Hotline</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="h-10 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-xs text-white outline-none focus:border-gold-500/70"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-ink-300 mb-1">Address (Somali)</label>
            <input
              type="text"
              value={addressSo}
              onChange={(e) => setAddressSo(e.target.value)}
              className="h-10 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-xs text-white outline-none focus:border-gold-500/70"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-ink-300 mb-1">Address (English)</label>
            <input
              type="text"
              value={addressEn}
              onChange={(e) => setAddressEn(e.target.value)}
              className="h-10 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-xs text-white outline-none focus:border-gold-500/70"
            />
          </div>
        </div>
      </div>

      {/* 4. Social Media Accounts */}
      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 space-y-5">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-purple-500/15 text-purple-400">
            <Share2 className="h-5 w-5" />
          </span>
          <div>
            <h2 className="font-display text-base font-bold text-white">Social Media Links</h2>
            <p className="text-xs text-ink-400">Direct URLs to party social channels.</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold text-ink-300 mb-1">Facebook Page</label>
            <input
              type="url"
              value={facebook}
              onChange={(e) => setFacebook(e.target.value)}
              className="h-10 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-xs text-white outline-none focus:border-gold-500/70"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-ink-300 mb-1">X (Twitter)</label>
            <input
              type="url"
              value={twitter}
              onChange={(e) => setTwitter(e.target.value)}
              className="h-10 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-xs text-white outline-none focus:border-gold-500/70"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-ink-300 mb-1">YouTube Channel</label>
            <input
              type="url"
              value={youtube}
              onChange={(e) => setYoutube(e.target.value)}
              className="h-10 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-xs text-white outline-none focus:border-gold-500/70"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-ink-300 mb-1">TikTok Profile</label>
            <input
              type="url"
              value={tiktok}
              onChange={(e) => setTiktok(e.target.value)}
              className="h-10 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-xs text-white outline-none focus:border-gold-500/70"
            />
          </div>
        </div>
      </div>
    </form>
  );
}
