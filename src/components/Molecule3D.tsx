"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Wireframe3D } from "./Wireframe3D";
import { chainColour, elementColour, elementName, type Mol } from "@/lib/molecule-render";
import { buildScene, createRenderer, LIGAND_CARBON, toMesh, type Scene, type SpriteCanvas } from "@/lib/molecule-draw";
import { moleculeStats, proteinStats } from "@/lib/molecule-stats";

export type StructureEntry = { label: string; file: string; note?: string; dim: 2 | 3; source: string; ref: string };
type Style = "solid" | "wire";

const themeOf = () => { const t = document.documentElement.dataset.theme; return t === "dark" || t === "contrast" ? true : t === "light" ? false : window.matchMedia("(prefers-color-scheme: dark)").matches; };

/**
 * Ball-and-stick model of a small molecule, or a smooth backbone ribbon (with the bound drug in ball-and-stick)
 * for a protein, drawn on a plain canvas: CPK colours, shaded spheres, depth-sorted cylinders, gentle auto-rotation,
 * drag to rotate, light or dark card. `compact` is the thumbnail form: canvas only, 30 fps, no controls.
 * Structures are the self-hosted snapshots under public/structures; no runtime calls to external services.
 */
export function Molecule3D({ entry, compact = false, height = "h-64 sm:h-80", className = "" }: { entry: StructureEntry; compact?: boolean; height?: string; className?: string }) {
  // The loaded snapshot is tagged with its file name so a changed entry never shows a stale molecule.
  const [loaded, setLoaded] = useState<{ file: string; mol: Mol | null; err: boolean } | null>(null);
  const [style, setStyle] = useState<Style>("solid");
  const [showH, setShowH] = useState(false);
  const [playing, setPlaying] = useState(true);
  const [chem, setChem] = useState(false);
  const isProtein = entry.source === "pdb";
  const mol = loaded?.file === entry.file ? loaded.mol : null;
  const err = loaded?.file === entry.file ? loaded.err : false;

  useEffect(() => {
    let alive = true;
    const file = entry.file;
    fetch(`/structures/${file}`).then((r) => { if (!r.ok) throw new Error(String(r.status)); return r.json(); }).then((m: Mol) => { if (alive) setLoaded({ file, mol: m, err: false }); }).catch(() => { if (alive) setLoaded({ file, mol: null, err: true }); });
    return () => { alive = false; };
  }, [entry.file]);

  const scene = useMemo(() => (mol ? buildScene(mol, isProtein) : null), [mol, isProtein]);
  const mesh = useMemo(() => (mol && style === "wire" ? toMesh(mol, isProtein, showH) : null), [mol, isProtein, style, showH]);

  const canvasEl = style === "wire" && mesh
    ? <Wireframe3D mesh={mesh} height={compact ? className : height} compact={compact} speed={0.3} />
    : <SolidCanvas scene={scene} compact={compact} className={compact ? `block w-full ${className}` : `block w-full ${height}`} showH={showH} playing={playing} label={entry.label} onTap={() => setChem((c) => !c)} />;

  if (compact) return canvasEl;

  const pdbId = isProtein ? entry.file.replace(/^pdb-|\.json$/g, "") : "";
  const what = isProtein ? (style === "wire" ? "Backbone trace" : "Backbone ribbon") : (style === "wire" ? "Wireframe" : "Ball-and-stick model");
  const from = isProtein ? `from PDB ${pdbId}` : entry.dim === 2 ? "from PubChem 2D record (no 3D conformer available)" : "from PubChem 3D conformer";

  return (
    <div>
      <div className="relative bg-gradient-to-b from-foreground/[0.03] to-transparent">
        {canvasEl}
        {!mol && !err && <div className="absolute inset-0 flex items-center justify-center text-sm text-muted">Loading structure</div>}
        {err && <div className="absolute inset-0 flex items-center justify-center text-sm text-muted">Structure unavailable.</div>}
      </div>
      <div className="px-3 py-2 border-t border-border flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs">
        <span className="inline-flex rounded-md border border-border overflow-hidden" role="group" aria-label="Drawing style">
          {([["solid", isProtein ? "Ribbon" : "Ball and stick"], ["wire", "Wireframe"]] as Array<[Style, string]>).map(([v, l]) => (
            <button key={v} type="button" onClick={() => setStyle(v)} aria-pressed={style === v} className={`px-2 py-0.5 ${style === v ? "bg-foreground text-background" : "bg-card hover:bg-foreground/5"}`}>{l}</button>
          ))}
        </span>
        {!isProtein && scene?.hasH && <button type="button" onClick={() => setShowH((h) => !h)} aria-pressed={showH} className={`chip border ${showH ? "bg-foreground text-background border-foreground" : "bg-card border-border hover:bg-foreground/5"}`}>Hydrogens</button>}
        {style === "solid" && <button type="button" onClick={() => setPlaying((p) => !p)} aria-pressed={!playing} className="chip border border-border bg-card hover:bg-foreground/5">{playing ? "Pause" : "Play"}</button>}
        {mol && <button type="button" onClick={() => setChem((c) => !c)} aria-pressed={chem} aria-controls="chemistry-panel" className={`chip border ${chem ? "bg-foreground text-background border-foreground" : "bg-card border-border hover:bg-foreground/5"}`}>Chemistry</button>}
        {style === "solid" && <span className="text-muted hidden sm:inline">Drag to rotate, click for the chemistry</span>}
        {scene && <Legend scene={scene} showH={showH} />}
      </div>
      <p className="px-3 pb-2 text-xs text-muted">
        {what} {from}. <a className="underline" href={entry.ref} rel="noopener">{isProtein ? `RCSB PDB ${pdbId}` : "PubChem record"}</a>
        {isProtein && style === "solid" && ". The ribbon widens where the chain is folded into a regular pattern and narrows where it is a loose loop."}
      </p>
      {chem && mol && <ChemistryPanel mol={mol} isProtein={isProtein} entry={entry} pdbId={pdbId} />}
    </div>
  );
}

