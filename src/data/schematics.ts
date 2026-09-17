/**
 * Procedural wireframe schematics for technology pages. Everything is generated at import time
 * from a few primitives (src/lib/wireframe.ts); no image assets. Meshes are capped at ~600 points.
 * Segment classes: "accent" = beams/energy/payload, "hot" = the thing being treated or highlighted, "soft" = context.
 */
import { add, antibody, antibodyTips, arrow, box, cone, cylinder, dna, dots, ellipsoid, empty, fan, grid3, helix, icosahedron, label, line, octahedron, polyline, ring, sphere, torus, type Mesh, type Vec3 } from "@/lib/wireframe";
import { ANIMATED } from "./animated";
import { FRONT_ANIMATED } from "./front-animations";
import { TERM_ANIMATED, termCategoryKey } from "./term-animations";

/** All animated builders by key: technology ids, plus `front:<sectionId>` for the fronts (adcs reuses the ADC sequence). */
export const ALL_ANIMATED: Record<string, () => Mesh> = { ...ANIMATED, ...Object.fromEntries(Object.entries(FRONT_ANIMATED).map(([k, f]) => [`front:${k}`, f])), "front:adcs": ANIMATED["adc"], ...Object.fromEntries(Object.entries(TERM_ANIMATED).map(([k, f]) => [`term:${k}`, f])) };

const TAU = Math.PI * 2;
const circlePts = (r: number, n: number, y = 0): Vec3[] => Array.from({ length: n }, (_, i) => [r * Math.cos((TAU * i) / n), y, r * Math.sin((TAU * i) / n)]);

// ---------- shared compositions ----------
function torso(): Mesh { return ellipsoid(1.1, 0.75, 0.6, 4, 12, "soft", true); }
function tumour(at: Vec3, r = 0.22): Mesh { const m = empty(); add(m, sphere(r, 4, 8, "hot", true), { at }); return m; }
function cellSphere(r: number, cls?: string): Mesh { return sphere(r, 5, 10, cls, true); }

function petScanner(targetLabel?: string): Mesh {
  const m = empty();
  add(m, torus(1.6, 0.16, 28, 6), { rotX: Math.PI / 2 });                       // detector ring (axis Z)
  add(m, ellipsoid(0.6, 0.45, 1.6, 4, 10, "soft"), { at: [0, -0.25, 0] });       // patient along Z
  const t: Vec3 = [0.15, -0.15, 0.2];
  add(m, sphere(0.14, 3, 8, "hot"), { at: t });
  // opposed 511 keV photons
  const dirs: Array<[number, number]> = [[0.8, 0.6], [-0.3, 0.95], [0.95, -0.3]];
  for (const [dx, dy] of dirs) {
    add(m, line(t, [t[0] + dx * 1.45, t[1] + dy * 1.45, t[2]], "accent"));
    add(m, line(t, [t[0] - dx * 1.45, t[1] - dy * 1.45, t[2]], "accent"));
  }
  label(m, [1.6, 0.3, 0], "Detector ring");
  label(m, t, targetLabel ?? "Tracer uptake");
  label(m, [1.2, 0.9, 0.2], "511 keV photon pair");
  return m;
}

function linacBeamSet(angles: number[], target: Vec3, cls = "accent"): Mesh {
  const m = empty();
  for (const a of angles) {
    const src: Vec3 = [target[0] + 1.7 * Math.sin(a), target[1] + 1.7 * Math.cos(a), target[2]];
    add(m, fan(0.12, 1.75, 4, cls), { at: src, rotZ: -a });
  }
  return m;
}

// ---------- registry ----------
const S: Record<string, () => Mesh> = {};

// ===== Radiation =====
S["brachytherapy"] = () => {
  const m = empty();
  add(m, ellipsoid(0.9, 0.75, 0.8, 5, 12), {});
  label(m, [0.9, 0.2, 0], "Prostate");
  // template grid of needle tracks entering from below (perineum)
  const xs = [-0.5, -0.25, 0, 0.25, 0.5], zs = [-0.4, 0, 0.4];
  const seeds: Vec3[] = [];
  for (const x of xs) for (const z of zs) {
    if (Math.hypot(x / 0.9, z / 0.8) > 0.85) continue;
    add(m, line([x, -1.9, z], [x, 0.55, z], "soft"));
    for (const y of [-0.45, -0.05, 0.35]) if (Math.hypot(x / 0.9, y / 0.75, z / 0.8) < 0.9) seeds.push([x, y, z]);
  }
  add(m, dots(seeds, "accent"));
  add(m, box(1.6, 0.08, 1.2, "soft"), { at: [0, -1.9, 0] });
  label(m, [0.55, -1.9, 0.6], "Needle template");
  label(m, [0.25, 0.35, 0.4], "I-125 / Pd-103 seeds");
  add(m, ellipsoid(0.5, 0.35, 0.5, 3, 8, "soft"), { at: [0, -1.0, -0.9] });
  label(m, [0.5, -1.0, -0.9], "Rectum (spared)");
  return m;
};

S["imrt-igrt"] = () => {
  const m = empty();
  add(m, torso());
  const t: Vec3 = [0.25, 0.1, 0];
  add(m, tumour(t, 0.2));
  add(m, torus(2.0, 0.12, 28, 5, "soft"), { rotX: Math.PI / 2 });
  add(m, box(0.5, 0.3, 0.45), { at: [0, 2.0, 0] });
  add(m, fan(0.13, 1.9, 5, "accent"), { at: [0, 2.0, 0] });
  // MLC leaves as short parallel bars at collimator
  for (let i = -3; i <= 3; i++) add(m, line([i * 0.07, 1.72, -0.15], [i * 0.07, 1.72, 0.15], "soft"));
  // arc direction
  add(m, arrow([1.5, 1.4, 0], [0.9, 1.85, 0], "soft", 0.2));
  label(m, [0, 2.0, 0], "Linac head + MLC");
  label(m, t, "Target (PTV)");
  label(m, [2.0, -0.3, 0], "Gantry arc");
  label(m, [-1.1, 0.5, 0], "Cone-beam CT guidance");
  return m;
};

S["sbrt"] = () => {
  const m = empty();
  add(m, torso());
  const t: Vec3 = [0.3, 0.05, 0.1];
  add(m, tumour(t, 0.14));
  add(m, linacBeamSet([0.2, 1.0, 1.9, 2.8, -1.1, -2.3], t));
  // non-coplanar beam
  add(m, polyline([[t[0], t[1] + 1.4, t[2] + 1.0], t], "accent"));
  add(m, ring(0.18, 16, "hot"), { at: t });
  label(m, t, "Ablative dose, 1-5 fractions");
  label(m, [1.6, 1.0, 0.1], "Converging beams");
  return m;
};

S["proton-therapy"] = () => {
  const m = empty();
  add(m, torso());
  const t: Vec3 = [0.35, 0.1, 0];
  add(m, tumour(t, 0.22));
  // beam enters from left, stops at Bragg peak
  add(m, polyline([[-2.2, 0.1, 0], [t[0] - 0.05, 0.1, 0]], "accent"));
  add(m, polyline([[-2.2, 0.16, 0], [t[0] - 0.05, 0.16, 0]], "accent"));
  add(m, polyline([[-2.2, 0.04, 0], [t[0] - 0.05, 0.04, 0]], "accent"));
  // dose along path: sparse then dense at peak
  const dosePts: Vec3[] = [];
  for (let x = -1.05; x < t[0] - 0.25; x += 0.22) dosePts.push([x, 0.1 + (Math.random() - 0.5) * 0.06, (Math.random() - 0.5) * 0.06]);
  for (let i = 0; i < 40; i++) dosePts.push([t[0] - 0.2 + Math.random() * 0.4, t[1] - 0.2 + Math.random() * 0.4, (Math.random() - 0.5) * 0.4]);
  add(m, dots(dosePts, "accent"));
  // no exit dose marker
  add(m, line([t[0] + 0.3, 0.1, 0], [1.0, 0.1, 0], "soft"));
  label(m, [-2.2, 0.1, 0], "Proton beam");
  label(m, t, "Bragg peak");
  label(m, [1.0, 0.1, 0], "No exit dose");
  return m;
};
S["carbon-ion"] = () => { const m = S["proton-therapy"](); m.labels = m.labels?.map((l) => l.text === "Proton beam" ? { ...l, text: "Carbon-ion beam (dense ionisation)" } : l); return m; };
S["flash-rt"] = () => {
  const m = empty();
  add(m, torso());
  const t: Vec3 = [0.3, 0.1, 0];
  add(m, tumour(t, 0.2));
  add(m, fan(0.1, 1.9, 4, "accent"), { at: [0, 2.0, 0] });
  // pulse: short dashes along the beam axis
  for (let y = 1.7; y > 0.4; y -= 0.25) add(m, line([-0.02, y, 0.05], [0.02, y - 0.08, 0.05], "hot"));
  label(m, [0, 2.0, 0], "> 40 Gy/s, < 1 s");
  label(m, t, "Same tumour kill");
  label(m, [-0.9, 0.4, 0], "Normal tissue spared");
  return m;
};

S["mr-linac"] = () => {
  const m = empty();
  add(m, cylinder(1.5, 1.4, 24, 3, "soft"), { rotX: Math.PI / 2 });
  add(m, torus(1.9, 0.12, 24, 5), { rotX: Math.PI / 2 });
  add(m, ellipsoid(0.55, 0.4, 1.4, 3, 8, "soft"), { at: [0, -0.3, 0] });
  const t: Vec3 = [0.2, -0.2, 0];
  add(m, tumour(t, 0.16));
  add(m, fan(0.1, 1.85, 4, "accent"), { at: [0, 1.9, 0.3], rotZ: 0 });
  add(m, helix(0.9, 1.2, 1.5, 24, "soft"), { rotX: Math.PI / 2, at: [0, 0, 0] });
  label(m, [1.5, 0.6, 0], "MRI bore");
  label(m, [1.9, -0.4, 0], "Linac gantry");
  label(m, t, "Daily-adapted target");
  return m;
};

