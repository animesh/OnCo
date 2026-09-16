import type { Graph } from "./graph";
import type { Term, Technology } from "./schema";
import type { TargetSchematicTarget } from "@/components/TargetSchematic";
import { hasMolecule } from "./structures";

/**
 * The most specific picture a glossary term can carry. A term about a protein shows that target's schematic,
 * a chemical entity shows its molecule, a technique shows the technology's schematic, an anatomical or
 * pathological term shows the organ it concerns; only terms with none of these fall back to the animation
 * for their category.
 */
export type TermVisual =
  | { kind: "target"; target: TargetSchematicTarget }
  | { kind: "molecule"; drugId: string; modality?: string }
  | { kind: "tech"; tech: Technology }
  | { kind: "cancer"; cancerId: string }
  | { kind: "category" };

const ORGAN_CATEGORIES = new Set(["Anatomy", "Pathology", "Clinical"]);

export function termVisual(t: Term, g: Graph): TermVisual {
  for (const id of t.targets) { const e = g.get(id); if (e?.kind === "target") return { kind: "target", target: { id: e.id, name: e.name, targetClass: e.targetClass, tldr: e.tldr } }; }
  for (const id of t.drugs) { const e = g.get(id); if (e?.kind === "drug" && hasMolecule(e.id)) return { kind: "molecule", drugId: e.id, modality: e.modality }; }
  for (const id of t.technologies) { const e = g.get(id); if (e?.kind === "technology") return { kind: "tech", tech: e }; }
  if (ORGAN_CATEGORIES.has(t.category)) for (const id of t.cancers) { const e = g.get(id); if (e?.kind === "cancer") return { kind: "cancer", cancerId: e.id }; }
  return { kind: "category" };
}
