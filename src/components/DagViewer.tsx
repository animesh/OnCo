"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { FrontIcon } from "./FrontIcon";

/** One technology in the dependency map; plain data prepared server-side (no graph imports here). */
export type DagNodeData = {
  id: string;
  name: string;
  /** Front id for the tile icon. */
  section: string;
  status?: string;
  route: string;
  tldr: string;
  /** Vendor companies linked to this technology. */
  vendors: number;
  /** Direct dependencies (upstream) and direct dependents (downstream). */
  up: string[];
  down: string[];
};

export type DagViewData = {
  nodes: DagNodeData[];
  /** [upstream, downstream] pairs: the second needs the first. */
  edges: Array<[string, string]>;
  /** Layered layout of the whole map. */
  whole: string[][];
  /** Layered layout of each node's own neighbourhood (everything it needs plus everything that needs it). */
  perRoot: Record<string, string[][]>;
  criticalPath: string[];
  chokepoints: string[];
  singleVendor: string[];
  cycles: string[][];
};

const NODE_W = 204;
const NODE_H = 46;
const COL_W = 268;
const ROW_H = 60;
const PAD = 20;
const ICON = 18;
const UP = "var(--accent-solid)";
const DOWN = "#0e7490";

const shorten = (s: string, max = 26) => (s.length <= max ? s : `${s.slice(0, max - 1).trimEnd()}…`);

function closure(start: string, next: Map<string, string[]>): Set<string> {
  const seen = new Set<string>();
  const stack = [...(next.get(start) ?? [])];
  while (stack.length) {
    const n = stack.pop()!;
    if (seen.has(n) || n === start) continue;
    seen.add(n);
    for (const m of next.get(n) ?? []) if (!seen.has(m)) stack.push(m);
  }
  return seen;
}

/**
 * Layered dependency map. Columns are layers (left: foundations with no dependencies; right: end products),
 * tiles are technologies, curves are "needed by" edges. Hovering a tile lights everything it needs in pink and
 * everything that needs it in teal. The root picker narrows the map to one technology's neighbourhood; the
 * choice is mirrored in `?root=` so a technology page can link straight to its own map.
 */