S["radioligand-therapy"] = () => {
  const m = empty();
  add(m, cellSphere(1.0));
  add(m, sphere(0.35, 3, 8, "soft"), { at: [0.1, 0.05, 0] });
  // receptors: stubs on surface
  for (let i = 0; i < 8; i++) { const a = (TAU * i) / 8; const p: Vec3 = [Math.cos(a), 0.15, Math.sin(a)]; add(m, line(p, [p[0] * 1.2, p[1] * 1.2, p[2] * 1.2])); }
  // ligand docking at one receptor, with isotope
  const dock: Vec3 = [1.25, 0.15, 0];
  add(m, octahedron(0.1, "accent"), { at: [1.45, 0.2, 0] });
  add(m, line([1.2, 0.18, 0], [1.38, 0.2, 0], "accent"));
  // beta track: wandering polyline through the cell
  add(m, polyline([[1.45, 0.2, 0], [0.9, 0.5, 0.3], [0.3, 0.2, 0.5], [-0.3, 0.6, 0.1], [-0.9, 0.3, -0.2], [-1.5, 0.7, -0.4]], "hot"));
  label(m, dock, "Receptor (PSMA / SSTR)");
  label(m, [1.45, 0.2, 0], "Ligand + Lu-177");
  label(m, [-1.5, 0.7, -0.4], "β⁻ track ~2 mm, crossfire");
  return m;
};

S["targeted-alpha-therapy"] = () => {
  const m = empty();
  add(m, cellSphere(1.0));
  add(m, sphere(0.35, 3, 8, "soft"), { at: [0.1, 0.05, 0] });
  add(m, octahedron(0.1, "accent"), { at: [1.3, 0.15, 0] });
  add(m, line([1.0, 0.15, 0], [1.25, 0.15, 0], "accent"));
  // short thick alpha tracks
  for (const d of [[-0.8, 0.3, 0.1], [-0.6, -0.5, 0.3], [-0.7, 0.1, -0.5]] as Vec3[]) {
    const a: Vec3 = [1.3, 0.15, 0]; const b: Vec3 = [a[0] + d[0] * 0.55, a[1] + d[1] * 0.55, a[2] + d[2] * 0.55];
    add(m, line(a, b, "hot")); add(m, line([a[0] + 0.02, a[1] + 0.02, a[2]], [b[0] + 0.02, b[1] + 0.02, b[2]], "hot"));
  }
  // contrast: long thin beta
  add(m, polyline([[1.3, -0.4, 0], [0.4, -0.8, 0.4], [-0.6, -0.4, 0.6], [-1.6, -0.9, 0.2]], "soft"));
  label(m, [1.3, 0.15, 0], "Ac-225 on ligand");
  label(m, [0.9, 0.35, 0.1], "α tracks < 100 µm, high LET");
  label(m, [-1.6, -0.9, 0.2], "β track for comparison");
  return m;
};
S["radioimmunotherapy"] = () => {
  const m = empty();
  add(m, antibody(0.8, undefined));
  add(m, octahedron(0.1, "accent"), { at: [0, -0.9, 0] });
  add(m, cellSphere(0.9, "soft"), { at: [0, 1.8, 0] });
  const [l, r] = antibodyTips(0.8);
  add(m, line(l, [l[0], 1.0, 0], "hot")); add(m, line(r, [r[0], 1.0, 0], "hot"));
  for (const d of [[0.5, 0.4, 0.2], [-0.5, 0.3, -0.3], [0.1, 0.6, 0.4]] as Vec3[]) add(m, line([0, -0.9, 0], [d[0] * 1.4, -0.9 + d[1] * 1.4, d[2] * 1.4], "hot"));
  label(m, [0, -0.9, 0], "Chelated Lu-177 / Ac-225");
  label(m, [0, 1.8, 0], "Antigen-positive cell");
  label(m, [0.6, -0.4, 0.3], "Radiation, not chemistry");
  return m;
};
S["bnct"] = () => {
  const m = empty();
  add(m, cellSphere(1.0));
  add(m, dots(Array.from({ length: 30 }, () => [(Math.random() - 0.5) * 1.4, (Math.random() - 0.5) * 1.4, (Math.random() - 0.5) * 1.4] as Vec3), "accent"));
  for (let i = 0; i < 5; i++) add(m, line([-2.4, -0.6 + i * 0.3, 0], [-1.0, -0.6 + i * 0.3, 0], "soft"));
  add(m, line([0.2, 0.1, 0], [0.55, 0.35, 0.1], "hot")); add(m, line([0.2, 0.1, 0], [-0.1, -0.2, -0.1], "hot"));
  label(m, [-2.4, 0.0, 0], "Thermal neutrons");
  label(m, [0.3, 0.4, 0.2], "B-10 capture → α + Li");
  label(m, [0, -1.0, 0], "Boron-loaded tumour cell");
  return m;
};
S["hyperthermia"] = () => {
  const m = empty();
  add(m, torso());
  const t: Vec3 = [0.3, 0.1, 0];
  add(m, tumour(t, 0.25));
  for (const a of [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2]) add(m, box(0.5, 0.15, 0.4, "soft"), { at: [1.5 * Math.sin(a), 1.2 * Math.cos(a), 0] });
  for (let i = 0; i < 6; i++) add(m, ring(0.35 + i * 0.12, 16, "accent"), { at: t, rotX: Math.PI / 2 });
  label(m, [0, 1.2, 0], "RF / microwave applicators");
  label(m, t, "41-43 °C");
  return m;
};

// ===== Imaging =====
S["pet"] = () => petScanner();
S["fdg-pet"] = () => petScanner("¹⁸F-FDG (glucose)");
S["psma-pet"] = () => petScanner("PSMA ligand");
S["fapi-pet"] = () => petScanner("FAP on fibroblasts");
S["trop2-pet"] = () => petScanner("TROP2 antibody / nanobody");
S["her2-pet"] = () => petScanner("⁸⁹Zr-trastuzumab");
S["immuno-pet"] = () => petScanner("CD8 minibody (T cells)");
S["parp-pet"] = () => petScanner("PARP1 in nucleus");
S["pet-ct"] = () => { const m = petScanner(); add(m, torus(1.6, 0.1, 28, 5, "soft"), { rotX: Math.PI / 2, at: [0, 0, 1.0] }); label(m, [1.6, -0.2, 1.0], "CT ring"); return m; };
S["pet-mri"] = () => { const m = petScanner(); add(m, cylinder(1.35, 2.6, 20, 3, "soft"), { rotX: Math.PI / 2 }); label(m, [1.35, 0.9, -1.0], "MRI bore"); return m; };
S["spect"] = () => {
  const m = empty();
  add(m, ellipsoid(0.6, 0.45, 1.6, 4, 10, "soft"), { at: [0, -0.25, 0] });
  add(m, box(1.4, 0.2, 0.9), { at: [0, 1.1, 0] }); add(m, box(1.4, 0.2, 0.9), { at: [0, -1.6, 0] });
  const t: Vec3 = [0.2, -0.2, 0.1];
  add(m, sphere(0.14, 3, 8, "hot"), { at: t });
  for (const dx of [-0.4, 0, 0.4]) add(m, line(t, [dx, 1.0, 0], "accent"));
  add(m, arrow([1.4, 0.6, 0], [1.0, 1.2, 0], "soft", 0.25));
  label(m, [0, 1.1, 0], "Gamma camera (rotates)");
  label(m, t, "Single photons (Tc-99m, Lu-177)");
  return m;
};
S["mri"] = () => {
  const m = empty();
  add(m, cylinder(1.5, 2.4, 24, 3), { rotX: Math.PI / 2 });
  add(m, ellipsoid(0.55, 0.4, 1.5, 3, 8, "soft"), { at: [0, -0.35, 0] });
  add(m, helix(1.15, 2.0, 5, 60, "accent"), { rotX: Math.PI / 2 });
  for (let i = -2; i <= 2; i++) add(m, line([-0.9, i * 0.25, -1.6], [0.9, i * 0.25, -1.6], "soft"));
  label(m, [1.5, 0.5, 0], "Superconducting magnet bore");
  label(m, [1.15, 0.0, 1.0], "RF coil / gradients");
  label(m, [0, -0.35, 1.5], "Proton spins align");
  return m;
};
S["whole-body-mri"] = () => { const m = S["mri"](); add(m, ellipsoid(0.55, 0.4, 1.5, 3, 8, "soft"), { at: [0, -0.35, 2.6] }); add(m, arrow([0, 0.9, 2.8], [0, 0.9, 0.6], "soft", 0.1)); label(m, [0, 0.9, 2.8], "Multi-station, head to toe"); return m; };
S["ultrasound"] = () => {
  const m = empty();
  add(m, box(0.5, 0.25, 0.25), { at: [0, 1.0, 0] });
  add(m, fan(0.55, 1.9, 9, "accent"), { at: [0, 0.9, 0] });
  add(m, ellipsoid(1.6, 0.6, 0.8, 3, 12, "soft"), { at: [0, 0.0, 0] });
  add(m, sphere(0.2, 3, 8, "hot"), { at: [0.2, -0.5, 0] });
  add(m, line([0.5, 1.0, 0], [0.5, -0.2, 0], "soft"));
  label(m, [0, 1.0, 0], "Transducer");
  label(m, [0.2, -0.5, 0], "Echo from lesion");
  label(m, [0.5, -0.2, 0], "Biopsy needle guidance");
  return m;
};
S["mammography"] = () => {
  const m = empty();
  add(m, box(2.0, 0.08, 1.4, "soft"), { at: [0, 0.5, 0] });
  add(m, box(2.0, 0.08, 1.4, "soft"), { at: [0, -0.5, 0] });
  add(m, ellipsoid(0.9, 0.45, 0.6, 4, 12), {});
  add(m, box(0.5, 0.25, 0.4), { at: [0, 1.6, 0] });
  add(m, fan(0.5, 1.0, 6, "accent"), { at: [0, 1.45, 0] });
  add(m, sphere(0.09, 3, 6, "hot"), { at: [0.3, 0.05, 0.1] });
  add(m, arrow([1.5, 1.1, 0], [1.5, 0.65, 0], "soft", 0.3)); add(m, arrow([1.5, -1.1, 0], [1.5, -0.65, 0], "soft", 0.3));
  label(m, [0, 1.6, 0], "Low-dose X-ray tube");
  label(m, [1.0, 0.5, 0.7], "Compression paddle");
  label(m, [0.3, 0.05, 0.1], "Microcalcification / mass");
  return m;
};
S["low-dose-ct-screening"] = () => {
  const m = empty();
  add(m, torus(1.6, 0.14, 28, 6), { rotX: Math.PI / 2 });
  add(m, ellipsoid(0.7, 0.5, 1.5, 4, 10, "soft"), { at: [0, -0.2, 0] });
  add(m, box(0.35, 0.3, 0.3), { at: [0, 1.6, 0] });
  add(m, fan(0.45, 3.0, 7, "accent"), { at: [0, 1.6, 0] });
  add(m, sphere(0.1, 3, 6, "hot"), { at: [0.35, -0.1, 0.3] });
  add(m, arrow([1.5, 1.0, 0], [0.9, 1.5, 0], "soft", 0.25));
  label(m, [0, 1.6, 0], "Rotating X-ray tube");
  label(m, [0.35, -0.1, 0.3], "Lung nodule");
  return m;
};
S["ct"] = S["low-dose-ct-screening"];
S["optical-imaging"] = () => {
  const m = empty();
  add(m, ellipsoid(1.4, 0.5, 0.9, 3, 12, "soft"));
  add(m, cone(0.9, 1.4, 12, "accent"), { at: [0.2, 1.3, 0] });
  add(m, box(0.35, 0.25, 0.3), { at: [0.2, 2.1, 0] });
  add(m, ring(0.35, 16, "hot"), { at: [0.2, 0.42, 0], rotX: 0 });
  add(m, ring(0.5, 16, "hot"), { at: [0.2, 0.4, 0] });
  label(m, [0.2, 2.1, 0], "NIR camera + excitation");
  label(m, [0.2, 0.42, 0], "Fluorescent tumour margin");
  return m;
};
S["fluorescence-guided-surgery"] = S["optical-imaging"];
S["radiology-ai-screening"] = () => {
  const m = empty();
  add(m, box(2.2, 1.5, 0.05, "soft"));
  for (let i = -4; i <= 4; i++) add(m, line([i * 0.24, -0.75, 0.03], [i * 0.24, 0.75, 0.03], "soft"));
  for (let j = -2; j <= 2; j++) add(m, line([-1.1, j * 0.3, 0.03], [1.1, j * 0.3, 0.03], "soft"));
  add(m, ring(0.25, 16, "hot"), { at: [0.4, 0.1, 0.06], rotX: Math.PI / 2 });
  // small network graph floating behind
  const layers = [[-0.8, 0.5], [-0.3, 0.3], [0.2, 0.5], [0.7, 0.35]] as Array<[number, number]>;
  const nodes: Vec3[] = [];
  layers.forEach(([x, spread], li) => { const n = li === 3 ? 1 : 3; for (let k = 0; k < n; k++) nodes.push([x, (k - (n - 1) / 2) * spread, -0.9]); });
  add(m, dots(nodes, "accent"));
  let idx = 0; const counts = [3, 3, 3, 1];
  for (let li = 0; li + 1 < counts.length; li++) { for (let a = 0; a < counts[li]; a++) for (let b = 0; b < counts[li + 1]; b++) add(m, line(nodes[idx + a], nodes[idx + counts[li] + b], "soft")); idx += counts[li]; }
  label(m, [0.4, 0.1, 0.06], "Flagged finding");
  label(m, [0.7, 0, -0.9], "Neural network");
  return m;
};

