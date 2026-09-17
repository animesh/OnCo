import { describe, expect, it } from "vitest";
import { buildDecisionSections, decisionQuestions, decisionsFor, decisionCancerIds, sectionIds, slugify, type Lookup } from "./decisions";
import type { Cancer, Entity } from "./schema";

/** Minimal records, shaped like parsed entities, for the pure builder. */
const drug = (id: string, extra: Partial<Extract<Entity, { kind: "drug" }>> = {}): Entity => ({
  id, kind: "drug", name: id.toUpperCase(), aka: [], tldr: `${id} in plain words.`, summary: "s", asOf: "2026-01-01", links: [], tags: [], related: [], cancers: [], sections: [], technologies: [], targets: [], drugs: [], companies: [], institutions: [], pathways: [], terms: [], trials: [], people: [], bottlenecks: [], keyPapers: [], journals: [], dependsOn: [], notes: [],
  modality: "ADC", mechanism: "m", approvals: [], mechanismSteps: [], toxicity: [], access: [], regulatoryEvents: [], status: "approved", ...extra,
} as Entity);

const tech = (id: string): Entity => ({
  id, kind: "technology", name: "Proton therapy", aka: [], tldr: "Protons stop in the tumour.", summary: "s", asOf: "2026-01-01", links: [], tags: [], related: [], cancers: [], sections: [], technologies: [], targets: [], drugs: [], companies: [], institutions: [], pathways: [], terms: [], trials: [], people: [], bottlenecks: [], keyPapers: [], journals: [], dependsOn: [], notes: [],
  principle: "p", strengths: ["Less dose to healthy tissue"], limitations: ["Few centres", "Cost", "Range uncertainty", "Fourth limitation"],
} as Entity);

const trial = (id: string, drugs: string[]): Entity => ({
  id, kind: "trial", name: id.toUpperCase(), aka: [], tldr: "t", summary: "s", asOf: "2026-01-01", links: [], tags: [], related: [], cancers: [], sections: [], technologies: [], targets: [], drugs, companies: [], institutions: [], pathways: [], terms: [], trials: [], people: [], bottlenecks: [], keyPapers: [], journals: [], dependsOn: [], notes: [],
  phase: "3", setting: "Metastatic, first line", nct: "NCT00000001", result: "Median OS 20 versus 15 months.", yearReported: 2024, enrolled: 500,
  outcomes: [{ endpoint: "Overall survival", primary: true, unit: "months", arms: [{ name: "A", value: 20 }, { name: "B", value: 15 }], hr: 0.7, source: "https://example.org/os" }],
} as Entity);

const term = (id: string): Entity => ({
  id, kind: "term", name: "Sentinel node", aka: [], tldr: "The first node.", summary: "s", asOf: "2026-01-01", links: [], tags: [], related: [], cancers: [], sections: [], technologies: [], targets: [], drugs: [], companies: [], institutions: [], pathways: [], terms: [], trials: [], people: [], bottlenecks: [], keyPapers: [], journals: [], dependsOn: [], notes: [], category: "c",
} as Entity);

const records = new Map<string, Entity>([
  ["a", drug("a", { toxicity: [
    { event: "Neutropenia", anyGradePct: 60, grade3PlusPct: 40, source: "https://example.org/a" },
    { event: "Nausea", anyGradePct: 50, grade3PlusPct: 2, source: "https://example.org/a" },
    { event: "Unsourced", anyGradePct: 90, grade3PlusPct: 80 },
    { event: "Diarrhoea", anyGradePct: 30, grade3PlusPct: 5, source: "https://example.org/a" },
    { event: "Fatigue", anyGradePct: 40, grade3PlusPct: 3, source: "https://example.org/a" },
    { event: "Rash", anyGradePct: 20, grade3PlusPct: 1, source: "https://example.org/a" },
  ] })],
  ["b", drug("b")],
  ["p", tech("p")],
  ["t1", trial("t1", ["a"])],
  ["s", term("s")],
]);
const lookup: Lookup = (id) => records.get(id);
const noFlags = () => [];

const rows: Cancer["standardOfCare"] = [
  { setting: "Metastatic, first line", approach: "A or B.", refs: ["a", "b", "t1", "s"], guideline: { nccn: "Category 1", version: "NCCN Test", url: "https://example.org/g" } },
  { setting: "Resectable", approach: "Surgery then protons.", refs: ["p"] },
  { setting: "Resectable", approach: "Same setting twice.", refs: [] },
  { setting: "Screening", approach: "Described in words only.", refs: ["missing-id"] },
];

describe("decisions: anchors", () => {
  it("slugifies settings and keeps anchors unique", () => {
    expect(slugify("Metastatic, first line, PD-L1 CPS ≥10")).toBe("metastatic-first-line-pd-l1-cps-10");
    expect(slugify("Stage II-III")).toBe("stage-ii-iii");
    expect(sectionIds(["Resectable", "Resectable", "Metastatic"])).toEqual(["resectable", "resectable-2", "metastatic"]);
  });
});

