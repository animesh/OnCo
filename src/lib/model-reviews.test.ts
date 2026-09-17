import { describe, expect, it } from "vitest";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { graph } from "./graph";
import {
  allModelReviews, disagreementsFor, foreignSources, loadModelReviews, MODEL_PANEL, ModelReviewSchema, panelModel, panelOverview, parseModelReviews, recordSources, type ModelReview,
} from "./model-reviews";

const fable = MODEL_PANEL[0];
const astra = MODEL_PANEL[1];
const base: ModelReview = {
  recordId: "tnbc", model: fable, date: "2026-09-17", confidence: "high", summary: "One paragraph.",
  verdicts: [{ claim: "The record lists five rows.", stance: "supports", note: "Counted.", source: { label: "Wikipedia", url: "https://en.wikipedia.org/wiki/Triple-negative_breast_cancer" } }],
};

describe("model review schema", () => {
  it("accepts a well-formed review and rejects bad stances, dates, ids and empty verdicts", () => {
    expect(ModelReviewSchema.safeParse(base).success).toBe(true);
    expect(ModelReviewSchema.safeParse({ ...base, verdicts: [] }).success).toBe(false);
    expect(ModelReviewSchema.safeParse({ ...base, date: "17/09/2026" }).success).toBe(false);
    expect(ModelReviewSchema.safeParse({ ...base, recordId: "TNBC" }).success).toBe(false);
    expect(ModelReviewSchema.safeParse({ ...base, confidence: "certain" }).success).toBe(false);
    expect(ModelReviewSchema.safeParse({ ...base, verdicts: [{ ...base.verdicts[0], stance: "agrees" }] }).success).toBe(false);
    expect(ModelReviewSchema.safeParse({ ...base, verdicts: [{ ...base.verdicts[0], source: { label: "x", url: "not a url" } }] }).success).toBe(false);
  });

  it("panel table has distinct ids and names, Fable first, and unknown ids fall back to the raw id", () => {
    expect(new Set(MODEL_PANEL.map((m) => m.id)).size).toBe(MODEL_PANEL.length);
    expect(new Set(MODEL_PANEL.map((m) => m.name)).size).toBe(MODEL_PANEL.length);
    expect(MODEL_PANEL.map((m) => m.name)).toContain("Fable");
    expect(MODEL_PANEL.map((m) => m.name)).toContain("Astra");
    expect(panelModel("claude-fable-5-1").name).toBe("Fable");
    expect(panelModel("some-other-model")).toMatchObject({ id: "some-other-model", name: "some-other-model" });
  });
});

describe("disagreement derivation", () => {
  it("surfaces claims where models differ and ignores agreement, case and trailing punctuation", () => {
    const a: ModelReview = { ...base, verdicts: [
      { claim: "The record lists five rows.", stance: "supports", note: "a" },
      { claim: "Urothelial cancer is listed among the record's cancers.", stance: "disputes", note: "withdrawn" },
      { claim: "Only Fable says this.", stance: "missing", note: "solo" },
    ] };
    const b: ModelReview = { ...base, model: astra, confidence: "medium", verdicts: [
      { claim: "the record lists five rows", stance: "supports", note: "b" },
      { claim: "Urothelial cancer is listed among the record's cancers", stance: "supports", note: "history" },
    ] };
    const d = disagreementsFor([a, b]);
    expect(d).toHaveLength(1);
    expect(d[0].claim).toMatch(/^Urothelial/);
    expect(d[0].positions.map((p) => [p.model.name, p.stance])).toEqual([["Fable", "disputes"], ["Astra", "supports"]]);
    expect(disagreementsFor([a])).toEqual([]);
    expect(disagreementsFor([])).toEqual([]);
  });
});

