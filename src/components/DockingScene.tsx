"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Mol } from "@/lib/molecule-render";
import { buildScene, createRenderer, type Scene, type SpriteCanvas } from "@/lib/molecule-draw";
import { Molecule3D, type StructureEntry } from "./Molecule3D";
import { runFrameLoop, useAnimationBudget } from "@/lib/use-animation-budget";
import { MotionHint } from "./MotionHint";

const themeOf = () => { const t = document.documentElement.dataset.theme; return t === "dark" || t === "contrast" ? true : t === "light" ? false : window.matchMedia("(prefers-color-scheme: dark)").matches; };
const makeSprite = (sizePx: number): SpriteCanvas => { const c = document.createElement("canvas"); c.width = sizePx; c.height = sizePx; return { width: sizePx, height: sizePx, ctx: c.getContext("2d")!, image: c }; };
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/** Phase of the 7 second docking loop: the drug approaches, settles into place, holds, then the loop restarts. */
export function dockingPhase(t: number): { label: string; k: number } {
  if (t < 0.45) return { label: "Approaching the target", k: ease(t / 0.45) };
  if (t < 0.6) return { label: "Docking", k: 1 };
  if (t < 0.92) return { label: "Bound: the signal is blocked", k: 1 };
  return { label: "Releasing", k: 1 - ease((t - 0.92) / 0.08) };
}

/**
 * The drug arriving at its target, drawn from a solved complex: small-molecule ligands glide into their pocket,
 * antibody chains onto their antigen. The renderer reads positions each frame, so the loop moves the drug's atoms
 * and ribbon points between a displaced start and the real bound coordinates. Falls back to the molecule alone.
 */
export function DockingScene({ complex, molecule, targetName, height = "h-64 sm:h-72" }: { complex?: StructureEntry; molecule?: StructureEntry; targetName?: string; height?: string }) {
  const [mol, setMol] = useState<Mol | null>(null);
  const [failed, setFailed] = useState(false);
  // The complex (often the largest structure file on a page) is fetched once the scene has been on screen.
  const [near, setNear] = useState(false);
  useEffect(() => {
    if (!complex || !near) return;
    let alive = true;
    fetch(`/structures/${complex.file}`).then((r) => { if (!r.ok) throw new Error(String(r.status)); return r.json(); }).then((m: Mol) => { if (alive) setMol(m); }).catch(() => { if (alive) setFailed(true); });
    return () => { alive = false; };
  }, [complex, near]);
  const scene = useMemo(() => (mol ? buildScene(mol, true) : null), [mol]);

  if (!complex || failed) {
    if (!molecule) return null;
    return (
      <div className="relative">
        <Molecule3D entry={molecule} compact className={height} />
        <div className="absolute left-3 bottom-3 text-xs text-muted bg-card/80 rounded px-2 py-1">No solved complex yet: the molecule alone{targetName ? `, which binds ${targetName}` : ""}.</div>
      </div>
    );
  }
  return <DockCanvas scene={scene} height={height} label={complex.label} onVisible={() => setNear(true)} />;
}

/** Which parts of the scene are the drug: ligand-flagged atoms, or the antibody chain group in a protein complex. */
function drugParts(scene: Scene): { atomIdx: number[]; chainIdx: number[] } {
  const atomIdx: number[] = [];
  scene.atoms.forEach((a, i) => { if (a.lig) atomIdx.push(i); });
  if (atomIdx.length) return { atomIdx, chainIdx: [] };
  // No small ligand: split chains into two spatial groups; the drug is the group with two chains (a Fab) or the smaller one.
  const { rib, chains } = scene;
  const nC = chains.length; if (nC < 2) return { atomIdx: [], chainIdx: [] };
  const sum = Array.from({ length: nC }, () => [0, 0, 0, 0]);
  for (let i = 0; i < rib.count; i++) { const c = rib.chain[i]; sum[c][0] += rib.P[3 * i]; sum[c][1] += rib.P[3 * i + 1]; sum[c][2] += rib.P[3 * i + 2]; sum[c][3]++; }
  const cen = sum.map((s) => (s[3] ? [s[0] / s[3], s[1] / s[3], s[2] / s[3]] : [0, 0, 0]));
  // Two-means on chain centroids, seeded by the two farthest chains.
  let a = 0, b = 1, best = -1;
  for (let i = 0; i < nC; i++) for (let j = i + 1; j < nC; j++) { const d = dist(cen[i], cen[j]); if (d > best) { best = d; a = i; b = j; } }
  let ga = cen[a], gb = cen[b], groups: number[] = [];
  for (let it = 0; it < 6; it++) {
    groups = cen.map((c) => (dist(c, ga) <= dist(c, gb) ? 0 : 1));
    const acc = [[0, 0, 0, 0], [0, 0, 0, 0]];
    cen.forEach((c, i) => { const g = groups[i]; acc[g][0] += c[0]; acc[g][1] += c[1]; acc[g][2] += c[2]; acc[g][3]++; });
    if (acc[0][3]) ga = [acc[0][0] / acc[0][3], acc[0][1] / acc[0][3], acc[0][2] / acc[0][3]];
    if (acc[1][3]) gb = [acc[1][0] / acc[1][3], acc[1][1] / acc[1][3], acc[1][2] / acc[1][3]];
  }
  const n0 = groups.filter((g) => g === 0).length, n1 = nC - n0;
  const drugGroup = n0 === 2 && n1 !== 2 ? 0 : n1 === 2 && n0 !== 2 ? 1 : n0 <= n1 ? 0 : 1;
  return { atomIdx: [], chainIdx: groups.map((g, i) => (g === drugGroup ? i : -1)).filter((i) => i >= 0) };
}
const dist = (p: number[], q: number[]) => Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]);

