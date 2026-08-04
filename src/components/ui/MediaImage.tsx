"use client";

import Image from "next/image";
import { useState } from "react";
import { cn, mediaUrl } from "@/lib/utils";

interface MediaImageProps {
  src?: string | null;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  /** Shown when the admin hasn't uploaded an image yet. */
  fallbackLabel?: string;
}

/**
 * Image that degrades to a branded gold placeholder when the admin record has
 * no cover image or the remote file fails to load.
 */
export function MediaImage({
  src,
  alt,
  className,
  sizes = "(max-width: 768px) 100vw, 33vw",
  priority,
  fallbackLabel,
}: MediaImageProps) {
  const resolved = mediaUrl(src);
  const [failed, setFailed] = useState(false);
  const showPlaceholder = !resolved || failed;

  if (showPlaceholder) {
    return (
      <div
        className={cn(
          "relative flex items-center justify-center overflow-hidden",
          "bg-[linear-gradient(135deg,#fff8e7_0%,#fdefc7_45%,#ffe7a3_100%)]",
          "dark:bg-[linear-gradient(135deg,#1e293b_0%,#111827_50%,#0a0f1a_100%)]",
          className,
        )}
        role="img"
        aria-label={alt}
      >
        <span
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, #f5a800 0 2px, transparent 2px 16px)",
          }}
          aria-hidden
        />
        <Image
          src="/images/logo.webp"
          alt=""
          width={120}
          height={120}
          className="relative h-20 w-20 object-contain opacity-40 dark:opacity-30 sm:h-24 sm:w-24"
          aria-hidden
        />
        {fallbackLabel && (
          <span className="absolute bottom-3 text-[0.7rem] font-semibold uppercase tracking-widest text-gold-700/70 dark:text-gold-300/50">
            {fallbackLabel}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={cn("relative overflow-hidden", className)}>
      <Image
        src={resolved}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        onError={() => setFailed(true)}
        className="object-cover transition-transform duration-700 group-hover:scale-[1.06]"
      />
    </div>
  );
}
