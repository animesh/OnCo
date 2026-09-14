import type { Mol } from "@/lib/molecule-render";
import { normaliseElement } from "@/lib/molecule-render";

/** Standard atomic weights (IUPAC 2021 conventional values), enough for every element in the structure snapshots. */
const MASS: Record<string, number> = {
  H: 1.008, C: 12.011, N: 14.007, O: 15.999, F: 18.998, P: 30.974, S: 32.06, Cl: 35.45, Br: 79.904, I: 126.904, B: 10.81, Se: 78.971, Si: 28.085,
  Pt: 195.084, Pd: 106.42, Au: 196.967, Cu: 63.546, Zn: 65.38, Fe: 55.845, Mg: 24.305, Ca: 40.078, Na: 22.99, K: 39.098, Li: 6.94, Al: 26.982,
  Lu: 174.967, Ga: 69.723, Ac: 227, Ra: 226, Y: 88.906, Tc: 98, In: 114.818, Zr: 91.224, Gd: 157.25, Sm: 150.36, Sr: 87.62, Ho: 164.93, Re: 186.207, Pb: 207.2,
  As: 74.922, Sn: 118.71, Ti: 47.867, Co: 58.933, Ni: 58.693, Mn: 54.938, Cr: 51.996, Ag: 107.868, Hg: 200.59, Bi: 208.98, Sb: 121.76, Te: 127.6, Ge: 72.63,
  Ce: 140.116, La: 138.905, Th: 232.038, U: 238.029, Cs: 132.905, Rb: 85.468, Ba: 137.327,
};

export type MoleculeStats = {
  /** Hill-order formula with subscripts as plain digits, e.g. C21H24N4O3. */
  formula: string;
  /** Molecular weight in g/mol, or null when an element has no mass in the table. */
  weight: number | null;
  atoms: number; heavyAtoms: number; hydrogens: number; bonds: number;
  /** Rings from the cycle rank of the bond graph (bonds minus atoms plus connected pieces). */
  rings: number;
  halogens: number; metals: string[];
  /** True when the record carries hydrogens, so formula and weight are complete. */
  hasH: boolean;
  elements: Array<{ el: string; n: number }>;
};

const METALS = new Set(["Pt", "Pd", "Au", "Cu", "Zn", "Fe", "Mg", "Ca", "Na", "K", "Li", "Al", "Lu", "Ga", "Ac", "Ra", "Y", "Tc", "In", "Zr", "Gd", "Sm", "Sr", "Ho", "Re", "Pb", "Sn", "Ti", "Co", "Ni", "Mn", "Cr", "Ag", "Hg", "Bi", "Ce", "La", "Th", "U", "Cs", "Rb", "Ba"]);
const HALOGENS = new Set(["F", "Cl", "Br", "I"]);

export function moleculeStats(mol: Mol): MoleculeStats {
  const counts = new Map<string, number>();
  for (const a of mol.atoms) { const el = normaliseElement(a[3]); counts.set(el, (counts.get(el) ?? 0) + 1); }
  const elements = [...counts.entries()].map(([el, n]) => ({ el, n }));
  // Hill order: C first, then H, then the rest alphabetically; without carbon everything is alphabetical.
  const hasC = counts.has("C");
  const order = (el: string) => (hasC ? (el === "C" ? "0" : el === "H" ? "1" : "2" + el) : el);
  elements.sort((a, b) => order(a.el).localeCompare(order(b.el)));
  const formula = elements.map(({ el, n }) => `${el}${n > 1 ? n : ""}`).join("");
  let weight: number | null = 0;
  for (const { el, n } of elements) { const m = MASS[el]; if (m === undefined) { weight = null; break; } weight += m * n; }
  const hydrogens = counts.get("H") ?? 0;
  // Connected pieces via union-find, for the ring count.
  const n = mol.atoms.length; const parent = Array.from({ length: n }, (_, i) => i);
  const find = (x: number): number => (parent[x] === x ? x : (parent[x] = find(parent[x])));
  for (const b of mol.bonds) { const ra = find(b[0]), rb = find(b[1]); if (ra !== rb) parent[ra] = rb; }
  const pieces = new Set(Array.from({ length: n }, (_, i) => find(i))).size;
  const rings = Math.max(0, mol.bonds.length - n + pieces);
  return {
    formula, weight: weight === null ? null : Math.round(weight * 10) / 10,
    atoms: n, heavyAtoms: n - hydrogens, hydrogens, bonds: mol.bonds.length, rings,
    halogens: elements.filter((e) => HALOGENS.has(e.el)).reduce((s, e) => s + e.n, 0),
    metals: elements.filter((e) => METALS.has(e.el)).map((e) => e.el),
    hasH: hydrogens > 0, elements,
  };
}

/** Protein snapshot summary: chains, residues (from alpha-carbon count) and bound ligands. */
export function proteinStats(mol: Mol): { chains: string[]; residues: number; ligands: string[]; atoms: number } {
  const chains = mol.chains ?? [...new Set(mol.atoms.map((a) => a[4]).filter((c): c is string => !!c))];
  const residues = mol.atoms.filter((a) => a[5] !== "lig").length;
  return { chains, residues, ligands: mol.ligands ?? [], atoms: mol.atoms.length };
}
