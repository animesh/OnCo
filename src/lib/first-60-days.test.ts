import { describe, expect, it } from "vitest";
import { graph } from "./graph";
import { buildGuide, buildSheet, settingRank, type Guide } from "./first-60-days";
import { CancerSchema, type Cancer } from "./schema";

const g = graph();
const must = (id: string): Cancer => { const c = g.must(id); if (c.kind !== "cancer") throw new Error(`${id} is not a cancer`); return c; };

/** A cancer record with nothing but the required fields: no standard of care, biomarkers, trials or terms. */
const bare: Cancer = CancerSchema.parse({ id: "test-bare-cancer", kind: "cancer", name: "Bare test cancer", tldr: "A record with no optional fields.", summary: "Used to check that empty sections are omitted.", asOf: "2026-09-17", group: "other" });

const sectionsOf = (guide: Guide) => guide.sections;

describe("first 60 days guide", () => {
  it("builds for three cancers and only lists sections that have data", () => {
    for (const id of ["tnbc", "nsclc", "glioblastoma"]) {
      const c = must(id);
      const guide = buildGuide(c, g);
      expect(guide.cancer.route).toBe(`/cancers/${id}/`);
      // Optional sections are present exactly when their data is present.
      expect(sectionsOf(guide).includes("now")).toBe(!!guide.now);
      expect(sectionsOf(guide).includes("team")).toBe(!!guide.team);
      expect(sectionsOf(guide).includes("decisions")).toBe(!!guide.decisions);
      expect(sectionsOf(guide).includes("questions")).toBe(!!guide.questions);
      expect(sectionsOf(guide).includes("trials")).toBe(!!guide.trials);
      if (guide.now) expect(guide.now.rows.length + guide.now.technologies.length + guide.now.staging.length + guide.now.biomarkers.length + guide.now.journeyDiagnosis.length).toBeGreaterThan(0);
      if (guide.team) expect(guide.team.roles.length).toBeGreaterThan(0);
      if (guide.decisions) expect(guide.decisions.rows.length + guide.decisions.journeys.length).toBeGreaterThan(0);
      if (guide.trials) { expect(guide.trials.length).toBeLessThanOrEqual(5); for (const t of guide.trials) expect(["recruiting", "active", "planned"]).toContain(t.status); }
      // The two link-only sections are always there and always point somewhere.
      expect(sectionsOf(guide)).toContain("free");
      expect(sectionsOf(guide)).toContain("read");
      expect(guide.free.links.map((l) => l.route)).toEqual(expect.arrayContaining(["/free/", "/assistance/"]));
      expect(guide.read.pages[0].route).toBe(`/cancers/${id}/`);
      for (const t of guide.read.terms) expect(t.route).toMatch(/^\/terms\//);
      // Page order is fixed.
      const order = ["now", "team", "decisions", "questions", "trials", "free", "read"];
      expect([...sectionsOf(guide)].sort((a, b) => order.indexOf(a) - order.indexOf(b))).toEqual(sectionsOf(guide));
    }
  });

  it("TNBC has diagnosis tests, a team, ordered decisions and open trials", () => {
    const guide = buildGuide(must("tnbc"), g);
    expect(guide.now).toBeDefined();
    expect(guide.now!.biomarkers.length).toBeGreaterThan(0);
    expect(guide.team!.roles.map((r) => r.role)).toContain("Medical oncologist");
    expect(guide.decisions!.rows.length).toBeGreaterThan(0);
    const ranks = guide.decisions!.rows.map((r) => settingRank(r.setting));
    expect(ranks).toEqual([...ranks].sort((a, b) => a - b));
    expect(guide.trials).toBeDefined();
    expect(guide.questions!.groups.length).toBeGreaterThan(0);
  });

  it("omits every data-driven section for a record with no optional fields", () => {
    const guide = buildGuide(bare, g);
    expect(guide.now).toBeUndefined();
    expect(guide.team).toBeUndefined();
    expect(guide.decisions).toBeUndefined();
    expect(guide.trials).toBeUndefined();
    // The generic question set still exists (every cancer gets one), so that section stays.
    expect(guide.questions).toBeDefined();
    expect(sectionsOf(guide)).toEqual(["questions", "free", "read"]);
    expect(guide.read.terms).toEqual([]);
  });

  it("orders settings the way a course of treatment runs", () => {
    const settings = ["Relapsed", "Metastatic, first line", "Screening", "Diagnosis and staging", "Localised", "Maintenance", "Locally advanced"];
    const sorted = [...settings].sort((a, b) => settingRank(a) - settingRank(b));
    expect(sorted).toEqual(["Screening", "Diagnosis and staging", "Localised", "Locally advanced", "Metastatic, first line", "Relapsed", "Maintenance"]);
  });

  it("builds the appointment sheet from the same record", () => {
    const sheet = buildSheet(must("nsclc"), g);
    expect(sheet.questions.length).toBeGreaterThan(0);
    expect(sheet.terms.length).toBeLessThanOrEqual(10);
    for (const t of sheet.terms) expect(t.tldr && t.tldr.length).toBeGreaterThan(0);
    expect(sheet.treatments.length).toBeGreaterThan(0);
    for (const r of sheet.treatments) expect(r.setting).not.toMatch(/diagnos/i);
    const empty = buildSheet(bare, g);
    expect(empty.terms).toEqual([]);
    expect(empty.treatments).toEqual([]);
    expect(empty.tests.rows).toEqual([]);
  });
});
