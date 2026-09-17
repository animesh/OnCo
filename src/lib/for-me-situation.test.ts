import { describe, expect, it } from "vitest";
import { graph } from "./graph";
import { buildSituationData, resolveBiomarkerTargets } from "./for-me-situation-data";
import { assembleSituation, EMPTY_SITUATION, geneTokens, hasSituation, NOT_TESTED, regionalBadge, SECTION_ORDER, settingPhrases, type Situation, type SituationData } from "./for-me-situation";
import type { Cancer } from "./schema";

const g = graph();
const cancer = (id: string): Cancer => { const c = g.must(id); if (c.kind !== "cancer") throw new Error(`${id} is not a cancer`); return c; };
const tnbc = buildSituationData(cancer("tnbc"), g);
const nsclc = buildSituationData(cancer("nsclc"), g);
const by = (sections: ReturnType<typeof assembleSituation>, id: string) => { const s = sections.find((x) => x.id === id); if (!s) throw new Error(`no section ${id}`); return s; };
const rowLike = (d: SituationData, re: RegExp) => { const r = d.rows.find((x) => re.test(x.setting)); if (!r) throw new Error(`no row ${re}`); return r; };
const bmLike = (d: SituationData, re: RegExp) => { const b = d.biomarkers.find((x) => re.test(x.label)); if (!b) throw new Error(`no biomarker ${re}`); return b; };

