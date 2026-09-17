"use client";

import { useEffect, useMemo, useRef } from "react";
import { faceSegments, facing, fitScale, hexToRgb, sceneExtents, type Mesh, type Vec3 } from "@/lib/wireframe";
import { ALL_ANIMATED } from "@/data/schematics";
import { runFrameLoop, useAnimationBudget } from "@/lib/use-animation-budget";
import { MotionHint } from "./MotionHint";

/**
 * Slowly turning wireframe schematic on a canvas, in the same visual language as MoleculeViewer:
 * monoline strokes whose weight and opacity follow depth (near edges heavier and darker, far edges thin and pale),
 * optional translucent faces so closed shapes read as bodies, a slow sway about a three-quarter view with a gentle nod
 * (never edge-on, so the process stays legible), pause when off-screen,
 * a static three-quarter view under prefers-reduced-motion. Colours come from the theme's CSS variables
 * (--foreground, --muted, --accent, --garden-2, --wire-hot) so the drawing matches light, dark and contrast themes.
 * Segment classes: default structure, "accent" (energy/beam), "hot" (highlight), "soft" (context).
 *
 * If `mesh.animate` is set, each frame asks the mesh for replacement point positions, per-segment alpha
 * multipliers, a caption, and optional label overrides, so process schematics (ADC internalisation,
 * CAR-T killing, …) can play as loops while the whole scene keeps rotating.
 */
type Rgb = [number, number, number];
type Palette = { dark: boolean; contrast: boolean; base: Rgb; muted: Rgb; accent: Rgb; hot: Rgb; body: Rgb; card: Rgb };

function readPalette(): Palette {
  const root = document.documentElement;
  const theme = root.dataset.theme;
  const dark = theme === "dark" || theme === "contrast" ? true : theme === "light" ? false : window.matchMedia("(prefers-color-scheme: dark)").matches;
  const cs = getComputedStyle(root);
  const v = (name: string, fallback: Rgb): Rgb => hexToRgb(cs.getPropertyValue(name)) ?? fallback;
  return {
    dark,
    contrast: theme === "contrast",
    base: v("--foreground", dark ? [230, 233, 230] : [27, 31, 28]),
    muted: v("--muted", dark ? [166, 175, 169] : [91, 101, 94]),
    accent: v("--accent", dark ? [249, 168, 212] : [194, 24, 91]),
    hot: v("--wire-hot", dark ? [251, 191, 36] : [180, 83, 9]),
    body: v("--garden-2", dark ? [95, 127, 99] : [109, 138, 104]),
    card: v("--card", dark ? [26, 32, 30] : [252, 251, 248]),
  };
}

const rgba = (c: Rgb, a: number) => `rgba(${c[0]},${c[1]},${c[2]},${a.toFixed(3)})`;

/** Stroke colour, opacity and width for a segment class at depth t (0 back … 1 front). */
function stroke(cls: string | undefined, t: number, pal: Palette): { rgb: Rgb; alpha: number; width: number } {
  const L = !pal.dark;
  switch (cls) {
    case "accent": return { rgb: pal.accent, alpha: 0.45 + 0.55 * t, width: 1.05 + 1.1 * t };
    case "hot": return { rgb: pal.hot, alpha: 0.5 + 0.5 * t, width: 1.15 + 1.15 * t };
    case "soft": return { rgb: pal.muted, alpha: L ? 0.26 + 0.34 * t : 0.16 + 0.32 * t, width: 0.65 + 0.65 * t };
    default: return { rgb: pal.base, alpha: L ? 0.3 + 0.62 * t : 0.22 + 0.68 * t, width: (L ? 0.85 : 0.8) + 1.0 * t };
  }
}

/** Fill colour and base opacity for a face class (before facing and depth). */
function fill(cls: string | undefined, pal: Palette): { rgb: Rgb; alpha: number } {
  const L = !pal.dark;
  switch (cls) {
    case "accent": return { rgb: pal.accent, alpha: L ? 0.09 : 0.12 };
    case "hot": return { rgb: pal.hot, alpha: L ? 0.11 : 0.13 };
    case "soft": return { rgb: pal.muted, alpha: L ? 0.045 : 0.06 };
    default: return { rgb: pal.body, alpha: L ? 0.075 : 0.1 };
  }
}

