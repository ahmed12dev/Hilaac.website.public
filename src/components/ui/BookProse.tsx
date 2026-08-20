"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";

/**
 * Long-form text set for reading.
 *
 * Keeps the shape the author typed: a blank line starts a new paragraph, and a
 * single newline inside one becomes a line break — which is what numbered
 * clauses and addresses need. Shared by the constitution reader and the About
 * page so both read the same way.
 */
export function BookProse({
  text,
  dropCap = false,
  className,
}: {
  text: string;
  /** Opening capital, as a printed charter has. Use once per page. */
  dropCap?: boolean;
  className?: string;
}) {
  const paragraphs = useMemo(
    () =>
      text
        .replace(/\r\n/g, "\n")
        .split(/\n\s*\n/)
        .filter((p) => p.trim()),
    [text],
  );

  if (!paragraphs.length) return null;

  return (
    <div className={cn("book-prose", dropCap && "book-prose--drop", className)}>
      {paragraphs.map((para, i) => (
        <p key={i}>
          {para.split("\n").map((line, j, all) => (
            <span key={j}>
              {line}
              {j < all.length - 1 && <br />}
            </span>
          ))}
        </p>
      ))}
    </div>
  );
}
