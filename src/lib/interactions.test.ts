import { describe, expect, it } from "vitest";
import { agents } from "@/data/interactions";
import { checkPairs, singleFlags, worst } from "./interactions";
import { validateInteractions } from "./interactions-validate";

describe("interaction data", () => {
  it("validates against the graph", () => {
    expect(() => validateInteractions()).not.toThrow();
    expect(agents.filter((a) => !a.external).length).toBeGreaterThanOrEqual(60);
    expect(agents.filter((a) => a.external).length).toBeGreaterThanOrEqual(30);
  });
});

describe("interaction rules", () => {
  it("flags a sensitive CYP3A4 substrate with a strong inhibitor as major, with the victim's own management text", () => {
    const f = checkPairs(["venetoclax", "posaconazole"]);
    const cyp = f.find((x) => x.rule === "cyp3a4-inhibitor")!;
    expect(cyp.severity).toBe("major");
    expect(cyp.management).toMatch(/ramp-up|posaconazole/);
    expect(f.find((x) => x.rule === "pgp-inhibitor")).toBeTruthy();
  });

  it("flags inducers, acid reducers and QT stacking", () => {
    expect(checkPairs(["osimertinib", "rifampicin"]).find((x) => x.rule === "cyp3a4-inducer")?.severity).toBe("major");
    const ppi = checkPairs(["erlotinib", "omeprazole"]).find((x) => x.rule === "acid-reducer")!;
    expect(ppi.severity).toBe("major");
    expect(ppi.management).toMatch(/Avoid PPIs/);
    expect(checkPairs(["erlotinib", "famotidine"]).find((x) => x.rule === "acid-reducer")?.severity).toBe("moderate");
    const qt = checkPairs(["ribociclib", "ondansetron"]).find((x) => x.rule === "qt")!;
    expect(qt.severity).toBe("major");
  });

  it("flags CYP2D6 inhibition of tamoxifen and label-named pairs", () => {
    expect(checkPairs(["tamoxifen", "paroxetine"]).find((x) => x.rule === "cyp2d6-inhibitor")?.severity).toBe("major");
    const bleo = checkPairs(["brentuximab-vedotin", "bleomycin"]).find((x) => x.rule === "label-pair")!;
    expect(bleo.severity).toBe("contraindicated");
    expect(checkPairs(["fluorouracil", "warfarin"]).some((x) => x.severity === "major")).toBe(true);
    expect(checkPairs(["ibrutinib", "apixaban"]).find((x) => x.rule === "bleeding")?.severity).toBe("major");
  });

  it("is symmetric, de-duplicated and sorted by severity", () => {
    const ab = checkPairs(["nilotinib", "ketoconazole"]);
    const ba = checkPairs(["ketoconazole", "nilotinib"]);
    expect(ab.map((x) => x.rule).sort()).toEqual(ba.map((x) => x.rule).sort());
    const rules = ab.map((x) => `${[x.a, x.b].sort().join("|")}#${x.rule}`);
    expect(new Set(rules).size).toBe(rules.length);
    for (let i = 1; i < ab.length; i++) expect(["contraindicated", "major", "moderate", "minor"].indexOf(ab[i].severity)).toBeGreaterThanOrEqual(["contraindicated", "major", "moderate", "minor"].indexOf(ab[i - 1].severity));
    expect(worst(ab)).toBe("major");
  });

  it("returns nothing for agents with no shared mechanism and unknown ids", () => {
    expect(checkPairs(["letrozole", "metformin"])).toHaveLength(0);
    expect(checkPairs(["no-such-drug", "letrozole"])).toHaveLength(0);
    expect(worst([])).toBeNull();
  });

  it("single-agent flags include food, QT, hepatic and renal lines", () => {
    const kinds = singleFlags(["nilotinib"]).map((f) => f.kind);
    expect(kinds).toContain("food");
    expect(kinds).toContain("qt");
    expect(singleFlags(["capecitabine-unknown"])).toHaveLength(0);
  });
});
