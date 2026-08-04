"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  BadgeCheck,
  Camera,
  CheckCircle2,
  Loader2,
  Send,
  Upload,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { useLanguage } from "@/lib/i18n/provider";
import { cn } from "@/lib/utils";

const FIELD =
  "w-full rounded-2xl border border-ink-200/80 bg-white px-4 py-3 text-[0.95rem] outline-none transition-all " +
  "placeholder:text-ink-400 focus:border-gold-500 focus:ring-4 focus:ring-gold-500/15 " +
  "dark:border-ink-700 dark:bg-ink-900";

const LABEL = "mb-2 block text-sm font-semibold";

/** Backend caps the request body, so photos are downscaled before upload. */
const MAX_PHOTO_EDGE = 900;
const PHOTO_QUALITY = 0.82;

function readAndCompress(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("read failed"));
    reader.onload = () => {
      const img = new window.Image();
      img.onerror = () => reject(new Error("decode failed"));
      img.onload = () => {
        const scale = Math.min(1, MAX_PHOTO_EDGE / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("no canvas"));
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        // JPEG keeps the payload small and is one of the formats the backend
        // accepts (png | jpe?g | webp).
        resolve(canvas.toDataURL("image/jpeg", PHOTO_QUALITY));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

type Status =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "error"; message: string }
  | { kind: "done"; ref: string };

export function JoinForm() {
  const { tr } = useLanguage();

  const [placeType, setPlaceType] = useState<"inside" | "outside">("inside");
  const [regions, setRegions] = useState<Record<string, string[]>>({});
  const [region, setRegion] = useState("");
  const [district, setDistrict] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const fileRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Region/district options come from the backend, so they always match what
  // the registration endpoint validates against.
  useEffect(() => {
    let cancelled = false;
    fetch("/api/locations")
      .then((r) => r.json())
      .then((d: { regions?: Record<string, string[]> }) => {
        if (!cancelled) setRegions(d.regions ?? {});
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  const districts = useMemo(() => regions[region] ?? [], [regions, region]);

  // The backend refuses anyone under 18; stop the date picker there too.
  const maxDob = useMemo(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 18);
    return d.toISOString().slice(0, 10);
  }, []);

  async function onPickPhoto(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setPhotoError(null);
    try {
      setPhoto(await readAndCompress(file));
    } catch {
      setPhotoError("Sawirka lama akhriyi karo. / Could not read that image.");
    }
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!photo) {
      setPhotoError(tr("join.photoHint"));
      return;
    }

    const data = Object.fromEntries(new FormData(event.currentTarget).entries());
    setStatus({ kind: "sending" });

    try {
      const res = await fetch("/api/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: data.fullName,
          gender: data.gender,
          dob: data.dob,
          phone: data.phone,
          contactPhone: data.contactPhone,
          email: data.email,
          education: data.education,
          placeType,
          region: placeType === "inside" ? region : "",
          district: placeType === "inside" ? district : "",
          country: placeType === "outside" ? data.country : "",
          photo,
          consent: true,
        }),
      });

      const json = (await res.json()) as { ok?: boolean; ref?: string; error?: string };
      if (!res.ok || !json.ok) {
        setStatus({ kind: "error", message: json.error ?? "Registration failed." });
        return;
      }
      setStatus({ kind: "done", ref: json.ref ?? "" });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setStatus({ kind: "error", message: "Network error. Please try again." });
    }
  }

  function reset() {
    formRef.current?.reset();
    setPhoto(null);
    setRegion("");
    setDistrict("");
    setPlaceType("inside");
    setStatus({ kind: "idle" });
  }

  /* ── success ── */
  if (status.kind === "done") {
    return (
      <Section>
        <div className="container-page">
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto max-w-xl rounded-5xl border border-gold-500/40 bg-white p-8 text-center shadow-gold-lg dark:bg-ink-900 sm:p-12"
          >
            <span className="mx-auto mb-6 grid h-20 w-20 place-items-center rounded-full bg-gold-gradient text-ink-900 shadow-gold">
              <BadgeCheck className="h-10 w-10" />
            </span>

            <h2 className="font-display text-2xl font-extrabold sm:text-3xl">
              {tr("join.successTitle")}
            </h2>
            <p className="mt-3 text-ink-600 dark:text-ink-400">{tr("join.successText")}</p>

            <p className="my-6 select-all rounded-2xl border-2 border-dashed border-gold-500/50 bg-gold-500/8 px-6 py-5 font-display text-2xl font-extrabold tracking-wider text-gold-700 dark:text-gold-300">
              {status.ref}
            </p>

            <p className="text-sm text-ink-500 dark:text-ink-400">{tr("join.successNote")}</p>

            <Button variant="outline" className="mt-8" onClick={reset}>
              {tr("join.another")}
            </Button>
          </motion.div>
        </div>
      </Section>
    );
  }

  /* ── form ── */
  return (
    <Section>
      <div className="container-page">
        <Reveal className="mx-auto max-w-3xl">
          <form
            ref={formRef}
            onSubmit={onSubmit}
            className="rounded-4xl border border-ink-200/70 bg-white p-7 shadow-soft dark:border-ink-800 dark:bg-ink-900 sm:p-10"
          >
            {/* Personal */}
            <fieldset className="mb-9">
              <legend className="mb-5 font-display text-lg font-bold">
                {tr("join.personal")}
              </legend>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className={LABEL} htmlFor="fullName">
                    {tr("join.fullName")} <span className="text-gold-600">*</span>
                  </label>
                  <input id="fullName" name="fullName" required minLength={3} className={FIELD} />
                </div>

                <div>
                  <span className={LABEL}>
                    {tr("join.gender")} <span className="text-gold-600">*</span>
                  </span>
                  <div className="flex gap-3">
                    {[
                      { value: "Lab", label: tr("join.male") },
                      { value: "Dhedig", label: tr("join.female") },
                    ].map((option) => (
                      <label
                        key={option.value}
                        className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-2xl border border-ink-200/80 px-4 py-3 text-sm font-semibold transition-all has-checked:border-gold-500 has-checked:bg-gold-500/10 has-checked:text-gold-700 dark:border-ink-700 dark:has-checked:text-gold-300"
                      >
                        <input
                          type="radio"
                          name="gender"
                          value={option.value}
                          required
                          className="sr-only"
                        />
                        {option.label}
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className={LABEL} htmlFor="dob">
                    {tr("join.dob")} <span className="text-gold-600">*</span>
                  </label>
                  <input id="dob" name="dob" type="date" required max={maxDob} className={FIELD} />
                  <p className="mt-1.5 text-xs text-ink-500">{tr("join.dobHint")}</p>
                </div>

                <div className="sm:col-span-2">
                  <label className={LABEL} htmlFor="education">
                    {tr("join.education")}
                  </label>
                  <input id="education" name="education" className={FIELD} />
                </div>
              </div>
            </fieldset>

            {/* Contact */}
            <fieldset className="mb-9">
              <legend className="mb-5 font-display text-lg font-bold">{tr("join.contact")}</legend>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className={LABEL} htmlFor="phone">
                    {tr("join.phone")} <span className="text-gold-600">*</span>
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    placeholder="+252612345678"
                    className={FIELD}
                  />
                  <p className="mt-1.5 text-xs text-ink-500">{tr("join.phoneHint")}</p>
                </div>

                <div>
                  <label className={LABEL} htmlFor="contactPhone">
                    {tr("join.contactPhone")} <span className="text-gold-600">*</span>
                  </label>
                  <input
                    id="contactPhone"
                    name="contactPhone"
                    type="tel"
                    required
                    placeholder="+252612345678"
                    className={FIELD}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className={LABEL} htmlFor="email">
                    {tr("join.email")}
                  </label>
                  <input id="email" name="email" type="email" className={FIELD} />
                </div>
              </div>
            </fieldset>

            {/* Place */}
            <fieldset className="mb-9">
              <legend className="mb-5 font-display text-lg font-bold">{tr("join.place")}</legend>

              <div className="mb-5 flex flex-wrap gap-3">
                {(["inside", "outside"] as const).map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setPlaceType(value)}
                    aria-pressed={placeType === value}
                    className={cn(
                      "rounded-full border px-5 py-2.5 text-sm font-bold transition-all",
                      placeType === value
                        ? "border-transparent bg-gold-gradient text-ink-900 shadow-gold"
                        : "border-ink-200/70 text-ink-600 hover:border-gold-500 hover:text-gold-600 dark:border-ink-700 dark:text-ink-300",
                    )}
                  >
                    {value === "inside" ? tr("join.placeInside") : tr("join.placeOutside")}
                  </button>
                ))}
              </div>

              {placeType === "inside" ? (
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className={LABEL} htmlFor="region">
                      {tr("join.region")} <span className="text-gold-600">*</span>
                    </label>
                    <select
                      id="region"
                      required
                      value={region}
                      onChange={(e) => {
                        setRegion(e.target.value);
                        setDistrict("");
                      }}
                      className={FIELD}
                    >
                      <option value="">{tr("join.selectRegion")}</option>
                      {Object.keys(regions).sort().map((name) => (
                        <option key={name} value={name}>
                          {name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={LABEL} htmlFor="district">
                      {tr("join.district")} <span className="text-gold-600">*</span>
                    </label>
                    <select
                      id="district"
                      required
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      disabled={!region}
                      className={cn(FIELD, "disabled:opacity-50")}
                    >
                      <option value="">{tr("join.selectDistrict")}</option>
                      {districts.map((name) => (
                        <option key={name} value={name}>
                          {name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ) : (
                <div>
                  <label className={LABEL} htmlFor="country">
                    {tr("join.country")} <span className="text-gold-600">*</span>
                  </label>
                  <input id="country" name="country" required minLength={2} className={FIELD} />
                </div>
              )}
            </fieldset>

            {/* Photo */}
            <fieldset className="mb-9">
              <legend className="mb-5 font-display text-lg font-bold">{tr("join.photo")}</legend>

              <div className="flex flex-wrap items-center gap-5">
                <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-3xl border-2 border-dashed border-ink-300 bg-ink-50 dark:border-ink-700 dark:bg-ink-800">
                  {photo ? (
                    <Image src={photo} alt="" fill sizes="112px" className="object-cover" unoptimized />
                  ) : (
                    <span className="grid h-full w-full place-items-center text-ink-400">
                      <Camera className="h-8 w-8" />
                    </span>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    capture="user"
                    onChange={onPickPhoto}
                    className="sr-only"
                    id="photo-input"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileRef.current?.click()}
                  >
                    <Upload className="h-4 w-4" />
                    {photo ? tr("join.photoChange") : tr("join.photoChoose")}
                  </Button>
                  <p className="mt-2 text-xs text-ink-500">{tr("join.photoHint")}</p>
                  {photoError && (
                    <p className="mt-2 text-sm font-semibold text-red-600" role="alert">
                      {photoError}
                    </p>
                  )}
                </div>
              </div>
            </fieldset>

            {/* Consent */}
            <label className="mb-7 flex cursor-pointer items-start gap-3 rounded-2xl border border-ink-200/70 p-4 dark:border-ink-800">
              <input
                type="checkbox"
                required
                className="mt-0.5 h-5 w-5 shrink-0 accent-gold-500"
              />
              <span className="text-sm text-ink-600 dark:text-ink-400">{tr("join.consent")}</span>
            </label>

            <AnimatePresence>
              {status.kind === "error" && (
                <motion.p
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  role="alert"
                  className="mb-5 flex items-start gap-2 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-600 dark:text-red-400"
                >
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  {status.message}
                </motion.p>
              )}
            </AnimatePresence>

            <div className="flex flex-wrap items-center gap-4">
              <Button type="submit" size="lg" disabled={status.kind === "sending"}>
                {status.kind === "sending" ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {tr("join.submitting")}
                  </>
                ) : (
                  <>
                    {tr("join.submit")}
                    <Send className="h-4 w-4" />
                  </>
                )}
              </Button>

              <span className="inline-flex items-center gap-2 text-xs text-ink-500">
                <CheckCircle2 className="h-3.5 w-3.5 text-gold-500" />
                {tr("membership.point2")}
              </span>
            </div>
          </form>
        </Reveal>
      </div>
    </Section>
  );
}
