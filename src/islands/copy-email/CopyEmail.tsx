"use client";

import { useState } from "react";

/** Copy-to-clipboard with a polite live confirmation (PLAN §7.2 rule 4, §9 aria-live). */
export function CopyEmail({
  email,
  label,
  done,
  className,
}: {
  email: string;
  label: string;
  done: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  return (
    <>
      <button
        type="button"
        className={className}
        data-copied={copied}
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(email);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          } catch {
            window.location.href = `mailto:${email}`;
          }
        }}
      >
        {copied ? done : label}
      </button>
      <span className="visually-hidden" aria-live="polite">
        {copied ? done : ""}
      </span>
    </>
  );
}
