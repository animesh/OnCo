import { describe, expect, it } from "vitest";
import { DIMENSIONS, prevalencePct, scoreRequests, scoreStartupRequests, solutionTypeOf, techType, type DimensionInput, type DimensionKey, type RequestInput } from "./startup-score";

const src = [{ label: "fixture", href: "/ideas/fixture/" }];
const num = (raw: number | null, note?: string): DimensionInput => ({ raw, rawText: raw === null ? "Not scored" : String(raw), sources: src, note });

/** A fully scored baseline; override any dimension to build a fixture. */
function fixture(id: string, over: Partial<Record<DimensionKey, DimensionInput>> = {}, type: RequestInput["type"] = "software"): RequestInput {
  const dims: Record<DimensionKey, DimensionInput> = {
    survival: num(50), approvedOptions: num(10), incidence: num(100_000), bottleneck: num(2),
    addressable: num(100_000), payerPath: num(2), routeYears: num(1), competitors: num(10), capital: num(1), evidence: num(2),
    ...over,
  };
  return { id, name: id, type, typeFrom: "actor", cost: "medium", dims };
}

const dim = (r: ReturnType<typeof scoreRequests>[number], k: DimensionKey) => r.dimensions.find((d) => d.key === k)!;

describe("startup score: pure scoring", () => {
  it("weights of each axis sum to one", () => {
    for (const axis of ["urgency", "commerciality"] as const) {
      const w = DIMENSIONS.filter((d) => d.axis === axis).reduce((s, d) => s + d.weight, 0);
      expect(Math.round(w * 1000) / 1000).toBe(1);
    }
  });

  it("lower five-year survival raises urgency", () => {
    const rows = scoreRequests([fixture("a", { survival: num(10) }), fixture("b", { survival: num(50) }), fixture("c", { survival: num(90) })]);
    const by = Object.fromEntries(rows.map((r) => [r.input.id, r]));
    expect(dim(by.a, "survival").score).toBe(100);
    expect(dim(by.c, "survival").score).toBe(0);
    expect(by.a.urgency.score!).toBeGreaterThan(by.b.urgency.score!);
    expect(by.b.urgency.score!).toBeGreaterThan(by.c.urgency.score!);
  });

  it("more competitors lowers whitespace and commerciality", () => {
    const rows = scoreRequests([fixture("few", { competitors: num(0) }), fixture("some", { competitors: num(10) }), fixture("many", { competitors: num(200) })]);
    const by = Object.fromEntries(rows.map((r) => [r.input.id, r]));
    expect(dim(by.few, "competitors").score).toBe(100);
    expect(dim(by.many, "competitors").score).toBe(0);
    expect(dim(by.some, "competitors").score!).toBeGreaterThan(dim(by.many, "competitors").score!);
    expect(by.few.commerciality.score!).toBeGreaterThan(by.some.commerciality.score!);
    expect(by.some.commerciality.score!).toBeGreaterThan(by.many.commerciality.score!);
  });

  it("missing inputs are marked not scored and excluded from the axis mean", () => {
    const rows = scoreRequests([fixture("full"), fixture("gappy", { survival: num(null, "no cancer"), incidence: num(null), approvedOptions: num(null), addressable: num(null) }), fixture("low", { survival: num(90), bottleneck: num(0) })]);
    const by = Object.fromEntries(rows.map((r) => [r.input.id, r]));
    const s = dim(by.gappy, "survival");
    expect(s.score).toBeNull();
    expect(s.rawText).toBe("Not scored");
    expect(s.note).toBe("no cancer");
    expect(by.gappy.urgency.scored).toBe(1);
    expect(by.gappy.urgency.total).toBe(4);
    // Only the bottleneck dimension is scored, so the axis equals that dimension's score exactly (weights renormalised, no guessed zero).
    expect(by.gappy.urgency.score).toBe(dim(by.gappy, "bottleneck").score);
    expect(by.gappy.commerciality.scored).toBe(5);
    expect(by.full.urgency.scored).toBe(4);
  });

  it("composite is the geometric mean of the two axes and ranks are dense and descending", () => {
    const rows = scoreRequests([fixture("a"), fixture("b", { survival: num(5), competitors: num(0) }), fixture("c", { survival: num(95), competitors: num(500) })]);
    for (const r of rows) expect(r.composite).toBe(Math.round(Math.sqrt(r.urgency.score! * r.commerciality.score!)));
    for (let i = 1; i < rows.length; i++) expect(rows[i - 1].composite!).toBeGreaterThanOrEqual(rows[i].composite!);
    rows.forEach((r, i) => expect(r.rank).toBe(i + 1));
    expect(rows[0].input.id).toBe("b");
  });

  it("a dimension identical across the set scores the midpoint for everyone", () => {
    const rows = scoreRequests([fixture("a"), fixture("b")]);
    for (const r of rows) for (const d of r.dimensions) expect(d.score).toBe(50);
  });
});