// ===== Diagnostics =====
function bloodTube(fragments: number, fragLen: number, lbl: string): Mesh {
  const m = empty();
  add(m, cylinder(0.6, 2.6, 16, 3, undefined, false));
  add(m, ring(0.6, 16, "soft"), { at: [0, 0.9, 0] });
  add(m, cylinder(0.62, 0.3, 16, 2, "soft"), { at: [0, 1.4, 0] });
  for (let i = 0; i < fragments; i++) {
    const a = (TAU * i) / fragments, r = 0.15 + 0.3 * ((i * 7) % 5) / 5;
    add(m, dna(0.07, fragLen, 1, 8, "accent", 4), { at: [r * Math.cos(a), -0.9 + 1.7 * ((i * 3) % 7) / 7, r * Math.sin(a)], rotZ: a });
  }
  label(m, [0.6, 0.9, 0], "Plasma");
  label(m, [0.0, -0.4, 0.4], lbl);
  return m;
}
S["liquid-biopsy"] = () => bloodTube(7, 0.45, "ctDNA fragments (~160 bp)");
S["mrd-testing"] = () => { const m = bloodTube(3, 0.4, "Tumour-informed variants at < 0.01%"); label(m, [0, 1.6, 0], "Serial draws after surgery"); return m; };
S["mced"] = () => { const m = bloodTube(8, 0.3, "Methylation patterns → cancer signal + origin"); return m; };
S["fragmentomics"] = () => bloodTube(9, 0.25, "Fragment length & end motifs");
S["cgp"] = () => { const m = empty(); add(m, dna(0.45, 3.0, 2.5, 60, undefined, 3)); for (const y of [-0.9, 0.2, 1.1]) add(m, ring(0.55, 14, "hot"), { at: [0, y, 0] }); label(m, [0.55, 0.2, 0], "Targeted genes (300-600)"); label(m, [0, 1.5, 0], "Hybrid-capture NGS"); return m; };
S["wes-wgs"] = () => { const m = empty(); add(m, dna(0.45, 3.2, 3, 72, undefined, 3)); label(m, [0, 1.6, 0], "Whole genome / exome"); label(m, [0.5, -0.8, 0], "Signatures, structural variants"); return m; };
S["germline-testing"] = () => { const m = empty(); add(m, dna(0.45, 2.6, 2, 48, undefined, 3)); add(m, ring(0.55, 14, "hot"), { at: [0, 0.3, 0] }); label(m, [0.55, 0.3, 0], "Inherited variant (BRCA, Lynch)"); label(m, [0, -1.3, 0], "Every cell, from birth"); return m; };
S["hrd-testing"] = () => { const m = empty(); add(m, dna(0.45, 2.6, 2, 48, undefined, 3)); add(m, line([0.45, 0.1, 0], [0.45, 0.35, 0], "hot")); add(m, line([-0.45, 0.1, 0], [-0.45, 0.35, 0], "hot")); label(m, [0.45, 0.2, 0], "Unrepaired double-strand break"); label(m, [0, -1.3, 0], "Genomic scars (LOH, TAI, LST)"); return m; };
S["rna-seq"] = () => { const m = empty(); add(m, helix(0.4, 2.8, 3, 60, "accent")); add(m, dna(0.4, 1.0, 1, 20, "soft", 4), { at: [1.3, 0, 0] }); add(m, arrow([0.9, 0.6, 0], [0.5, 0.6, 0], "soft", 0.3)); label(m, [1.3, 0.6, 0], "DNA"); label(m, [0, 1.4, 0], "mRNA transcripts counted"); return m; };
S["methylation-profiling"] = () => { const m = empty(); add(m, dna(0.45, 2.8, 2.5, 60, undefined, 3)); const tags: Vec3[] = []; for (let i = 0; i < 9; i++) { const a = TAU * 2.5 * (i / 9); tags.push([0.6 * Math.cos(a), -1.4 + 2.8 * (i / 9), 0.6 * Math.sin(a)]); } add(m, dots(tags, "accent")); label(m, tags[4], "Methyl tags (CpG)"); return m; };
S["single-cell-spatial"] = () => { const m = empty(); add(m, box(2.4, 0.06, 1.6, "soft")); const cells: Vec3[] = []; for (let i = 0; i < 40; i++) cells.push([(Math.random() - 0.5) * 2.2, 0.1, (Math.random() - 0.5) * 1.4]); add(m, dots(cells, "accent")); for (let i = 0; i < 6; i++) add(m, sphere(0.09, 2, 6, "hot"), { at: [0.3 + (Math.random() - 0.5) * 0.5, 0.1, (Math.random() - 0.5) * 0.4] }); add(m, line([-1.2, 0.8, -0.8], [1.2, 0.8, -0.8], "soft")); label(m, [0.3, 0.1, 0], "Tumour niche"); label(m, [-0.8, 0.1, -0.6], "Immune cells, in place"); return m; };
S["proteomics"] = () => { const m = empty(); add(m, polyline([[-1.6, -0.6, 0], [-1.2, 0.3, 0], [-0.9, -0.5, 0], [-0.5, 0.9, 0], [-0.2, -0.6, 0], [0.2, 0.5, 0], [0.6, -0.4, 0], [1.0, 1.1, 0], [1.4, -0.6, 0]], "accent")); add(m, line([-1.8, -0.7, 0], [1.8, -0.7, 0], "soft")); add(m, line([-1.8, -0.7, 0], [-1.8, 1.3, 0], "soft")); label(m, [1.0, 1.1, 0], "Peptide peaks (mass spec)"); label(m, [1.8, -0.7, 0], "m/z"); return m; };
S["histopathology-ihc"] = () => { const m = empty(); add(m, box(2.6, 0.05, 1.2, "soft")); add(m, box(1.0, 0.07, 0.8), { at: [0.3, 0, 0] }); const cells: Vec3[] = []; for (let i = 0; i < 30; i++) cells.push([0.3 + (Math.random() - 0.5) * 0.9, 0.06, (Math.random() - 0.5) * 0.7]); add(m, dots(cells, "soft")); for (let i = 0; i < 8; i++) add(m, ring(0.06, 8, "accent"), { at: [0.3 + (Math.random() - 0.5) * 0.9, 0.07, (Math.random() - 0.5) * 0.7] }); label(m, [0.3, 0.07, 0], "Stained protein (HER2, PD-L1)"); label(m, [-1.0, 0, 0.5], "Glass slide"); return m; };
S["digital-pathology-ai"] = () => { const m = S["histopathology-ihc"](); add(m, line([-1.3, 0.5, -0.6], [1.3, 0.5, -0.6], "hot")); add(m, line([-1.3, 0.5, 0.0], [1.3, 0.5, 0.0], "hot")); add(m, line([-1.3, 0.5, 0.6], [1.3, 0.5, 0.6], "hot")); label(m, [1.3, 0.5, 0.6], "Whole-slide scan → model"); return m; };
S["pathology-foundation-model"] = S["digital-pathology-ai"];
S["companion-diagnostic"] = () => { const m = S["histopathology-ihc"](); add(m, arrow([0.3, 0.5, 0], [0.3, 1.1, 0], "accent", 0.25)); add(m, octahedron(0.18, "accent"), { at: [0.3, 1.35, 0] }); label(m, [0.3, 1.35, 0], "Drug unlocked by the test"); return m; };
S["functional-drug-testing"] = () => { const m = empty(); for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) { add(m, cylinder(0.3, 0.3, 12, 2, "soft"), { at: [i * 0.8, 0, j * 0.8] }); add(m, sphere(0.12, 3, 6, (i + j) % 2 === 0 ? "hot" : "soft"), { at: [i * 0.8, 0.1, j * 0.8] }); } label(m, [0, 0.1, 0], "Patient tumour cells"); label(m, [0.8, 0.3, 0.8], "Drug per well → viability"); return m; };
S["organoids"] = () => { const m = empty(); add(m, cylinder(1.2, 0.5, 20, 2, "soft")); for (const p of [[0.3, 0.1, 0.2], [-0.5, 0.1, -0.3], [0.1, 0.1, -0.6], [-0.4, 0.1, 0.5]] as Vec3[]) { add(m, sphere(0.22, 3, 8), { at: p }); add(m, sphere(0.09, 2, 6, "soft"), { at: [p[0], p[1] + 0.05, p[2]] }); } label(m, [0.3, 0.1, 0.2], "3D mini-tumours in matrix"); return m; };
S["pdac-organoid-pharmacotyping"] = S["organoids"];
S["pdx-models"] = () => { const m = empty(); add(m, ellipsoid(1.4, 0.5, 0.6, 3, 10, "soft")); add(m, ellipsoid(0.35, 0.3, 0.3, 3, 8, "soft"), { at: [1.6, 0.1, 0] }); add(m, sphere(0.25, 3, 8, "hot"), { at: [0.2, 0.5, 0.3] }); add(m, polyline([[-1.4, 0.0, -0.2], [-2.2, -0.4, -0.2]], "soft")); label(m, [0.2, 0.5, 0.3], "Patient tumour graft"); label(m, [1.6, 0.1, 0], "Immunodeficient mouse"); return m; };
S["crispr-screens"] = () => { const m = empty(); const cells: Vec3[] = []; for (let i = -3; i <= 3; i++) for (let j = -2; j <= 2; j++) cells.push([i * 0.4, j * 0.4, 0]); add(m, dots(cells, "soft")); for (const c of cells.filter((_, k) => k % 5 === 2)) add(m, line([c[0] - 0.1, c[1] - 0.1, 0], [c[0] + 0.1, c[1] + 0.1, 0], "hot")); add(m, dna(0.15, 0.7, 1, 12, "accent", 3), { at: [0, 1.5, 0], rotZ: Math.PI / 2 }); label(m, [0, 1.5, 0], "Guide RNA library"); label(m, [0.8, -0.8, 0], "Knockout → dependency"); return m; };
S["ai-drug-design"] = () => { const m = empty(); add(m, sphere(1.0, 5, 10, "soft")); add(m, polyline([[0.2, 0.1, 0], [0.5, 0.3, 0.1], [0.4, 0.6, -0.1], [0.1, 0.5, 0.2], [-0.1, 0.2, 0.1]], "accent", true)); const nodes: Vec3[] = [[-2.0, 0.6, 0], [-2.0, 0, 0], [-2.0, -0.6, 0], [-1.4, 0.3, 0], [-1.4, -0.3, 0]]; add(m, dots(nodes, "hot")); for (let a = 0; a < 3; a++) for (let b = 3; b < 5; b++) add(m, line(nodes[a], nodes[b], "soft")); add(m, arrow([-1.2, 0, 0], [-0.6, 0.2, 0], "soft", 0.3)); label(m, [0.3, 0.4, 0], "Generated ligand in pocket"); label(m, [-2.0, 0.6, 0], "Model"); return m; };
S["ai-trial-matching"] = () => { const m = empty(); add(m, box(1.0, 1.4, 0.05, "soft"), { at: [-1.3, 0, 0] }); for (let j = -2; j <= 2; j++) add(m, line([-1.7, j * 0.25, 0.03], [-0.9, j * 0.25, 0.03], "soft")); const trials: Vec3[] = [[1.3, 0.8, 0], [1.3, 0.3, 0], [1.3, -0.2, 0], [1.3, -0.7, 0]]; add(m, dots(trials, "soft")); add(m, line([-0.8, 0.2, 0], trials[1], "accent")); add(m, line([-0.8, 0.0, 0], trials[2], "accent")); label(m, [-1.3, 0.7, 0], "Patient record"); label(m, [1.3, 0.3, 0], "Eligible trials"); return m; };
S["robotic-bronchoscopy"] = () => { const m = empty(); add(m, ellipsoid(0.9, 1.2, 0.6, 4, 10, "soft")); add(m, polyline([[0, 1.8, 0], [0, 0.8, 0], [0.2, 0.3, 0.1], [0.45, -0.2, 0.15], [0.6, -0.5, 0.2]], "accent")); add(m, polyline([[0, 0.8, 0], [-0.3, 0.3, -0.1], [-0.5, -0.3, -0.15]], "soft")); add(m, sphere(0.12, 3, 6, "hot"), { at: [0.65, -0.55, 0.2] }); label(m, [0, 1.8, 0], "Robotic catheter"); label(m, [0.65, -0.55, 0.2], "Peripheral nodule biopsy"); return m; };
S["pancreatic-surveillance"] = () => { const m = empty(); add(m, ellipsoid(1.4, 0.4, 0.5, 3, 12, "soft"), { rotZ: -0.3 }); add(m, sphere(0.12, 3, 6, "hot"), { at: [0.6, 0.0, 0.1] }); add(m, box(0.4, 0.2, 0.2), { at: [0, 1.4, 0] }); add(m, fan(0.5, 1.4, 6, "accent"), { at: [0, 1.3, 0] }); label(m, [0, 1.4, 0], "Annual MRI / EUS"); label(m, [0.6, 0, 0.1], "Cyst or early lesion"); return m; };