/** The chemistry behind the picture: formula, weight, atom and ring counts for a molecule; chains, residues and bound ligands for a protein. */
function ChemistryPanel({ mol, isProtein, entry, pdbId }: { mol: Mol; isProtein: boolean; entry: StructureEntry; pdbId: string }) {
  if (isProtein) {
    const p = proteinStats(mol);
    return (
      <dl id="chemistry-panel" className="px-3 pb-3 grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-1.5 text-xs border-t border-border pt-2">
        <div><dt className="text-muted">Chains</dt><dd className="font-medium">{p.chains.length} ({p.chains.join(", ")})</dd></div>
        <div><dt className="text-muted">Residues traced</dt><dd className="font-medium tabular-nums">{p.residues.toLocaleString()}</dd></div>
        <div><dt className="text-muted">Bound ligands</dt><dd className="font-medium">{p.ligands.length ? p.ligands.join(", ") : "none in this snapshot"}</dd></div>
        <div><dt className="text-muted">Source</dt><dd><a className="underline notranslate" translate="no" href={entry.ref} rel="noopener">RCSB PDB {pdbId}</a></dd></div>
        <p className="col-span-full text-muted">Alpha-carbon backbone only; side chains are not in the snapshot, so no formula or weight is computed for proteins.</p>
      </dl>
    );
  }
  const s = moleculeStats(mol);
  return (
    <dl id="chemistry-panel" className="px-3 pb-3 grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-1.5 text-xs border-t border-border pt-2">
      <div><dt className="text-muted">Formula{s.hasH ? "" : " (heavy atoms)"}</dt><dd className="font-medium notranslate" translate="no">{s.formula}</dd></div>
      <div><dt className="text-muted">Molecular weight</dt><dd className="font-medium tabular-nums">{s.weight === null ? "not computed" : `${s.weight.toLocaleString()} g/mol${s.hasH ? "" : " without hydrogens"}`}</dd></div>
      <div><dt className="text-muted">Atoms</dt><dd className="font-medium tabular-nums">{s.heavyAtoms} heavy{s.hasH ? `, ${s.hydrogens} hydrogen` : ""}</dd></div>
      <div><dt className="text-muted">Bonds and rings</dt><dd className="font-medium tabular-nums">{s.bonds} bonds, {s.rings} ring{s.rings === 1 ? "" : "s"}</dd></div>
      <div><dt className="text-muted">Halogens</dt><dd className="font-medium tabular-nums">{s.halogens}</dd></div>
      <div><dt className="text-muted">Metals</dt><dd className="font-medium">{s.metals.length ? s.metals.join(", ") : "none"}</dd></div>
      <div><dt className="text-muted">Elements</dt><dd className="font-medium notranslate" translate="no">{s.elements.map((e) => `${e.el} ${e.n}`).join(", ")}</dd></div>
      <div><dt className="text-muted">Source</dt><dd><a className="underline" href={entry.ref} rel="noopener">PubChem record</a></dd></div>
      <p className="col-span-full text-muted">Counted from the {entry.dim === 2 ? "2D" : "3D"} record served by this site{s.hasH ? "" : ", which omits hydrogens, so formula and weight cover heavy atoms only"}. Ring count is the cycle rank of the bond graph.</p>
    </dl>
  );
}