export function DagViewer({ data }: { data: DagViewData }) {
  const byId = useMemo(() => new Map(data.nodes.map((n) => [n.id, n])), [data.nodes]);
  const upMap = useMemo(() => new Map(data.nodes.map((n) => [n.id, n.up])), [data.nodes]);
  const downMap = useMemo(() => new Map(data.nodes.map((n) => [n.id, n.down])), [data.nodes]);
  const chokepoints = useMemo(() => new Set(data.chokepoints), [data.chokepoints]);
  const singleVendor = useMemo(() => new Set(data.singleVendor), [data.singleVendor]);
  const sorted = useMemo(() => [...data.nodes].sort((a, b) => a.name.localeCompare(b.name)), [data.nodes]);

  const [root, setRoot] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);

  // Initial root from ?root=, deferred so the first render matches the static HTML.
  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      const r = new URLSearchParams(window.location.search).get("root");
      if (r && byId.has(r)) setRoot(r);
    });
    return () => cancelAnimationFrame(raf);
  }, [byId]);
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    if (root) p.set("root", root); else p.delete("root");
    const q = p.toString();
    window.history.replaceState(null, "", q ? `?${q}` : window.location.pathname);
  }, [root]);

  const layers = root ? data.perRoot[root] ?? data.whole : data.whole;
  const visible = useMemo(() => new Set(layers.flat()), [layers]);
  const edges = useMemo(() => data.edges.filter(([a, b]) => visible.has(a) && visible.has(b)), [data.edges, visible]);

  const focus = hovered && visible.has(hovered) ? hovered : root;
  const upSet = useMemo(() => (focus ? closure(focus, upMap) : new Set<string>()), [focus, upMap]);
  const downSet = useMemo(() => (focus ? closure(focus, downMap) : new Set<string>()), [focus, downMap]);

  const maxRows = Math.max(1, ...layers.map((l) => l.length));
  const width = PAD * 2 + (layers.length - 1) * COL_W + NODE_W;
  const height = PAD * 2 + maxRows * ROW_H;
  const pos = useMemo(() => {
    const m = new Map<string, { x: number; y: number }>();
    layers.forEach((l, li) => {
      const y0 = PAD + ((maxRows - l.length) * ROW_H) / 2;
      l.forEach((id, i) => m.set(id, { x: PAD + li * COL_W, y: y0 + i * ROW_H }));
    });
    return m;
  }, [layers, maxRows]);

  const edgeTone = (a: string, b: string): "up" | "down" | "dim" | "plain" => {
    if (!focus) return "plain";
    const inUp = (n: string) => n === focus || upSet.has(n);
    const inDown = (n: string) => n === focus || downSet.has(n);
    if (inUp(a) && inUp(b)) return "up";
    if (inDown(a) && inDown(b)) return "down";
    return "dim";
  };
  const nodeTone = (id: string): "focus" | "up" | "down" | "dim" | "plain" => {
    if (!focus) return "plain";
    if (id === focus) return "focus";
    if (upSet.has(id)) return "up";
    if (downSet.has(id)) return "down";
    return "dim";
  };

  const panel = focus ? byId.get(focus) : undefined;
  const num = (n: number) => n.toLocaleString("en-GB");

  return (
    <div className="dag">
      <div className="flex flex-wrap items-end gap-3 mb-3">
        <label className="text-sm">
          <span className="kicker block mb-1">Root technology</span>
          <select className="ctl h-9 text-sm min-w-[16rem]" value={root ?? ""} onChange={(ev) => { setRoot(ev.target.value || null); setHovered(null); }} aria-label="Choose the technology to centre the map on">
            <option value="">Whole map ({num(data.nodes.length)} technologies)</option>
            {sorted.map((n) => <option key={n.id} value={n.id}>{n.name}</option>)}
          </select>
        </label>
        <p className="text-xs text-muted self-center">
          {root ? <>{num(visible.size)} technologies in this neighbourhood, {num(layers.length)} layers. </> : <>{num(data.nodes.length)} technologies, {num(data.edges.length)} dependencies, {num(layers.length)} layers. </>}
          Scroll to pan; hover a tile to trace what it needs and what needs it; click to open its page.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="card overflow-auto max-h-[72vh] relative" style={{ scrollbarGutter: "stable" }}>
          <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`Dependency map, ${layers.length} layers`} className="block font-sans" style={{ minWidth: width }}>
            <defs>
              <marker id="dag-arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0.8 7 4 0 7.2" fill="none" stroke="context-stroke" strokeWidth="1.2" strokeLinejoin="round" /></marker>
            </defs>
            {layers.map((_, li) => (
              <text key={li} x={PAD + li * COL_W + NODE_W / 2} y={12} textAnchor="middle" className="fill-[var(--muted)]" fontSize={10} style={{ letterSpacing: "0.08em", textTransform: "uppercase" }}>
                {li === 0 ? "Layer 0 · foundations" : li === layers.length - 1 && layers.length > 1 ? `Layer ${li} · end products` : `Layer ${li}`}
              </text>
            ))}
            <g fill="none" strokeLinecap="round">
              {edges.map(([a, b]) => {
                const pa = pos.get(a)!, pb = pos.get(b)!;
                const x1 = pa.x + NODE_W, y1 = pa.y + NODE_H / 2, x2 = pb.x, y2 = pb.y + NODE_H / 2;
                const cx = (x1 + x2) / 2;
                const tone = edgeTone(a, b);
                const stroke = tone === "up" ? UP : tone === "down" ? DOWN : "var(--border-strong)";
                return <path key={`${a}>${b}`} d={`M${x1} ${y1} C${cx} ${y1} ${cx} ${y2} ${x2} ${y2}`} stroke={stroke} strokeWidth={tone === "up" || tone === "down" ? 2 : 1.2} opacity={tone === "dim" ? 0.25 : 1} markerEnd="url(#dag-arrow)" />;
              })}
            </g>
            {layers.flat().map((id) => {
              const n = byId.get(id);
              const p = pos.get(id);
              if (!n || !p) return null;
              const tone = nodeTone(id);
              const isRoot = id === root;
              const stroke = tone === "focus" ? UP : tone === "up" ? UP : tone === "down" ? DOWN : "var(--border-strong)";
              return (
                <a key={id} href={n.route} onMouseEnter={() => setHovered(id)} onMouseLeave={() => setHovered(null)} onFocus={() => setHovered(id)} onBlur={() => setHovered(null)} aria-label={`${n.name}: open technology page`} style={{ opacity: tone === "dim" ? 0.35 : 1 }}>
                  <title>{`${n.name}\nDepends on ${n.up.length} · needed by ${n.down.length}${n.vendors ? ` · ${n.vendors} vendor${n.vendors === 1 ? "" : "s"}` : ""}\n${n.tldr}`}</title>
                  <rect x={p.x} y={p.y} width={NODE_W} height={NODE_H} rx={10} fill={tone === "focus" ? "var(--accent-soft)" : "var(--card)"} stroke={stroke} strokeWidth={tone === "focus" || isRoot ? 2 : 1.2} />
                  <svg x={p.x + 10} y={p.y + (NODE_H - ICON) / 2} width={ICON} height={ICON} aria-hidden focusable="false" style={{ color: tone === "focus" || tone === "up" ? UP : tone === "down" ? DOWN : "var(--muted)" }}>
                    <FrontIcon id={n.section} className="" />
                  </svg>
                  <text x={p.x + 36} y={p.y + NODE_H / 2 + 4} fontSize={12.5} fontWeight={tone === "focus" ? 600 : 500} className="fill-[var(--foreground)]">{shorten(n.name)}</text>
                  {chokepoints.has(id) && <g transform={`translate(${p.x + NODE_W - 12}, ${p.y + 1})`}><title>Chokepoint: removing this step cuts off part of the map</title><path d="M0 -6 5 3h-10z" fill="#d97706" transform="translate(0,4)" /></g>}
                  {singleVendor.has(id) && <g transform={`translate(${p.x + NODE_W - (chokepoints.has(id) ? 26 : 12)}, ${p.y + 4})`}><title>Single vendor</title><circle r={4.5} fill="var(--card)" stroke="#475569" strokeWidth={1.5} /><text y={3} textAnchor="middle" fontSize={7} fontWeight={700} fill="#475569">1</text></g>}
                </a>
              );
            })}
          </svg>
        </div>

        <aside className="card p-4 text-sm min-h-[12rem] flex flex-col gap-3">
          {panel ? (
            <>
              <div>
                <div className="kicker mb-1 flex items-center gap-1.5"><span className="inline-flex text-accent"><FrontIcon id={panel.section} className="h-3.5 w-3.5" /></span>{panel.id === root ? "Root" : "Hovering"}</div>
                <div className="font-semibold text-base leading-snug">{panel.name}</div>
                <p className="text-muted mt-1 line-clamp-4">{panel.tldr}</p>
              </div>
              <dl className="grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-md bg-surface px-2 py-1.5"><dt className="text-muted">Depends on</dt><dd className="font-semibold text-sm" style={{ color: UP }}>{num(panel.up.length)} direct · {num(upSet.size)} total</dd></div>
                <div className="rounded-md bg-surface px-2 py-1.5"><dt className="text-muted">Needed by</dt><dd className="font-semibold text-sm" style={{ color: DOWN }}>{num(panel.down.length)} direct · {num(downSet.size)} total</dd></div>
              </dl>
              {(chokepoints.has(panel.id) || singleVendor.has(panel.id)) && (
                <ul className="text-xs space-y-1">
                  {chokepoints.has(panel.id) && <li className="flex items-start gap-1.5"><span aria-hidden className="mt-1 inline-block h-2 w-2 rotate-45 bg-amber-600" />Chokepoint: take it away and part of the map can no longer reach the rest.</li>}
                  {singleVendor.has(panel.id) && <li className="flex items-start gap-1.5"><span aria-hidden className="mt-0.5 inline-flex h-3.5 w-3.5 items-center justify-center rounded-full border border-slate-500 text-[8px] font-bold text-slate-600">1</span>Single vendor in the corpus: one company supplies this step.</li>}
                </ul>
              )}
              {panel.up.length > 0 && <div><div className="kicker mb-1" style={{ color: UP }}>Depends on</div><div className="flex flex-wrap gap-1">{panel.up.map((id) => { const m = byId.get(id); return m ? <button key={id} type="button" className="chip border border-border bg-card hover:bg-foreground/5 text-xs" onMouseEnter={() => setHovered(id)} onMouseLeave={() => setHovered(null)} onClick={() => setRoot(id)} title={`Centre the map on ${m.name}`}>{shorten(m.name, 30)}</button> : null; })}</div></div>}
              {panel.down.length > 0 && <div><div className="kicker mb-1" style={{ color: DOWN }}>Needed by</div><div className="flex flex-wrap gap-1">{panel.down.map((id) => { const m = byId.get(id); return m ? <button key={id} type="button" className="chip border border-border bg-card hover:bg-foreground/5 text-xs" onMouseEnter={() => setHovered(id)} onMouseLeave={() => setHovered(null)} onClick={() => setRoot(id)} title={`Centre the map on ${m.name}`}>{shorten(m.name, 30)}</button> : null; })}</div></div>}
              <div className="mt-auto flex flex-wrap gap-2 pt-1">
                <Link href={panel.route} className="btn btn-primary !h-8 text-xs">Open page →</Link>
                {panel.id !== root && <button type="button" className="btn !h-8 text-xs" onClick={() => setRoot(panel.id)}>Centre here</button>}
                {root && <button type="button" className="btn !h-8 text-xs" onClick={() => { setRoot(null); setHovered(null); }}>Whole map</button>}
              </div>
            </>
          ) : (
            <>
              <div className="kicker">How to read it</div>
              <p className="text-muted">Each column is a layer: the left column needs nothing else in the corpus; each step to the right needs something from the columns before it. Arrows point from the thing that is needed to the thing that needs it.</p>
              <p className="text-muted">Hover a tile to trace its chain, pick a root above to see one technology&apos;s neighbourhood on its own, or click a tile to open its page.</p>
            </>
          )}
          <ul className="border-t border-border pt-3 grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs" aria-label="Legend">
            <li className="flex items-center gap-1.5"><span aria-hidden className="inline-block h-3 w-5 rounded border-2" style={{ borderColor: UP, background: "var(--accent-soft)" }} />Root or hovered</li>
            <li className="flex items-center gap-1.5"><span aria-hidden className="inline-block h-0.5 w-5 rounded" style={{ background: UP }} />Depends on</li>
            <li className="flex items-center gap-1.5"><span aria-hidden className="inline-block h-0.5 w-5 rounded" style={{ background: DOWN }} />Needed by</li>
            <li className="flex items-center gap-1.5"><span aria-hidden className="inline-block h-0.5 w-5 rounded bg-[var(--border-strong)]" />Other dependency</li>
            <li className="flex items-center gap-1.5"><span aria-hidden className="inline-block h-2 w-2 rotate-45 bg-amber-600" />Chokepoint</li>
            <li className="flex items-center gap-1.5"><span aria-hidden className="inline-flex h-3.5 w-3.5 items-center justify-center rounded-full border border-slate-500 text-[8px] font-bold text-slate-600">1</span>Single vendor</li>
          </ul>
        </aside>
      </div>
    </div>
  );
}