// ===== Surgery / interventional =====
S["robotic-surgery"] = () => {
  const m = empty();
  add(m, torso(), { at: [0, -0.9, 0] });
  add(m, box(1.4, 0.15, 0.8, "soft"), { at: [0, 1.9, 0] });
  const arms: Array<[Vec3, Vec3, Vec3]> = [[[-0.5, 1.8, 0.2], [-0.9, 0.9, 0.5], [-0.3, -0.4, 0.2]], [[0.1, 1.8, -0.2], [0.5, 1.0, -0.6], [0.2, -0.4, -0.1]], [[0.6, 1.8, 0.3], [1.1, 0.8, 0.6], [0.5, -0.4, 0.3]]];
  for (const [a, b, c] of arms) { add(m, polyline([a, b, c], "accent")); add(m, sphere(0.08, 2, 6), { at: b }); }
  add(m, sphere(0.16, 3, 8, "hot"), { at: [0.15, -0.5, 0.1] });
  label(m, [0, 1.9, 0], "Patient-side cart");
  label(m, [1.1, 0.8, 0.6], "Wristed instrument arms");
  label(m, [0.15, -0.5, 0.1], "Target through 8 mm ports");
  return m;
};
S["sentinel-node"] = () => {
  const m = empty();
  add(m, ellipsoid(1.0, 0.8, 0.9, 4, 12, "soft"), { at: [-0.6, -0.4, 0] });
  add(m, sphere(0.15, 3, 8, "hot"), { at: [-0.5, -0.3, 0.3] });
  const chain: Vec3[] = [[-0.5, -0.3, 0.3], [0.2, 0.2, 0.3], [0.9, 0.7, 0.2], [1.5, 1.0, 0.1], [2.0, 1.3, 0]];
  add(m, polyline(chain, "accent"));
  add(m, sphere(0.16, 3, 8, "accent"), { at: chain[2] });
  for (const p of [chain[3], chain[4]]) add(m, sphere(0.12, 3, 6, "soft"), { at: p });
  label(m, chain[0], "Tracer injected at tumour");
  label(m, chain[2], "Sentinel node (first drainage)");
  label(m, chain[4], "Other nodes left in place");
  return m;
};
S["thermal-ablation"] = () => {
  const m = empty();
  add(m, ellipsoid(1.4, 0.9, 0.9, 4, 12, "soft"));
  add(m, sphere(0.25, 3, 8, "hot"), { at: [0.2, 0.0, 0] });
  add(m, ellipsoid(0.55, 0.5, 0.5, 3, 10, "accent"), { at: [0.2, 0, 0] });
  add(m, line([1.9, 1.4, 0.2], [0.2, 0.05, 0], undefined));
  add(m, line([1.9, 1.48, 0.2], [0.25, 0.12, 0], "soft"));
  label(m, [1.9, 1.4, 0.2], "RF / microwave probe");
  label(m, [0.2, 0, 0], "Tumour");
  label(m, [0.75, 0.3, 0], "Ablation zone > 60 °C (+ margin)");
  return m;
};
S["litt"] = () => { const m = S["thermal-ablation"](); m.labels = m.labels?.map((l) => l.text.startsWith("RF") ? { ...l, text: "Laser fibre (MRI-thermometry guided)" } : l); return m; };
S["irreversible-electroporation"] = () => {
  const m = empty();
  add(m, ellipsoid(1.4, 0.9, 0.9, 4, 12, "soft"));
  add(m, sphere(0.25, 3, 8, "hot"), { at: [0, 0, 0] });
  add(m, line([-0.45, 1.6, 0], [-0.45, -0.2, 0])); add(m, line([0.45, 1.6, 0], [0.45, -0.2, 0]));
  for (let k = -2; k <= 2; k++) { const b = 0.35 * Math.abs(k) / 2 + 0.05; add(m, polyline([[-0.45, 0.1 * k, 0], [-0.2, 0.1 * k + b, 0], [0.2, 0.1 * k + b, 0], [0.45, 0.1 * k, 0]], "accent")); }
  add(m, polyline([[-0.6, -0.55, 0.3], [-0.9, -0.2, 0.4], [-1.0, 0.3, 0.3]], "soft"));
  label(m, [0.45, 1.6, 0], "Needle electrodes");
  label(m, [0, 0.4, 0], "µs pulses → membrane pores");
  label(m, [-1.0, 0.3, 0.3], "Vessel / duct spared");
  return m;
};
S["hifu-histotripsy"] = () => {
  const m = empty();
  add(m, ellipsoid(1.5, 0.8, 0.9, 3, 12, "soft"), { at: [0, -0.6, 0] });
  add(m, sphere(0.18, 3, 8, "hot"), { at: [0, -0.7, 0] });
  // bowl transducer above
  const bowl = empty(); for (let i = 0; i < 12; i++) { const a = (TAU * i) / 12; bowl.points.push([1.2 * Math.cos(a), 1.6, 1.2 * Math.sin(a)]); bowl.points.push([0.7 * Math.cos(a), 1.3, 0.7 * Math.sin(a)]); }
  for (let i = 0; i < 12; i++) { bowl.segments.push([2 * i, 2 * ((i + 1) % 12)], [2 * i + 1, 2 * ((i + 1) % 12) + 1], [2 * i, 2 * i + 1]); }
  add(m, bowl);
  for (let i = 0; i < 12; i += 2) { const a = (TAU * i) / 12; add(m, line([1.0 * Math.cos(a), 1.45, 1.0 * Math.sin(a)], [0, -0.7, 0], "accent")); }
  label(m, [1.2, 1.6, 0], "Focused transducer");
  label(m, [0, -0.7, 0], "Focal spot: heat or cavitation");
  return m;
};
S["bbb-focused-ultrasound"] = () => { const m = S["hifu-histotripsy"](); m.labels = [{ at: [1.2, 1.6, 0], text: "Helmet transducer array" }, { at: [0, -0.7, 0], text: "Microbubbles open BBB" }]; return m; };
S["hipec"] = () => { const m = empty(); add(m, ellipsoid(1.4, 0.8, 1.0, 4, 12, "soft")); add(m, dots(Array.from({ length: 30 }, () => { const a = Math.random() * TAU, r = 0.9 + Math.random() * 0.35; return [r * Math.cos(a) * 1.3, (Math.random() - 0.5) * 1.2, r * Math.sin(a) * 0.9] as Vec3; }), "accent")); add(m, line([1.5, 1.5, 0.3], [0.8, 0.6, 0.3], undefined)); add(m, line([-1.5, 1.5, -0.3], [-0.8, 0.6, -0.3], undefined)); label(m, [1.5, 1.5, 0.3], "Heated chemo in"); label(m, [-1.5, 1.5, -0.3], "Out (circulated 41-43 °C)"); label(m, [0, -0.9, 0], "Peritoneal cavity"); return m; };

