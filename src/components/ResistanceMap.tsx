"use client";

import { useId, useRef, useState, type ReactNode } from "react";
import { CATEGORY_BY_ID, type MechanismCategory } from "@/lib/resistance-categories";
import { useAnimationBudget, useMotionSnapshot } from "@/lib/use-animation-budget";
import { CategoryDot, useAtlas } from "./ResistanceMatrix";

/**
 * Escape-route map for one drug class, in the site's wireframe style.
 * Left: the drug class node. Centre: a schematic tumour cell (concentric rings + nucleus). Right: one
 * route per mechanism fanning out of the cell, coloured by category, ending in a green "gate" that
 * shows how many countermeasures close it. Dashes flow along each route (CSS keyframes; static under
 * prefers-reduced-motion). Hover a route for its `how` text in the side caption; click to expand the
 * full mechanism card (server-rendered, passed in through `details`).
 *
 * Two SVGs share one state: a labelled wide one (sm and up) and a compact numbered one for phones,
 * whose labels are listed as HTML underneath so they stay legible at any width.
 */

export type MapRoute = {
  name: string;
  category: MechanismCategory;
  how: string;
  frequency?: string;
  /** Number of countermeasures listed for this route. */
  countermeasures: number;
};

export function ResistanceMap({ drugLabel, exemplarCount, routes, details }: { drugLabel: string; exemplarCount: number; routes: MapRoute[]; details?: ReactNode[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const [open, setOpen] = useState<number | null>(null);
  const { highlight } = useAtlas();
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  // Shared animation budget: the spinning rings and the flowing dashes are still under reduced motion, and pause
  // (data-motion-paused) while the map is off screen, the tab is hidden or the device has a low budget.
  const box = useRef<HTMLDivElement>(null);
  const motion = useMotionSnapshot(useAnimationBudget(box, { wakeOnHover: false }));
  const reduced = motion.reduced;

  const focus = hover ?? open;
  const current = focus !== null ? routes[focus] : null;
  const counts = routes.reduce((m, r) => m.set(r.category, (m.get(r.category) ?? 0) + 1), new Map<MechanismCategory, number>());

  return (
    <div ref={box} data-motion-paused={motion.active ? undefined : ""} className="card overflow-hidden">
      <style>{`
        @keyframes res-flow-${uid} { to { stroke-dashoffset: -28; } }
        @keyframes res-spin-${uid} { to { transform: rotate(360deg); } }
        .res-flow-${uid} { animation: res-flow-${uid} 1.6s linear infinite; }
        .res-spin-${uid} { animation: res-spin-${uid} 90s linear infinite; }
        .res-spin-rev-${uid} { animation: res-spin-${uid} 140s linear infinite reverse; }
      `}</style>
      <div className="grid lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="p-2 sm:p-3">
          <div className="hidden sm:block">
            <Diagram uid={uid} compact={false} drugLabel={drugLabel} exemplarCount={exemplarCount} routes={routes} focus={focus} open={open} highlight={highlight} reduced={reduced}
              onHover={setHover} onToggle={(i) => setOpen((cur) => (cur === i ? null : i))} />
          </div>
          <div className="sm:hidden">
            <Diagram uid={uid} compact drugLabel={drugLabel} exemplarCount={exemplarCount} routes={routes} focus={focus} open={open} highlight={highlight} reduced={reduced}
              onHover={setHover} onToggle={(i) => setOpen((cur) => (cur === i ? null : i))} />
            <ol className="mt-2 space-y-1 text-xs">
              {routes.map((r, i) => (
                <li key={i}>
                  <button type="button" onClick={() => setOpen((cur) => (cur === i ? null : i))} aria-expanded={open === i} className={`w-full text-left flex items-baseline gap-2 rounded px-1 py-0.5 ${open === i ? "bg-foreground/5" : ""}`}>
                    <span className="inline-flex shrink-0 items-center justify-center w-4 h-4 rounded-full text-[10px] font-bold text-white" style={{ background: CATEGORY_BY_ID[r.category].color }}>{i + 1}</span>
                    <span className="font-medium leading-snug">{r.name}</span>
                    {r.frequency && <span className="text-muted">· {r.frequency}</span>}
                  </button>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* Side caption */}
        <aside className="border-t lg:border-t-0 lg:border-l border-border p-4 text-sm min-h-[7rem]" aria-live="polite">
          {current ? (
            <>
              <div className="flex items-center gap-2 text-xs font-semibold" style={{ color: CATEGORY_BY_ID[current.category].color }}>
                <CategoryDot category={current.category} size={8} /> {CATEGORY_BY_ID[current.category].label}
                <span className="text-muted font-normal">· route {(focus ?? 0) + 1} of {routes.length}</span>
              </div>
              <div className="font-medium mt-1 leading-snug">{current.name}</div>
              {current.frequency && <div className="text-xs text-muted mt-0.5">{current.frequency}</div>}
              <p className="text-muted mt-2 leading-relaxed">{current.how}</p>
              <div className="mt-2 text-xs inline-flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-medium">
                <span className="inline-flex items-center justify-center min-w-5 h-4 px-1 rounded-sm border border-emerald-500 text-[10px] font-bold">{current.countermeasures}</span>
                countermeasure{current.countermeasures === 1 ? "" : "s"} {open === focus ? "shown below" : "· click the route to open"}
              </div>
            </>
          ) : (
            <>
              <div className="kicker">Escape routes</div>
              <p className="text-muted mt-1 leading-relaxed">{routes.length} documented way{routes.length === 1 ? "" : "s"} a tumour gets past {drugLabel}. Hover a route to read how it works; click to open its countermeasures.</p>
              <ul className="mt-2 space-y-1 text-xs">
                {[...counts.entries()].map(([cat, n]) => (
                  <li key={cat} className="flex items-center gap-2"><CategoryDot category={cat} size={8} /><span className="font-medium" style={{ color: CATEGORY_BY_ID[cat].color }}>{CATEGORY_BY_ID[cat].label}</span><span className="text-muted">× {n}</span></li>
                ))}
              </ul>
            </>
          )}
        </aside>
      </div>

      {/* Expanded mechanism */}
      {open !== null && details?.[open] && (
        <div className="border-t border-border p-4 bg-foreground/[0.02]">
          <div className="flex items-center justify-between gap-3 mb-3 text-xs text-muted">
            <span className="inline-flex items-center gap-1.5"><CategoryDot category={routes[open].category} size={8} /> Route {open + 1} of {routes.length}</span>
            <button type="button" onClick={() => setOpen(null)} className="chip border bg-card border-border hover:bg-foreground/5">Close</button>
          </div>
          {details[open]}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------------------------------------ */

const ELLIPSIS = (s: string, n: number) => (s.length > n ? s.slice(0, n - 1).trimEnd() + "…" : s);

/** Greedy word wrap into at most two lines of roughly `max` characters; the second line is truncated. */
function wrapLabel(s: string, max: number): string[] {
  if (s.length <= max) return [s];
  const words = s.split(" ");
  let first = "";
  while (words.length && (first + " " + words[0]).trim().length <= max) first = (first + " " + words.shift()).trim();
  if (!first) first = words.shift() ?? "";
  const rest = words.join(" ");
  return rest ? [first, ELLIPSIS(rest, max)] : [first];
}

function Diagram({ uid, compact, drugLabel, exemplarCount, routes, focus, open, highlight, reduced, onHover, onToggle }: {
  uid: string; compact: boolean; drugLabel: string; exemplarCount: number; routes: MapRoute[]; focus: number | null; open: number | null;
  highlight: MechanismCategory | null; reduced: boolean; onHover: (i: number | null) => void; onToggle: (i: number) => void;
}) {
  const n = routes.length;
  const W = compact ? 360 : 760;
  const gap = compact ? 34 : 46;
  const H = Math.max(compact ? 170 : 220, n * gap + (compact ? 30 : 44));
  const cy = H / 2;
  const lines = wrapLabel(drugLabel, compact ? 13 : 20);
  const drug = compact ? { x: 6, w: 88, h: lines.length > 1 ? 56 : 44 } : { x: 14, w: 152, h: lines.length > 1 ? 66 : 56 };
  const cx = compact ? 168 : 300;
  const r = Math.min(compact ? 42 : 62, H / 2 - 14);
  const ex = compact ? 292 : 516;
  const flow = reduced ? "" : `res-flow-${uid} motion-css`;
  const anyFocus = focus !== null;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto max-h-[320px]" role="img" aria-label={`${drugLabel}: ${n} escape routes`} onMouseLeave={() => onHover(null)}>
      <defs>
        <marker id={`bar-${uid}`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><rect x="6" y="0" width="3" height="10" fill="currentColor" /></marker>
        <marker id={`dot-${uid}`} viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5"><circle cx="5" cy="5" r="4" fill="currentColor" /></marker>
      </defs>

      {/* Drug node */}
      <g className="text-accent">
        <rect x={drug.x} y={cy - drug.h / 2} width={drug.w} height={drug.h} rx={10} className="fill-card stroke-accent" strokeWidth={1.4} />
        <rect x={drug.x + 4} y={cy - drug.h / 2 + 4} width={drug.w - 8} height={drug.h - 8} rx={7} fill="none" className="stroke-accent" strokeWidth={0.6} strokeDasharray="2 3" opacity={0.6} />
        <text x={drug.x + drug.w / 2} y={cy - (lines.length > 1 ? (compact ? 12 : 14) : compact ? 3 : 5)} textAnchor="middle" className="fill-foreground" style={{ fontSize: compact ? 10 : 12, fontWeight: 600 }}>
          <title>{drugLabel}</title>
          {lines.map((l, k) => <tspan key={k} x={drug.x + drug.w / 2} dy={k === 0 ? 0 : compact ? 12 : 14}>{l}</tspan>)}
        </text>
        <text x={drug.x + drug.w / 2} y={cy + (lines.length > 1 ? (compact ? 16 : 20) : compact ? 10 : 12)} textAnchor="middle" className="fill-muted" style={{ fontSize: compact ? 8.5 : 10 }}>{exemplarCount} exemplar drug{exemplarCount === 1 ? "" : "s"}</text>
        {/* Inhibition arrow into the cell */}
        <line x1={drug.x + drug.w} y1={cy} x2={cx - r - 8} y2={cy} stroke="currentColor" strokeWidth={1.8} strokeDasharray="7 7" className={flow} markerEnd={`url(#bar-${uid})`} />
        <text x={(drug.x + drug.w + cx - r) / 2} y={cy - 8} textAnchor="middle" className="fill-accent" style={{ fontSize: compact ? 8.5 : 10, fontWeight: 600, letterSpacing: "0.08em" }}>BLOCKS</text>
      </g>

      {/* Tumour cell */}
      <g transform={`translate(${cx} ${cy})`} className="text-foreground">
        <circle r={r} fill="none" stroke="currentColor" strokeWidth={1.4} opacity={0.85} />
        <circle r={r * 0.8} fill="none" stroke="currentColor" strokeWidth={0.8} strokeDasharray="5 4" opacity={0.45} className={reduced ? "" : `res-spin-${uid} motion-css`} style={{ transformOrigin: "0 0" }} />
        <circle r={r * 0.58} fill="none" stroke="currentColor" strokeWidth={0.7} strokeDasharray="1.5 4" opacity={0.4} className={reduced ? "" : `res-spin-rev-${uid} motion-css`} style={{ transformOrigin: "0 0" }} />
        <circle r={r * 0.32} className="fill-foreground/5" stroke="currentColor" strokeWidth={1.1} opacity={0.8} />
        <circle r={r * 0.32} fill="none" stroke="currentColor" strokeWidth={0.6} strokeDasharray="2 3" opacity={0.45} transform="scale(0.72)" />
        <circle cx={r * 0.08} cy={-r * 0.06} r={r * 0.07} fill="currentColor" opacity={0.7} />
        {/* Receptor stubs on the membrane facing the drug */}
        {[-0.35, 0, 0.35].map((a) => {
          const ang = Math.PI + a;
          return <line key={a} x1={Math.cos(ang) * (r - 6)} y1={Math.sin(ang) * (r - 6)} x2={Math.cos(ang) * (r + 6)} y2={Math.sin(ang) * (r + 6)} stroke="currentColor" strokeWidth={1.6} opacity={0.75} />;
        })}
        {!compact && <text y={r + 14} textAnchor="middle" className="fill-muted" style={{ fontSize: 9.5, letterSpacing: "0.1em" }}>TUMOUR CELL</text>}
      </g>

      {/* Routes */}
      {routes.map((route, i) => {
        const color = CATEGORY_BY_ID[route.category].color;
        const ey = cy + (i - (n - 1) / 2) * gap;
        const spread = n === 1 ? 0 : Math.min(0.9, 0.22 * (n - 1));
        const ang = n === 1 ? 0 : -spread + (2 * spread * i) / (n - 1);
        const sx = cx + Math.cos(ang) * r, sy = cy + Math.sin(ang) * r;
        const c1x = sx + (compact ? 40 : 80), c2x = ex - (compact ? 40 : 80);
        const d = `M ${sx.toFixed(1)} ${sy.toFixed(1)} C ${c1x} ${sy.toFixed(1)}, ${c2x} ${ey.toFixed(1)}, ${ex} ${ey.toFixed(1)}`;
        const isFocus = focus === i, isOpen = open === i;
        const dim = (highlight !== null && highlight !== route.category) || (anyFocus && !isFocus);
        const gateW = compact ? 22 : 26, gateH = compact ? 16 : 20, gx = ex + 6;
        return (
          <g key={i} role="button" tabIndex={0} aria-label={`${route.name}${route.frequency ? `, ${route.frequency}` : ""}, ${route.countermeasures} countermeasures`} aria-pressed={isOpen}
            className="cursor-pointer outline-none transition-opacity duration-300" style={{ opacity: dim ? 0.22 : 1 }}
            onMouseEnter={() => onHover(i)} onFocus={() => onHover(i)} onBlur={() => onHover(null)} onClick={() => onToggle(i)}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onToggle(i); } }}>
            <title>{`${route.name}${route.frequency ? ` · ${route.frequency}` : ""}`}</title>
            {/* wide invisible hit path */}
            <path d={d} fill="none" stroke="transparent" strokeWidth={18} />
            <path d={d} fill="none" stroke={color} strokeWidth={isFocus ? 3.2 : 1.6} opacity={0.28} />
            <path d={d} fill="none" stroke={color} strokeWidth={isFocus ? 2.6 : 1.8} strokeDasharray="7 7" className={flow} style={reduced || !isFocus ? undefined : { animationDuration: "0.8s" }} />
            <circle cx={sx} cy={sy} r={isFocus ? 3.6 : 2.6} fill={color} />
            {/* Gate: number of countermeasures */}
            <rect x={gx} y={ey - gateH / 2} width={gateW} height={gateH} rx={4} fill={isOpen ? "#16a34a" : "rgba(22,163,74,0.12)"} stroke="#16a34a" strokeWidth={1.2} />
            <text x={gx + gateW / 2} y={ey + (compact ? 3.5 : 4)} textAnchor="middle" fill={isOpen ? "#fff" : "#16a34a"} style={{ fontSize: compact ? 9.5 : 11, fontWeight: 700 }}>{route.countermeasures}</text>
            {compact ? (
              <>
                <circle cx={ex - 12} cy={ey} r={7} fill={color} />
                <text x={ex - 12} y={ey + 3} textAnchor="middle" fill="#fff" style={{ fontSize: 8.5, fontWeight: 700 }}>{i + 1}</text>
              </>
            ) : (
              <>
                <text x={gx + gateW + 8} y={ey + (route.frequency ? -1 : 4)} className="fill-foreground" style={{ fontSize: 12, fontWeight: 600 }}>{ELLIPSIS(route.name, 30)}</text>
                {route.frequency && <text x={gx + gateW + 8} y={ey + 11} className="fill-muted" style={{ fontSize: 9.5 }}>{ELLIPSIS(route.frequency, 40)}</text>}
              </>
            )}
          </g>
        );
      })}

      {!compact && (
        <text x={ex + 6} y={14} className="fill-muted" style={{ fontSize: 9.5, letterSpacing: "0.1em" }}>ESCAPE ROUTES · GATE = COUNTERMEASURES</text>
      )}
    </svg>
  );
}
