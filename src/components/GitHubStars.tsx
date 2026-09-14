"use client";

import { useEffect, useState } from "react";
import { useT } from "@/lib/i18n/ui";

const REPO = "judegomila/OnCo";
const KEY = "onco:stars";
const TTL = 60 * 60 * 1000;

/** Live GitHub star count for the header, cached for an hour in localStorage. Renders nothing until known. */
export function GitHubStars({ className = "" }: { className?: string }) {
  const [stars, setStars] = useState<number | null>(null);
  const { t } = useT();
  useEffect(() => {
    let cancelled = false;
    const id = requestAnimationFrame(() => {
      try {
        const cached = JSON.parse(localStorage.getItem(KEY) ?? "null") as { n: number; at: number } | null;
        if (cached && Date.now() - cached.at < TTL) { setStars(cached.n); return; }
      } catch { /* ignore */ }
      fetch(`https://api.github.com/repos/${REPO}`, { headers: { Accept: "application/vnd.github+json" } })
        .then((r) => (r.ok ? r.json() : null))
        .then((j: { stargazers_count?: number } | null) => {
          if (cancelled || !j || typeof j.stargazers_count !== "number") return;
          setStars(j.stargazers_count);
          try { localStorage.setItem(KEY, JSON.stringify({ n: j.stargazers_count, at: Date.now() })); } catch { /* ignore */ }
        })
        .catch(() => {});
    });
    return () => { cancelled = true; cancelAnimationFrame(id); };
  }, []);
  if (stars === null) return null;
  const label = stars >= 1000 ? `${(stars / 1000).toFixed(stars >= 10000 ? 0 : 1)}k` : String(stars);
  return (
    <a href={`https://github.com/${REPO}`} rel="noopener" title={t("header.starsTitle", { n: stars.toLocaleString() })} aria-label={t("header.stars", { n: stars.toLocaleString() })}
      className={`ctl px-2 gap-1 text-xs tabular-nums ${className}`}>
      <svg viewBox="0 0 16 16" width="13" height="13" fill="currentColor" aria-hidden><path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.75.75 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z" /></svg>
      {label}
    </a>
  );
}
