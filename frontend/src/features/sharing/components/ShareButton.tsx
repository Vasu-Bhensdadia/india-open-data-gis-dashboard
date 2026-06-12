"use client";

import { useState, useCallback } from "react";

/**
 * ShareButton — copies the current page URL to the clipboard.
 *
 * States:
 * - idle: shows link icon + "Share" label
 * - copied: shows check icon + "Copied!" for 2s, then resets
 * - error: shows X icon + "Failed" for 2s, then resets
 */
export function ShareButton() {
  const [status, setStatus] = useState<"idle" | "copied" | "error">("idle");

  const handleShare = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setStatus("copied");
    } catch {
      setStatus("error");
    } finally {
      setTimeout(() => setStatus("idle"), 2000);
    }
  }, []);

  const isCopied = status === "copied";
  const isError = status === "error";

  return (
    <button
      id="dashboard-share-button"
      type="button"
      onClick={handleShare}
      aria-label="Copy shareable dashboard link to clipboard"
      className={[
        "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5",
        "text-xs font-medium transition-all duration-200",
        "ring-1 focus-visible:outline-none focus-visible:ring-2",
        isCopied
          ? "bg-emerald-50 text-emerald-700 ring-emerald-200 hover:bg-emerald-100"
          : isError
            ? "bg-rose-50 text-rose-700 ring-rose-200 hover:bg-rose-100"
            : "bg-white text-zinc-600 ring-zinc-200 hover:bg-zinc-50 hover:text-zinc-900 hover:ring-zinc-300",
      ].join(" ")}
    >
      {/* Icon */}
      {isCopied ? (
        <CheckIcon />
      ) : isError ? (
        <XIcon />
      ) : (
        <LinkIcon />
      )}

      {/* Label */}
      <span>
        {isCopied ? "Copied!" : isError ? "Failed" : "Share"}
      </span>
    </button>
  );
}

// ───────────────────────────────────────────────────────────────────────────────
// Micro icons (inline SVG — no extra dep)
// ───────────────────────────────────────────────────────────────────────────────

function LinkIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-3.5 w-3.5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-3.5 w-3.5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-3.5 w-3.5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
