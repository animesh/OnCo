"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

/** Plain data for one ranked request. Built on the server from startup-score.ts; no graph access here. */
export type RequestCard = {
  id: string;
  name: string;
  tldr: string;
  href: string;
  chips: Array<{ label: string; href: string; className: string; title?: string }>;
  type: string | null;
  typeLabel: string;
  cost: string | null;
  namesCancer: boolean;
  bottlenecks: Array<{ name: string; href: string }>;
  urgency: number | null;
  commerciality: number | null;
  composite: number | null;
  scored: number;
  total: number;
  dims: Array<{ key: string; axis: "urgency" | "commerciality"; label: string; weight: number; rawText: string; score: number | null; note?: string; sources: Array<{ label: string; href: string; note?: string }> }>;
};

type SortKey = "composite" | "urgency" | "commerciality";
const SORTS: Array<{ value: SortKey; label: string }> = [{ value: "composite", label: "Composite" }, { value: "urgency", label: "Urgency" }, { value: "commerciality", label: "Commerciality" }];
const isSort = (s: string | null): s is SortKey => SORTS.some((o) => o.value === s);

export function ScoreBar({ label, value, tone }: { label: string; value: number | null; tone: string }) {
  return (
    <div className="flex items-center gap-2 text-xs tabular-nums">
      <span className="w-24 shrink-0 text-muted">{label}</span>
      <span className="flex-1 h-1.5 rounded-full bg-foreground/10 overflow-hidden" aria-hidden><span className={`block h-full rounded-full ${tone}`} style={{ width: `${value ?? 0}%` }} /></span>
      <span className="w-8 text-right font-medium">{value === null ? <span className="text-muted font-normal">n/s</span> : value}</span>
    </div>
  );
}

export function StartupRequestBoard({ cards, routes, capitals }: { cards: RequestCard[]; routes: Array<{ value: string; label: string }>; capitals: Array<{ value: string; label: string }> }) {
  const [sort, setSort] = useState<SortKey>("composite");
  const [route, setRoute] = useState("");
  const [capital, setCapital] = useState("");
  const [cancerOnly, setCancerOnly] = useState(false);
  const [synced, setSynced] = useState(false);

  // Static export: read ?sort=, ?route= and ?capital= after mount (next frame, as EntityBrowser does) so the server and first client render agree.
  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      const q = new URLSearchParams(window.location.search);
      const s = q.get("sort");
      if (isSort(s)) setSort(s);
      const r = q.get("route");
      if (r && routes.some((o) => o.value === r)) setRoute(r);
      const c = q.get("capital");
      if (c && capitals.some((o) => o.value === c)) setCapital(c);
      setCancerOnly(q.get("cancer") === "1");
      setSynced(true);
    });
    return () => cancelAnimationFrame(raf);
  }, [routes, capitals]);

  useEffect(() => {
    if (!synced) return;
    const q = new URLSearchParams(window.location.search);
    const set = (k: string, v: string) => (v ? q.set(k, v) : q.delete(k));
    set("sort", sort === "composite" ? "" : sort);
    set("route", route);
    set("capital", capital);
    set("cancer", cancerOnly ? "1" : "");
    const qs = q.toString();
    const next = `${window.location.pathname}${qs ? `?${qs}` : ""}${window.location.hash}`;
    if (next !== window.location.pathname + window.location.search + window.location.hash) window.history.replaceState(window.history.state, "", next);
  }, [synced, sort, route, capital, cancerOnly]);

  const list = useMemo(() => {
    const val = (c: RequestCard) => c[sort] ?? -1;
    return cards
      .filter((c) => (!route || (c.type ?? "none") === route) && (!capital || c.cost === capital) && (!cancerOnly || c.namesCancer))
      .sort((a, b) => val(b) - val(a) || a.name.localeCompare(b.name));
  }, [cards, sort, route, capital, cancerOnly]);

  const sel = "rounded-md border border-border bg-card px-2 py-1 text-sm";
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <label className="flex items-center gap-1.5">Sort by<select className={sel} value={sort} onChange={(e) => setSort(e.target.value as SortKey)}>{SORTS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select></label>
        <label className="flex items-center gap-1.5">Regulatory route<select className={sel} value={route} onChange={(e) => setRoute(e.target.value)}><option value="">Any</option>{routes.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select></label>
        <label className="flex items-center gap-1.5">Capital band<select className={sel} value={capital} onChange={(e) => setCapital(e.target.value)}><option value="">Any</option>{capitals.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select></label>
        <label className="flex items-center gap-1.5"><input type="checkbox" checked={cancerOnly} onChange={(e) => setCancerOnly(e.target.checked)} />Only ideas that name a cancer</label>
        <span className="text-muted ml-auto tabular-nums">{list.length} of {cards.length}</span>
      </div>
      {list.length === 0 && <p className="card p-4 text-sm text-muted">No request matches these filters.</p>}
      <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((c, i) => (
          <li key={c.id} className="card p-4 flex flex-col gap-2">
            <div className="flex items-start gap-2">
              <span className="text-xs text-muted tabular-nums mt-0.5 shrink-0">#{i + 1}</span>
              <Link href={c.href} className="font-medium leading-snug hover:underline">{c.name}</Link>
            </div>
            <p className="text-sm text-muted leading-relaxed">{c.tldr}</p>
            <div className="space-y-1 mt-1">
              <ScoreBar label="Urgency" value={c.urgency} tone="bg-rose-500" />
              <ScoreBar label="Commerciality" value={c.commerciality} tone="bg-sky-500" />
              <ScoreBar label="Composite" value={c.composite} tone="bg-accent" />
            </div>
            <div className="flex flex-wrap gap-1.5 text-xs">
              <span className="chip bg-foreground/5" title="Solution type read from the actor field or the technology records">{c.typeLabel}</span>
              {c.chips.map((ch) => <Link key={ch.label} href={ch.href} title={ch.title} className={`chip inline-flex items-center gap-1 ${ch.className}`}>{ch.label}</Link>)}
            </div>
            {c.bottlenecks.length > 0 && <div className="text-xs text-muted">Attacks {c.bottlenecks.map((b, k) => <span key={b.href}>{k > 0 && ", "}<Link href={b.href} className="underline hover:text-accent">{b.name}</Link></span>)}</div>}
            <details className="text-xs mt-auto">
              <summary className="cursor-pointer text-muted hover:text-foreground">How this was scored ({c.scored} of {c.total} dimensions)</summary>
              <ul className="mt-2 space-y-2">
                {c.dims.map((d) => (
                  <li key={d.key} className="border-l-2 border-border pl-2">
                    <div className="flex items-baseline gap-2"><span className="font-medium">{d.label}</span><span className="text-muted">{d.axis} · weight {d.weight}</span><span className="ml-auto tabular-nums">{d.score === null ? <span className="text-muted italic">not scored</span> : `${d.score}/100`}</span></div>
                    <div className={d.score === null ? "text-muted italic" : ""}>{d.rawText}</div>
                    {d.note && <div className="text-muted">{d.note}</div>}
                    <div className="text-muted">From {d.sources.map((s, k) => <span key={`${s.href}-${k}`}>{k > 0 && ", "}{s.href.startsWith("/") ? <Link href={s.href} className="underline hover:text-accent">{s.label}</Link> : <a href={s.href} target="_blank" rel="noopener noreferrer" className="underline hover:text-accent">{s.label}</a>}{s.note ? ` (${s.note})` : ""}</span>)}</div>
                  </li>
                ))}
              </ul>
            </details>
          </li>
        ))}
      </ol>
    </div>
  );
}