describe("startup score: type and prevalence helpers", () => {
  it("classifies technology ids by route, in rule order", () => {
    expect(techType("liquid-biopsy")).toBe("diagnostic");
    expect(techType("psma-pet")).toBe("diagnostic");
    expect(techType("pet-ct")).toBe("device");
    expect(techType("robotic-surgery")).toBe("device");
    expect(techType("adc")).toBe("drug");
    expect(techType("checkpoint-inhibitor")).toBe("drug");
    expect(techType("ai-trial-matching")).toBe("software");
    expect(techType("pdx-models")).toBe("research-tool");
    expect(techType("organoids")).toBe("research-tool");
    expect(techType("geriatric-assessment")).toBeUndefined();
  });

  it("reads the type from the actor for data ideas, else from the technologies, else none", () => {
    expect(solutionTypeOf({ technologies: ["adc"], actor: "data" })).toEqual({ type: "software", from: "actor" });
    expect(solutionTypeOf({ technologies: ["liquid-biopsy", "adc"], actor: "industry" })).toEqual({ type: "drug", from: "adc" });
    expect(solutionTypeOf({ technologies: ["liquid-biopsy", "mrd-testing", "adc"], actor: "industry" })).toEqual({ type: "diagnostic", from: "liquid-biopsy" });
    expect(solutionTypeOf({ technologies: [], actor: "engineering" })).toBeNull();
  });

  it("parses prevalence numbers and ranges", () => {
    expect(prevalencePct(95)).toBe(95);
    expect(prevalencePct("15-20")).toBe(17.5);
    expect(prevalencePct("about half")).toBeNull();
  });
});

describe("startup score: corpus", () => {
  it("scores every open idea once, cites a record for every dimension and never invents a figure", () => {
    const rows = scoreStartupRequests();
    expect(rows.length).toBeGreaterThan(50);
    expect(new Set(rows.map((r) => r.input.id)).size).toBe(rows.length);
    for (const r of rows) {
      expect(r.dimensions.length).toBe(DIMENSIONS.length);
      for (const d of r.dimensions) {
        expect(d.sources.length, `${r.input.id} ${d.key} has no source`).toBeGreaterThan(0);
        if (d.raw === null) { expect(d.score).toBeNull(); expect(d.rawText).toBe("Not scored"); expect(d.note).toBeTruthy(); }
        else expect(d.score).not.toBeNull();
      }
      // Type-based dimensions are scored together or not at all.
      expect(dim(r, "payerPath").score === null).toBe(r.input.type === null);
      expect(dim(r, "routeYears").score === null).toBe(r.input.type === null);
      // No cancer named means no patient figures.
      if (!r.input.idea.cancers.length) for (const k of ["survival", "approvedOptions", "incidence", "addressable"] as const) expect(dim(r, k).score).toBeNull();
    }
    const withSurvival = rows.filter((r) => dim(r, "survival").score !== null);
    expect(withSurvival.length).toBeGreaterThan(10);
  });
});
