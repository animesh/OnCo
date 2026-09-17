"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { STATUS_LABEL, statusClass } from "@/lib/text";
import { useAnimationBudget, useMotionSnapshot } from "@/lib/use-animation-budget";

export type TLApproval = { year: number; drug: string; route: string; region: string; indication: string };
export type TLTrial = { year: number; name: string; route: string; status?: string; cancers: string[] };
export type TLHistory = { year: number; cancer: string; cancerRoute: string; title: string; note?: string; refs: Array<{ name: string; route: string }> };
export type TLStep = { start: number; end: number; era: string; title: string; roadmap: string; route: string; status: string };
export type TimelineData = { approvals: TLApproval[]; trials: TLTrial[]; history: TLHistory[]; steps: TLStep[]; min: number; max: number };

/** Year slider: the state of oncology as of year Y, derived from dated records in the corpus. */
export function TimelineScrubber({ data }: { data: TimelineData }) {
  const [year, setYear] = useState(2026);
  const [playing, setPlaying] = useState(false);
  const timer = useRef<number | null>(null);
  // Shared animation budget: the year ticker waits while the tab is hidden or the controls are off screen, then resumes.
  const controls = useRef<HTMLDivElement>(null);
  const motion = useMotionSnapshot(useAnimationBudget(controls, { wakeOnHover: false }));
  const ticking = playing && motion.visible && !motion.hidden;

  useEffect(() => {
    if (!ticking) { if (timer.current) window.clearInterval(timer.current); timer.current = null; return; }
    timer.current = window.setInterval(() => setYear((y) => (y >= data.max ? (setPlaying(false), y) : y + 1)), 700);
    return () => { if (timer.current) window.clearInterval(timer.current); };
  }, [ticking, data.max]);

  const approvalsToDate = useMemo(() => data.approvals.filter((a) => a.year <= year), [data, year]);
  const newThisYear = approvalsToDate.filter((a) => a.year === year);
  const firstApprovals = useMemo(() => { const seen = new Set<string>(); return approvalsToDate.filter((a) => (seen.has(a.drug) ? false : (seen.add(a.drug), true))); }, [approvalsToDate]);
  const trialsToDate = data.trials.filter((t) => t.year <= year);
  const trialsThisYear = trialsToDate.filter((t) => t.year === year);
  const historyThisYear = data.history.filter((h) => h.year === year);
  const nearby = data.history.filter((h) => Math.abs(h.year - year) <= 2 && h.year !== year).sort((a, b) => a.year - b.year);
  const activeSteps = data.steps.filter((s) => s.start <= year && year <= s.end);

  // Derived "standard of care as of Y": for each cancer, the latest history event at or before Y that carries refs.
  const socAsOf = useMemo(() => {
    const byCancer = new Map<string, TLHistory>();
    for (const h of data.history) if (h.year <= year && h.refs.length && (!byCancer.has(h.cancer) || byCancer.get(h.cancer)!.year <= h.year)) byCancer.set(h.cancer, h);
    return [...byCancer.values()].sort((a, b) => a.cancer.localeCompare(b.cancer));
  }, [data, year]);

  const ticks = [1940, 1950, 1960, 1970, 1980, 1990, 2000, 2010, 2020, 2030];

  return (
    <div>
      <div ref={controls} className="card p-4 sticky top-14 z-30 bg-card/95 backdrop-blur">
        <div className="flex items-center gap-4">
          <button type="button" onClick={() => setPlaying((p) => !p)} className="rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-foreground/5">{playing ? "Pause" : "Play"}</button>
          <div className="text-3xl font-semibold tabular-nums w-20">{year}</div>
          <input type="range" min={data.min} max={data.max} value={year} onChange={(e) => { setPlaying(false); setYear(Number(e.target.value)); }} className="flex-1 accent-[var(--accent)]" aria-label="Year" />
          <div className="hidden sm:flex gap-1">{[1998, 2011, 2017, 2022, 2026].map((y) => <button key={y} type="button" onClick={() => { setPlaying(false); setYear(y); }} className={`chip border ${year === y ? "bg-foreground text-background border-foreground" : "bg-card border-border hover:bg-foreground/5"}`}>{y}</button>)}</div>
        </div>
        <div className="relative mt-2 h-4 text-[10px] text-muted">{ticks.map((t) => <span key={t} className="absolute -translate-x-1/2" style={{ left: `${((t - data.min) / (data.max - data.min)) * 100}%` }}>{t}</span>)}</div>
        <div className="grid grid-cols-3 gap-3 mt-2 text-sm">
          <Stat n={firstApprovals.length} label="products approved to date" />
          <Stat n={trialsToDate.length} label="landmark trials reported to date" />
          <Stat n={activeSteps.length} label="roadmap eras active" />
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2 mt-8">
        <section>
          <h2 className="text-lg font-semibold mb-2">This year: {year}</h2>
          {newThisYear.length === 0 && historyThisYear.length === 0 && trialsThisYear.length === 0 && <p className="text-sm text-muted">No dated approvals, trial readouts, or history events recorded for {year}. Nearby: {nearby.slice(0, 3).map((h) => `${h.year} ${h.title}`).join("; ") || "none"}.</p>}
          {newThisYear.length > 0 && <Block title={`Approvals (${newThisYear.length})`}>{newThisYear.map((a, i) => <li key={i}><Link href={a.route} className="font-medium hover:underline">{a.drug}</Link> <span className="text-muted">· {a.region} · {a.indication}</span></li>)}</Block>}
          {trialsThisYear.length > 0 && <Block title={`Trials reported (${trialsThisYear.length})`}>{trialsThisYear.map((t) => <li key={t.route}><Link href={t.route} className="font-medium hover:underline">{t.name}</Link> {t.status && <span className={`chip ${statusClass(t.status)}`}>{STATUS_LABEL[t.status] ?? t.status}</span>} <span className="text-muted">· {t.cancers.join(", ")}</span></li>)}</Block>}
          {historyThisYear.length > 0 && <Block title={`History events (${historyThisYear.length})`}>{historyThisYear.map((h, i) => <li key={i}><Link href={h.cancerRoute} className="text-muted hover:underline">{h.cancer}</Link>: <span className="font-medium">{h.title}</span>{h.note && <span className="text-muted"> · {h.note}</span>}{h.refs.length > 0 && <span className="ml-1">{h.refs.map((r) => <Link key={r.route} href={r.route} className="chip bg-foreground/5 mr-1 hover:underline">{r.name}</Link>)}</span>}</li>)}</Block>}
          <Block title={`Roadmap eras active (${activeSteps.length})`}>{activeSteps.map((s, i) => <li key={i}><Link href={s.route} className="hover:underline"><span className="text-muted">{s.roadmap} · {s.era}:</span> <span className="font-medium">{s.title}</span></Link> <span className={`chip ${statusClass(s.status === "current" ? "approved" : s.status === "emerging" ? "phase-2" : s.status === "speculative" ? "concept" : "historic")}`}>{s.status}</span></li>)}</Block>
        </section>
        <section>
          <h2 className="text-lg font-semibold mb-2">Standard of care in {year} <span className="text-xs text-muted font-normal">derived</span></h2>
          <p className="text-xs text-muted mb-3">Best effort: for each cancer, the most recent dated history event at or before {year} that references products or technologies. Not a guideline; see each cancer page for the current standard of care.</p>
          <ul className="space-y-2 text-sm">
            {socAsOf.map((h) => <li key={h.cancer} className="card p-3"><Link href={h.cancerRoute} className="font-medium hover:underline">{h.cancer}</Link> <span className="text-muted">({h.year}) · </span>{h.title}<div className="mt-1 flex flex-wrap gap-1">{h.refs.map((r) => <Link key={r.route} href={r.route} className="chip bg-foreground/5 hover:underline">{r.name}</Link>)}</div></li>)}
            {socAsOf.length === 0 && <li className="text-muted">Nothing dated at or before {year}.</li>}
          </ul>
        </section>
      </div>

      <section className="mt-10">
        <h2 className="text-lg font-semibold mb-2">All products approved by {year} ({firstApprovals.length})</h2>
        <div className="flex flex-wrap gap-1.5">{firstApprovals.sort((a, b) => a.year - b.year).map((a) => <Link key={a.drug} href={a.route} className={`chip border ${a.year === year ? "bg-accent text-white border-accent" : "bg-card border-border hover:bg-foreground/5"}`}>{a.drug} <span className="opacity-70 ml-1">{a.year}</span></Link>)}</div>
      </section>
    </div>
  );
}

function Stat({ n, label }: { n: number; label: string }) {
  return <div><div className="text-xl font-semibold tabular-nums">{n}</div><div className="text-xs text-muted">{label}</div></div>;
}
function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="mt-4"><div className="kicker mb-1.5">{title}</div><ul className="space-y-1.5 text-sm">{children}</ul></div>;
}