// ===== Drugs / biologics =====
function adcMesh(payloadSites: number, arms: [boolean, boolean], labels: string[]): Mesh {
  const m = empty();
  add(m, antibody(1.0, undefined, 0.6, arms[0], arms[1]));
  const sites: Vec3[] = [];
  for (let i = 0; i < payloadSites; i++) { const y = -0.9 + (0.7 * i) / Math.max(1, payloadSites - 1); sites.push([i % 2 === 0 ? -0.32 : 0.32, y, (i % 4 < 2 ? 0.12 : -0.12)]); }
  for (const s of sites) { add(m, line([s[0] > 0 ? 0.12 : -0.12, s[1], 0], s, "soft")); add(m, octahedron(0.07, "accent"), { at: s }); }
  label(m, [0, -1.0, 0], labels[0]);
  if (sites.length) label(m, sites[sites.length - 1], labels[1]);
  const [l, r] = antibodyTips(1.0);
  label(m, arms[0] ? l : r, labels[2]);
  return m;
}
S["adc"] = () => adcMesh(8, [true, true], ["Antibody (Fc)", "Payload on cleavable linker (DAR 8)", "Antigen-binding arm"]);
S["dual-payload-adc"] = () => { const m = adcMesh(8, [true, true], ["Antibody", "Payload A (TOP1)", "Antigen-binding arm"]); for (let i = 0; i < 4; i++) add(m, sphere(0.06, 2, 6, "hot"), { at: [i % 2 ? 0.34 : -0.34, -0.85 + 0.2 * i, i % 2 ? -0.22 : 0.22] }); label(m, [0.34, -0.25, -0.22], "Payload B (orthogonal)"); return m; };
S["degrader-antibody-conjugate"] = () => { const m = adcMesh(4, [true, true], ["Antibody", "Degrader payload (glue / PROTAC)", "Antigen-binding arm"]); return m; };
S["immune-stimulating-adc"] = () => adcMesh(4, [true, true], ["Antibody", "TLR / STING agonist payload", "Tumour antigen arm"]);
S["masked-adc"] = () => { const m = adcMesh(6, [true, true], ["Antibody", "Payload", "Binding arm"]); const [l, r] = antibodyTips(1.0); add(m, polyline([[l[0] - 0.15, l[1] + 0.05, 0], [l[0] + 0.15, l[1] + 0.2, 0]], "hot")); add(m, polyline([[r[0] - 0.15, r[1] + 0.2, 0], [r[0] + 0.15, r[1] + 0.05, 0]], "hot")); label(m, [r[0], r[1] + 0.2, 0], "Peptide mask, cleaved by tumour proteases"); return m; };
S["site-specific-conjugation"] = () => adcMesh(4, [true, true], ["Antibody", "Defined attachment sites (homogeneous DAR)", "Fab arm"]);
S["bispecific-adc"] = () => { const m = adcMesh(8, [true, false], ["Antibody", "TOP1 payload", "Arm 1 (e.g. EGFR)"]); const [, r] = antibodyTips(1.0); add(m, polyline([[0.12, -0.05, 0], [r[0], r[1] + 0.05, 0]], undefined)); add(m, sphere(0.14, 3, 8), { at: [r[0], r[1] + 0.05, 0] }); label(m, [r[0], r[1] + 0.05, 0], "Arm 2 (e.g. HER3)"); return m; };
S["peptide-drug-conjugate"] = () => { const m = empty(); add(m, polyline([[-0.6, 0.3, 0], [-0.3, 0.6, 0.1], [0.1, 0.5, -0.1], [0.4, 0.2, 0.1], [0.2, -0.2, 0], [-0.3, -0.1, -0.1]], undefined, true)); add(m, line([0.4, 0.2, 0.1], [0.9, 0.1, 0.1], "soft")); add(m, octahedron(0.12, "accent"), { at: [1.05, 0.1, 0.1] }); label(m, [-0.3, 0.6, 0.1], "Bicyclic peptide binder"); label(m, [1.05, 0.1, 0.1], "Payload"); return m; };
S["adc-payload-neutralizer"] = () => { const m = adcMesh(6, [true, true], ["ADC", "Payload", "Binding arm"]); add(m, sphere(0.3, 3, 8, "hot"), { at: [1.2, -0.9, 0] }); add(m, octahedron(0.07, "accent"), { at: [1.2, -0.9, 0] }); label(m, [1.2, -0.9, 0], "Free payload captured"); return m; };
S["monoclonal-antibody"] = () => { const m = empty(); add(m, antibody(1.0)); const [l, r] = antibodyTips(1.0); add(m, cellSphere(0.7, "soft"), { at: [0, 1.7, 0] }); add(m, line(l, [l[0] + 0.2, 1.05, 0], "hot")); add(m, line(r, [r[0] - 0.2, 1.05, 0], "hot")); label(m, [0, -1.0, 0], "Fc: recruits immune effectors"); label(m, [0, 1.7, 0], "Target antigen on cell"); return m; };
S["bispecific-antibody"] = () => { const m = empty(); add(m, antibody(1.0, undefined, 0.6, true, false)); const [l, r] = antibodyTips(1.0); add(m, polyline([[0.12, -0.05, 0], [r[0], r[1] + 0.05, 0]])); add(m, sphere(0.14, 3, 8), { at: [r[0], r[1] + 0.05, 0] }); add(m, cellSphere(0.55, "soft"), { at: [l[0] - 0.2, l[1] + 0.6, 0] }); add(m, cellSphere(0.55, "soft"), { at: [r[0] + 0.2, r[1] + 0.6, 0] }); label(m, [l[0] - 0.2, l[1] + 0.6, 0], "Target A"); label(m, [r[0] + 0.2, r[1] + 0.6, 0], "Target B"); return m; };
S["t-cell-engager"] = () => { const m = empty(); add(m, cellSphere(0.9, "soft"), { at: [-1.3, 0, 0] }); add(m, cellSphere(0.9, "hot"), { at: [1.3, 0, 0] }); add(m, antibody(0.45, "accent", 1.2), { at: [0, -0.25, 0] }); const [l, r] = antibodyTips(0.45, 1.2); add(m, line([l[0], l[1] - 0.25, 0], [-0.42, 0.05, 0], "accent")); add(m, line([r[0], r[1] - 0.25, 0], [0.42, 0.05, 0], "accent")); for (let i = 0; i < 6; i++) { const a = (TAU * i) / 6; add(m, line([-1.3 + 0.9 * Math.cos(a), 0.9 * Math.sin(a), 0], [-1.3 + 1.05 * Math.cos(a), 1.05 * Math.sin(a), 0], "soft")); } label(m, [-1.3, 0, 0], "T cell (CD3)"); label(m, [1.3, 0, 0], "Tumour cell (antigen)"); label(m, [0, -0.7, 0], "Bispecific bridge → synapse"); return m; };
S["checkpoint-inhibitor"] = () => { const m = empty(); add(m, cellSphere(0.9, "soft"), { at: [-1.3, 0, 0] }); add(m, cellSphere(0.9, "hot"), { at: [1.3, 0, 0] }); add(m, line([-0.4, 0.3, 0], [-0.05, 0.3, 0])); add(m, line([0.4, 0.3, 0], [0.05, 0.3, 0])); add(m, antibody(0.3, "accent", 1.0), { at: [0, -0.15, 0], rotZ: Math.PI / 2 }); add(m, line([-0.4, -0.4, 0], [0.4, -0.4, 0], "soft")); label(m, [-0.4, 0.3, 0], "PD-1"); label(m, [0.4, 0.3, 0], "PD-L1"); label(m, [0, -0.15, 0], "Blocking antibody"); label(m, [-1.3, 0, 0], "T cell, brake released"); return m; };
S["car-t"] = () => { const m = empty(); add(m, cellSphere(1.0, "soft"), { at: [-1.2, 0, 0] }); add(m, cellSphere(0.9, "hot"), { at: [1.3, 0, 0] }); for (let i = 0; i < 7; i++) { const a = -0.9 + (1.8 * i) / 6; const p: Vec3 = [-1.2 + 1.0 * Math.cos(a), 1.0 * Math.sin(a), 0]; add(m, polyline([p, [p[0] + 0.25 * Math.cos(a), p[1] + 0.25 * Math.sin(a), 0]], "accent")); add(m, line([p[0] + 0.25 * Math.cos(a) - 0.06, p[1] + 0.25 * Math.sin(a) + 0.06, 0], [p[0] + 0.25 * Math.cos(a) + 0.06, p[1] + 0.25 * Math.sin(a) - 0.06, 0], "accent")); } add(m, line([-0.2, 0, 0], [0.4, 0, 0], "hot")); add(m, dna(0.12, 0.6, 1, 10, "soft", 3), { at: [-1.2, 0, 0] }); label(m, [-1.2, 0, 0], "T cell + CAR transgene"); label(m, [0.1, 0.25, 0], "CAR binds antigen (no MHC needed)"); label(m, [1.3, 0, 0], "Tumour cell"); return m; };
S["glioma-car-t"] = S["car-t"]; S["armored-car"] = () => { const m = S["car-t"](); for (let i = 0; i < 5; i++) add(m, arrow([-1.2, 0, 0], [-1.2 + 1.5 * Math.cos(2.4 + i * 0.4), 1.5 * Math.sin(2.4 + i * 0.4), 0], "hot", 0.2)); label(m, [-2.4, 0.9, 0], "Secreted IL-12/IL-18, dnTGFβR"); return m; };
S["allogeneic-cell-therapy"] = () => { const m = S["car-t"](); add(m, line([-1.35, 0.2, 0.3], [-1.05, -0.1, 0.3], "hot")); add(m, line([-1.35, -0.1, 0.3], [-1.05, 0.2, 0.3], "hot")); label(m, [-1.2, 0.05, 0.3], "TCR / HLA knocked out (donor cell)"); return m; };
S["car-nk-macrophage"] = () => { const m = S["car-t"](); m.labels = m.labels?.map((l) => l.text.startsWith("T cell") ? { ...l, text: "NK cell or macrophage + CAR" } : l); return m; };
S["tcr-t"] = () => { const m = empty(); add(m, cellSphere(1.0, "soft"), { at: [-1.2, 0, 0] }); add(m, cellSphere(0.9, "hot"), { at: [1.3, 0, 0] }); add(m, polyline([[-0.2, 0.1, 0], [0.1, 0.1, 0]], "accent")); add(m, polyline([[-0.2, -0.1, 0], [0.1, -0.1, 0]], "accent")); add(m, box(0.25, 0.35, 0.2), { at: [0.45, 0, 0] }); add(m, line([0.35, 0, 0], [0.55, 0, 0], "hot")); label(m, [-0.05, 0.1, 0], "Engineered TCR"); label(m, [0.45, 0, 0], "Peptide in HLA"); label(m, [1.3, 0, 0], "Intracellular antigen presented"); return m; };
S["in-vivo-car-t"] = () => { const m = empty(); add(m, sphere(0.5, 4, 10, "accent"), { at: [-1.4, 0.3, 0] }); add(m, helix(0.18, 0.6, 2, 16, "hot"), { at: [-1.4, 0.3, 0] }); add(m, cellSphere(1.0, "soft"), { at: [1.0, 0, 0] }); add(m, arrow([-0.85, 0.2, 0], [-0.05, 0.05, 0], "accent", 0.25)); for (let i = 0; i < 4; i++) { const a = -0.6 + 0.4 * i; add(m, line([1.0 + Math.cos(a), Math.sin(a), 0], [1.0 + 1.25 * Math.cos(a), 1.25 * Math.sin(a), 0], "accent")); } label(m, [-1.4, 0.3, 0], "Targeted LNP with CAR mRNA"); label(m, [1.0, 0, 0], "T cell reprogrammed in the body"); return m; };
S["til-therapy"] = () => { const m = empty(); add(m, sphere(0.7, 4, 10, "hot"), { at: [-1.8, 0.3, 0] }); add(m, dots([[-1.9, 0.5, 0.2], [-1.6, 0.1, -0.2], [-1.7, 0.4, -0.3]], "accent")); add(m, arrow([-1.1, 0.3, 0], [-0.5, 0.3, 0], "soft", 0.25)); add(m, grid3(4, 3, 2, 0.22, "accent"), { at: [0.2, 0.3, 0] }); add(m, arrow([0.9, 0.3, 0], [1.5, 0.3, 0], "soft", 0.25)); add(m, ellipsoid(0.5, 0.7, 0.4, 3, 8, "soft"), { at: [2.0, 0.1, 0] }); label(m, [-1.8, 0.3, 0], "Tumour with infiltrating T cells"); label(m, [0.2, 0.75, 0], "Expanded ×1000 with IL-2"); label(m, [2.0, 0.1, 0], "Returned to patient"); return m; };
S["neoantigen-mrna-vaccine"] = () => { const m = empty(); add(m, sphere(1.0, 6, 12, "accent")); add(m, helix(0.45, 1.2, 3, 30, "hot")); add(m, dots(circlePts(1.15, 12), "soft")); label(m, [1.0, 0.3, 0], "Lipid nanoparticle"); label(m, [0, 0.6, 0.45], "mRNA: up to 34 neoantigens"); return m; };
S["shared-antigen-vaccine"] = () => { const m = S["neoantigen-mrna-vaccine"](); m.labels = [{ at: [1.0, 0.3, 0], text: "Off-the-shelf vaccine" }, { at: [0, 0.6, 0.45], text: "Shared antigen (e.g. KRAS G12D)" }]; return m; };
S["hpv-vaccine"] = () => { const m = empty(); add(m, icosahedron(0.9, "accent")); add(m, dots(circlePts(1.1, 12), "soft")); label(m, [0.9, 0.3, 0], "Virus-like particle (L1 capsid)"); label(m, [0, -1.1, 0], "No viral DNA inside"); return m; };
S["oncolytic-virus"] = () => { const m = empty(); add(m, cellSphere(1.1, "soft")); add(m, icosahedron(0.35, "accent"), { at: [1.3, 0.5, 0] }); add(m, icosahedron(0.25, "accent"), { at: [0.2, 0.1, 0.2] }); add(m, arrow([1.0, 0.4, 0], [0.5, 0.2, 0.15], "soft", 0.3)); for (let i = 0; i < 5; i++) { const a = 2.6 + i * 0.35; add(m, arrow([-0.7 * Math.cos(a), 0.7 * Math.sin(a), 0], [-1.6 * Math.cos(a), 1.6 * Math.sin(a), 0], "hot", 0.2)); } label(m, [1.3, 0.5, 0], "Engineered HSV / adenovirus"); label(m, [0.2, 0.1, 0.2], "Replicates in tumour cell"); label(m, [-1.6, 0.6, 0], "Lysis + antigen release"); return m; };
S["cytokine-therapy"] = () => { const m = empty(); add(m, cellSphere(1.0, "soft")); add(m, dots(Array.from({ length: 18 }, (_, i) => { const a = (TAU * i) / 18, r = 1.3 + 0.4 * (i % 3); return [r * Math.cos(a), r * Math.sin(a) * 0.7, (i % 2) * 0.3] as Vec3; }), "accent")); for (let i = 0; i < 6; i++) { const a = (TAU * i) / 6; add(m, line([Math.cos(a), Math.sin(a) * 0.7, 0], [1.15 * Math.cos(a), 1.15 * Math.sin(a) * 0.7, 0])); } label(m, [1.3, 0, 0], "IL-2 / IL-15 molecules"); label(m, [0, 0, 0], "T / NK cell receptors"); return m; };
S["sting-agonist"] = () => { const m = empty(); add(m, cellSphere(1.1, "soft")); add(m, dna(0.1, 0.5, 1, 8, "hot", 3), { at: [-0.4, 0.2, 0.2] }); add(m, sphere(0.15, 3, 8, "accent"), { at: [0.1, -0.1, 0] }); add(m, arrow([-0.3, 0.1, 0.15], [-0.05, -0.05, 0.05], "soft", 0.3)); add(m, arrow([0.25, -0.1, 0], [0.9, -0.4, 0], "accent", 0.25)); label(m, [-0.4, 0.2, 0.2], "Cytosolic DNA"); label(m, [0.1, -0.1, 0], "cGAS → STING"); label(m, [0.9, -0.4, 0], "Type I interferon"); return m; };
S["photoimmunotherapy"] = () => { const m = empty(); add(m, cellSphere(0.9, "hot"), { at: [0.6, -0.4, 0] }); add(m, antibody(0.5, undefined, 0.6), { at: [-0.7, 0.2, 0], rotZ: -0.8 }); add(m, octahedron(0.1, "accent"), { at: [-0.9, -0.3, 0] }); add(m, cone(0.6, 1.6, 10, "accent"), { at: [-1.2, 1.4, 0], rotZ: -0.7 }); label(m, [-1.2, 1.9, 0], "690 nm light"); label(m, [-0.9, -0.3, 0], "IR700 dye on antibody"); label(m, [0.6, -0.4, 0], "Membrane rupture"); return m; };
S["kinase-inhibitors"] = () => { const m = empty(); add(m, ellipsoid(1.2, 0.9, 0.8, 5, 10)); add(m, ring(0.35, 12, "soft"), { at: [0.5, 0.2, 0.55], rotX: 0.5 }); add(m, polyline([[0.35, 0.15, 0.6], [0.6, 0.3, 0.65], [0.7, 0.05, 0.6], [0.45, -0.05, 0.62]], "accent", true)); add(m, line([0.55, 0.3, 0.9], [0.55, 0.3, 1.4], "soft")); label(m, [0.5, 0.2, 0.55], "ATP pocket"); label(m, [0.55, 0.3, 1.4], "Inhibitor blocks phosphotransfer"); label(m, [-1.0, -0.6, 0], "Kinase domain"); return m; };
S["cdk46-inhibitor"] = S["kinase-inhibitors"]; S["kras-inhibitors"] = () => { const m = S["kinase-inhibitors"](); m.labels = [{ at: [0.5, 0.2, 0.55], text: "Switch-II pocket (G12C)" }, { at: [0.55, 0.3, 1.4], text: "Covalent inhibitor locks RAS off" }, { at: [-1.0, -0.6, 0], text: "KRAS GTPase" }]; return m; };
S["parp-inhibitor"] = () => { const m = empty(); add(m, dna(0.4, 2.6, 2, 48, undefined, 3)); add(m, line([0.4, 0.05, 0], [0.4, 0.3, 0], "hot")); add(m, sphere(0.3, 3, 8), { at: [0.75, 0.18, 0] }); add(m, octahedron(0.1, "accent"), { at: [0.75, 0.18, 0] }); label(m, [0.4, 0.18, 0], "Single-strand break"); label(m, [0.75, 0.18, 0], "PARP trapped on DNA"); label(m, [0, -1.3, 0], "HR-deficient cell cannot repair"); return m; };
S["synthetic-lethality-approaches"] = S["parp-inhibitor"];
S["protac-degrader"] = () => { const m = empty(); add(m, sphere(0.7, 4, 10, "hot"), { at: [-1.2, 0, 0] }); add(m, sphere(0.7, 4, 10), { at: [1.2, 0, 0] }); add(m, polyline([[-0.55, 0.1, 0], [-0.25, 0.25, 0.1], [0.25, 0.25, -0.1], [0.55, 0.1, 0]], "accent")); add(m, octahedron(0.12, "accent"), { at: [-0.55, 0.1, 0] }); add(m, octahedron(0.12, "accent"), { at: [0.55, 0.1, 0] }); add(m, dots([[1.5, 0.8, 0], [1.7, 1.0, 0.1], [1.4, 1.1, -0.1]], "soft")); label(m, [-1.2, 0, 0], "Target protein"); label(m, [1.2, 0, 0], "E3 ligase (CRBN / VHL)"); label(m, [1.6, 1.0, 0], "Ubiquitin → proteasome"); return m; };
S["antisense-sirna"] = () => { const m = empty(); add(m, helix(0.4, 2.4, 3, 48, "soft")); add(m, helix(0.4, 0.8, 1, 16, "accent", Math.PI), { at: [0, 0.2, 0] }); add(m, line([0.5, 0.6, 0], [0.9, 1.0, 0], "hot")); label(m, [0, -1.2, 0], "Target mRNA"); label(m, [0.4, 0.2, 0], "Antisense / siRNA pairs"); label(m, [0.9, 1.0, 0], "Cleavage, no protein"); return m; };
S["programmable-dna-targeting-therapeutics"] = () => { const m = empty(); add(m, dna(0.45, 2.8, 2.5, 60, undefined, 3)); add(m, helix(0.55, 0.6, 0.5, 10, "accent"), { at: [0, 0.2, 0] }); add(m, sphere(0.28, 3, 8, "hot"), { at: [0.8, 0.2, 0] }); add(m, line([0.55, 0.2, 0], [0.55, 0.2, 0], "hot")); label(m, [0, 0.2, 0.55], "Guide recognises diseased sequence"); label(m, [0.8, 0.2, 0], "Kill switch fires only here"); return m; };
S["cytotoxic-chemotherapy"] = () => { const m = empty(); add(m, ellipsoid(1.4, 0.9, 0.9, 4, 12, "soft")); for (const x of [-0.5, 0.5]) add(m, sphere(0.35, 3, 8), { at: [x, 0, 0] }); for (let i = 0; i < 5; i++) { const y = -0.35 + 0.175 * i; add(m, line([-0.5, y * 0.6, 0], [0.5, y * 0.6, 0], "soft")); } add(m, dots([[0.1, 0.15, 0.3], [-0.2, -0.2, 0.3], [0.3, -0.1, -0.3]], "accent")); label(m, [0.5, 0, 0], "Chromosomes at spindle"); label(m, [0.3, -0.1, -0.3], "Drug blocks division / damages DNA"); return m; };
S["platinum"] = () => { const m = empty(); add(m, dna(0.4, 2.6, 2, 48, undefined, 3)); add(m, line([0.2, 0.1, 0.35], [-0.2, 0.1, 0.35], "hot")); add(m, octahedron(0.1, "accent"), { at: [0, 0.1, 0.35] }); label(m, [0, 0.1, 0.35], "Pt crosslink between strands"); return m; };
S["topoisomerase-inhibitors"] = () => { const m = empty(); add(m, dna(0.4, 2.6, 2, 48, undefined, 3)); add(m, sphere(0.32, 3, 8), { at: [0.6, -0.2, 0] }); add(m, octahedron(0.1, "accent"), { at: [0.6, -0.2, 0] }); add(m, line([0.4, -0.3, 0], [0.4, -0.1, 0], "hot")); label(m, [0.6, -0.2, 0], "TOP1 frozen on cut DNA (SN-38, DXd)"); label(m, [0, 1.3, 0], "Replication fork collides → break"); return m; };
S["endocrine-therapy"] = () => { const m = empty(); add(m, ellipsoid(1.0, 0.8, 0.7, 4, 10)); add(m, ring(0.3, 12, "soft"), { at: [0.6, 0.2, 0.4], rotX: 0.6 }); add(m, octahedron(0.12, "accent"), { at: [0.65, 0.2, 0.45] }); add(m, dots([[1.6, 0.9, 0], [1.9, 0.6, 0.2]], "soft")); add(m, line([1.5, 0.8, 0], [1.1, 0.5, 0.2], "soft")); add(m, line([1.2, 0.7, 0.1], [1.3, 0.5, 0.1], "hot")); label(m, [-0.6, -0.5, 0], "Oestrogen receptor"); label(m, [0.65, 0.2, 0.45], "Ligand pocket blocked / receptor degraded"); label(m, [1.6, 0.9, 0], "Oestrogen kept out"); return m; };
S["androgen-deprivation"] = () => { const m = S["endocrine-therapy"](); m.labels = [{ at: [-0.6, -0.5, 0], text: "Androgen receptor" }, { at: [0.65, 0.2, 0.45], text: "Antagonist in pocket" }, { at: [1.6, 0.9, 0], text: "Testosterone removed" }]; return m; };
S["epigenetic-drugs"] = () => { const m = empty(); add(m, dna(0.35, 3.0, 4, 60, "soft", 5)); for (const y of [-1.0, -0.3, 0.4, 1.1]) add(m, sphere(0.3, 3, 8), { at: [0, y, 0] }); add(m, dots([[0.35, -0.3, 0.2], [0.3, 0.4, -0.2], [-0.3, 1.1, 0.2]], "accent")); label(m, [0, 0.4, 0], "Histones"); label(m, [0.35, -0.3, 0.2], "Marks read / written / erased"); return m; };
S["chemoprevention"] = S["endocrine-therapy"]; S["antiangiogenic"] = () => { const m = empty(); add(m, sphere(0.8, 4, 10, "hot")); for (let i = 0; i < 5; i++) { const a = (TAU * i) / 5; add(m, polyline([[2.0 * Math.cos(a), 2.0 * Math.sin(a) * 0.6, 0], [1.4 * Math.cos(a + 0.2), 1.4 * Math.sin(a + 0.2) * 0.6, 0.1], [0.85 * Math.cos(a), 0.85 * Math.sin(a) * 0.6, 0]], "accent")); } add(m, line([1.2, 0.9, 0], [1.5, 1.2, 0], "hot")); label(m, [0, 0, 0], "Tumour signals VEGF"); label(m, [2.0, 0, 0], "New vessels blocked"); return m; };
S["ttfields"] = () => { const m = empty(); add(m, ellipsoid(0.9, 1.1, 1.0, 5, 12, "soft")); for (const [x, y, z] of [[0.85, 0.3, 0], [-0.85, 0.3, 0], [0, 0.4, 0.95], [0, 0.4, -0.95]] as Vec3[]) add(m, grid3(3, 3, 1, 0.14, undefined), { at: [x, y, z], rotY: x !== 0 ? Math.PI / 2 : 0 }); for (let k = -2; k <= 2; k++) add(m, polyline([[-0.8, 0.3 + 0.1 * k, 0], [-0.4, 0.3 + 0.18 * k, 0], [0.4, 0.3 + 0.18 * k, 0], [0.8, 0.3 + 0.1 * k, 0]], "accent")); add(m, sphere(0.25, 3, 8, "hot"), { at: [0.2, 0.2, 0.1] }); label(m, [0.85, 0.3, 0], "Transducer arrays"); label(m, [0, 0.66, 0], "100-300 kHz alternating field"); label(m, [0.2, 0.2, 0.1], "Mitosis disrupted"); return m; };
S["scalp-cooling"] = () => { const m = empty(); add(m, ellipsoid(0.9, 1.1, 1.0, 5, 12, "soft")); add(m, ellipsoid(0.98, 0.75, 1.08, 3, 12, "accent"), { at: [0, 0.5, 0] }); add(m, polyline([[0.5, 1.2, 0.8], [1.2, 1.6, 1.2]], undefined)); label(m, [1.2, 1.6, 1.2], "Coolant"); label(m, [0, 1.2, 0], "Scalp vasoconstriction"); return m; };
S["cardio-oncology"] = () => { const m = empty(); add(m, ellipsoid(0.9, 1.0, 0.8, 4, 10)); add(m, polyline([[-1.8, -0.5, 0], [-1.2, -0.5, 0], [-1.0, 0.4, 0], [-0.8, -1.0, 0], [-0.6, -0.5, 0], [0.2, -0.5, 0], [0.4, 0.0, 0], [0.6, -0.5, 0], [1.8, -0.5, 0]], "accent"), { at: [0, -1.6, 0] }); label(m, [0, 1.0, 0], "Heart under treatment"); label(m, [-1.0, -1.2, 0], "Echo / troponin surveillance"); return m; };
S["exercise-oncology"] = () => { const m = empty(); add(m, polyline([[0, 1.2, 0], [0, 0.2, 0]])); add(m, sphere(0.22, 3, 8), { at: [0, 1.45, 0] }); add(m, polyline([[0, 0.9, 0], [-0.6, 0.4, 0.2]])); add(m, polyline([[0, 0.9, 0], [0.6, 1.1, -0.2]])); add(m, polyline([[0, 0.2, 0], [-0.5, -0.8, 0.1]])); add(m, polyline([[0, 0.2, 0], [0.6, -0.7, -0.1]])); add(m, line([-1.5, -0.9, 0], [1.5, -0.9, 0], "soft")); label(m, [0.6, 1.1, -0.2], "Structured aerobic + resistance"); return m; };
S["geriatric-assessment"] = () => { const m = empty(); for (let j = 0; j < 5; j++) { add(m, line([-1.2, 0.8 - j * 0.4, 0], [0.4, 0.8 - j * 0.4, 0], "soft")); add(m, box(0.2, 0.2, 0.05, j < 3 ? "accent" : undefined), { at: [0.9, 0.8 - j * 0.4, 0] }); } label(m, [0.9, 0.8, 0], "Function, cognition, nutrition, support"); return m; };
S["organoids"] ??= S["functional-drug-testing"];

