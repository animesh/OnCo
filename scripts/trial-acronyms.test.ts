import { describe, expect, it } from "vitest";
import type { Entity } from "../src/lib/schema";
import { abbreviates, fromTitles, reject, vocab } from "./trial-acronyms";

type TrialEntity = Extract<Entity, { kind: "trial" }>;
const v = vocab();
const trial = (id: string, name: string, setting = ""): TrialEntity => ({ id, kind: "trial", name, setting, aka: [], tags: ["ctgov-ingest"], phase: "3" } as unknown as TrialEntity);

describe("trial acronym filter", () => {
  it("accepts the names patients hear", () => {
    for (const a of ["MARIPOSA-2", "KEYNOTE-671", "CheckMate 9LA", "ADAURA", "DESTINY-Lung02", "SPARTAN", "IMpower010", "CodeBreaK 202", "ROSETTA Breast-01", "Symbiotic-GI-03", "KEYNOTE 158", "RAMP 301", "Beamion LUNG-2", "EPIK-B2", "China ARCHES", "ZIRCON-CP"]) {
      expect(reject(a, v), a).toBeUndefined();
    }
  });
  it("rejects drug codes, genes, phases, organisations, regimens and generic words", () => {
    expect(reject("AZD9291", v)).toMatch(/drug/);
    expect(reject("PF-08634404", v)).toMatch(/drug/);
    expect(reject("SHR-A1811", v)).toMatch(/drug/);
    expect(reject("MK-3475A-F84", v)).toMatch(/drug/);
    expect(reject("ASCA101", v)).toMatch(/drug/);
    expect(reject("PSMAxCD3", v)).toMatch(/drug/);
    expect(reject("EGFR", v)).toBe("gene");
    expect(reject("KRAS G12C", v)).toMatch(/gene|mutation/);
    expect(reject("Phase III", v)).toBe("phase");
    expect(reject("SWOG", v)).toBe("organisation");
    expect(reject("NSCLC", v)).toBe("generic");
    expect(reject("DPd", v)).toMatch(/regimen|generic/);
    expect(reject("D-Vd", v)).toMatch(/regimen|generic/);
    expect(reject("R-CHP", v)).toMatch(/generic/);
    expect(reject("Substudy 01A", v)).toMatch(/generic/);
    expect(reject("NK Cells", v)).toMatch(/generic/);
    expect(reject("T-DXd", v)).toMatch(/generic|compound/);
    expect(reject("LUNG-2", v)).toMatch(/generic/);
    expect(reject("BCG", v)).toMatch(/generic|abbreviation/);
  });
  it("is looser for registry acronyms than for title tokens", () => {
    expect(reject("JAVELIN Bladder Medley", v, undefined, true)).toMatch(/descriptive/);
    expect(reject("JAVELIN Bladder Medley", v, undefined, false)).toBeUndefined();
  });
});

describe("abbreviates", () => {
  it("spots a bracketed abbreviation of the preceding words", () => {
    expect(abbreviates("LGSOC", "Patients With Low-Grade Serous Ovarian Cancer")).toBe(true);
    expect(abbreviates("MMAE", "an ADC carrying monomethyl auristatin E")).toBe(true);
    expect(abbreviates("CLDN", "targeting Claudin")).toBe(true);
    expect(abbreviates("GEP-NETs", "Gastroenteropancreatic Neuroendocrine Tumors")).toBe(true);
    expect(abbreviates("MARIPOSA", "Locally Advanced or Metastatic Non-Small Cell Lung Cancer")).toBe(false);
    expect(abbreviates("KEYNOTE", "Participants With Advanced Melanoma")).toBe(false);
  });
});

describe("fromTitles", () => {
  it("prefers the id spelled in the title, then brackets, then the leading segment, then a dash-number token", () => {
    expect(fromTitles(trial("taishan-301", "A Phase III Study of YL201 in Recurrent or Metastatic Nasopharyngeal Carcinoma(TAISHAN-301)"), v).candidate).toMatchObject({ acronym: "TAISHAN-301", source: "title:id" });
    expect(fromTitles(trial("nct1", "Osimertinib in Non-Small Cell Lung Cancer (NSCLC) After Surgery (ADAURA)"), v).candidate).toMatchObject({ acronym: "ADAURA", source: "title:brackets" });
    expect(fromTitles(trial("nct2", "Symbiotic-GI-03: A Study to Learn About PF-08634404 in Colorectal Cancer"), v).candidate).toMatchObject({ acronym: "Symbiotic-GI-03", source: "title:leading" });
    expect(fromTitles(trial("nct3", "Pembrolizumab Plus Chemotherapy in Resectable NSCLC", "A Phase 3 Study of MK-3475 With Platinum Doublet (KEYNOTE-671)"), v).candidate).toMatchObject({ acronym: "KEYNOTE-671", source: "title:brackets" });
    expect(fromTitles(trial("nct4", "Study of Pembrolizumab in Melanoma KEYNOTE-054 Adjuvant Setting"), v).candidate).toMatchObject({ acronym: "KEYNOTE-054", source: "title:token" });
  });
  it("finds nothing in a title that only names the drug and the disease", () => {
    const r = fromTitles(trial("nct5", "SSGJ-707 in Advanced Non-Small Cell Lung Cancer", "A Randomized Phase III Trial of SSGJ-707 Versus Pembrolizumab in PD-L1-Positive NSCLC"), v);
    expect(r.candidate).toBeUndefined();
  });
});