function DockCanvas({ scene, height, label, onVisible }: { scene: Scene | null; height: string; label: string; onVisible?: () => void }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [phase, setPhase] = useState("Approaching the target");
  const visRef = useRef(onVisible);
  useEffect(() => { visRef.current = onVisible; }, [onVisible]);
  // Animation budget: pauses off screen and in a hidden tab, still under reduced motion, low-budget devices animate on tap.
  const gate = useAnimationBudget(ref, { tapToPlay: true });
  useEffect(() => {
    const check = () => { if (gate.state.visible) visRef.current?.(); };
    check();
    return gate.subscribe(check);
  }, [gate]);
  useEffect(() => {
    const canvas = ref.current; if (!canvas || !scene) return;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    const renderer = createRenderer(scene, makeSprite);
    const parts = drugParts(scene);
    // Displacement: from the drug's own centroid away from the scene centre, 1.4 radii out.
    const { rib, centre, radius } = scene;
    const origA = parts.atomIdx.map((i) => [...scene.atoms[i].p] as [number, number, number]);
    const chainSet = new Set(parts.chainIdx);
    const ribIdx: number[] = []; for (let i = 0; i < rib.count; i++) if (chainSet.has(rib.chain[i])) ribIdx.push(i);
    const origR = ribIdx.map((i) => [rib.P[3 * i], rib.P[3 * i + 1], rib.P[3 * i + 2]]);
    const acc = [0, 0, 0]; let n = 0;
    for (const p of origA) { acc[0] += p[0]; acc[1] += p[1]; acc[2] += p[2]; n++; }
    for (const p of origR) { acc[0] += p[0]; acc[1] += p[1]; acc[2] += p[2]; n++; }
    let dir = n ? [acc[0] / n - centre[0], acc[1] / n - centre[1], acc[2] / n - centre[2]] : [1, 0, 0];
    const len = Math.hypot(dir[0], dir[1], dir[2]); dir = len > 1e-6 ? dir.map((v) => v / len) : [1, 0.2, 0];
    const mag = radius * 1.4;
    const place = (k: number) => {
      const off = mag * (1 - k);
      parts.atomIdx.forEach((i, j) => { const o = origA[j]; scene.atoms[i].p = [o[0] + dir[0] * off, o[1] + dir[1] * off, o[2] + dir[2] * off]; });
      ribIdx.forEach((i, j) => { const o = origR[j]; rib.P[3 * i] = o[0] + dir[0] * off; rib.P[3 * i + 1] = o[1] + dir[1] * off; rib.P[3 * i + 2] = o[2] + dir[2] * off; });
    };
    let yaw = 0.6, last = 0, lastPhase = "";
    const t0 = performance.now();
    const draw = (time: number) => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const W = canvas.clientWidth, H = canvas.clientHeight; if (!W || !H) return;
      if (canvas.width !== Math.round(W * dpr) || canvas.height !== Math.round(H * dpr)) { canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr); }
      const dt = last ? Math.min(0.1, (time - last) / 1000) : 0; last = time;
      const reduced = gate.state.reduced;
      if (!reduced) yaw += dt * 0.25;
      const t = reduced ? 0.7 : ((time - t0) / 7000) % 1;
      const ph = dockingPhase(t); place(ph.k);
      if (ph.label !== lastPhase) { lastPhase = ph.label; setPhase(ph.label); }
      renderer.draw(ctx, { W, H, dpr, yaw, pitch: 0.35, showH: false, compact: false, dark: themeOf() });
    };
    const stop = runFrameLoop(gate, (time) => draw(time));
    return () => { stop(); place(1); };
  }, [scene, gate]);
  return (
    <div className="relative bg-gradient-to-b from-foreground/[0.03] to-transparent">
      <canvas ref={ref} className={`block w-full ${height}`} aria-label={`${label}: the drug moving into its binding site`} />
      <MotionHint gate={gate} />
      {!scene && <div className="absolute inset-0 flex items-center justify-center text-sm text-muted">Loading structure</div>}
      <div className="absolute left-3 bottom-3 text-xs rounded px-2 py-1 bg-card/85 border border-border"><span className="inline-block h-2 w-2 rounded-full bg-accent mr-1.5 align-middle" aria-hidden />{phase}</div>
    </div>
  );
}