describe("situation data (server side)", () => {
  it("copies rows, biomarkers, drugs and trials from the records of two cancers", () => {
    for (const d of [tnbc, nsclc]) {
      expect(d.rows.length).toBe(cancer(d.cancer.id).standardOfCare.length);
      expect(new Set(d.rows.map((r) => r.id)).size).toBe(d.rows.length);
      for (const r of d.rows) { expect(r.decisionHref).toContain(`/cancers/${d.cancer.id}/decisions/#${r.id}`); expect(r.questions.length).toBeGreaterThan(0); }
      expect(d.biomarkers.length).toBeGreaterThan(0);
      expect(d.drugs.some((x) => x.inStandardOfCare)).toBe(true);
      for (const t of d.trials) expect(t.route).toMatch(/^\/trials\//);
      expect(d.sheet.route).toBe(`/prep/${d.cancer.id}/`);
      expect(d.guide.route).toBe(`/first-60-days/${d.cancer.id}/`);
    }
  });
  it("resolves biomarker wording to the targets it names and leaves the rest unresolved", () => {
    expect(bmLike(nsclc, /^EGFR$/).targets.map((t) => t.id)).toContain("egfr");
    expect(bmLike(nsclc, /^KRAS G12C$/).targets.map((t) => t.id)).toContain("kras");
    expect(bmLike(tnbc, /^PD-L1/).targets.map((t) => t.id)).toContain("pdl1");
    expect(bmLike(tnbc, /^TILs/).targets).toEqual([]);
    const targets = g.kind("target");
    expect(resolveBiomarkerTargets("Metastatic disease", targets)).toEqual([]);
    expect(resolveBiomarkerTargets("BRAF V600E", targets).map((t) => t.id)).toContain("braf");
  });
});

describe("assembleSituation", () => {
  it("keeps the section order and omits the first 60 days unless the diagnosis is recent", () => {
    const plain = assembleSituation(tnbc, EMPTY_SITUATION).map((s) => s.id);
    expect(plain).toEqual(SECTION_ORDER.filter((id) => id !== "first60"));
    const recent = assembleSituation(tnbc, { ...EMPTY_SITUATION, diagnosedRecently: true }).map((s) => s.id);
    expect(recent).toEqual(SECTION_ORDER);
    expect(hasSituation(EMPTY_SITUATION)).toBe(false);
    expect(hasSituation({ ...EMPTY_SITUATION, diagnosedRecently: true })).toBe(true);
  });

  it("with nothing chosen says so plainly and lists every setting as a link", () => {
    const s = assembleSituation(tnbc, EMPTY_SITUATION);
    const where = by(s, "where");
    expect(where.lead).toContain("No setting chosen yet");
    expect(where.items.map((i) => i.id)).toEqual(tnbc.rows.map((r) => r.id));
    expect(by(s, "standard").empty).toContain("none chosen");
    expect(by(s, "biomarkers").lead).toContain("No biomarkers chosen");
    expect(by(s, "trials").items).toEqual([]);
    // Warnings fall back to the whole standard of care when no treatment is in play.
    expect(by(s, "warnings").redCards?.length).toBe(tnbc.redCards.length);
  });

  it("NSCLC, EGFR row, EGFR biomarker, UK: reads the row, the EGFR drugs with MHRA status, trials that fit and the row's questions", () => {
    const row = rowLike(nsclc, /EGFR exon 19/);
    const egfr = bmLike(nsclc, /^EGFR$/);
    const sit: Situation = { ...EMPTY_SITUATION, setting: row.id, biomarkers: [egfr.key], region: "UK" };
    const s = assembleSituation(nsclc, sit);
    const where = by(s, "where");
    expect(where.items[0]).toMatchObject({ id: row.id, route: row.decisionHref, tone: "match" });
    // Every NSCLC metastatic row is first line, so nothing later in the course is recorded and the section says so.
    expect(where.items.some((i) => i.badge === "may come later") || /No row later in the course/.test(where.lead)).toBe(true);
    // An early row does have rows later in the course.
    const early = by(assembleSituation(tnbc, { ...EMPTY_SITUATION, setting: rowLike(tnbc, /Stage II-III/).id }), "where");
    expect(early.items.filter((i) => i.badge === "may come later").length).toBeGreaterThan(0);
    expect(early.items.filter((i) => i.badge === "may come later").length).toBeLessThanOrEqual(3);
    const standard = by(s, "standard");
    expect(standard.lead).toBe(row.approach);
    expect(standard.items.map((i) => i.id)).toEqual(row.refs.map((r) => r.id));
    const bm = by(s, "biomarkers");
    const osi = bm.items.find((i) => i.id === "osimertinib");
    expect(osi).toBeDefined();
    expect(osi!.badge).toMatch(/UK/);
    expect(osi!.note).toContain("EGFR");
    for (const i of bm.items) expect(nsclc.drugs.find((d) => d.id === i.id)!.targets).toContain("egfr");
    const trials = by(s, "trials");
    expect(trials.items.length).toBeGreaterThan(0);
    expect(trials.items.length).toBeLessThanOrEqual(12);
    for (const i of trials.items) expect(i.note).toMatch(/Fits because of/);
    const q = by(s, "questions");
    expect(q.questions!.length).toBeGreaterThan(0);
    expect(q.questions!.some((x) => x.setting === row.setting)).toBe(true);
    const warn = by(s, "warnings");
    for (const card of warn.redCards ?? []) expect(card.concerns.some((d) => row.optionIds.includes(d.id) || bm.items.some((i) => i.id === d.id))).toBe(true);
  });

  it("TNBC: 'not tested' names the biomarkers the record lists and matches no drug", () => {
    const s = assembleSituation(tnbc, { ...EMPTY_SITUATION, biomarkers: [NOT_TESTED] });
    const bm = by(s, "biomarkers");
    expect(bm.lead).toContain("not been tested");
    expect(bm.lead).toContain("PD-L1");
    expect(bm.items).toEqual([]);
    expect(bm.empty).toBeDefined();
  });

  it("TNBC: a biomarker with no target record is reported as such, not guessed", () => {
    const tils = bmLike(tnbc, /^TILs/);
    const s = assembleSituation(tnbc, { ...EMPTY_SITUATION, biomarkers: [tils.key] });
    const bm = by(s, "biomarkers");
    expect(bm.lead).toContain("no target record");
    expect(bm.items).toEqual([]);
  });

  it("TNBC: treatments already had are marked and traced to the rows that name them", () => {
    const s = assembleSituation(tnbc, { ...EMPTY_SITUATION, hadTreatments: ["pembrolizumab"] });
    const where = by(s, "where");
    const had = where.items.find((i) => i.id === "pembrolizumab");
    expect(had).toMatchObject({ badge: "already had", tone: "had" });
    expect(had!.note).toContain("Stage II-III");
    const rows = tnbc.rows.filter((r) => r.optionIds.includes("pembrolizumab"));
    for (const r of rows) expect(where.items.some((i) => i.id === r.id)).toBe(true);
    // Warnings are now the cards that concern the drug in play.
    for (const card of by(s, "warnings").redCards ?? []) expect(card.concerns.some((d) => d.id === "pembrolizumab")).toBe(true);
    // In the standard row, the drug is badged as already had.
    const row = rowLike(tnbc, /Stage II-III/);
    const st = by(assembleSituation(tnbc, { ...EMPTY_SITUATION, setting: row.id, hadTreatments: ["pembrolizumab"] }), "standard");
    expect(st.items.find((i) => i.id === "pembrolizumab")?.badge).toBe("already had");
  });

  it("trials switched off are counted but not listed; a global reader sees approved regions", () => {
    const row = rowLike(tnbc, /first line, PD-L1 CPS/);
    const pdl1 = bmLike(tnbc, /^PD-L1/);
    const off = by(assembleSituation(tnbc, { ...EMPTY_SITUATION, setting: row.id, wantsTrials: false }), "trials");
    expect(off.items).toEqual([]);
    expect(off.lead).toContain("not to look for trials");
    const on = by(assembleSituation(tnbc, { ...EMPTY_SITUATION, setting: row.id, biomarkers: [pdl1.key] }), "trials");
    expect(on.items.length).toBeGreaterThan(0);
    const bm = by(assembleSituation(tnbc, { ...EMPTY_SITUATION, biomarkers: [pdl1.key] }), "biomarkers");
    const pembro = bm.items.find((i) => i.id === "pembrolizumab");
    expect(pembro?.badge).toMatch(/^Approved: /);
  });

  it("is deterministic for the same inputs", () => {
    const sit: Situation = { ...EMPTY_SITUATION, setting: rowLike(nsclc, /KRAS G12C/).id, biomarkers: [bmLike(nsclc, /^KRAS G12C$/).key], region: "US", diagnosedRecently: true };
    expect(JSON.stringify(assembleSituation(nsclc, sit))).toBe(JSON.stringify(assembleSituation(nsclc, sit)));
  });
});

describe("helpers", () => {
  it("geneTokens keeps gene-like symbols and drops words and bracketed detail", () => {
    expect(geneTokens("PD-L1 (22C3 CPS ≥10 for metastatic pembrolizumab)")).toEqual(["PD-L1"]);
    expect(geneTokens("Germline BRCA1/2 and PALB2 (PARP inhibitors, surgery choices)")).toEqual(["BRCA1", "PALB2"]);
    expect(geneTokens("KRAS G12C")).toEqual(["KRAS", "G12C"]);
    expect(geneTokens("ctDNA/MRD (Signatera, investigational)")).toEqual(["MRD"]);
  });
  it("settingPhrases keeps the specific phrases of a setting and drops generic single words", () => {
    expect(settingPhrases("Metastatic, first line, PD-L1 CPS ≥10")).toEqual(["first line", "pd-l1 cps ≥10"]);
    expect(settingPhrases("Stage II-III")).toEqual(["stage ii-iii"]);
    expect(settingPhrases("Metastatic, later lines")).toEqual(["later lines"]);
  });
  it("regionalBadge reads the regulator's status, and says 'no record' rather than 'not approved' where a region is not researched", () => {
    const d = nsclc.drugs.find((x) => x.id === "osimertinib")!;
    expect(regionalBadge(d, "US").badge).toMatch(/^Approved in US/);
    const blank = { ...d, regional: {}, anchorApprovals: [] };
    expect(regionalBadge(blank, "IN")).toMatchObject({ badge: "No IN record", tone: "unknown" });
    expect(regionalBadge(blank, null)).toMatchObject({ badge: "No regulator record", tone: "unknown" });
  });
});