function Legend({ scene, showH }: { scene: Scene; showH: boolean }) {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const update = () => setDark(themeOf());
    update();
    const mo = new MutationObserver(update); mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => mo.disconnect();
  }, []);
  const dot = (colour: string) => <i aria-hidden className="inline-block h-2.5 w-2.5 rounded-full border border-black/10 align-[-1px] mr-1" style={{ background: colour }} />;
  if (scene.isProtein) {
    return (
      <span className="ml-auto flex flex-wrap items-center gap-x-2.5 gap-y-1 text-muted">
        {scene.chains.map((c) => <span key={c}>{dot(chainColour(scene.chains, c, dark))}Chain {c}</span>)}
        {scene.hasLigand && <span>{dot(dark ? LIGAND_CARBON.dark : LIGAND_CARBON.light)}Bound drug</span>}
      </span>
    );
  }
  const els = scene.elements.filter((e) => e !== "H" || showH);
  return (
    <span className="ml-auto flex flex-wrap items-center gap-x-2.5 gap-y-1 text-muted">
      {els.map((e) => <span key={e}>{dot(elementColour(e))}{elementName(e)}</span>)}
    </span>
  );
}

/** Off-screen canvas factory for sphere sprites. */
function makeSpriteCanvas(sizePx: number): SpriteCanvas {
  const c = document.createElement("canvas");
  c.width = sizePx; c.height = sizePx;
  return { width: sizePx, height: sizePx, ctx: c.getContext("2d")!, image: c };
}

