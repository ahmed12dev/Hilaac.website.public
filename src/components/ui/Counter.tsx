"use client";

import { useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/lib/i18n/provider";
import { formatNumber } from "@/lib/utils";

interface CounterProps {
  value: number;
  suffix?: string;
  duration?: number;
  className?: string;
}

/**
 * Counts up to `value` the first time it scrolls into view.
 *
 * Starts at the real number rather than 0 so the server-rendered HTML carries
 * the true figure — search engines and visitors without JavaScript would
 * otherwise read "0 Registered Members". The count-up replays from 0 only on
 * the client, at the moment the element enters the viewport.
 */
export function Counter({ value, suffix = "", duration = 1900, className }: CounterProps) {
  const { locale } = useLanguage();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const reduce = useReducedMotion();
  const [display, setDisplay] = useState(value);
  const animated = useRef(false);

  useEffect(() => {
    if (!inView || animated.current) return;
    animated.current = true;

    if (reduce) {
      setDisplay(value);
      return;
    }

    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      // requestAnimationFrame reports the frame's start time, which can predate
      // the performance.now() captured just above. Without the lower clamp the
      // first tick produces a negative progress, and Math.round then yields -0,
      // which Intl.NumberFormat renders as "-0".
      const progress = Math.min(1, Math.max(0, (now - start) / duration));
      // easeOutExpo — fast then settling, reads as "counting up"
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setDisplay(Math.round(value * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    // Never leave a partial count on screen if this unmounts mid-animation.
    return () => {
      cancelAnimationFrame(frame);
      setDisplay(value);
    };
  }, [inView, value, duration, reduce]);

  return (
    <span ref={ref} className={className}>
      {formatNumber(display, locale)}
      {suffix}
    </span>
  );
}
