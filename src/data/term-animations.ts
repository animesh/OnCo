/**
 * Animated wireframe schematics for glossary term CATEGORIES (Endpoints, Biomarkers, Genomics, …).
 * Each tells what that kind of concept is about in 3-5 captioned phases on a 10-14 s loop, using the
 * same scene/part/frame machinery as the technology and front animations. Every mesh stays under
 * 400 points. Registered under the key `term:<slug>`; see TERM_ANIMATED at the bottom.
 */
import { add, arrow, box, cylinder, dna, dots, ellipsoid, empty, lerp, lerp3, line, movePart, octahedron, phase, polyline, ring, setAlpha, sphere, type Mesh, type Part, type Vec3 } from "@/lib/wireframe";
import { ANIMATED, buffers, pulse, put, receptor, scene, type Scene } from "./animated";
import { FRONT_ANIMATED } from "./front-animations";

const TAU = Math.PI * 2;
const cell = (r: number, cls?: string) => sphere(r, 4, 8, cls);
const grow = (alpha: number[], p: Part, u: number) => { const n = p.s1 - p.s0; for (let k = 0; k < n; k++) alpha[p.s0 + k] = Math.max(0, Math.min(1, u * n - k)); };
const hide = (alpha: number[], ...parts: Part[]) => parts.forEach((p) => setAlpha(alpha, p, 0));
const moveTo = (pts: Vec3[], base: Vec3[], p: Part, from: Vec3, to: Vec3, u: number, scale = 1, spin = 0) => { const d = lerp3(from, to, u); movePart(pts, base, p, [d[0] - from[0], d[1] - from[1], d[2] - from[2]], scale, spin); };
const stepIn = (u: number, i: number, n: number) => Math.max(0, Math.min(1, u * n - i));
function frame(sc: Scene, duration: number, fn: (t: number, pts: Vec3[], alpha: number[]) => { caption: string; labels?: Array<{ at: Vec3; text: string }> }): Mesh {
  sc.mesh.animate = { duration, frame: (t) => { const { pts, alpha } = buffers(sc); const r = fn(t, pts, alpha); return { points: pts, alpha, caption: r.caption, labels: r.labels ?? sc.mesh.labels }; } };
  return sc.mesh;
}
/** Small standing figure, ~1.8 tall. */
function figure(cls?: string): Mesh {
  const m = empty();
  add(m, sphere(0.16, 3, 8, cls), { at: [0, 0.78, 0] });
  add(m, polyline([[0, 0.6, 0], [0, 0.0, 0]], cls));
  add(m, polyline([[-0.32, 0.5, 0], [0, 0.55, 0], [0.32, 0.5, 0]], cls));
  add(m, polyline([[-0.32, 0.5, 0], [-0.4, 0.0, 0]], cls)); add(m, polyline([[0.32, 0.5, 0], [0.4, 0.0, 0]], cls));
  add(m, polyline([[-0.18, 0.0, 0], [0.18, 0.0, 0]], cls));
  add(m, polyline([[-0.18, 0.0, 0], [-0.2, -0.8, 0]], cls)); add(m, polyline([[0.18, 0.0, 0], [0.2, -0.8, 0]], cls));
  return m;
}
/** L-shaped axes in the XY plane with origin at `o`. */
function axes(o: Vec3, w: number, h: number): Mesh { const m = empty(); add(m, arrow(o, [o[0] + w, o[1], o[2]], "soft", 0.06)); add(m, arrow(o, [o[0], o[1] + h, o[2]], "soft", 0.06)); return m; }

// ---------------------------------------------------------------- Endpoints
export function endpointsTerm(): Mesh {
  const sc = scene();
  const O: Vec3 = [-2.0, -1.1, 0];
  put(sc, "axes", axes(O, 4.2, 2.4));
  const curve = (k: number, cls: string) => { const pts: Vec3[] = []; for (let i = 0; i <= 14; i++) { const x = i / 14; pts.push([O[0] + 4.0 * x, O[1] + 2.2 * Math.exp(-k * x * x * 2.2), 0]); } return polyline(pts, cls); };
  const ctrl = put(sc, "ctrl", curve(1.6, "soft"));
  const exp = put(sc, "exp", curve(0.7, "accent"));
  const median = put(sc, "median", line([O[0], O[1] + 1.1, 0], [O[0] + 4.0, O[1] + 1.1, 0], "hot"));
  const mC = put(sc, "mC", line([O[0] + 1.35, O[1], 0], [O[0] + 1.35, O[1] + 1.1, 0], "soft"));
  const mE = put(sc, "mE", line([O[0] + 2.3, O[1], 0], [O[0] + 2.3, O[1] + 1.1, 0], "accent"));
  const hr1 = put(sc, "hr1", line([1.2, 0.9, 0], [2.2, 0.35, 0], "soft"));
  const hr2 = put(sc, "hr2", line([1.2, 0.9, 0], [2.2, 0.65, 0], "accent"));
  return frame(sc, 12, (t, pts, alpha) => {
    hide(alpha, median, mC, mE, hr1, hr2);
    let caption = "";
    if (t < 0.3) { const u = phase(t, 0, 0.3); grow(alpha, ctrl, u); grow(alpha, exp, u); caption = "1 · Follow patients over time: the fraction still alive (or progression-free) falls"; }
    else if (t < 0.55) { const u = phase(t, 0.3, 0.55); setAlpha(alpha, median, u); grow(alpha, mC, u); grow(alpha, mE, u); caption = "2 · The median is where half have had the event: 8 vs 14 months, say"; }
    else if (t < 0.8) { setAlpha(alpha, median, 0.5); setAlpha(alpha, mC, 1); setAlpha(alpha, mE, 1); const u = phase(t, 0.55, 0.8); grow(alpha, hr1, u); grow(alpha, hr2, u); caption = "3 · The hazard ratio compares the two slopes: 0.6 means 40% lower risk at any moment"; }
    else { setAlpha(alpha, median, 0.5); setAlpha(alpha, mC, 1); setAlpha(alpha, mE, 1); setAlpha(alpha, hr1, 1); setAlpha(alpha, hr2, pulse(t, 4)); caption = "4 · ORR, pCR, PFS, OS: different endpoints, different questions; OS is the gold standard"; }
    return { caption, labels: [{ at: [O[0] + 4.3, O[1], 0], text: "Time" }, { at: [O[0], O[1] + 2.6, 0], text: "% alive" }, { at: [O[0] + 3.6, O[1] + 1.35, 0], text: t >= 0.3 ? "Median" : "" }, ...(t >= 0.55 ? [{ at: [1.7, 1.15, 0] as Vec3, text: "Hazard ratio" }] : [])] };
  });
}