// ===== Generic fallbacks by front =====
const GENERIC: Record<string, () => Mesh> = {
  imaging: () => petScanner(),
  diagnostics: () => { const m = empty(); add(m, dna(0.45, 2.8, 2.5, 60, undefined, 3)); label(m, [0, 1.4, 0], "Molecular read-out"); return m; },
  "early-detection": () => bloodTube(6, 0.35, "Early signal"),
  surgery: S["robotic-surgery"],
  radiation: S["imrt-igrt"],
  chemotherapy: S["cytotoxic-chemotherapy"],
  "targeted-therapy": S["kinase-inhibitors"],
  adcs: S["adc"],
  immunotherapy: S["checkpoint-inhibitor"],
  "cell-therapy": S["car-t"],
  radiopharma: S["radioligand-therapy"],
  hormonal: S["endocrine-therapy"],
  epigenetics: S["epigenetic-drugs"],
  "supportive-care": S["exercise-oncology"],
  "ai-computation": S["radiology-ai-screening"],
  "drug-discovery": S["crispr-screens"],
  prevention: S["hpv-vaccine"],
  devices: S["ttfields"],
};

const cache = new Map<string, Mesh>();
function build(key: string, f: () => Mesh): Mesh {
  let m = cache.get(key);
  if (!m) { m = f(); if (m.points.length > 700) console.warn(`schematic ${key}: ${m.points.length} points`); cache.set(key, m); }
  return m;
}

