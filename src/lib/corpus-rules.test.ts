/**
 * Corpus rules: the editorial invariants that used to live only in prose (CONTRIBUTING.md, the schema
 * comments, REVIEWERS.md), written as tests so a pull request that breaks one fails CI.
 *
 * Each rule lists its known exceptions by id. An exception is a record that predates the rule or has a
 * documented reason (an academic trial with no registry entry, say). New records get no exception:
 * either fix the record or add it here with a reason.
 */
import { describe, expect, it } from "vitest";
import { graph } from "./graph";
import { companies } from "@/data/companies";
import { companiesWave1 } from "@/data/companies-wave1";
import { companiesYc } from "@/data/companies-yc";
import { companiesStartups } from "@/data/companies-startups";
import { journals } from "@/data/journals";
import { journalsWave2 } from "@/data/journals-wave2";
import { people } from "@/data/people";
import { sources } from "@/data/sources";
import { terms } from "@/data/terms";
import { termsBasics } from "@/data/terms-basics";
import { termsJargon } from "@/data/terms-jargon";

const g = graph();

/**
 * House style for rendered copy: no em-dash or en-dash (write "to" for ranges, a comma, full stop or colon
 * otherwise), no "as of <date>" stamps (dates belong in `asOf`, `checked` or `year`), and never the word
 * "spike" (say "deep dive"). The internal `tags: ["spike"]` value is not rendered and is not checked.
 */
const HOUSE_STYLE_FIELDS = new Set(["tldr", "summary", "notes", "result", "setting", "indication", "note", "label"]);
const HOUSE_STYLE_RULES: [string, RegExp][] = [["em-dash or en-dash", /[—–]/], ['"as of" date stamp', /\bas of\b/i], ['the word "spike"', /\bspikes?\b/i]];
/**
 * Entities from files being edited by other passes when the rule landed (companies, journals, people, terms,
 * sources). Exempt so the rule can ship now; remove a module from this list once its copy is clean.
 */
const HOUSE_STYLE_EXEMPT_IDS = new Set(
  [...companies, ...companiesWave1, ...companiesYc, ...companiesStartups, ...journals, ...journalsWave2, ...people, ...sources, ...terms, ...termsBasics, ...termsJargon].map((e) => e.id),
);

/** Walks a record and reports every string under a rendered field name that breaks a house-style rule. */
function houseStyleViolations(value: unknown, key: string, path: string, out: string[]): void {
  if (typeof value === "string") {
    if (!HOUSE_STYLE_FIELDS.has(key)) return;
    for (const [rule, re] of HOUSE_STYLE_RULES) {
      const m = re.exec(value);
      if (m) out.push(`${path}: ${rule} at "${value.slice(Math.max(0, m.index - 30), m.index + 30)}"`);
    }
  } else if (Array.isArray(value)) {
    value.forEach((v, i) => houseStyleViolations(v, key, `${path}[${i}]`, out));
  } else if (value && typeof value === "object") {
    for (const [k, v] of Object.entries(value)) houseStyleViolations(v, k, `${path}.${k}`, out);
  }
}
const TODAY = new Date().toISOString().slice(0, 10);

/** Cytotoxic regimens are combinations of individually approved generics; they have no approval of their own. */
const isRegimen = (modality: string) => /regimen/i.test(modality);