// ---------------------------------------------------------------- Biomarkers
export function biomarkersTerm(): Mesh {
  const sc = scene();
  put(sc, "block", box(3.2, 2.0, 0.3, "soft"));
  const cells: Part[] = []; const pos: number[] = [];
  for (let i = 0; i < 20; i++) { const x = -1.35 + 0.3 * (i % 10), y = -0.4 + 0.8 * Math.floor(i / 10); const positive = i % 3 !== 1; pos.push(positive ? 1 : 0); cells.push(put(sc, `c${i}`, ring(0.11, 8, positive ? "hot" : undefined, "z"), { at: [x, y, 0.16] })); }
  const thresh = put(sc, "thresh", line([-1.6, -0.9, 0.2], [1.6, -0.9, 0.2], "accent"));
  const bar = put(sc, "bar", box(2.4, 0.18, 0.1, "accent"), { at: [0, -1.5, 0] });
  const barFrame = put(sc, "barFrame", box(3.6, 0.22, 0.12, "soft"), { at: [0, -1.5, 0] });
  const base = sc.mesh.points;
  return frame(sc, 12, (t, pts, alpha) => {
    hide(alpha, thresh, bar, barFrame);
    let caption = "";
    if (t < 0.25) { const u = phase(t, 0, 0.25); cells.forEach((c) => setAlpha(alpha, c, 0.35 + 0.65 * u)); caption = "1 · A tumour sample is stained for one protein (ER, HER2, PD-L1) or sequenced for a gene"; }
    else if (t < 0.5) { const u = phase(t, 0.25, 0.5); cells.forEach((c, i) => setAlpha(alpha, c, pos[i] ? 1 : 0.35 + 0.15 * (1 - u))); setAlpha(alpha, thresh, 1); movePart(pts, base, thresh, [0, lerp(0, 0.9, u), 0]); caption = "2 · A threshold is set: how many cells, how strongly, must be positive"; }
    else if (t < 0.75) { cells.forEach((c, i) => setAlpha(alpha, c, pos[i] ? pulse(t, 3) : 0.35)); setAlpha(alpha, thresh, 0.6); movePart(pts, base, thresh, [0, 0.9, 0]); const u = phase(t, 0.5, 0.75); setAlpha(alpha, barFrame, 1); setAlpha(alpha, bar, u); movePart(pts, base, bar, [-1.2 + 1.2 * u, 0, 0], 1); caption = "3 · Above it the patient is 'positive' and eligible; the same assay, a different cut-off, a different answer"; }
    else { cells.forEach((c, i) => setAlpha(alpha, c, pos[i] ? 1 : 0.35)); setAlpha(alpha, barFrame, 1); setAlpha(alpha, bar, 1); caption = "4 · Prognostic tells you the likely course; predictive tells you whether a drug will work"; }
    return { caption, labels: [{ at: [0, 1.3, 0], text: "Tumour section" }, ...(t >= 0.25 ? [{ at: [1.9, 0.0, 0.2] as Vec3, text: "Threshold" }] : []), ...(t >= 0.5 ? [{ at: [2.1, -1.5, 0] as Vec3, text: "Positive fraction" }] : [])] };
  });
}

// ---------------------------------------------------------------- Genomics
export function genomicsTerm(): Mesh {
  const sc = scene();
  const helixP = put(sc, "dna", dna(0.32, 2.2, 2.5, 36, undefined, 4), { at: [-2.0, 0, 0] });
  const reads: Part[] = [];
  for (let i = 0; i < 8; i++) reads.push(put(sc, `r${i}`, line([-0.6 + 0.12 * (i % 3), -1.0 + 0.28 * i, 0], [1.2 + 0.12 * (i % 3), -1.0 + 0.28 * i, 0], "accent")));
  const muts: Part[] = [];
  for (let i = 0; i < 8; i++) muts.push(put(sc, `m${i}`, dots([[0.45, -1.0 + 0.28 * i, 0.02]], "hot")));
  const vafFrame = put(sc, "vf", box(1.0, 0.16, 0.1, "soft"), { at: [2.4, -0.4, 0] });
  const vaf = put(sc, "vaf", box(0.375, 0.14, 0.08, "hot"), { at: [2.4 - 0.3125, -0.4, 0] });
  const base = sc.mesh.points;
  const mutated = [1, 4, 6];
  return frame(sc, 12, (t, pts, alpha) => {
    hide(alpha, ...reads, ...muts, vafFrame, vaf);
    let caption = "";
    if (t < 0.25) { const u = phase(t, 0, 0.25); movePart(pts, base, helixP, [0, 0, 0], 1, u * 2); setAlpha(alpha, helixP, 1); caption = "1 · Tumour DNA (and RNA) is extracted and broken into millions of fragments"; }
    else if (t < 0.5) { movePart(pts, base, helixP, [0, 0, 0], 1, 2); setAlpha(alpha, helixP, 0.5); const u = phase(t, 0.25, 0.5); reads.forEach((r, i) => grow(alpha, r, stepIn(u, i, 8))); caption = "2 · Sequencing reads each fragment; reads are stacked against the reference genome"; }
    else if (t < 0.75) { setAlpha(alpha, helixP, 0.3); reads.forEach((r) => setAlpha(alpha, r, 1)); const u = phase(t, 0.5, 0.75); mutated.forEach((i, k) => setAlpha(alpha, muts[i], stepIn(u, k, 3) * pulse(t, 4))); caption = "3 · Where reads disagree with the reference, a variant is called: missense, frameshift, fusion, copy gain"; }
    else { setAlpha(alpha, helixP, 0.3); reads.forEach((r) => setAlpha(alpha, r, 1)); mutated.forEach((i) => setAlpha(alpha, muts[i], 1)); const u = phase(t, 0.75, 1); setAlpha(alpha, vafFrame, 1); setAlpha(alpha, vaf, u); caption = "4 · Variant allele frequency = mutant reads ÷ all reads (3 of 8 here): clonal or subclonal, tumour or germline"; }
    return { caption, labels: [{ at: [-2.0, 1.35, 0], text: "DNA" }, ...(t >= 0.25 ? [{ at: [0.3, 1.35, 0] as Vec3, text: "Reads vs reference" }] : []), ...(t >= 0.75 ? [{ at: [2.4, -0.05, 0] as Vec3, text: "VAF 37%" }] : [])] };
  });
}

// ---------------------------------------------------------------- Clinical
export function clinicalTerm(): Mesh {
  const sc = scene();
  put(sc, "axis", arrow([-2.6, -0.6, 0], [2.8, -0.6, 0], "soft", 0.05));
  const neo = put(sc, "neo", box(1.0, 0.4, 0.3, "accent"), { at: [-1.9, -0.3, 0] });
  const surg = put(sc, "surg", polyline([[-1.2, -0.9, 0], [-1.2, 0.3, 0]], "hot"));
  const adj = put(sc, "adj", box(1.0, 0.4, 0.3, "accent"), { at: [-0.5, -0.3, 0] });
  const relapse = put(sc, "rel", sphere(0.14, 3, 8, "hot"), { at: [0.5, -0.3, 0] });
  const lines: Part[] = [];
  for (let i = 0; i < 3; i++) lines.push(put(sc, `l${i}`, box(0.6 - 0.1 * i, 0.3, 0.3, i === 0 ? "accent" : "soft"), { at: [1.1 + 0.7 * i, -0.3 + 0.0, 0] }));
  const prog: Part[] = []; for (let i = 0; i < 2; i++) prog.push(put(sc, `p${i}`, dots([[1.45 + 0.7 * i, 0.05, 0]], "hot")));
  const scope = put(sc, "scope", ring(0.35, 14, "soft", "z"), { at: [-1.2, 0.85, 0] });
  const scopeDot = put(sc, "sd", dots([[-1.2, 0.85, 0.02]], "hot"));
  const base = sc.mesh.points;
  return frame(sc, 12, (t, pts, alpha) => {
    hide(alpha, adj, relapse, ...lines, ...prog, scope, scopeDot);
    let caption = "";
    if (t < 0.25) { const u = phase(t, 0, 0.25); setAlpha(alpha, neo, u); setAlpha(alpha, surg, 0.4 + 0.6 * u); setAlpha(alpha, scope, 1); setAlpha(alpha, scopeDot, pulse(t, 3)); movePart(pts, base, scopeDot, [0, 0, 0], 1 - 0.5 * u); caption = "1 · Neoadjuvant: treatment before surgery shrinks the tumour and shows if it responds (pCR)"; }
    else if (t < 0.5) { setAlpha(alpha, surg, 1); setAlpha(alpha, scope, 0.5); const u = phase(t, 0.25, 0.5); setAlpha(alpha, adj, u); caption = "2 · Adjuvant: treatment after surgery to kill what cannot be seen (micrometastases)"; }
    else if (t < 0.75) { setAlpha(alpha, adj, 1); setAlpha(alpha, scope, 0.3); const u = phase(t, 0.5, 0.75); setAlpha(alpha, relapse, u > 0.3 ? pulse(t, 4) : 0); setAlpha(alpha, lines[0], stepIn(u, 1, 2)); caption = "3 · If it comes back or has spread: first-line therapy for metastatic disease"; }
    else { setAlpha(alpha, adj, 1); setAlpha(alpha, scope, 0.3); setAlpha(alpha, relapse, 1); const u = phase(t, 0.75, 1); lines.forEach((l, i) => setAlpha(alpha, l, i === 0 ? 1 : stepIn(u, i - 1, 2))); prog.forEach((p, i) => setAlpha(alpha, p, stepIn(u, i, 2) * pulse(t, 4))); caption = "4 · Each progression starts a new line: second, third… order and sequencing are the craft"; }
    return { caption, labels: [{ at: [-1.9, 0.1, 0], text: t < 0.25 ? "" : "Neoadjuvant" }, { at: [-1.2, 0.45, 0], text: "Surgery" }, ...(t >= 0.25 ? [{ at: [-0.5, 0.1, 0] as Vec3, text: "Adjuvant" }] : []), ...(t >= 0.5 ? [{ at: [1.8, 0.35, 0] as Vec3, text: "Lines of therapy" }] : []), { at: [3.0, -0.6, 0], text: "Time" }] };
  });
}