/** Animated process schematic for a technology id, if one exists (see animated.ts). */
export function hasAnimation(techId: string): boolean { return techId in ANIMATED; }
/** Serialisable stand-in for an animated mesh: static geometry plus the `anim` marker; Wireframe3D rebuilds the animation client-side. */
function marker(key: string): Mesh {
  return build(`anim:${key}`, () => { const m = ALL_ANIMATED[key](); return { points: m.points, segments: m.segments, labels: m.labels, anim: key }; });
}
export function animatedFor(techId: string): Mesh | undefined { const base = SCHEMATIC_ALIAS[techId] ?? techId; return ANIMATED[base] ? marker(base) : undefined; }

/** Animated schematic for a front (section id). Every front has one. */
export function hasFrontAnimation(sectionId: string): boolean { return `front:${sectionId}` in ALL_ANIMATED; }
export function frontSchematicFor(sectionId: string): Mesh {
  if (hasFrontAnimation(sectionId)) return marker(`front:${sectionId}`);
  return genericFor(sectionId);
}

/** Animated schematic for a glossary term category (see term-animations.ts). */
export function hasTermAnimation(category: string): boolean { return `term:${termCategoryKey(category)}` in ALL_ANIMATED; }
export function termSchematicFor(category: string): Mesh {
  const key = `term:${termCategoryKey(category)}`;
  if (key in ALL_ANIMATED) return marker(key);
  return genericFor("diagnostics");
}