/** `compact`: thumbnail mode. Draws at ~30 fps, skips labels and the caption box, thin progress bar. Safe to show many at once. */
export function Wireframe3D({ mesh: given, height = "h-64 sm:h-72", speed = 0.3, tilt = 0.35, compact = false }: { mesh: Mesh; height?: string; speed?: number; tilt?: number; compact?: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  // Animation budget: pauses off screen and in a hidden tab, still under reduced motion, thumbnails share six slots,
  // low-budget devices draw a still frame until a tap (full size) or a hover.
  const gate = useAnimationBudget(ref, compact ? { pool: "schematic" } : { tapToPlay: true });
  // Server components send a marker (`anim`) instead of the animation function; build the animated mesh here.
  const mesh = useMemo(() => (given.anim && ALL_ANIMATED[given.anim] ? ALL_ANIMATED[given.anim]() : given), [given]);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const basePts = mesh.points;
    const n = basePts.length;
    if (!n) return;
    const c = [0, 0, 0];
    for (const p of basePts) { c[0] += p[0]; c[1] += p[1]; c[2] += p[2]; }
    c[0] /= n; c[1] /= n; c[2] /= n;
    // Fit the scene to the card from its body extents (82nd/90th percentiles) rather than the maximum, so a few far-off
    // parts (an ADC approaching from the edge, a distant label anchor) do not shrink the whole drawing; fitScale
    // then caps the scale so those outliers still stay close to the card. The nod adds up to 0.2 rad to the tilt; half
    // of that is allowed for, since the extreme is momentary and a hair of overflow at the rim reads better than slack.
    const ext = sceneExtents(basePts, c as Vec3, tilt + 0.1);
    if (mesh.animate) { ext.hx *= 1.05; ext.hy *= 1.05; }
    let maxR = 0;
    for (const p of basePts) maxR = Math.max(maxR, Math.hypot(p[0] - c[0], p[1] - c[1], p[2] - c[2]));
    maxR ||= 1;
    const faces = mesh.faces ?? [];
    const faceSegs = faceSegments(mesh);
    let pal = readPalette();
    const font = getComputedStyle(document.body).fontFamily || "ui-sans-serif, system-ui, sans-serif";
    // Still frames (reduced motion, no slot, low budget) are not redrawn by the loop, so repaint them on theme changes and resizes.
    const repaint = () => { pal = readPalette(); if (!gate.state.active) draw(performance.now()); };
    const mo = new MutationObserver(repaint);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    const scheme = window.matchMedia("(prefers-color-scheme: dark)");
    scheme.addEventListener("change", repaint);

    const t0 = performance.now();
    const ro = new ResizeObserver(() => { if (!gate.state.active) draw(performance.now()); });
    ro.observe(canvas);

    const project = (time: number, W: number, H: number) => {
      const s = fitScale(W, H, ext, compact);
      const secs = (time - t0) / 1000;
      // Camera: the scene sways slowly about a three-quarter view (±0.5 rad around -0.25) rather than spinning through
      // 360°, because these compositions are laid out left-to-right and a full turn shows them edge-on twice a cycle.
      // `speed` sets the sway rate. Reduced motion: a still three-quarter view, slightly from above.
      const reduced = gate.state.reduced;
      const ay = reduced ? -0.62 : -0.25 + 0.5 * Math.sin(secs * speed);
      const ax = reduced ? tilt + 0.06 : tilt + Math.sin(secs * 0.15) * 0.2;
      const cy = Math.cos(ay), sy = Math.sin(ay), cx = Math.cos(ax), sx = Math.sin(ax);
      const zs = s / (maxR || 1);
      const f = (p: Vec3 | number[]) => {
        const x = p[0] - c[0], y = p[1] - c[1], z = p[2] - c[2];
        const x1 = x * cy + z * sy, z1 = -x * sy + z * cy;
        const y2 = y * cx - z1 * sx, z2 = y * sx + z1 * cx;
        return [W / 2 + x1 * s, H / 2 - y2 * s, z2 / (maxR || 1)] as const;
      };
      return { f, s, zs };
    };

    const draw = (time: number) => {
      // Supersample: at least 1.5× so strokes stay smooth on 1× displays, capped to keep many thumbnails cheap.
      const dpr = Math.min(3, Math.max(1.5, window.devicePixelRatio || 1));
      const W = canvas.clientWidth, H = canvas.clientHeight;
      if (!W || !H) return;
      const bw = Math.round(W * dpr), bh = Math.round(H * dpr);
      if (canvas.width !== bw || canvas.height !== bh) { canvas.width = bw; canvas.height = bh; }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      ctx.lineCap = "round"; ctx.lineJoin = "round";

      // Soft floor: a faint pool of shade below the model grounds it in the card.
      if (!pal.contrast) {
        const g = ctx.createRadialGradient(W / 2, H * 0.84, 0, W / 2, H * 0.84, W * 0.42);
        g.addColorStop(0, rgba(pal.base, pal.dark ? 0.1 : 0.045)); g.addColorStop(1, rgba(pal.base, 0));
        ctx.save(); ctx.translate(W / 2, H * 0.84); ctx.scale(1, compact ? 0.16 : 0.2); ctx.translate(-W / 2, -H * 0.84);
        ctx.fillStyle = g; ctx.fillRect(0, -H * 4, W, H * 9); ctx.restore();
      }

      // Animation frame (static meshes: identity).
      let pts: Vec3[] = basePts, alpha: number[] | undefined, caption: string | undefined, labels = mesh.labels ?? [];
      if (mesh.animate) {
        const reduced = gate.state.reduced;
        const t = reduced ? 0.35 : (((time - t0) / 1000) % mesh.animate.duration) / mesh.animate.duration;
        const fr = mesh.animate.frame(t);
        // Seamless loop: over the last part of the cycle, ease the geometry back towards the opening frame so the
        // restart is a continuation rather than a jump. Captions and labels switch at the end.
        const BLEND = 0.14;
        if (!reduced && t > 1 - BLEND) {
          const w0 = (t - (1 - BLEND)) / BLEND, w = w0 * w0 * (3 - 2 * w0);
          const f0 = mesh.animate.frame(0);
          const a = fr.points ?? basePts, b = f0.points ?? basePts;
          const len = Math.max(a.length, b.length);
          const mixed: Vec3[] = [];
          for (let i = 0; i < len; i++) { const pa = a[i] ?? basePts[i], pb = b[i] ?? basePts[i]; mixed.push([pa[0] + (pb[0] - pa[0]) * w, pa[1] + (pb[1] - pa[1]) * w, pa[2] + (pb[2] - pa[2]) * w]); }
          fr.points = mixed;
          if (fr.alpha || f0.alpha) { const aa = fr.alpha, ab = f0.alpha; fr.alpha = Array.from({ length: Math.max(aa?.length ?? 0, ab?.length ?? 0) }, (_, i) => { const x = aa?.[i] ?? 1, y = ab?.[i] ?? 1; return x + (y - x) * w; }); }
        }
        if (fr.points) pts = fr.points.length >= n ? fr.points : fr.points.concat(basePts.slice(fr.points.length));
        alpha = fr.alpha; caption = fr.caption; if (fr.labels) labels = fr.labels;
      }

      const { f, zs } = project(time, W, H);
      const proj = pts.map(f);

      // Faces first, back to front: a translucent wash tinted by class, stronger when facing the viewer and nearer.
      if (faces.length) {
        const order = faces.map((fc, k) => { let d = 0; for (const i of fc.idx) d += proj[i]?.[2] ?? 0; return [k, d / (fc.idx.length || 1)] as const; }).sort((a, b) => a[1] - b[1]);
        for (const [k, depth] of order) {
          const fc = faces[k];
          let mul = 1;
          if (alpha) { const segs = faceSegs[k]; if (segs.length) { let s = 0; for (const i of segs) s += alpha[i] ?? 1; mul = s / segs.length; } }
          if (mul <= 0.02) continue;
          const poly = fc.idx.map((i) => proj[i]).filter(Boolean);
          if (poly.length < 3) continue;
          const view = facing(poly.map((p) => [p[0], p[1], p[2] * maxR * zs] as Vec3));
          const t = Math.max(0, Math.min(1, (depth + 1) / 2));
          const { rgb, alpha: a0 } = fill(fc.cls, pal);
          const a = a0 * (0.3 + 0.7 * view) * (0.55 + 0.45 * t) * mul;
          if (a <= 0.004) continue;
          ctx.fillStyle = rgba(rgb, a);
          ctx.beginPath(); ctx.moveTo(poly[0][0], poly[0][1]);
          for (let i = 1; i < poly.length; i++) ctx.lineTo(poly[i][0], poly[i][1]);
          ctx.closePath(); ctx.fill();
        }
      }

      // Edges, back to front, with depth-graded weight and opacity.
      const order = mesh.segments.map((seg, k) => [k, (proj[seg[0]][2] + proj[seg[1]][2]) / 2] as const).sort((a, b) => a[1] - b[1]);
      const heavy = compact ? 0.9 : 1;
      for (const [k, depth] of order) {
        const mul = alpha ? (alpha[k] ?? 1) : 1;
        if (mul <= 0.01) continue;
        const [a, b, cls] = mesh.segments[k];
        const pa = proj[a], pb = proj[b];
        const t = Math.max(0, Math.min(1, (depth + 1) / 2)); // 0 back … 1 front
        const st = stroke(cls, t, pal);
        const col = rgba(st.rgb, st.alpha * mul);
        if (a === b) { ctx.fillStyle = col; ctx.beginPath(); ctx.arc(pa[0], pa[1], (1.2 + 1.6 * t) * heavy, 0, Math.PI * 2); ctx.fill(); continue; }
        ctx.strokeStyle = col; ctx.lineWidth = st.width * heavy;
        ctx.beginPath(); ctx.moveTo(pa[0], pa[1]); ctx.lineTo(pb[0], pb[1]); ctx.stroke();
      }

      // Labels: leader dot + text, faded by depth, skipped when far behind (not drawn in compact mode).
      if (compact) labels = [];
      ctx.font = `11px ${font}`;
      ctx.textBaseline = "middle";
      for (const l of labels) {
        const p = f(l.at);
        const t = (p[2] + 1) / 2;
        if (t < 0.25) continue;
        const al = 0.35 + 0.65 * Math.min(1, t);
        ctx.fillStyle = rgba(pal.base, al);
        ctx.beginPath(); ctx.arc(p[0], p[1], 2.2, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = rgba(pal.base, al * 0.5); ctx.lineWidth = 0.8;
        ctx.beginPath(); ctx.moveTo(p[0], p[1]); ctx.lineTo(p[0] + 10, p[1] - 10); ctx.stroke();
        const w = ctx.measureText(l.text).width;
        ctx.fillStyle = rgba(pal.card, 0.82 * al);
        ctx.fillRect(p[0] + 12, p[1] - 18, w + 6, 15);
        ctx.fillStyle = rgba(pal.base, al);
        ctx.fillText(l.text, p[0] + 15, p[1] - 10.5);
      }
      // Caption for animated process phases; thumbnails (compact) draw none, since a truncated caption reads as cycling numbers.
      if (caption && !compact) {
        ctx.font = `600 12px ${font}`;
        let text = caption;
        while (text.length > 4 && ctx.measureText(text).width > W - 36) text = text.slice(0, -2).trimEnd() + "…";
        const w = ctx.measureText(text).width;
        ctx.fillStyle = rgba(pal.card, 0.9);
        ctx.fillRect(10, H - 30, w + 16, 22);
        ctx.strokeStyle = rgba(pal.base, 0.25); ctx.lineWidth = 1; ctx.strokeRect(10.5, H - 29.5, w + 15, 21);
        ctx.fillStyle = rgba(pal.base, 0.95);
        ctx.fillText(text, 18, H - 19);
      }
    };

    const stop = runFrameLoop(gate, (time) => draw(time), { fps: compact ? 30 : undefined });
    return () => { stop(); ro.disconnect(); mo.disconnect(); scheme.removeEventListener("change", repaint); };
  }, [mesh, speed, tilt, compact, gate]);

  return (
    <div className="relative wire-bg">
      <canvas ref={ref} className={`block w-full ${height}`} aria-label={mesh.animate ? "Animated rotating wireframe schematic" : "Rotating wireframe schematic"} />
      {/* The labels are painted into the canvas, where translators and screen readers cannot see them; repeat them as real text. */}
      {!compact && (mesh.labels?.length ?? 0) > 0 && <ul className="sr-only" lang="en">{mesh.labels!.map((l, i) => <li key={i}>{l.text}</li>)}</ul>}
      {!compact && <MotionHint gate={gate} />}
    </div>
  );
}