// ---------------------------------------------------------------- Biology
export function biologyTerm(): Mesh {
  const sc = scene();
  const rec = put(sc, "rec", receptor([-1.2, 1.35, 0], 0.3, "soft"));
  const lig = put(sc, "lig", octahedron(0.12, "accent"), { at: [-2.2, 2.2, 0.2] });
  const nodes: Vec3[] = [[-1.0, 0.7, 0], [-0.3, 0.2, 0], [0.5, -0.2, 0], [1.3, -0.5, 0]];
  const bulbs: Part[] = []; const links: Part[] = [];
  let prev: Vec3 = [-0.9, 1.35, 0];
  nodes.forEach((n, i) => { links.push(put(sc, `k${i}`, arrow(prev, n, "hot", 0.2))); bulbs.push(put(sc, `b${i}`, sphere(0.13, 2, 8), { at: n })); prev = n; });
  const nuc = put(sc, "nuc", sphere(0.5, 4, 8, "soft"), { at: [2.2, -0.7, 0] });
  const gene = put(sc, "gene", line([1.95, -0.75, 0.05], [2.45, -0.75, 0.05], "hot"));
  const base = sc.mesh.points;
  const LIG0: Vec3 = [-2.2, 2.2, 0.2], LIG1: Vec3 = [-0.9, 1.35, 0.02];
  const names = ["kinase", "kinase", "kinase", "TF"];
  return frame(sc, 11, (t, pts, alpha) => {
    hide(alpha, ...links, gene); bulbs.forEach((b) => setAlpha(alpha, b, 0.4));
    let caption = "";
    if (t < 0.25) { const u = phase(t, 0, 0.25); moveTo(pts, base, lig, LIG0, LIG1, u, 1, u * 4); setAlpha(alpha, rec, 0.6 + 0.4 * u); caption = "1 · A signal (growth factor, hormone) docks on a receptor at the cell surface"; }
    else if (t < 0.6) { movePart(pts, base, lig, [LIG1[0] - LIG0[0], LIG1[1] - LIG0[1], LIG1[2] - LIG0[2]], 1, 4); const u = phase(t, 0.25, 0.6); links.forEach((l, i) => grow(alpha, l, stepIn(u, i, 4))); bulbs.forEach((b, i) => setAlpha(alpha, b, 0.4 + 0.6 * stepIn(u, i, 4))); caption = "2 · A cascade of proteins passes it on, each switching the next (phosphorylation)"; }
    else if (t < 0.85) { movePart(pts, base, lig, [LIG1[0] - LIG0[0], LIG1[1] - LIG0[1], LIG1[2] - LIG0[2]], 1, 4); links.forEach((l) => setAlpha(alpha, l, 1)); bulbs.forEach((b) => setAlpha(alpha, b, 1)); const u = phase(t, 0.6, 0.85); setAlpha(alpha, gene, u * pulse(t, 5)); setAlpha(alpha, nuc, 0.6 + 0.4 * u); caption = "3 · In the nucleus, transcription factors switch genes on: divide, survive, move"; }
    else { movePart(pts, base, lig, [LIG1[0] - LIG0[0], LIG1[1] - LIG0[1], LIG1[2] - LIG0[2]], 1, 4); links.forEach((l, i) => setAlpha(alpha, l, pulse(t + 0.08 * i, 3))); bulbs.forEach((b) => setAlpha(alpha, b, 1)); setAlpha(alpha, gene, pulse(t, 5)); caption = "4 · Cancer jams a switch in the 'on' position; pathways are where drugs intervene"; }
    return { caption, labels: [{ at: [-1.2, 1.7, 0], text: "Receptor" }, ...nodes.map((n, i) => ({ at: [n[0], n[1] - 0.3, 0] as Vec3, text: names[i] })), { at: [2.2, -0.05, 0], text: "Nucleus" }] };
  });
}

