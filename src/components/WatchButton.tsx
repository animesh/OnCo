"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchEntityDates, isWatched, markSeen, storageBlocked, unwatch, watch } from "@/lib/watchlist";
import { useT } from "@/lib/i18n/ui";

/**
 * Star an object to watch it. The watchlist lives in localStorage; /saved/ shows what changed since you last
 * looked by comparing the record's `asOf` and provenance dates with the ones stored here. Visiting a watched
 * page marks it as seen. `asOf` and `route` are optional: when absent they are read from the entity JSON and
 * the current URL, so the button works wherever it is mounted.
 */
export function WatchButton({ id, kind, name, route, asOf, className = "" }: { id: string; kind: string; name: string; route?: string; asOf?: string; className?: string }) {
  const [on, setOn] = useState(false);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const { t } = useT();

  useEffect(() => {
    const raf = requestAnimationFrame(async () => {
      const watched = isWatched(id);
      setOn(watched); setReady(true);
      if (watched) { const dates = await fetchEntityDates(id); markSeen(id, dates ?? { asOf }); }
    });
    const onChange = () => setOn(isWatched(id));
    window.addEventListener("onco:watchlist", onChange);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("onco:watchlist", onChange); };
  }, [id, asOf]);

  useEffect(() => { if (!note) return; const t = setTimeout(() => setNote(null), 4000); return () => clearTimeout(t); }, [note]);

  const toggle = async () => {
    if (on) { unwatch(id); setNote(t("watch.removed")); return; }
    setBusy(true);
    const dates = asOf ? { asOf, edited: undefined as string | undefined } : await fetchEntityDates(id);
    watch({ id, kind, name, route: route ?? window.location.pathname, asOf: dates?.asOf ?? asOf, edited: dates?.edited });
    setBusy(false); setNote(t("watch.added"));
  };

  return (
    <span className={`inline-flex flex-wrap items-center gap-2 ${className}`}>
      <button type="button" onClick={toggle} disabled={busy || !ready} aria-pressed={on}
        title={on ? t("watch.titleOn") : t("watch.title")}
        className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs transition-colors ${on ? "border-accent bg-accent-soft text-accent" : "border-border bg-card hover:bg-surface"}`}>
        <span aria-hidden>{on ? "★" : "☆"}</span>
        <span>{on ? t("watch.watching") : t("watch.watch")}</span>
      </button>
      {on && !storageBlocked && <Link href="/saved/" className="text-xs text-muted underline hover:text-foreground">{t("watch.saved")}</Link>}
      {on && storageBlocked && <span className="text-xs text-muted">{t("watch.blocked")}</span>}
      <a href="/feeds/changelog.xml" className="text-xs text-muted underline hover:text-foreground" title={t("watch.feedTitle")}>{t("watch.feed")}</a>
      <span role="status" aria-live="polite" className={`basis-full text-xs ${note ? "text-accent" : "sr-only"}`}>{note ?? ""}</span>
    </span>
  );
}
