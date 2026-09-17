"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { GuidelineChange, GuidelineVersion } from "@/data/guideline-versions";
import { diffVersions } from "@/lib/guidelines-shared";

/** Two-version diff: pick a "from" and a "to" version and see every row added, removed or recategorised between them. */
export type RefLite = { id: string; name: string; route: string };

const KIND_STYLE = {
  added: { label: "Added", cls: "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-100", sign: "+" },
  removed: { label: "Removed", cls: "bg-rose-100 text-rose-900 dark:bg-rose-900/40 dark:text-rose-100", sign: "−" },
  recategorised: { label: "Recategorised", cls: "bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-100", sign: "↔" },
} as const;

function ChangeRow({ c, refs }: { c: GuidelineChange; refs: Record<string, RefLite> }) {
  const k = KIND_STYLE[c.kind];
  return (
    <li className="flex gap-3 py-2.5 border-b border-border last:border-0">
      <span className={`chip shrink-0 mt-0.5 ${k.cls}`} aria-label={k.label}><span aria-hidden className="font-bold">{k.sign}</span> {k.label}</span>
      <div className="min-w-0 text-sm">
        <div className="text-xs text-muted">{c.setting}</div>
        <div>{c.text}</div>
        {c.kind === "recategorised" && c.from && c.to && <div className="text-xs mt-1"><span className="text-muted line-through">{c.from}</span> <span aria-hidden>→</span> <span className="font-medium">{c.to}</span></div>}
        {c.refs.length > 0 && <div className="mt-1.5 flex flex-wrap gap-1">{c.refs.map((id) => refs[id] ? <Link key={id} href={refs[id].route} className="chip border bg-card border-border text-[11px] hover:bg-foreground/5">{refs[id].name}</Link> : null)}</div>}
      </div>
    </li>
  );
}

export function VersionDiff({ versions, refs }: { versions: GuidelineVersion[]; refs: Record<string, RefLite> }) {
  const sorted = useMemo(() => versions.slice().sort((a, b) => a.date.localeCompare(b.date)), [versions]);
  const [from, setFrom] = useState<string>(sorted.length > 1 ? sorted[Math.max(0, sorted.length - 3)].id : "");
  const [to, setTo] = useState<string>(sorted[sorted.length - 1]?.id ?? "");
  const diff = useMemo(() => diffVersions(sorted, from || null, to), [sorted, from, to]);
  const label = (v: GuidelineVersion) => `${v.date} · ${v.body} · ${v.version}`;
  const fromV = sorted.find((v) => v.id === from), toV = sorted.find((v) => v.id === to);
  const invalid = fromV && toV && fromV.date > toV.date;

  return (
    <div className="card p-4 sm:p-5">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm"><span className="kicker block mb-1">From (exclusive)</span>
          <select value={from} onChange={(e) => setFrom(e.target.value)} className="w-full rounded-lg border border-border bg-card px-3 py-1.5 text-sm">
            <option value="">Start of history</option>
            {sorted.map((v) => <option key={v.id} value={v.id}>{label(v)}</option>)}
          </select>
        </label>
        <label className="text-sm"><span className="kicker block mb-1">To (inclusive)</span>
          <select value={to} onChange={(e) => setTo(e.target.value)} className="w-full rounded-lg border border-border bg-card px-3 py-1.5 text-sm">
            {sorted.map((v) => <option key={v.id} value={v.id}>{label(v)}</option>)}
          </select>
        </label>
      </div>
      {invalid ? <p className="mt-4 text-sm text-rose-700 dark:text-rose-300">The &ldquo;from&rdquo; version is later than the &ldquo;to&rdquo; version; swap them.</p> : (
        <>
          <div className="mt-4 flex flex-wrap gap-3 text-sm">
            <span className="chip bg-emerald-100 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-100 tabular-nums">{diff.added.length ? "+" : ""}{diff.added.length} added</span>
            <span className="chip bg-rose-100 text-rose-900 dark:bg-rose-900/40 dark:text-rose-100 tabular-nums">{diff.removed.length ? "−" : ""}{diff.removed.length} removed</span>
            <span className="chip bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-100 tabular-nums">↔ {diff.recategorised.length} recategorised</span>
            <span className="text-muted">across {diff.versions.length} version{diff.versions.length === 1 ? "" : "s"}</span>
          </div>
          {diff.versions.length === 0 ? <p className="mt-3 text-sm text-muted">No versions in that range.</p> : (
            <ul className="mt-3">
              {[...diff.recategorised, ...diff.added, ...diff.removed].map((c, i) => <ChangeRow key={i} c={c} refs={refs} />)}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