// ---------------------------------------------------------------- Pathology
export function pathologyTerm(): Mesh {
  const sc = scene();
  put(sc, "organ", ellipsoid(0.8, 0.55, 0.45, 4, 10, "soft"), { at: [-2.3, 0.2, 0] });
  const NEEDLE0: Vec3 = [-1.1, 1.7, 0.2], NEEDLE1: Vec3 = [-2.05, 0.45, 0.15];
  const needle = put(sc, "needle", polyline([[0, 0, 0], [0.7, 0.8, 0]], "accent"), { at: NEEDLE0 });
  put(sc, "slide", box(1.0, 0.04, 0.6, "soft"), { at: [-0.4, -0.6, 0] });
  const section = put(sc, "section", ring(0.16, 10, "hot", "y"), { at: [-0.4, -0.56, 0] });
  const lens = put(sc, "lens", ring(0.9, 24, undefined, "z"), { at: [1.4, 0.3, 0] });
  const nuclei: Part[] = [];
  for (let i = 0; i < 12; i++) { const a = (TAU * i) / 12, r = 0.25 + 0.35 * ((i * 7) % 5) / 5; const big = i % 4 === 0; nuclei.push(put(sc, `n${i}`, ring(big ? 0.13 : 0.08, 8, big ? "hot" : "soft", "z"), { at: [1.4 + r * Math.cos(a), 0.3 + r * Math.sin(a), 0.02] })); }
  const gradeBars: Part[] = []; for (let i = 0; i < 3; i++) gradeBars.push(put(sc, `g${i}`, box(0.22, 0.25 + 0.3 * i, 0.15, i === 2 ? "hot" : "soft"), { at: [2.8, -1.0 + 0.125 + 0.15 * i, 0] }));
  const base = sc.mesh.points;
  return frame(sc, 12, (t, pts, alpha) => {
    hide(alpha, section, lens, ...nuclei, ...gradeBars);
    let caption = "";
    if (t < 0.25) { const u = phase(t, 0, 0.25); moveTo(pts, base, needle, NEEDLE0, NEEDLE1, u); caption = "1 · A biopsy or the surgical specimen goes to the pathology lab"; }
    else if (t < 0.5) { const u = phase(t, 0.25, 0.5); moveTo(pts, base, needle, NEEDLE0, NEEDLE1, 1 - u); setAlpha(alpha, needle, 1 - 0.6 * u); setAlpha(alpha, section, u); caption = "2 · Fixed, sliced thinner than a hair, stained (H&E), mounted on glass"; }
    else if (t < 0.78) { setAlpha(alpha, needle, 0.4); setAlpha(alpha, section, 1); const u = phase(t, 0.5, 0.78); setAlpha(alpha, lens, u); nuclei.forEach((n, i) => setAlpha(alpha, n, stepIn(u, i, 12))); caption = "3 · Under the microscope: cell shape, nuclei, how much it resembles normal tissue"; }
    else { setAlpha(alpha, needle, 0.4); setAlpha(alpha, section, 1); setAlpha(alpha, lens, 1); nuclei.forEach((n, i) => setAlpha(alpha, n, i % 4 === 0 ? pulse(t, 4) : 1)); const u = phase(t, 0.78, 1); gradeBars.forEach((g, i) => setAlpha(alpha, g, stepIn(u, i, 3))); caption = "4 · Type, grade, margins, nodes, receptors: the report that drives every decision"; }
    return { caption, labels: [{ at: [-2.3, 0.9, 0], text: "Tissue" }, { at: [-0.4, -0.95, 0], text: "Slide" }, ...(t >= 0.5 ? [{ at: [1.4, 1.4, 0] as Vec3, text: "Microscope field" }] : []), ...(t >= 0.78 ? [{ at: [2.8, -0.05, 0] as Vec3, text: "Grade" }] : [])] };
  });
}

// ---------------------------------------------------------------- Immunology
export function immunologyTerm(): Mesh {
  const sc = scene();
  const TC0: Vec3 = [-2.6, 0, 0], TC1: Vec3 = [-1.15, 0, 0], TUM: Vec3 = [1.15, 0, 0];
  const tcell = put(sc, "t", cell(0.85, "soft"), { at: TC0 });
  put(sc, "tum", cell(0.85, "hot"), { at: TUM });
  const tcr = put(sc, "tcr", line([-0.35, -0.2, 0], [0.35, -0.2, 0], "accent"));
  const brake = put(sc, "brake", line([-0.35, 0.3, 0], [0.35, 0.3, 0], "hot"));
  const cyt: Part[] = []; for (let i = 0; i < 8; i++) { const a = (TAU * i) / 8; cyt.push(put(sc, `cy${i}`, dots([[0, 0, 0]], "accent"), { at: [TC1[0] + Math.cos(a) * 1.1, Math.sin(a) * 1.1, 0.1 * Math.sin(a)] })); }
  const mem: Part[] = []; for (let i = 0; i < 3; i++) mem.push(put(sc, `m${i}`, cell(0.28, "soft"), { at: [-2.4 + 0.5 * i, -1.6, 0.1 * i] }));
  const base = sc.mesh.points;
  return frame(sc, 12, (t, pts, alpha) => {
    hide(alpha, tcr, brake, ...cyt, ...mem);
    let caption = "";
    if (t < 0.25) { const u = phase(t, 0, 0.25); moveTo(pts, base, tcell, TC0, TC1, u); caption = "1 · Immune cells patrol; a T cell meets a tumour cell showing a foreign fragment (antigen)"; }
    else if (t < 0.5) { moveTo(pts, base, tcell, TC0, TC1, 1); const u = phase(t, 0.25, 0.5); setAlpha(alpha, tcr, u); setAlpha(alpha, brake, u * pulse(t, 3)); caption = "2 · Recognition (TCR-MHC) plus a second signal; checkpoints like PD-1 can veto the attack"; }
    else if (t < 0.78) { moveTo(pts, base, tcell, TC0, TC1, 1); setAlpha(alpha, tcr, 1); setAlpha(alpha, brake, 0.2); const u = phase(t, 0.5, 0.78); cyt.forEach((c, i) => { const a = (TAU * i) / 8; setAlpha(alpha, c, stepIn(u, i % 4, 4)); movePart(pts, base, c, [Math.cos(a) * 0.9 * u, Math.sin(a) * 0.9 * u, 0]); }); caption = "3 · Activated: cytokines recruit help, granzymes kill; the tumour may hide MHC or recruit suppressors"; }
    else { moveTo(pts, base, tcell, TC0, TC1, 1); setAlpha(alpha, tcr, 1); cyt.forEach((c, i) => { const a = (TAU * i) / 8; setAlpha(alpha, c, 0.5); movePart(pts, base, c, [Math.cos(a) * 0.9, Math.sin(a) * 0.9, 0]); }); const u = phase(t, 0.78, 1); mem.forEach((m, i) => setAlpha(alpha, m, stepIn(u, i, 3))); caption = "4 · Memory cells remain: why immune responses can last for years"; }
    return { caption, labels: [{ at: [TC1[0], 1.15, 0], text: "T cell" }, { at: [TUM[0], 1.15, 0], text: "Tumour cell" }, ...(t >= 0.25 && t < 0.78 ? [{ at: [0, 0.6, 0] as Vec3, text: "Checkpoint" }] : []), ...(t >= 0.78 ? [{ at: [-1.9, -1.95, 0] as Vec3, text: "Memory" }] : [])] };
  });
}