/** Phase 3 trials with no ClinicalTrials.gov id: pre-registration era, non-US academic groups, or pooled analyses. */
const PHASE3_WITHOUT_NCT = new Set(["abc-02", "bilcap", "cadance-304", "circulate-japan", "crystal-fire3", "first-308", "olanzapine-appetite-tmh", "nlst-nelson", "prehab-trial",
  // Chinese phase 3 registered domestically only; NCT04829604, once recorded here, is the separate US study ACE-Breast-03.
  "ace-breast-02",
  // UK MRC trial run before ClinicalTrials.gov registration was required; registered as ISRCTN72251782.
  "pt-1",
  // Radiotherapy trials from the pre-registration era: CALGB 9343 (opened 1994), DAHANCA 5 (1986 to 1994), START-B, CHHiP, HYPO-RT-PC, PRIME II, IMPORT LOW and QUARTZ (UK and Nordic trials registered with ISRCTN only).
  "calgb-9343", "dahanca-5", "start-b", "chhip", "hypo-rt-pc", "prime-ii", "import-low", "quartz", "fast-forward",
  // Pre-registration chemoradiation and nodal trials (INT-0116, German rectal, ACT II, RTOG 91-11, DBCG 82, EORTC 26951, Slotman and Takahashi PCI).
  "int-0116", "cao-aro-aio-94", "act-ii", "rtog-91-11", "dbcg-82bc", "eortc-26951", "slotman-pci-es-sclc", "takahashi-pci",
  // Indian academic trials registered with the Clinical Trials Registry - India (CTRI) or run before registration was required.
  "low-dose-nivolumab-tmh", "metronomic-vs-cisplatin-tmh", "metro-plus-varanasi", "gefitinib-chemo-tmh", "progesterone-preop-tmh", "lidocaine-peritumoral-tmh", "osmanabad-hpv-screening", "kerala-oral-screening", "mumbai-via-screening"]);

/** Standard-of-care rows whose approach is surgery or observation, with no product to reference. */
const SOC_ROWS_WITHOUT_REFS = new Set(["cholangiocarcinoma: Resectable", "dlbcl: Frontline", "endometrial: Early", "neuroendocrine: Localised", "ovarian: Platinum-sensitive relapse"]);

/** Hosts that publish guidelines, or the primary publication a guideline row cites. */
const GUIDELINE_HOSTS = ["nccn.org", "jnccn.org", "esmo.org", "esgo.org", "uroweb.org", "who.int", "cancer.gov", "nice.org.uk", "asco.org", "ascopubs.org", "annalsofoncology.org", "doi.org", "pmc.ncbi.nlm.nih.gov", "pubmed.ncbi.nlm.nih.gov", "nature.com", "nejm.org", "thelancet.com"];
/** Rows that cite secondary coverage of a guideline update; replace with the guideline URL when it is public. */
const GUIDELINE_URL_EXCEPTIONS = new Set(["tnbc: Metastatic, first line, PD-L1 CPS ≥10", "tnbc: Metastatic, first line, PD-L1 negative or PD-1 ineligible"]);

/**
 * Acronyms that should not appear in a TL;DR (written for a reader with no background) unless the
 * glossary defines them, in which case the hover explains them. Endpoint and trial-design shorthand
 * is the usual leak.
 */
const TLDR_ACRONYM_DENYLIST = ["PFS", "OS", "ORR", "DFS", "EFS", "iDFS", "DOR", "pCR", "CR", "PR", "CI", "ITT", "TEAE", "DLT", "MTD", "RP2D", "SoC", "SOC", "QoL", "RWE", "AE", "AEs", "TKI", "IHC", "NGS", "TMB", "MSI", "dMMR", "MRD", "HR", "RECIST", "ECOG", "IO", "mAb", "RCT", "SAE", "TRAE", "irAE", "BICR", "NNT"];
/** TL;DRs that predate the rule. The glossary defines "MSI-H" and "Real-world evidence" but not the bare acronyms; reword or add the aka. */
const TLDR_ACRONYM_EXCEPTIONS = new Set(["owkin: MSI", "cota-healthcare: RWE", "paper-lynch-frameshift-vaccine-ccr-2020: MSI"]);

