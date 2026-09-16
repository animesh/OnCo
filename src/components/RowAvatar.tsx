"use client";

import { useState } from "react";

/** Deterministic soft background for an initials tile, so the same organisation always gets the same tint. */
function tint(name: string): string {
  let h = 0; for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const hues = [340, 20, 45, 160, 200, 230, 270, 300];
  return `hsl(${hues[h % hues.length]} 55% 92%)`;
}

/**
 * Logo or portrait beside a table row's name. Shows initials when there is no image, when the image fails,
 * or when a hotlinked favicon turns out to be the 16 px generic globe a favicon service returns for sites
 * without one, so no row is left blank or carrying a placeholder that is not the organisation's own.
 */
export function RowAvatar({ src, name, round = false }: { src?: string; name: string; round?: boolean }) {
  const [failed, setFailed] = useState(false);
  const initials = name.replace(/\(.*?\)/g, "").split(/[\s/–-]+/).filter((w) => /[A-Za-z0-9]/.test(w)).slice(0, 2).map((w) => w[0]!.toUpperCase()).join("");
  const shape = round ? "rounded-full" : "rounded-md";
  const show = src && !failed;
  return (
    <span className={`relative inline-flex h-7 w-7 shrink-0 items-center justify-center border border-border overflow-hidden ${shape}`} style={show ? { background: "white" } : { background: tint(name) }} aria-hidden="true">
      {!show && <span className="text-[10px] font-semibold text-foreground/70 leading-none">{initials}</span>}
      {show && (
        // eslint-disable-next-line @next/next/no-img-element -- self-hosted or hotlinked icon, never optimised
        <img src={src} alt="" className={round ? "h-full w-full object-cover" : "h-[70%] w-[70%] object-contain"} loading="lazy" referrerPolicy="no-referrer"
          onError={() => setFailed(true)} onLoad={(e) => { if (e.currentTarget.naturalWidth > 0 && e.currentTarget.naturalWidth <= 16) setFailed(true); }} />
      )}
    </span>
  );
}