// ---------------------------------------------------------------- Resistance
export function resistanceTerm(): Mesh {
  const sc = scene();
  const cells: Part[] = []; const P0: Vec3[] = [];
  for (let i = 0; i < 12; i++) { const a = (TAU * i) / 12, r = 0.75 + 0.35 * (i % 3); const at: Vec3 = [r * Math.cos(a), r * Math.sin(a) * 0.8, 0.15 * Math.sin(a * 3)]; P0.push(at); cells.push(put(sc, `c${i}`, sphere(0.26, 2, 6, i === 5 ? "hot" : undefined), { at })); }
  const drug: Part[] = []; for (let i = 0; i < 8; i++) { const a = (TAU * i) / 8; drug.push(put(sc, `d${i}`, octahedron(0.09, "accent"), { at: [2.4 * Math.cos(a), 2.0 * Math.sin(a), 0.3] })); }
  const clones: Part[] = []; for (let i = 0; i < 8; i++) clones.push(put(sc, `k${i}`, sphere(0.22, 2, 6, "hot"), { at: P0[5] }));
  const base = sc.mesh.points;
  return frame(sc, 13, (t, pts, alpha) => {
    hide(alpha, ...clones);
    let caption = "";
    if (t < 0.22) { drug.forEach((d) => setAlpha(alpha, d, 0.35)); setAlpha(alpha, cells[5], pulse(t, 3)); caption = "1 · A tumour is a population: a rare cell already carries a mutation that shrugs off the drug"; }
    else if (t < 0.48) { const u = phase(t, 0.22, 0.48); drug.forEach((d, i) => { const a = (TAU * i) / 8; moveTo(pts, base, d, [2.4 * Math.cos(a), 2.0 * Math.sin(a), 0.3], [0.9 * Math.cos(a), 0.7 * Math.sin(a), 0.1], u, 1, u * 5); }); cells.forEach((c, i) => { if (i !== 5) { setAlpha(alpha, c, 1 - 0.85 * u); movePart(pts, base, c, [0, 0, 0], 1 - 0.5 * u); } }); caption = "2 · Treatment kills the sensitive cells: the scan shows a response"; }
    else if (t < 0.75) { drug.forEach((d, i) => { const a = (TAU * i) / 8; movePart(pts, base, d, [0.9 * Math.cos(a) - 2.4 * Math.cos(a), 0.7 * Math.sin(a) - 2.0 * Math.sin(a), 0.1 - 0.3], 1, 5); setAlpha(alpha, d, 0.5); }); cells.forEach((c, i) => { if (i !== 5) { setAlpha(alpha, c, 0.15); movePart(pts, base, c, [0, 0, 0], 0.5); } }); const u = phase(t, 0.48, 0.75); setAlpha(alpha, cells[5], 1); clones.forEach((k, i) => { const a = (TAU * i) / 8; setAlpha(alpha, k, stepIn(u, i, 8)); moveTo(pts, base, k, P0[5], [P0[5][0] + 0.55 * Math.cos(a), P0[5][1] + 0.5 * Math.sin(a), P0[5][2]], stepIn(u, i, 8)); }); caption = "3 · The survivor keeps dividing under selection: the tumour regrows, now resistant"; }
    else { drug.forEach((d) => setAlpha(alpha, d, 0.3)); cells.forEach((c, i) => { if (i !== 5) { setAlpha(alpha, c, 0.15); movePart(pts, base, c, [0, 0, 0], 0.5); } }); clones.forEach((k, i) => { const a = (TAU * i) / 8; setAlpha(alpha, k, 1); movePart(pts, base, k, [0.55 * Math.cos(a), 0.5 * Math.sin(a), 0]); }); setAlpha(alpha, cells[5], pulse(t, 4)); caption = "4 · Mechanisms: new mutations, bypass pathways, efflux pumps, lineage change. Answer: combinations and next-generation drugs"; }
    return { caption, labels: [{ at: [0, 1.5, 0], text: "Tumour cell population" }, ...(t >= 0.22 && t < 0.48 ? [{ at: [2.0, 1.6, 0] as Vec3, text: "Drug" }] : []), ...(t >= 0.48 ? [{ at: [P0[5][0], P0[5][1] - 0.9, 0] as Vec3, text: "Resistant clone" }] : [])] };
  });
}

// ---------------------------------------------------------------- Toxicity
export function toxicityTerm(): Mesh {
  const sc = scene();
  put(sc, "fig", figure("soft"), { at: [-1.6, 0, 0] });
  const heart = put(sc, "heart", sphere(0.13, 3, 8, "hot"), { at: [-1.68, 0.35, 0.1] });
  const gut = put(sc, "gut", ring(0.22, 10, "hot", "z"), { at: [-1.6, -0.05, 0.1] });
  const marrow = put(sc, "marrow", line([-1.8, -0.5, 0.1], [-1.4, -0.5, 0.1], "hot"));
  const scale = put(sc, "scale", axes([0.4, -1.1, 0], 2.6, 2.2));
  const grades: Part[] = []; for (let i = 0; i < 4; i++) grades.push(put(sc, `g${i}`, box(0.35, 0.3 + 0.45 * i, 0.2, i >= 2 ? "hot" : "soft"), { at: [0.9 + 0.55 * i, -1.1 + 0.15 + 0.225 * i, 0] }));
  const doseFrame = put(sc, "df", box(2.2, 0.16, 0.1, "soft"), { at: [1.7, 1.45, 0] });
  const dose = put(sc, "dose", box(2.2, 0.14, 0.08, "accent"), { at: [1.7, 1.45, 0] });
  const base = sc.mesh.points;
  return frame(sc, 12, (t, pts, alpha) => {
    hide(alpha, heart, gut, marrow, ...grades, doseFrame, dose); setAlpha(alpha, scale, 0);
    let caption = "";
    if (t < 0.25) { const u = phase(t, 0, 0.25); setAlpha(alpha, marrow, u * 0.6); caption = "1 · Every drug touches normal tissue too: marrow, gut, skin, heart, lungs, nerves"; }
    else if (t < 0.5) { const u = phase(t, 0.25, 0.5); setAlpha(alpha, marrow, 0.6 + 0.4 * u); setAlpha(alpha, gut, u * 0.8); setAlpha(alpha, heart, stepIn(u, 1, 2) * pulse(t, 5)); setAlpha(alpha, scale, u); grades.forEach((g, i) => setAlpha(alpha, g, stepIn(u, i, 4))); caption = "2 · Adverse events are graded 1 (mild) to 5 (fatal); grade 3+ is what trials count"; }
    else if (t < 0.75) { setAlpha(alpha, marrow, 1); setAlpha(alpha, gut, 0.8); setAlpha(alpha, heart, pulse(t, 5)); setAlpha(alpha, scale, 1); grades.forEach((g) => setAlpha(alpha, g, 1)); const u = phase(t, 0.5, 0.75); setAlpha(alpha, doseFrame, 1); setAlpha(alpha, dose, 1); movePart(pts, base, dose, [-1.1 * 0.25 * u, 0, 0], 1); for (let i = dose.p0; i < dose.p1; i++) pts[i] = [base[i][0] - (base[i][0] - 0.6) * 0.25 * u, base[i][1], base[i][2]]; caption = "3 · Manage: dose reduction, delay, supportive drugs (anti-emetics, growth factors, steroids)"; }
    else { setAlpha(alpha, marrow, 0.5); setAlpha(alpha, gut, 0.3); setAlpha(alpha, heart, 0.4); setAlpha(alpha, scale, 1); grades.forEach((g, i) => setAlpha(alpha, g, i >= 2 ? 0.4 : 1)); setAlpha(alpha, doseFrame, 1); setAlpha(alpha, dose, 1); for (let i = dose.p0; i < dose.p1; i++) pts[i] = [base[i][0] - (base[i][0] - 0.6) * 0.25, base[i][1], base[i][2]]; caption = "4 · The goal: the same benefit with less harm. Some effects (ILD, CRS, irAEs) need their own playbooks"; }
    return { caption, labels: [{ at: [-1.6, 1.15, 0], text: "Patient" }, ...(t >= 0.25 ? [{ at: [1.75, -1.35, 0] as Vec3, text: "Grade 1 → 4" }] : []), ...(t >= 0.5 ? [{ at: [1.7, 1.8, 0] as Vec3, text: "Dose" }] : [])] };
  });
}