/** Returns a specific mesh if one exists (animated where available), else a generic mesh for the first matching front.
 *  Called with a section id (schematicFor(sectionId, [sectionId])) it returns that front's animated schematic. */
/**
 * Technologies that share another technology's animated schematic because the drawing depicts the same mechanism
 * (a checkpoint antibody, a radioligand, an epigenetic drug). Each key is a technology id; each value an id with its own scene.
 */
import { radiationSchematicAliases } from "./radiation-wave1";
import { modelSchematicAliases } from "./models-wave";
import { machineSchematicAliases } from "./machines-wave";
import { machineSchematicAliases2 } from "./machines-wave2";
import { manufacturingSchematicAliases } from "./manufacturing-wave";

export const SCHEMATIC_ALIAS: Record<string, string> = {
  "stride-dna-break-detection": "wes-wgs",
  ...radiationSchematicAliases,
  ...modelSchematicAliases,
  ...machineSchematicAliases,
  ...machineSchematicAliases2,
  ...manufacturingSchematicAliases,
  "spatial-transcriptomics": "spatial-biology-instruments",
  "imaging-mass-cytometry": "spatial-biology-instruments",
  "multiplex-immunofluorescence": "histopathology-ihc",
  "ai-pathology-scoring": "digital-pathology-ai",
  radiomics: "radiology-ai-screening",
  "ctc-capture": "liquid-biopsy",
  "cfdna-methylation-testing": "methylation-profiling",
  "gene-expression-prognostic-assays": "rna-seq",
  "oncology-pharmacogenomics": "germline-testing",
  "ai-mammography-screening": "mammography",
  "ai-endoscopy-detection": "colorectal-screening",
  "cns-tumour-methylation-classifier": "methylation-profiling",
  "clonal-evolution-tracking": "wes-wgs",
  "tigit-blockade": "checkpoint-inhibitor",
  "lag3-blockade": "checkpoint-inhibitor",
  "tim3-blockade": "checkpoint-inhibitor",
  "cd47-blockade": "monoclonal-antibody",
  "cd40-agonists": "monoclonal-antibody",
  immunocytokines: "cytokine-therapy",
  "nk-cell-engagers": "t-cell-engager",
  "trispecific-antibodies": "bispecific-antibody",
  "dendritic-cell-vaccines": "cell-vaccine",
  "bacterial-vector-vaccines": "engineered-bacteria-therapy",
  "gamma-delta-t-cell-therapy": "allogeneic-cell-therapy",
  "nk-cell-therapy": "car-nk-macrophage",
  "virus-specific-t-cells": "allogeneic-cell-therapy",
  "lu177-radioligand-therapy": "radioligand-therapy",
  "astatine-211-alpha-therapy": "targeted-alpha-therapy",
  "radioligand-dosimetry": "spect",
  "menin-inhibitors": "epigenetic-drugs",
  "bcl2-inhibitors": "bh3-profiling",
  "idh-inhibitors": "epigenetic-drugs",
  "pi3k-akt-mtor-inhibitors": "kinase-inhibitors",
  "mdm2-inhibitors": "molecular-glue-platforms",
  "her2-tyrosine-kinase-inhibitors": "kinase-inhibitors",
  "oral-serds": "endocrine-therapy",
  "hedgehog-inhibitors": "kinase-inhibitors",
  "gamma-secretase-inhibitors": "kinase-inhibitors",
  celmods: "molecular-glue-platforms",
  "lsd1-inhibitors": "epigenetic-drugs",
  "atr-chk1-inhibitors": "parp-inhibitor",
  "kat6-inhibitors": "epigenetic-drugs",
  "genetically-engineered-mouse-models": "pdx-models",
  "humanised-mouse-models": "pdx-models",
  "cancer-cell-line-encyclopedias": "crispr-screens",
  "tumour-on-chip": "organoids"
};

export function schematicFor(techId: string, sections: string[]): { mesh: Mesh; specific: boolean } {
  const base = SCHEMATIC_ALIAS[techId] ?? techId;
  if (ANIMATED[base]) return { mesh: marker(base), specific: true };
  if (S[base]) return { mesh: build(base, S[base]), specific: true };
  if (hasFrontAnimation(techId) && sections.includes(techId)) return { mesh: marker(`front:${techId}`), specific: true };
  for (const s of sections) if (GENERIC[s]) return { mesh: build(`generic:${s}`, GENERIC[s]), specific: false };
  return { mesh: build("generic:default", () => { const m = empty(); add(m, sphere(1, 5, 10)); return m; }), specific: false };
}

export const SPECIFIC_IDS = Object.keys(S);
export function genericFor(sectionId: string): Mesh { return build(`generic:${sectionId}`, GENERIC[sectionId] ?? (() => sphere(1, 5, 10))); }
