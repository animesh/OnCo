"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { FIGURE, type BodyRegion } from "@/data/body-regions";
import { useAnimationBudget, useMotionSnapshot } from "@/lib/use-animation-budget";

export type BodyCancer = { id: string; name: string; tldr: string; route: string; products: number };
export type BodyTech = { id: string; name: string; tldr: string; route: string; status?: string };

type Props = { regions: BodyRegion[]; cancers: Record<string, BodyCancer>; technologies: Record<string, BodyTech> };
type Mode = "cancers" | "technologies";
type Sex = "female" | "male";

const W = 400, H = 980;

const CSS = `
.bm-figure { color: var(--foreground); }
.bm-organ { transition: fill-opacity .18s ease, stroke-width .18s ease, filter .18s ease; }
.bm-region { outline: none; cursor: pointer; }
.bm-region:focus-visible .bm-organ { stroke: var(--accent); stroke-width: 2.5; }
.bm-lungs { transform-origin: 200px 280px; animation: bm-breathe 5.2s ease-in-out infinite; }
.bm-heart { transform-origin: 209px 286px; animation: bm-pulse 1.9s ease-in-out infinite; }
@keyframes bm-breathe { 0%,100% { transform: scale(1); } 50% { transform: scale(1.025); } }
@keyframes bm-pulse { 0%,100% { transform: scale(1); } 12% { transform: scale(1.05); } 24% { transform: scale(1); } 36% { transform: scale(1.03); } 48% { transform: scale(1); } }
@media (prefers-reduced-motion: reduce) { .bm-lungs, .bm-heart { animation: none; } .bm-organ { transition: none; } }
`;

/**
 * Anatomical front-view body map drawn to the eight-head canon in the site's line-art style.
 * Organs are the clickable regions (fill or wide stroke for tubes and bones). Mode "cancers"
 * shows where cancers arise; "technologies" where local technologies (imaging, ablation,
 * radiation, surgery) apply. Labels sit in the margins with leader lines so nothing overlaps.
 */