// ---------------------------------------------------------------- Regulatory
export function regulatoryTerm(): Mesh {
  const sc = scene();
  const stages = ["Filing", "Review", "Advisory", "Decision"];
  const boxes: Part[] = stages.map((_, i) => put(sc, `s${i}`, box(0.9, 0.5, 0.3, "soft"), { at: [-2.1 + 1.4 * i, 0.4, 0] }));
  const links: Part[] = []; for (let i = 0; i < 3; i++) links.push(put(sc, `a${i}`, arrow([-1.65 + 1.4 * i, 0.4, 0], [-1.15 + 1.4 * i, 0.4, 0], "accent", 0.25)));
  const dossier = put(sc, "doc", box(0.35, 0.45, 0.08, "accent"), { at: [-2.1, 0.4, 0.2] });
  const clock = put(sc, "clock", ring(0.5, 20, "soft", "z"), { at: [0, -1.1, 0] });
  const hand = put(sc, "hand", line([0, -1.1, 0.02], [0, -0.65, 0.02], "accent"));
  const tick = put(sc, "tick", polyline([[1.85, 0.3, 0.2], [2.05, 0.15, 0.2], [2.4, 0.6, 0.2]], "hot"));
  const cross = put(sc, "cross", polyline([[1.9, 0.2, 0.2], [2.3, 0.6, 0.2]], "hot"));
  const cross2 = put(sc, "cross2", polyline([[1.9, 0.6, 0.2], [2.3, 0.2, 0.2]], "hot"));
  const base = sc.mesh.points;
  return frame(sc, 13, (t, pts, alpha) => {
    hide(alpha, tick, cross, cross2); links.forEach((l) => setAlpha(alpha, l, 0.3)); boxes.forEach((b) => setAlpha(alpha, b, 0.5));
    // clock hand rotates once per loop
    const ang = -t * TAU; const c = Math.cos(ang), s = Math.sin(ang);
    for (let i = hand.p0; i < hand.p1; i++) { const x = base[i][0] - 0, y = base[i][1] + 1.1; pts[i] = [x * c - y * s, -1.1 + x * s + y * c, base[i][2]]; }
    const stage = Math.min(3, Math.floor(t * 4.2));
    boxes.forEach((b, i) => setAlpha(alpha, b, i <= stage ? 1 : 0.5));
    links.forEach((l, i) => setAlpha(alpha, l, i < stage ? 1 : 0.3));
    moveTo(pts, base, dossier, [-2.1, 0.4, 0.2], [-2.1 + 1.4 * Math.min(3, t * 4.2), 0.4, 0.2], 1);
    let caption = "";
    if (t < 0.24) caption = "1 · A company files trial data (NDA/BLA in the US, MAA in Europe); designations like Breakthrough can speed it";
    else if (t < 0.48) caption = "2 · Reviewers weigh benefit against risk; a PDUFA date sets the deadline (6 or 10 months)";
    else if (t < 0.72) caption = "3 · Sometimes an advisory committee votes in public; the agency need not follow it";
    else if (t < 0.88) { const u = phase(t, 0.72, 0.88); grow(alpha, tick, u); caption = "4 · Approval (full or accelerated, with a confirmatory trial owed) and a label that defines who can get it"; }
    else { const u = phase(t, 0.88, 1); setAlpha(alpha, tick, 1 - u); grow(alpha, cross, u); grow(alpha, cross2, u); caption = "5 · Or a complete response letter, a withdrawal, or later a label change: the record keeps moving"; }
    void clock;
    return { caption, labels: [...stages.map((s, i) => ({ at: [-2.1 + 1.4 * i, 0.85, 0] as Vec3, text: s })), { at: [0, -1.8, 0], text: "Review clock" }] };
  });
}

// ---------------------------------------------------------------- Diagnostics
export function diagnosticsTerm(): Mesh {
  const sc = scene();
  const tube = put(sc, "tube", cylinder(0.4, 2.0, 12, 3), { at: [-2.2, 0, 0] });
  put(sc, "cap", cylinder(0.43, 0.22, 12, 2, "accent"), { at: [-2.2, 1.05, 0] });
  const frags: Part[] = []; for (let i = 0; i < 6; i++) frags.push(put(sc, `f${i}`, dots([[0, 0, 0]], "soft"), { at: [-2.2 + 0.2 * Math.cos(i), -0.6 + 0.22 * i, 0.2 * Math.sin(i)] }));
  const reads: Part[] = []; for (let i = 0; i < 6; i++) reads.push(put(sc, `r${i}`, line([-0.9, -0.7 + 0.28 * i, 0], [0.5, -0.7 + 0.28 * i, 0], i === 2 ? "hot" : "accent")));
  const report = put(sc, "rep", box(1.4, 1.9, 0.08, "soft"), { at: [2.0, 0.1, 0] });
  const linesR: Part[] = []; for (let i = 0; i < 5; i++) linesR.push(put(sc, `l${i}`, line([1.45, 0.75 - 0.32 * i, 0.06], [2.55 - 0.2 * (i % 2), 0.75 - 0.32 * i, 0.06], i === 1 ? "hot" : "soft")));
  const base = sc.mesh.points;
  return frame(sc, 12, (t, pts, alpha) => {
    hide(alpha, ...reads, report, ...linesR);
    let caption = "";
    if (t < 0.25) { frags.forEach((f, i) => movePart(pts, base, f, [0, 0.08 * Math.sin(t * TAU * 2 + i), 0])); setAlpha(alpha, tube, 1); caption = "1 · A sample: tissue, blood (liquid biopsy), or other fluid"; }
    else if (t < 0.55) { const u = phase(t, 0.25, 0.55); frags.forEach((f, i) => moveTo(pts, base, f, [-2.2 + 0.2 * Math.cos(i), -0.6 + 0.22 * i, 0.2 * Math.sin(i)], [-0.9, -0.7 + 0.28 * i, 0], u)); reads.forEach((r, i) => grow(alpha, r, stepIn(u, i, 6))); caption = "2 · An assay measures it: IHC, FISH, PCR, sequencing, methylation, flow cytometry"; }
    else if (t < 0.8) { frags.forEach((f, i) => movePart(pts, base, f, [1.3 - 0.2 * Math.cos(i), -0.1 - 0.22 * i + 0.28 * i, -0.2 * Math.sin(i)])); reads.forEach((r) => setAlpha(alpha, r, 1)); setAlpha(alpha, reads[2], pulse(t, 4)); const u = phase(t, 0.55, 0.8); setAlpha(alpha, report, u); linesR.forEach((l, i) => grow(alpha, l, stepIn(u, i, 5))); caption = "3 · Analytical validity (does it measure right?) then clinical validity (does it predict?)"; }
    else { frags.forEach((f, i) => movePart(pts, base, f, [1.3 - 0.2 * Math.cos(i), -0.1 - 0.22 * i + 0.28 * i, -0.2 * Math.sin(i)])); reads.forEach((r) => setAlpha(alpha, r, 1)); setAlpha(alpha, report, 1); linesR.forEach((l, i) => setAlpha(alpha, l, i === 1 ? pulse(t, 4) : 1)); caption = "4 · Clinical utility: does acting on the result change the outcome? Sensitivity, specificity, PPV decide"; }
    return { caption, labels: [{ at: [-2.2, 1.35, 0], text: "Sample" }, ...(t >= 0.25 ? [{ at: [-0.2, 1.1, 0] as Vec3, text: "Assay" }] : []), ...(t >= 0.55 ? [{ at: [2.0, 1.3, 0] as Vec3, text: "Report" }] : [])] };
  });
}

