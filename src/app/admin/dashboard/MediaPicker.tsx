"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  Check,
  ImagePlus,
  Link2,
  Loader2,
  Search,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Image chooser used by every screen with a cover, photo or logo field.
 *
 * Uploads go to /api/site-admin/media, which stores the bytes in PostgreSQL
 * and hands back a /api/media/:id URL. A plain URL can still be typed in, so
 * images already hosted elsewhere keep working.
 */

export interface MediaItem {
  id: string;
  filename: string;
  mime: string;
  bytes: number;
  alt: string;
  folder: string;
  url: string;
  createdAt: string;
}

const FIELD =
  "w-full rounded-xl border border-white/12 bg-white/5 px-4 py-2.5 text-sm text-white outline-none " +
  "transition-all placeholder:text-ink-500 focus:border-gold-500/70 focus:bg-white/8 focus:ring-4 focus:ring-gold-500/12";

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

/* ───────────────────────── the library dialog ───────────────────────── */

export function MediaLibraryDialog({
  open,
  folder = "general",
  onClose,
  onSelect,
}: {
  open: boolean;
  folder?: string;
  onClose: () => void;
  onSelect?: (item: MediaItem) => void;
}) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/site-admin/media");
      const data = (await res.json()) as { ok?: boolean; items?: MediaItem[] };
      if (data.ok && Array.isArray(data.items)) setItems(data.items);
    } catch {
      setError("Could not load the media library.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) load();
  }, [open, load]);

  const upload = useCallback(
    async (files: FileList | File[]) => {
      const list = Array.from(files);
      if (!list.length) return;

      setUploading(true);
      setError("");
      try {
        const form = new FormData();
        for (const file of list) form.append("file", file);
        form.append("folder", folder);

        const res = await fetch("/api/site-admin/media", { method: "POST", body: form });
        const data = (await res.json()) as {
          ok?: boolean;
          items?: MediaItem[];
          failed?: string[];
          error?: string;
        };

        if (!res.ok || !data.ok || !data.items?.length) {
          setError(data.error ?? "The upload failed.");
          return;
        }
        setItems((prev) => [...data.items!, ...prev]);
        if (data.failed?.length) setError(data.failed.join(" · "));
      } catch {
        setError("Network error during upload.");
      } finally {
        setUploading(false);
      }
    },
    [folder],
  );

  async function remove(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
    await fetch(`/api/site-admin/media?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    }).catch(() => undefined);
  }

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((i) =>
      [i.filename, i.alt, i.folder].join(" ").toLowerCase().includes(q),
    );
  }, [items, query]);

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] overflow-y-auto bg-ink-950/90 p-4 backdrop-blur-sm sm:p-8"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.98 }}
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-label="Media library"
          className="mx-auto w-full max-w-4xl rounded-4xl border border-white/10 bg-ink-900 p-6 sm:p-8"
        >
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-xl font-extrabold">Media library</h2>
              <p className="mt-0.5 text-xs text-ink-400">
                Upload from this computer, or pick an image you have already used.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="grid h-9 w-9 place-items-center rounded-lg text-ink-400 transition hover:bg-white/8 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Drop zone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              if (e.dataTransfer.files?.length) upload(e.dataTransfer.files);
            }}
            className={cn(
              "rounded-3xl border-2 border-dashed p-7 text-center transition-colors",
              dragging
                ? "border-gold-500/70 bg-gold-500/10"
                : "border-white/12 bg-white/[0.02] hover:border-gold-500/40",
            )}
          >
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.length) upload(e.target.files);
                e.target.value = "";
              }}
            />
            {uploading ? (
              <>
                <Loader2 className="mx-auto h-8 w-8 animate-spin text-gold-400" />
                <p className="mt-2 text-sm font-semibold">Uploading…</p>
              </>
            ) : (
              <>
                <Upload className="mx-auto h-8 w-8 text-ink-500" />
                <p className="mt-2 text-sm font-semibold">
                  Drag images here, or{" "}
                  <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    className="text-gold-400 underline underline-offset-2 hover:text-gold-300"
                  >
                    browse your computer
                  </button>
                </p>
                <p className="mt-1 text-xs text-ink-500">
                  JPG, PNG, WebP, GIF or AVIF · up to 5 MB each
                </p>
              </>
            )}
          </div>

          {error && (
            <p className="mt-4 flex items-center gap-2 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-300">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </p>
          )}

          {items.length > 0 && (
            <div className="relative mt-5">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-[17px] w-[17px] -translate-y-1/2 text-ink-500" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search the library…"
                className={cn(FIELD, "pl-11")}
              />
            </div>
          )}

          <div className="mt-5 max-h-[46vh] overflow-y-auto">
            {loading ? (
              <p className="py-10 text-center text-sm text-ink-500">
                <Loader2 className="mx-auto h-6 w-6 animate-spin text-gold-400" />
              </p>
            ) : visible.length === 0 ? (
              <p className="py-10 text-center text-sm text-ink-500">
                {items.length ? "No images match that search." : "The library is empty so far."}
              </p>
            ) : (
              <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {visible.map((item) => (
                  <li
                    key={item.id}
                    className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        onSelect?.(item);
                        onClose();
                      }}
                      className="block w-full text-left"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.url}
                        alt={item.alt || item.filename}
                        loading="lazy"
                        className="aspect-square w-full object-cover transition-transform group-hover:scale-105"
                      />
                      <span className="block truncate px-2.5 py-2 text-[0.68rem] font-semibold text-ink-300">
                        {item.filename}
                      </span>
                      <span className="block px-2.5 pb-2 text-[0.6rem] text-ink-500">
                        {formatBytes(item.bytes)}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(item.id)}
                      aria-label={`Delete ${item.filename}`}
                      className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-lg bg-ink-950/80 text-ink-300 opacity-0 transition hover:text-red-400 group-hover:opacity-100"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ───────────────────────── the field itself ───────────────────────── */

export function MediaPicker({
  value,
  onChange,
  folder = "general",
  label,
  id,
}: {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  label?: string;
  id?: string;
}) {
  const [open, setOpen] = useState(false);
  const [typing, setTyping] = useState(false);

  return (
    <div>
      {label && (
        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-ink-400">
          {label}
        </span>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <span className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-2xl border border-white/12 bg-white/[0.03]">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" className="h-full w-full object-cover" />
          ) : (
            <ImagePlus className="h-6 w-6 text-ink-600" />
          )}
        </span>

        <div className="flex flex-1 flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-gold-gradient px-4 py-2 text-xs font-bold text-ink-900 shadow-gold transition-transform hover:-translate-y-0.5"
          >
            <Upload className="h-3.5 w-3.5" />
            {value ? "Change image" : "Upload or choose"}
          </button>

          <button
            type="button"
            onClick={() => setTyping((v) => !v)}
            className="inline-flex items-center gap-2 rounded-xl border border-white/12 px-3.5 py-2 text-xs font-semibold text-ink-300 transition hover:bg-white/6"
          >
            <Link2 className="h-3.5 w-3.5" />
            Use a link
          </button>

          {value && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="inline-flex items-center gap-2 rounded-xl border border-white/12 px-3.5 py-2 text-xs font-semibold text-ink-300 transition hover:border-red-500/50 hover:text-red-400"
            >
              <X className="h-3.5 w-3.5" />
              Remove
            </button>
          )}
        </div>
      </div>

      {(typing || (value && !value.startsWith("/api/media/"))) && (
        <input
          id={id}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://… or /images/…"
          className={cn(FIELD, "mt-3")}
        />
      )}

      {value?.startsWith("/api/media/") && (
        <p className="mt-2 flex items-center gap-1.5 text-[0.7rem] font-semibold text-emerald-400">
          <Check className="h-3 w-3" />
          Stored in your media library
        </p>
      )}

      <MediaLibraryDialog
        open={open}
        folder={folder}
        onClose={() => setOpen(false)}
        onSelect={(item) => onChange(item.url)}
      />
    </div>
  );
}