describe("loader", () => {
  it("returns nothing for records without a file and validates files it reads", () => {
    expect(loadModelReviews("no-such-record")).toEqual([]);
    const dir = mkdtempSync(join(tmpdir(), "onco-model-reviews-"));
    writeFileSync(join(dir, "tnbc.json"), JSON.stringify([{ ...base, date: "2026-01-01" }, { ...base, model: astra }]));
    writeFileSync(join(dir, "broken.json"), JSON.stringify([{ ...base, recordId: "broken", confidence: "sure" }]));
    writeFileSync(join(dir, "misfiled.json"), JSON.stringify([base]));
    const list = loadModelReviews("tnbc", dir);
    expect(list.map((r) => r.date)).toEqual(["2026-09-17", "2026-01-01"]);
    expect(() => loadModelReviews("broken", dir)).toThrow(/broken\.json/);
    expect(() => loadModelReviews("misfiled", dir)).toThrow(/wrong file/);
    expect(() => parseModelReviews("x", "{}")).toThrow();
  });

  it("every shipped file validates, names a real record, cites only that record's own sources, and marks examples", () => {
    const g = graph();
    const all = allModelReviews();
    expect(all.size).toBeGreaterThanOrEqual(2);
    for (const [recordId, list] of all) {
      const e = g.get(recordId);
      expect(e, `record ${recordId} exists`).toBeDefined();
      for (const r of list) {
        expect(r.recordId).toBe(recordId);
        expect(foreignSources(r, e!), `${recordId} / ${r.model.name} sources`).toEqual([]);
        expect(r.summary.includes("—"), "no em-dashes").toBe(false);
        for (const v of r.verdicts) expect(v.source, `${recordId} / ${r.model.name}: "${v.claim}" has a source`).toBeDefined();
        // No key in this environment: everything shipped so far is a hand-written example.
        expect(r.example).toBe(true);
      }
    }
  });

  it("example claims are plainly true from the record text", () => {
    const g = graph();
    const tnbc = g.must("tnbc");
    expect(tnbc.kind === "cancer" && tnbc.standardOfCare.length).toBe(5);
    expect(tnbc.links).toHaveLength(1);
    const sg = g.must("sacituzumab-govitecan");
    if (sg.kind !== "drug") throw new Error("sacituzumab-govitecan should be a drug");
    expect(sg.approvals).toHaveLength(4);
    expect(sg.approvals.filter((a) => a.region === "US")).toHaveLength(3);
    expect(sg.targets).toEqual(["trop2"]);
    expect(sg.cancers).toContain("urothelial");
    expect(sg.summary).toMatch(/withdrawn/);
    const events = (sg as { regulatoryEvents?: Array<{ date: string; type: string }> }).regulatoryEvents ?? [];
    expect(events).toHaveLength(7);
    expect(events[0].date.startsWith("2016")).toBe(true);
    expect(events.some((ev) => ev.type === "withdrawal")).toBe(true);
    expect(events[events.length - 1]).toMatchObject({ type: "approval" });
    expect(events[events.length - 1].date.startsWith("2026")).toBe(true);
    expect(disagreementsFor(loadModelReviews("sacituzumab-govitecan"))).toHaveLength(1);
    expect(disagreementsFor(loadModelReviews("tnbc"))).toHaveLength(0);
  });

  it("record sources include links, Wikipedia, guideline and regulatory URLs", () => {
    const g = graph();
    const urls = recordSources(g.must("tnbc")).map((s) => s.url);
    expect(urls).toContain("https://en.wikipedia.org/wiki/Triple-negative_breast_cancer");
    expect(urls.some((u) => u.includes("nccn.org"))).toBe(true);
    expect(new Set(urls).size).toBe(urls.length);
    const sg = recordSources(g.must("sacituzumab-govitecan")).map((s) => s.url);
    expect(sg.some((u) => u.startsWith("https://www.fda.gov/"))).toBe(true);
  });

  it("panel overview counts records per model and puts disagreements first", () => {
    const o = panelOverview();
    const fableRow = o.models.find((m) => m.id === fable.id);
    expect(fableRow?.records).toBeGreaterThanOrEqual(2);
    expect(o.models[0].onPanel).toBe(true);
    expect(o.records[0].recordId).toBe("sacituzumab-govitecan");
    expect(o.records[0].disagreements).toBe(1);
    for (let i = 1; i < o.records.length; i++) expect(o.records[i - 1].disagreements).toBeGreaterThanOrEqual(o.records[i].disagreements);
  });
});