describe("corpus rules", () => {
  it("approved products carry at least one approval with a region and a year", () => {
    const failures: string[] = [];
    for (const d of g.kind("drug")) {
      if (d.status !== "approved" && d.status !== "standard-of-care") continue;
      if (isRegimen(d.modality)) continue;
      if (!d.approvals.length) failures.push(`${d.id}: no approvals`);
      for (const a of d.approvals) if (!a.region.trim() || !Number.isInteger(a.year)) failures.push(`${d.id}: approval without region or year`);
    }
    expect(failures).toEqual([]);
  });

  it("phase 3 trials have a ClinicalTrials.gov id", () => {
    const failures = g.kind("trial").filter((t) => t.phase === "3" && !t.nct && !PHASE3_WITHOUT_NCT.has(t.id)).map((t) => t.id);
    expect(failures).toEqual([]);
    // `nct` also carries other primary registry ids: ISRCTN (UK), ACTRN/ANZCTR (Australia and New Zealand), NTR (Netherlands).
    for (const t of g.kind("trial")) if (t.nct) expect(t.nct, t.id).toMatch(/^(NCT\d{8}|ISRCTN\d{8}|ACTRN\d{14}|ANZCTR\d{14}|NTR\d+)$/);
  });

  it("standard-of-care rows reference the products or technologies they describe", () => {
    const failures: string[] = [];
    for (const c of g.kind("cancer")) for (const row of c.standardOfCare) {
      const key = `${c.id}: ${row.setting}`;
      if (!row.refs.length && !SOC_ROWS_WITHOUT_REFS.has(key)) failures.push(key);
    }
    expect(failures).toEqual([]);
  });

  it("no record is dated in the future", () => {
    const failures = g.entities.filter((e) => e.asOf > TODAY).map((e) => `${e.id} ${e.asOf}`);
    expect(failures).toEqual([]);
    for (const e of g.entities) if (e.provenance) expect(e.provenance.editedOn <= TODAY, e.id).toBe(true);
  });

  it("guideline URLs point at guideline bodies or the primary publication", () => {
    const failures: string[] = [];
    for (const c of g.kind("cancer")) for (const row of c.standardOfCare) {
      const url = row.guideline?.url;
      if (!url) continue;
      const host = new URL(url).hostname.replace(/^www\./, "");
      const ok = GUIDELINE_HOSTS.some((h) => host === h || host.endsWith(`.${h}`));
      if (!ok && !GUIDELINE_URL_EXCEPTIONS.has(`${c.id}: ${row.setting}`)) failures.push(`${c.id}: ${row.setting} -> ${host}`);
    }
    expect(failures).toEqual([]);
  });

  it("TL;DRs avoid trial and endpoint acronyms unless the glossary defines them", () => {
    // A glossary term defines an acronym through its name ("Progression-free survival (PFS)"), a parenthetical, or an aka.
    const defined = new Set<string>();
    for (const t of g.kind("term")) {
      for (const s of [t.name, ...t.aka]) defined.add(s.trim().toUpperCase());
      for (const m of t.name.matchAll(/\(([^)]+)\)/g)) for (const part of m[1].split(/[\s/,]+/)) defined.add(part.toUpperCase());
    }
    const failures: string[] = [];
    for (const e of g.entities) {
      for (const acr of TLDR_ACRONYM_DENYLIST) {
        if (defined.has(acr.toUpperCase())) continue;
        const re = new RegExp(`(^|[^A-Za-z0-9-])${acr}(?![A-Za-z0-9-])`);
        if (re.test(e.tldr) && !TLDR_ACRONYM_EXCEPTIONS.has(`${e.id}: ${acr}`)) failures.push(`${e.id}: "${acr}"`);
      }
    }
    expect(failures).toEqual([]);
  });

  it("every TL;DR is a full sentence, not a fragment", () => {
    for (const e of g.entities) {
      expect(/[.!?)"”]$/.test(e.tldr.trim()), `${e.id}: "${e.tldr.slice(0, 60)}"`).toBe(true);
    }
  });

  it("rendered text follows house style: no em or en dashes, no 'as of' stamps, no 'spike'", () => {
    const failures: string[] = [];
    for (const e of g.entities) {
      if (HOUSE_STYLE_EXEMPT_IDS.has(e.id)) continue;
      houseStyleViolations(e, "", e.id, failures);
    }
    expect(failures).toEqual([]);
  });
});
