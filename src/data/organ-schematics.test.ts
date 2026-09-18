import { describe, expect, it } from "vitest";
import { graph } from "@/lib/graph";
import { ORGAN_SCHEMATICS, matchedSubtypes, organMesh } from "./organ-schematics";

describe("organ schematics", () => {
  it("cover every cancer at most once, reference real cancers, and stay under 500 points", () => {
    const g = graph();
    const seen = new Set<string>();
    for (const o of ORGAN_SCHEMATICS) {
      for (const id of o.cancers) {
        expect(g.get(id)?.kind, `${o.id} → ${id}`).toBe("cancer");
        expect(seen.has(id), `${id} drawn twice`).toBe(false);
        seen.add(id);
      }
      const m = organMesh(o);
      expect(m.points.length, `${o.id} points`).toBeLessThan(500);
      expect(m.segments.length, `${o.id} segments`).toBeGreaterThan(20);
      for (const p of m.points) for (const c of p) expect(Number.isFinite(c), `${o.id} finite`).toBe(true);
      expect(o.subsites.length, `${o.id} subsites`).toBeGreaterThanOrEqual(2);
      if (!o.nodes.length) expect(o.nodeNote, `${o.id} explains missing nodes`).toBeTruthy();
    }
    const uncovered = g.kind("cancer").filter((c) => !seen.has(c.id)).map((c) => c.id);
    // Unknown primary has no organ by definition; the NCI "rare cancers of childhood" umbrella and the adolescent and young adult family page span a dozen organs.
    expect(uncovered, "cancers without an organ drawing").toEqual(["aya-cancers", "cancer-of-unknown-primary", "childhood-cancers", "extragonadal-germ-cell-tumour", "metastatic-cancer", "rare-childhood-cancers"]);
  });

  it("every drawn cancer with subtypes links at least one subtype to a subsite", () => {
    const g = graph();
    const unlinked: string[] = [];
    for (const o of ORGAN_SCHEMATICS) for (const id of o.cancers) {
      const c = g.get(id);
      if (!c || c.kind !== "cancer" || !c.subtypes.length) continue;
      if (!o.subsites.some((s) => matchedSubtypes(s, c.subtypes).length)) unlinked.push(`${id}: ${c.subtypes.slice(0, 3).join(" | ")}`);
    }
    expect(unlinked, `no subsite matches these cancers' subtypes:\n${unlinked.join("\n")}`).toEqual([]);
  });
});