export function BodyMap({ regions, cancers, technologies }: Props) {
  const [mode, setMode] = useState<Mode>("cancers");
  const [sex, setSex] = useState<Sex>("female");
  const [active, setActive] = useState<string | null>(null);
  const [pinned, setPinned] = useState<string | null>(null);
  // The breathing lungs and beating heart (CSS keyframes) pause while the figure is off screen or the tab is hidden.
  const figure = useRef<HTMLDivElement>(null);
  const motion = useMotionSnapshot(useAnimationBudget(figure, { wakeOnHover: false }));

  const visible = useMemo(() => regions.filter((r) => !r.sex || r.sex === sex), [regions, sex]);
  const shown = pinned ?? active;
  const region = visible.find((r) => r.id === shown) ?? null;
  const counts = useMemo(() => Object.fromEntries(visible.map((r) => [r.id, mode === "cancers" ? r.cancers.length : r.technologies.length])), [visible, mode]);
  const max = Math.max(1, ...Object.values(counts));
  const tint = mode === "cancers" ? "#e11d48" : "#0284c7";

  const labelX = (side: "L" | "R") => (side === "L" ? 8 : W - 8);
  const elbowX = (side: "L" | "R") => (side === "L" ? 92 : W - 92);

  return (
    <div className="grid gap-6 lg:grid-cols-[440px_1fr]">
      <style>{CSS}</style>
      <div ref={figure} data-motion-paused={motion.active ? undefined : ""} className="card p-3">
        <div className="flex flex-wrap items-center gap-1 mb-2 text-sm">
          <button type="button" onClick={() => setMode("cancers")} aria-pressed={mode === "cancers"} className={`chip border ${mode === "cancers" ? "bg-foreground text-background border-foreground" : "bg-card border-border hover:bg-foreground/5"}`}>Where cancers arise</button>
          <button type="button" onClick={() => setMode("technologies")} aria-pressed={mode === "technologies"} className={`chip border ${mode === "technologies" ? "bg-foreground text-background border-foreground" : "bg-card border-border hover:bg-foreground/5"}`}>Where technologies apply</button>
          <span className="ml-auto inline-flex rounded-md border border-border overflow-hidden text-xs">
            <button type="button" onClick={() => setSex("female")} aria-pressed={sex === "female"} className={`px-2 py-1 ${sex === "female" ? "bg-foreground text-background" : "bg-card"}`}>Female</button>
            <button type="button" onClick={() => setSex("male")} aria-pressed={sex === "male"} className={`px-2 py-1 ${sex === "male" ? "bg-foreground text-background" : "bg-card"}`}>Male</button>
          </span>
        </div>

        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto bm-figure" role="img" aria-label="Front view of the human body with clickable organs">
          <defs>
            <filter id="bm-glow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="4" result="b" />
              <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          {/* Figure: outline and anatomical hints, not clickable */}
          <g fill="none" stroke="currentColor" strokeLinejoin="round" strokeLinecap="round" className="pointer-events-none">
            <path d={FIGURE.head} strokeWidth={1.5} opacity={0.6} />
            <path d={FIGURE.hairline} strokeWidth={1} opacity={0.25} />
            {FIGURE.ears.map((d) => <path key={d} d={d} strokeWidth={1.1} opacity={0.4} />)}
            <path d={FIGURE.outlineLeft} strokeWidth={1.5} opacity={0.6} />
            <path d={FIGURE.mirror(FIGURE.outlineLeft)} strokeWidth={1.5} opacity={0.6} />
            {sex === "female" && <path d="M112 470 C104 478 100 486 100 492 M288 470 C296 478 300 486 300 492" strokeWidth={1.2} opacity={0.35} />}
            {FIGURE.collarbones.map((d) => <path key={d} d={d} strokeWidth={1} opacity={0.3} />)}
            {FIGURE.ribs.map((d) => <path key={d} d={d} strokeWidth={0.9} opacity={0.18} />)}
            {FIGURE.hips.map((d) => <path key={d} d={d} strokeWidth={0.9} opacity={0.2} />)}
            {FIGURE.knees.map((d) => <path key={d} d={d} strokeWidth={0.9} opacity={0.25} />)}
            <path d={FIGURE.hands[0]} strokeWidth={0.9} opacity={0.3} />
            <path d={FIGURE.mirror(FIGURE.hands[0])} strokeWidth={0.9} opacity={0.3} />
            <path d="M200 148 L200 496" strokeWidth={0.8} strokeDasharray="2 8" opacity={0.15} />
            <g className="bm-heart motion-css"><path d={FIGURE.heart} strokeWidth={1.1} opacity={0.35} fill="currentColor" fillOpacity={0.06} /></g>
          </g>

          {/* Clickable organs */}
          {visible.map((r) => {
            const on = r.id === shown;
            const n = counts[r.id] ?? 0;
            const alpha = r.systemWide ? 0.5 : 0.14 + 0.46 * (n / max);
            const stroke = on ? "var(--accent)" : r.systemWide ? "currentColor" : tint;
            const wrapperClass = r.id === "lung" ? "bm-lungs motion-css" : undefined;
            return (
              <g key={r.id} tabIndex={0} role="button" aria-pressed={on} aria-label={`${r.label}: ${n} ${mode}`}
                className="bm-region"
                onMouseEnter={() => setActive(r.id)} onMouseLeave={() => setActive(null)} onFocus={() => setActive(r.id)} onBlur={() => setActive(null)}
                onClick={() => setPinned((p) => (p === r.id ? null : r.id))} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setPinned((p) => (p === r.id ? null : r.id)); } }}>
                <g className={wrapperClass} filter={on ? "url(#bm-glow)" : undefined}>
                  {r.paths.map((d, i) => r.hit === "fill" ? (
                    <path key={i} d={d} className="bm-organ" fill={on ? "var(--accent)" : tint} fillOpacity={on ? 0.55 : alpha} stroke={stroke} strokeWidth={on ? 1.8 : 1.1} strokeLinejoin="round" style={r.systemWide ? { opacity: on ? 1 : 0.7 } : undefined} />
                  ) : (
                    <g key={i}>
                      <path d={d} fill="none" stroke="transparent" strokeWidth={r.id === "skin" ? 12 : 16} pointerEvents="stroke" />
                      <path d={d} className="bm-organ pointer-events-none" fill="none" stroke={stroke} strokeWidth={r.id === "skin" ? (on ? 3 : 0) : r.id === "colon" ? (on ? 15 : 13) : (on ? 5 : 3.5)} strokeOpacity={r.id === "skin" ? 0.9 : on ? 0.85 : r.systemWide ? 0.35 : 0.14 + 0.5 * (n / max)} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={r.id === "bone" ? "6 4" : undefined} />
                    </g>
                  ))}
                </g>
                {/* leader + margin label */}
                {!r.systemWide && (
                  <g className="pointer-events-none">
                    <path d={`M${r.anchor[0]} ${r.anchor[1]} L${elbowX(r.side)} ${r.labelY} L${r.side === "L" ? 40 : W - 40} ${r.labelY}`} fill="none" stroke="currentColor" strokeWidth={0.8} strokeOpacity={on ? 0.9 : 0.28} />
                    <circle cx={r.anchor[0]} cy={r.anchor[1]} r={1.8} fill="currentColor" fillOpacity={on ? 1 : 0.5} />
                    <text x={labelX(r.side)} y={r.labelY - 3} textAnchor={r.side === "L" ? "start" : "end"} className="fill-foreground" style={{ fontSize: 11, fontWeight: on ? 700 : 500, opacity: on ? 1 : 0.85 }}>{r.label}</text>
                    <text x={labelX(r.side)} y={r.labelY + 9} textAnchor={r.side === "L" ? "start" : "end"} className="fill-muted" style={{ fontSize: 9 }}>{n} {mode === "cancers" ? (n === 1 ? "cancer type" : "cancer types") : (n === 1 ? "technology" : "technologies")}</text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>

        <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs">
          <span className="kicker">System-wide</span>
          {visible.filter((r) => r.systemWide).map((r) => {
            const on = r.id === shown;
            return <button key={r.id} type="button" onMouseEnter={() => setActive(r.id)} onMouseLeave={() => setActive(null)} onFocus={() => setActive(r.id)} onBlur={() => setActive(null)} onClick={() => setPinned((p) => (p === r.id ? null : r.id))} aria-pressed={on} className={`chip border ${on ? "bg-accent text-white border-accent" : "bg-card border-border hover:bg-foreground/5"}`}>{r.label.replace(/ \(.*\)$/, "")} <span className={on ? "text-white/80" : "text-muted"}>{counts[r.id]}</span></button>;
          })}
          <span className="ml-auto text-muted">shade = how many {mode === "cancers" ? "cancer types" : "technologies"} · click to pin</span>
        </div>
      </div>

      <div className="lg:sticky lg:top-28 self-start">
        {!region && (
          <div className="card p-6 text-sm text-muted">
            <p>Hover or tap an organ. The figure is drawn to the eight-head canon with organs in their anatomical positions; the viewer&apos;s left is the patient&apos;s right, so the liver sits on the left of the drawing.</p>
            <p className="mt-2">Switch to <button type="button" className="underline" onClick={() => setMode(mode === "cancers" ? "technologies" : "cancers")}>{mode === "cancers" ? "where technologies apply" : "where cancers arise"}</button>, or pick female or male to change the pelvis.</p>
          </div>
        )}
        {region && (
          <div className="card p-5">
            <div className="flex items-baseline justify-between gap-3">
              <div>
                <div className="kicker mb-1">{mode === "cancers" ? "Cancers arising in" : "Technologies applied to"}</div>
                <h2 className="text-xl font-semibold">{region.label}</h2>
              </div>
              {pinned === region.id && <button type="button" className="text-xs underline text-muted" onClick={() => setPinned(null)}>Unpin</button>}
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {mode === "cancers"
                ? region.cancers.map((id) => { const c = cancers[id]; if (!c) return null; return (
                  <Link key={id} href={c.route} className="card p-3 hover:shadow-md transition">
                    <div className="font-medium">{c.name}</div>
                    <p className="text-xs text-muted mt-0.5 line-clamp-3">{c.tldr}</p>
                    <div className="text-xs text-muted mt-1"><span className="font-semibold text-foreground tabular-nums">{c.products}</span> products in OnCo</div>
                  </Link>); })
                : region.technologies.map((id) => { const t = technologies[id]; if (!t) return null; return (
                  <Link key={id} href={t.route} className="card p-3 hover:shadow-md transition">
                    <div className="font-medium">{t.name}</div>
                    <p className="text-xs text-muted mt-0.5 line-clamp-3">{t.tldr}</p>
                  </Link>); })}
            </div>
            {mode === "cancers" && region.technologies.length > 0 && (
              <p className="mt-4 text-xs text-muted">Local technologies here: {region.technologies.map((id) => technologies[id]?.name).filter(Boolean).join(", ")}. <button type="button" className="underline" onClick={() => setMode("technologies")}>Show</button></p>
            )}
            {mode === "technologies" && region.cancers.length > 0 && (
              <p className="mt-4 text-xs text-muted">Cancers arising here: {region.cancers.map((id) => cancers[id]?.name).filter(Boolean).join(", ")}. <button type="button" className="underline" onClick={() => setMode("cancers")}>Show</button></p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