// ---------------------------------------------------------------- Cancer biology
export function cancerBiologyTerm(): Mesh {
  const sc = scene();
  const mother = put(sc, "m", cell(0.55, "hot"), { at: [0, 0, 0] });
  const kids: Part[] = []; for (let i = 0; i < 6; i++) { const a = (TAU * i) / 6; kids.push(put(sc, `k${i}`, cell(0.32, "hot"), { at: [0, 0, 0] })); void a; }
  const hallmarks = ["Sustained growth", "Evading suppressors", "Resisting death", "Immortality", "Angiogenesis", "Invasion", "Immune escape", "Genome instability"];
  const hm: Part[] = []; const hmPos: Vec3[] = [];
  hallmarks.forEach((_, i) => { const a = (TAU * i) / 8 - Math.PI / 2; const at: Vec3 = [2.1 * Math.cos(a), 1.6 * Math.sin(a), 0]; hmPos.push(at); hm.push(put(sc, `h${i}`, sphere(0.1, 2, 8, "accent"), { at })); });
  const hring = put(sc, "hr", polyline(hmPos, "soft", true));
  const base = sc.mesh.points;
  return frame(sc, 13, (t, pts, alpha) => {
    hide(alpha, ...kids, ...hm, hring);
    let caption = "";
    if (t < 0.25) { const u = phase(t, 0, 0.25); movePart(pts, base, mother, [0, 0, 0], 1 + 0.15 * Math.sin(u * Math.PI)); caption = "1 · A normal cell divides only on command and dies on schedule"; }
    else if (t < 0.5) { const u = phase(t, 0.25, 0.5); kids.forEach((k, i) => { const a = (TAU * i) / 6; setAlpha(alpha, k, stepIn(u, i, 6)); moveTo(pts, base, k, [0, 0, 0], [0.95 * Math.cos(a), 0.75 * Math.sin(a), 0.15 * Math.sin(2 * a)], stepIn(u, i, 6)); }); caption = "2 · Mutations in drivers (KRAS, TP53, PIK3CA…) make it divide without command and ignore stop signals"; }
    else if (t < 0.8) { kids.forEach((k, i) => { const a = (TAU * i) / 6; setAlpha(alpha, k, 1); movePart(pts, base, k, [0.95 * Math.cos(a), 0.75 * Math.sin(a), 0.15 * Math.sin(2 * a)]); }); const u = phase(t, 0.5, 0.8); setAlpha(alpha, hring, u * 0.7); hm.forEach((h, i) => setAlpha(alpha, h, stepIn(u, i, 8))); caption = "3 · The hallmarks: growth, evasion, immortality, blood supply, invasion, immune escape, instability"; }
    else { kids.forEach((k, i) => { const a = (TAU * i) / 6; setAlpha(alpha, k, 1); movePart(pts, base, k, [0.95 * Math.cos(a), 0.75 * Math.sin(a), 0.15 * Math.sin(2 * a)]); }); setAlpha(alpha, hring, 0.7); hm.forEach((h, i) => setAlpha(alpha, h, pulse(t + 0.1 * i, 2))); caption = "4 · Each hallmark is a target class: kinase inhibitors, PARP, anti-VEGF, immunotherapy…"; }
    return { caption, labels: [{ at: [0, -1.05, 0], text: "Cancer cell" }, ...(t >= 0.5 ? hmPos.map((p, i) => ({ at: [p[0] * 1.22, p[1] * 1.25, 0] as Vec3, text: hallmarks[i] })) : [])] };
  });
}

// ---------------------------------------------------------------- Trials
export function trialsTerm(): Mesh {
  const sc = scene();
  const people: Part[] = []; const P0: Vec3[] = [];
  for (let i = 0; i < 16; i++) { const at: Vec3 = [-2.4 + 0.22 * (i % 4), 0.6 - 0.22 * Math.floor(i / 4), 0]; P0.push(at); people.push(put(sc, `p${i}`, sphere(0.08, 2, 6, i % 2 ? "accent" : "soft"), { at })); }
  const coin = put(sc, "coin", ring(0.3, 12, "hot", "z"), { at: [-0.9, 0.3, 0] });
  const armA = put(sc, "A", box(1.3, 0.5, 0.2, "accent"), { at: [0.9, 1.0, 0] });
  const armB = put(sc, "B", box(1.3, 0.5, 0.2, "soft"), { at: [0.9, -0.5, 0] });
  const clock = put(sc, "clock", ring(0.3, 14, "soft", "z"), { at: [2.1, 0.25, 0] });
  const hand = put(sc, "hand", line([2.1, 0.25, 0.02], [2.1, 0.5, 0.02], "accent"));
  const barA = put(sc, "bA", box(0.25, 1.2, 0.15, "accent"), { at: [2.7, 0.0, 0] });
  const barB = put(sc, "bB", box(0.25, 0.7, 0.15, "soft"), { at: [3.05, -0.25, 0] });
  const base = sc.mesh.points;
  return frame(sc, 13, (t, pts, alpha) => {
    hide(alpha, coin, armA, armB, clock, hand, barA, barB);
    let caption = "";
    const target = (i: number): Vec3 => i % 2 ? [0.4 + 0.25 * ((i >> 1) % 4), 1.15 - 0.25 * Math.floor((i >> 1) / 4), 0] : [0.4 + 0.25 * ((i >> 1) % 4), -0.35 - 0.25 * Math.floor((i >> 1) / 4), 0];
    if (t < 0.22) { caption = "1 · Eligible patients consent to join (only ~5% of adults with cancer ever do)"; }
    else if (t < 0.5) { const u = phase(t, 0.22, 0.5); setAlpha(alpha, coin, 1); movePart(pts, base, coin, [0, 0, 0], 1, u * 8); people.forEach((p, i) => moveTo(pts, base, p, P0[i], target(i), stepIn(u, Math.floor(i / 4), 4))); setAlpha(alpha, armA, u); setAlpha(alpha, armB, u); caption = "2 · Randomisation splits them by chance into the new treatment and the control (standard of care)"; }
    else if (t < 0.75) { people.forEach((p, i) => moveTo(pts, base, p, P0[i], target(i), 1)); setAlpha(alpha, coin, 0.3); setAlpha(alpha, armA, 1); setAlpha(alpha, armB, 1); setAlpha(alpha, clock, 1); setAlpha(alpha, hand, 1); const ang = -phase(t, 0.5, 0.75) * TAU * 2; const c = Math.cos(ang), s = Math.sin(ang); for (let i = hand.p0; i < hand.p1; i++) { const x = base[i][0] - 2.1, y = base[i][1] - 0.25; pts[i] = [2.1 + x * c - y * s, 0.25 + x * s + y * c, base[i][2]]; } caption = "3 · Follow-up for months or years; phases 1 (safety), 2 (signal), 3 (proof) build on each other"; }
    else { people.forEach((p, i) => moveTo(pts, base, p, P0[i], target(i), 1)); setAlpha(alpha, coin, 0.3); setAlpha(alpha, armA, 1); setAlpha(alpha, armB, 1); setAlpha(alpha, clock, 0.5); setAlpha(alpha, hand, 0.5); const u = phase(t, 0.75, 1); setAlpha(alpha, barA, u); setAlpha(alpha, barB, u); caption = "4 · Readout: the pre-specified primary endpoint compared between arms; then publication and regulators"; }
    return { caption, labels: [{ at: [-2.05, 1.0, 0], text: "Patients" }, ...(t >= 0.22 ? [{ at: [-0.9, 0.75, 0] as Vec3, text: "Randomise" }, { at: [0.9, 1.45, 0] as Vec3, text: "New treatment" }, { at: [0.9, -1.0, 0] as Vec3, text: "Control" }] : []), ...(t >= 0.75 ? [{ at: [2.85, 0.95, 0] as Vec3, text: "Readout" }] : [])] };
  });
}

