"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  Check,
  Copy,
  HardDrive,
  Image as ImageIcon,
  Loader2,
  Search,
  Trash2,
  Upload,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { cn, formatDate } from "@/lib/utils";
import { formatBytes, type MediaItem } from "../MediaPicker";
import { useAdminText } from "../useAdminText";

/**
 * The media library as a full screen: upload here once, then pick the same
 * image from any content editor.
 */
export function MediaManager() {
  const { at } = useAdminText();
  const [items, setItems] = useState<MediaItem[]>([]);
  const [folders, setFolders] = useState<string[]>([]);
  const [folder, setFolder] = useState("all");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/site-admin/media");
      const data = (await res.json()) as {
        ok?: boolean;
        items?: MediaItem[];
        folders?: string[];
        error?: string;
      };
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Could not load the library.");
        return;
      }
      setItems(data.items ?? []);
      setFolders(data.folders ?? []);
    } catch {
      setError("Network error.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function upload(files: FileList | File[]) {
    const list = Array.from(files);
    if (!list.length) return;

    setUploading(true);
    setError("");
    try {
      const form = new FormData();
      for (const file of list) form.append("file", file);
      form.append("folder", folder === "all" ? "general" : folder);

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
  }

  async function remove(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
    setConfirmId(null);
    await fetch(`/api/site-admin/media?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    }).catch(() => undefined);
  }

  async function copyUrl(item: MediaItem) {
    const absolute = `${window.location.origin}${item.url}`;
    try {
      await navigator.clipboard.writeText(absolute);
      setCopied(item.id);
      window.setTimeout(() => setCopied(null), 2000);
    } catch {
      setError("Your browser blocked the clipboard.");
    }
  }

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((i) => {
      if (folder !== "all" && i.folder !== folder) return false;
      if (!q) return true;
      return [i.filename, i.alt, i.folder].join(" ").toLowerCase().includes(q);
    });
  }, [items, folder, query]);

  const totalBytes = items.reduce((sum, i) => sum + i.bytes, 0);

  return (
    <div className="space-y-7">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold sm:text-3xl">{at("media.title")}</h1>
          <p className="mt-1.5 text-sm text-ink-400">
            {items.length} {at("media.images")} · {formatBytes(totalBytes)} {at("media.stored")}
          </p>
        </div>

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
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="inline-flex items-center gap-2 rounded-xl bg-gold-gradient px-5 py-2.5 text-sm font-bold text-ink-900 shadow-gold transition-transform hover:-translate-y-0.5 disabled:opacity-60"
        >
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          {uploading ? at("media.uploading") : at("media.upload")}
        </button>
      </header>

      {error && (
        <p className="flex items-center gap-2 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-300">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </p>
      )}

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
          "rounded-3xl border-2 border-dashed p-8 text-center transition-colors",
          dragging
            ? "border-gold-500/70 bg-gold-500/10"
            : "border-white/12 bg-white/[0.02] hover:border-gold-500/40",
        )}
      >
        <HardDrive className="mx-auto h-8 w-8 text-ink-500" />
        <p className="mt-2 text-sm font-semibold">{at("media.dragHere")}</p>
        <p className="mt-1 text-xs text-ink-500">
          {at("media.formats")}
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-[17px] w-[17px] -translate-y-1/2 text-ink-500" />
          <label htmlFor="media-search" className="sr-only">
            {at("common.search")}
          </label>
          <input
            id="media-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={at("media.searchPlaceholder")}
            className="w-full rounded-xl border border-white/12 bg-white/5 py-2.5 pl-11 pr-4 text-sm text-white outline-none placeholder:text-ink-500 focus:border-gold-500/70"
          />
        </div>

        <div className="rounded-xl border border-white/12 bg-white/5 px-3">
          <label htmlFor="media-folder" className="sr-only">
            {at("media.allFolders")}
          </label>
          <select
            id="media-folder"
            value={folder}
            onChange={(e) => setFolder(e.target.value)}
            className="bg-transparent py-2.5 text-sm text-white outline-none"
          >
            <option value="all" className="bg-ink-900">
              {at("media.allFolders")}
            </option>
            {folders.map((f) => (
              <option key={f} value={f} className="bg-ink-900">
                {f}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <p className="py-16 text-center">
          <Loader2 className="mx-auto h-7 w-7 animate-spin text-gold-400" />
        </p>
      ) : visible.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-white/12 py-16 text-center">
          <ImageIcon className="mx-auto mb-4 h-10 w-10 text-ink-600" />
          <p className="font-semibold">
            {items.length ? at("common.noMatches") : at("media.noneYet")}
          </p>
          {!items.length && (
            <p className="mt-1 text-sm text-ink-500">
              {at("media.noneHint")}
            </p>
          )}
        </div>
      ) : (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {visible.map((item) => (
            <li
              key={item.id}
              className="group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] transition-colors hover:border-gold-500/30"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.url}
                alt={item.alt || item.filename}
                loading="lazy"
                className="aspect-square w-full object-cover"
              />
              <div className="p-3">
                <p className="truncate text-xs font-semibold">{item.filename}</p>
                <p className="mt-0.5 text-[0.65rem] text-ink-500">
                  {formatBytes(item.bytes)} · {item.folder} · {formatDate(item.createdAt, "en")}
                </p>
                <div className="mt-2.5 flex gap-2">
                  <button
                    type="button"
                    onClick={() => copyUrl(item)}
                    className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-white/10 py-1.5 text-[0.65rem] font-bold text-ink-300 transition hover:border-gold-500/50 hover:text-gold-300"
                  >
                    {copied === item.id ? (
                      <>
                        <Check className="h-3 w-3" /> {at("media.copied")}
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" /> {at("media.copyLink")}
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmId(item.id)}
                    aria-label={`${at("common.delete")} ${item.filename}`}
                    className="grid h-7 w-7 place-items-center rounded-lg border border-white/10 text-ink-300 transition hover:border-red-500/50 hover:text-red-400"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <AnimatePresence>
        {confirmId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setConfirmId(null)}
            className="fixed inset-0 z-50 grid place-items-center bg-ink-950/80 p-5 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.96, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.96, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              className="w-full max-w-sm rounded-3xl border border-red-500/25 bg-ink-900 p-6 text-center"
            >
              <span className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-red-500/12 text-red-400">
                <Trash2 className="h-5 w-5" />
              </span>
              <h2 className="font-display text-lg font-bold">{at("media.deleteTitle")}</h2>
              <p className="mt-2 text-sm text-ink-400">
                {at("media.deleteText")}
              </p>
              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => setConfirmId(null)}
                  className="flex-1 rounded-xl border border-white/12 px-4 py-2.5 text-sm font-semibold text-ink-300 transition hover:bg-white/6"
                >
                  {at("common.cancel")}
                </button>
                <button
                  type="button"
                  onClick={() => remove(confirmId)}
                  className="flex-1 rounded-xl bg-red-500/90 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-red-500"
                >
                  {at("common.delete")}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