describe("decisions: sections from standard-of-care rows", () => {
  const sections = buildDecisionSections(rows, lookup, { flags: noFlags, extraQuestions: [{ setting: "Resectable", question: "Handwritten one?", why: "Because." }] });

  it("builds one section per row with the row's setting, approach, line and guideline", () => {
    expect(sections).toHaveLength(4);
    expect(sections.map((s) => s.id)).toEqual(["metastatic-first-line", "resectable", "resectable-2", "screening"]);
    expect(sections[0].line).toBe("line-1");
    expect(sections[1].line).toBe("early");
    expect(sections[0].guideline?.nccn).toBe("Category 1");
    expect(sections[0].approach).toBe("A or B.");
  });

  it("splits refs into options (drugs and technologies), evidence (trials) and context (everything else)", () => {
    const s = sections[0];
    expect(s.options.map((o) => o.id)).toEqual(["a", "b"]);
    expect(s.evidence.map((e) => e.id)).toEqual(["t1"]);
    expect(s.context.map((c) => c.id)).toEqual(["s"]);
    expect(s.singlePath).toBe(false);
    expect(s.options[0].tldr).toBe("a in plain words.");
  });

  it("carries the trial's recorded result and primary outcome, and links it to the options it tests", () => {
    const e = sections[0].evidence[0];
    expect(e.result).toBe("Median OS 20 versus 15 months.");
    expect(e.nct).toBe("NCT00000001");
    expect(e.primary?.endpoint).toBe("Overall survival");
    expect(e.primary?.arms.map((a) => a.value)).toEqual([20, 15]);
    expect(e.primary?.hr).toBe(0.7);
    expect(e.optionIds).toEqual(["a"]);
  });

  it("keeps only sourced toxicities, worst grade 3+ first, at most four", () => {
    const a = sections[0].options[0];
    expect(a.sideEffects.map((t) => t.event)).toEqual(["Neutropenia", "Diarrhoea", "Fatigue", "Nausea"]);
    expect(a.sideEffects.every((t) => t.source)).toBe(true);
    expect(a.sideEffects.some((t) => t.event === "Unsourced")).toBe(false);
    expect(sections[0].options[1].sideEffects).toEqual([]);
  });

  it("uses a technology's own limitations and strengths as its trade-offs, capped at three", () => {
    const s = sections[1];
    expect(s.singlePath).toBe(true);
    expect(s.options[0].kind).toBe("technology");
    expect(s.options[0].cautions).toEqual(["Few centres", "Cost", "Range uncertainty"]);
    expect(s.options[0].strengths).toEqual(["Less dose to healthy tissue"]);
  });

  it("shows a single path plainly when a row names fewer than two options, and ignores unresolved refs", () => {
    expect(sections[2].options).toEqual([]);
    expect(sections[2].singlePath).toBe(true);
    expect(sections[3].options).toEqual([]);
    expect(sections[3].evidence).toEqual([]);
    expect(sections[3].context).toEqual([]);
  });

  it("generates questions shaped by the decision and merges extra questions for the same setting without duplicates", () => {
    const fork = sections[0].questions.map((q) => q.question);
    expect(fork[0]).toMatch(/^Between A and B, which do you recommend/);
    expect(fork.some((q) => q.includes("T1"))).toBe(true);
    expect(fork.some((q) => q.includes("side effects of A"))).toBe(true);
    expect(fork.some((q) => q.includes("NCCN Test"))).toBe(true);
    const single = sections[1].questions.map((q) => q.question);
    expect(single[0]).toMatch(/^Is Proton therapy the only reasonable path/);
    expect(single).toContain("Handwritten one?");
    expect(sections[2].questions.filter((q) => q.question === "Handwritten one?")).toHaveLength(1);
    expect(sections[3].questions[0]).toMatchObject({ question: expect.stringMatching(/^Which specific treatments/) });
    for (const s of sections) expect(new Set(s.questions.map((q) => q.question.toLowerCase())).size).toBe(s.questions.length);
  });

  it("does not ask about trials or side effects when none are recorded", () => {
    const qs = decisionQuestions({ setting: "X", options: [], evidence: [], guideline: undefined, singlePath: true }).map((q) => q.question);
    expect(qs.some((q) => q.includes("match the people"))).toBe(false);
    expect(qs.some((q) => q.includes("side effects"))).toBe(false);
    expect(qs.some((q) => q.includes("guideline"))).toBe(false);
  });
});

describe("decisions: over the corpus", () => {
  it("builds a page for every cancer with standard-of-care rows, with unique anchors and only sourced figures", () => {
    const ids = decisionCancerIds();
    expect(ids.length).toBeGreaterThan(50);
    for (const id of ids) {
      const d = decisionsFor(id)!;
      expect(d).not.toBeNull();
      expect(new Set(d.sections.map((s) => s.id)).size).toBe(d.sections.length);
      for (const s of d.sections) {
        expect(s.questions.length).toBeGreaterThanOrEqual(3);
        for (const o of s.options) for (const t of o.sideEffects) expect(t.source, `${id}/${o.id}: ${t.event}`).toBeTruthy();
      }
    }
  });

  it("finds real forks: triple-negative breast cancer has settings with more than one option", () => {
    const d = decisionsFor("tnbc");
    expect(d).not.toBeNull();
    expect(d!.forks).toBeGreaterThan(0);
    const fork = d!.sections.find((s) => !s.singlePath && s.evidence.length)!;
    expect(fork, "a fork with trial evidence").toBeTruthy();
    expect(fork.options.length).toBeGreaterThanOrEqual(2);
    expect(fork.evidence.every((e) => e.route.startsWith("/trials/"))).toBe(true);
  });

  it("returns null for non-cancers and unknown ids", () => {
    expect(decisionsFor("pembrolizumab")).toBeNull();
    expect(decisionsFor("no-such-thing")).toBeNull();
  });
});