// ---------------------------------------------------------------- Pharmacology
export function pharmacologyTerm(): Mesh {
  const sc = scene();
  const O: Vec3 = [-2.6, -1.0, 0];
  put(sc, "axes", axes(O, 3.0, 2.2));
  const curvePts: Vec3[] = []; for (let i = 0; i <= 16; i++) { const x = i / 16; curvePts.push([O[0] + 2.8 * x, O[1] + 2.0 / (1 + Math.exp(-(x - 0.45) * 12)), 0]); }
  const curve = put(sc, "curve", polyline(curvePts, "accent"));
  const tox: Vec3[] = []; for (let i = 0; i <= 16; i++) { const x = i / 16; tox.push([O[0] + 2.8 * x, O[1] + 2.0 / (1 + Math.exp(-(x - 0.8) * 14)), 0]); }
  const toxC = put(sc, "tox", polyline(tox, "hot"));
  const window = put(sc, "win", box(0.9, 2.1, 0.05, "soft"), { at: [O[0] + 2.8 * 0.6, O[1] + 1.05, 0] });
  const cellP = put(sc, "cell", cell(0.9), { at: [2.0, 0.1, 0] });
  const D0: Vec3 = [1.0, 1.8, 0.3], D1: Vec3 = [2.0, 0.1, 0.0];
  const drug = put(sc, "drug", octahedron(0.12, "accent"), { at: D0 });
  const base = sc.mesh.points;
  return frame(sc, 12, (t, pts, alpha) => {
    hide(alpha, toxC, window, drug);
    let caption = "";
    if (t < 0.3) { const u = phase(t, 0, 0.3); grow(alpha, curve, u); caption = "1 · Dose-response: more drug, more effect, until it saturates"; }
    else if (t < 0.55) { const u = phase(t, 0.3, 0.55); grow(alpha, toxC, u); setAlpha(alpha, window, u * 0.7); caption = "2 · A second curve for harm; the gap between them is the therapeutic window"; }
    else if (t < 0.8) { setAlpha(alpha, toxC, 1); setAlpha(alpha, window, 0.7); const u = phase(t, 0.55, 0.8); setAlpha(alpha, drug, 1); moveTo(pts, base, drug, D0, D1, u, 1, u * 5); setAlpha(alpha, cellP, 0.7 + 0.3 * u); caption = "3 · Pharmacokinetics: absorbed, distributed, metabolised (CYP3A4…), excreted; half-life sets the schedule"; }
    else { setAlpha(alpha, toxC, 1); setAlpha(alpha, window, 0.7); setAlpha(alpha, drug, pulse(t, 4)); movePart(pts, base, drug, [D1[0] - D0[0], D1[1] - D0[1], D1[2] - D0[2]], 1, 5); caption = "4 · Pharmacodynamics: what it does once there. Interactions and genetics (UGT1A1, DPYD) shift both curves"; }
    return { caption, labels: [{ at: [O[0] + 3.1, O[1], 0], text: "Dose" }, { at: [O[0], O[1] + 2.4, 0], text: "Effect" }, ...(t >= 0.3 ? [{ at: [O[0] + 2.8 * 0.6, O[1] + 2.3, 0] as Vec3, text: "Therapeutic window" }] : []), { at: [2.0, 1.2, 0], text: "Cell" }] };
  });
}

// ---------------------------------------------------------------- Genetics (inherited)
export function geneticsTerm(): Mesh {
  const sc = scene();
  put(sc, "parent", figure("soft"), { at: [-2.0, 0, 0] });
  put(sc, "child", figure("soft"), { at: [2.0, 0, 0] });
  const helixP = put(sc, "dna", dna(0.22, 1.4, 2, 28, undefined, 4), { at: [-2.0, 0.1, 0.4] });
  const mark = put(sc, "mark", sphere(0.1, 2, 8, "hot"), { at: [-2.0, 0.3, 0.6] });
  const shield = put(sc, "shield", ring(0.9, 18, "accent", "z"), { at: [2.0, 0.1, 0.5] });
  const scan = put(sc, "scan", line([1.3, -0.4, 0.5], [2.7, -0.4, 0.5], "accent"));
  const base = sc.mesh.points;
  return frame(sc, 12, (t, pts, alpha) => {
    hide(alpha, shield, scan);
    let caption = "";
    if (t < 0.25) { setAlpha(alpha, mark, pulse(t, 3)); caption = "1 · Germline: a variant present in every cell since birth (BRCA1/2, Lynch genes, TP53, CDH1)"; }
    else if (t < 0.55) { const u = phase(t, 0.25, 0.55); moveTo(pts, base, helixP, [-2.0, 0.1, 0.4], [2.0, 0.1, 0.4], u, 1, u * 3); moveTo(pts, base, mark, [-2.0, 0.3, 0.6], [2.0, 0.3, 0.6], u); caption = "2 · Passed to children with a 50% chance (autosomal dominant); it raises lifetime risk, it is not a diagnosis"; }
    else if (t < 0.8) { movePart(pts, base, helixP, [4.0, 0, 0], 1, 3); movePart(pts, base, mark, [4.0, 0, 0]); setAlpha(alpha, mark, pulse(t, 3)); const u = phase(t, 0.55, 0.8); setAlpha(alpha, scan, u); movePart(pts, base, scan, [0, 1.2 * Math.sin(u * Math.PI), 0]); caption = "3 · Testing finds carriers; then earlier and more frequent screening (MRI, colonoscopy)"; }
    else { movePart(pts, base, helixP, [4.0, 0, 0], 1, 3); movePart(pts, base, mark, [4.0, 0, 0]); const u = phase(t, 0.8, 1); setAlpha(alpha, shield, u); caption = "4 · And prevention or targeted treatment: risk-reducing surgery, aspirin in Lynch, PARP inhibitors in BRCA tumours"; }
    return { caption, labels: [{ at: [-2.0, 1.15, 0], text: "Parent" }, { at: [2.0, 1.15, 0], text: "Child" }, { at: [t < 0.55 ? lerp(-2.0, 2.0, phase(t, 0.25, 0.55)) : 2.0, -0.95, 0.4], text: "Inherited variant" }] };
  });
}

/** Slug for a category string: "Cancer biology" → "cancer-biology". */
export function termCategoryKey(category: string): string { return category.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }

/** Category slug → animated builder. Some reuse existing sequences: ADC internalisation, imaging, radiopharma, prevention fronts. */
export const TERM_ANIMATED: Record<string, () => Mesh> = {
  // canonical categories (src/data/term-categories.ts); several reuse a front or technology sequence that fits
  "treatment-jargon": FRONT_ANIMATED["targeted-therapy"],
  "biology-basics": biologyTerm,
  "procedures": FRONT_ANIMATED["surgery"],
  "clinic-basics": FRONT_ANIMATED["supportive-care"],
  "regulation-policy": regulatoryTerm,
  "side-effects": toxicityTerm,
  "adc-chemistry": ANIMATED["adc"],
  "genomics-genetics": genomicsTerm,
  "nutrition-lifestyle": FRONT_ANIMATED["nutrition-lifestyle"],
  "anatomy": FRONT_ANIMATED["imaging"],
  "diagnostics-imaging": diagnosticsTerm,
  "epidemiology-prevention": FRONT_ANIMATED["prevention"],
  endpoints: endpointsTerm,
  biomarkers: biomarkersTerm,
  genomics: genomicsTerm,
  clinical: clinicalTerm,
  biology: biologyTerm,
  pathology: pathologyTerm,
  immunology: immunologyTerm,
  resistance: resistanceTerm,
  toxicity: toxicityTerm,
  regulatory: regulatoryTerm,
  adc: ANIMATED["adc"],
  diagnostics: diagnosticsTerm,
  "cancer-biology": cancerBiologyTerm,
  radiopharma: FRONT_ANIMATED["radiopharma"],
  trials: trialsTerm,
  imaging: FRONT_ANIMATED["imaging"],
  pharmacology: pharmacologyTerm,
  prevention: FRONT_ANIMATED["prevention"],
  genetics: geneticsTerm,
};

export function hasTermAnimation(category: string): boolean { return termCategoryKey(category) in TERM_ANIMATED; }