function SolidCanvas({ scene, compact, className, showH, playing, label, onTap }: { scene: Scene | null; compact: boolean; className: string; showH: boolean; playing: boolean; label: string; onTap?: () => void }) {
  const tapRef = useRef(onTap);
  useEffect(() => { tapRef.current = onTap; }, [onTap]);
  const ref = useRef<HTMLCanvasElement>(null);
  const st = useRef({ showH, playing, yaw: 0, seeded: false, pitchOff: 0, dragging: false, lastX: 0, lastY: 0, downX: 0, downY: 0, resumeAt: 0, lastTime: 0 });
  const redraw = useRef<(() => void) | null>(null);
  useEffect(() => { st.current.showH = showH; st.current.playing = playing; redraw.current?.(); }, [showH, playing]);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || !scene) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const s0 = st.current;
    if (!s0.seeded) { s0.yaw = Math.random() * Math.PI * 2; s0.seeded = true; } // thumbnails in a grid start at different angles
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const renderer = createRenderer(scene, makeSpriteCanvas);

    let dark = themeOf();
    const retheme = () => { dark = themeOf(); if (reduced) draw(performance.now()); };
    const mo = new MutationObserver(retheme);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", retheme);

    const draw = (time: number) => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const W = canvas.clientWidth, H = canvas.clientHeight;
      if (!W || !H) return;
      if (canvas.width !== Math.round(W * dpr) || canvas.height !== Math.round(H * dpr)) { canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr); }
      const dt = s0.lastTime ? Math.min(0.1, (time - s0.lastTime) / 1000) : 0;
      s0.lastTime = time;
      if (s0.playing && !s0.dragging && time > s0.resumeAt && !reduced) s0.yaw += dt * (compact ? 0.3 : 0.35);
      const pitch = 0.35 + s0.pitchOff + (reduced ? 0 : Math.sin((time / 1000) * 0.15) * 0.15);
      renderer.draw(ctx, { W, H, dpr, yaw: s0.yaw, pitch, showH: s0.showH, compact, dark });
    };
    redraw.current = () => draw(performance.now());

    // Drag to rotate (full mode only; thumbnails sit inside links and buttons). Auto-rotation resumes after 2.5 s.
    const onDown = (e: PointerEvent) => { if (compact) return; s0.dragging = true; s0.lastX = e.clientX; s0.lastY = e.clientY; s0.downX = e.clientX; s0.downY = e.clientY; canvas.setPointerCapture(e.pointerId); };
    const onMove = (e: PointerEvent) => {
      if (!s0.dragging) return;
      s0.yaw += (e.clientX - s0.lastX) * 0.01;
      s0.pitchOff = Math.max(-1.2, Math.min(1.2, s0.pitchOff + (e.clientY - s0.lastY) * 0.01));
      s0.lastX = e.clientX; s0.lastY = e.clientY; s0.resumeAt = performance.now() + 2500;
      if (reduced) draw(performance.now());
    };
    const onUp = (e: PointerEvent) => { if (!s0.dragging) return; s0.dragging = false; if (Math.hypot(e.clientX - s0.downX, e.clientY - s0.downY) < 5) tapRef.current?.(); s0.resumeAt = performance.now() + 2500; try { canvas.releasePointerCapture(e.pointerId); } catch { /* already released */ } };
    canvas.addEventListener("pointerdown", onDown); canvas.addEventListener("pointermove", onMove); canvas.addEventListener("pointerup", onUp); canvas.addEventListener("pointercancel", onUp);

    let raf = 0, visible = true, last = 0;
    const minGap = compact || scene.isProtein ? 1000 / 30 : 0;
    const loop = (time: number) => {
      if (!visible) return;
      if (time - last >= minGap) { draw(time); last = time; }
      if (!reduced) raf = requestAnimationFrame(loop);
    };
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) { cancelAnimationFrame(raf); raf = requestAnimationFrame(loop); } }, { threshold: 0.05 });
    io.observe(canvas);
    const ro = new ResizeObserver(() => { if (reduced) draw(performance.now()); });
    ro.observe(canvas);
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf); io.disconnect(); ro.disconnect(); mo.disconnect(); mq.removeEventListener("change", retheme); redraw.current = null;
      canvas.removeEventListener("pointerdown", onDown); canvas.removeEventListener("pointermove", onMove); canvas.removeEventListener("pointerup", onUp); canvas.removeEventListener("pointercancel", onUp);
    };
  }, [scene, compact]);

  return <canvas ref={ref} className={`${className} ${compact ? "" : "cursor-grab active:cursor-grabbing touch-none"}`} aria-label={scene?.isProtein ? `${label}: backbone ribbon, drag to rotate` : `${label}: ball-and-stick model, drag to rotate`} />;
}
