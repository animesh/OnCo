/**
 * Backlink fill for weakly connected records (fewer than three relations in and out, the `backlinks` health gauge).
 *
 * For every weak record this scans its own text (name, TL;DR, summary, and for trials the registry title and sponsor, for
 * people the role and specialisms) for the names and aliases of records that exist in the corpus, and proposes adding the
 * matched ids to the record's typed relation arrays. Nothing is invented: a link is proposed only when the record's own text
 * names the other record (or, for trials, when the sponsor string resolves through src/data/sponsor-aliases.ts to a company).
 * Reverse edges are then planned so the other side counts the new link too (a drug lists the trial, a company lists the trial).
 *
 *   npx tsx scripts/backlink-fill.ts                 plan: print every proposed edit with the sentence that supports it
 *   npx tsx scripts/backlink-fill.ts --apply         apply through the editor in scripts/orphan-links.ts and print what changed
 *   npx tsx scripts/backlink-fill.ts --kinds trial,person   limit to some kinds
 *
 * Tokens that match generically (single common words, cancer names inside other cancer names) are listed in SKIP_TOKENS; add
 * to it when the plan shows a false positive rather than hand-editing the output.
 */
import { graph } from "../src/lib/graph";
import { resolveSponsor } from "../src/data/sponsor-aliases";
import type { Entity, Kind, RelField } from "../src/lib/schema";
import { applyEdits, cancerEligible } from "./orphan-links";

type Edit = { targetId: string; targetKind: string; targetName: string; field: string; add: string; why: string };

/** Which relation array on a record holds ids of each kind. */
const FIELD_FOR: Partial<Record<Kind, RelField>> = {
  drug: "drugs", cancer: "cancers", target: "targets", technology: "technologies", company: "companies", institution: "institutions",
  trial: "trials", term: "terms", person: "people", journal: "journals", collection: "related", bottleneck: "bottlenecks", paper: "keyPapers", pathway: "pathways",
};
/** Kinds whose names are scanned for. */
const LINK_KINDS: Kind[] = ["drug", "cancer", "target", "technology", "company", "institution", "trial", "collection"];
/** Proper nouns: a match must keep the record's capitalisation ("the national cancer institute in Naples" is not the NCI). */
const CASE_SENSITIVE_KINDS = new Set<Kind>(["company", "institution", "trial", "collection"]);
/** Pairs the text supports only superficially (a parent name inside a different organisation, a sponsor alias that misfires). */
const REJECT = new Set<string>([
  "nct07346144>trog", // Trogenix ltd is not the Trans-Tasman Radiation Oncology Group
  "nct04724369>illumina", // "Formerly: Illumina Radiopharmaceuticals LLC" is not the sequencing company
  "nct07678684>bevacizumab", // the glioma-specific bevacizumab record is the right one for a glioma trial
  "david-probert>macmillan-cancer-support", // the UCH Macmillan Cancer Centre is a UCLH building
  "nu-zhang>lung-cancer", "christian-sauvr>lung-cancer", // the hospital's institute, not the person's field
  "john-arne-rottingen>wellcome-sanger", // Wellcome funds the Sanger; the CEO's record does not place him there
  "victor-piana-de-andrade>princess-margaret", // a partnership mention, not an affiliation
  "ken-smith>bcl2", "ken-smith>venetoclax", "madeline-bell>car-t", // the institute's work, not theirs
  "dominique-bazy>gustave-roussy", "vasanta-nanduri>fred-hutch", "vasanta-nanduri>st-jude", // other board members' affiliations
  "javier-arcos>oeci", "nicolas-revel>oeci", // accreditation of a centre someone else directs
  "sgccn>rcc", // RCC Stockholm Gotland is a regional cancer centre, not renal cell carcinoma
  "lilly-ventures>kras", // the record itself says this was not confirmed
  "andera-partners>versant-ventures", // a news-page cross-mention
  "the-cancer-journal>lung-cancer", // one issue's theme
  "ddr2>lung-cancer", // already linked to the specific cancer (nsclc)
  "capsovision>medtronic", "capsovision>olympus", // competitors, not partners
]);
/** Tokens too generic to support a link on their own. */
const SKIP_TOKENS = new Set<string>([
  "cancer", "cancers", "tumour", "tumor", "solid tumours", "solid tumors", "advanced solid tumours", "metastatic cancer", "metastatic", "leukaemia", "leukemia", "lymphoma", "sarcoma", "carcinoma", "melanoma",
  "placebo", "standard of care", "chemotherapy", "surgery", "radiotherapy", "radiation", "immunotherapy", "vaccine", "vaccines", "antibody", "antibodies", "protein", "peptide", "gene", "genes", "cell", "cells", "screening",
  "trial", "trials", "clinical trial", "clinical trials", "phase", "biomarker", "biomarkers", "patients", "research", "medicine", "health", "hospital", "institute", "university", "foundation", "centre", "center",
  "therapy", "treatment", "drug", "drugs", "device", "test", "tests", "panel", "sequencing", "imaging", "data", "registry", "guidelines", "guideline", "nature", "science", "lancet", "cell therapy", "blood", "bone", "skin", "brain", "liver", "lung", "breast", "colon", "kidney", "bladder", "prostate", "thyroid", "stomach", "pancreas", "ovary", "eye", "head and neck",
  "response", "survival", "quality of life", "pain", "nausea", "fatigue", "diet", "exercise", "sleep", "stress", "smoking", "obesity", "alcohol", "children", "adults", "women", "men", "family", "insurance", "cost", "costs", "policy", "china", "india", "europe", "africa", "america", "japan", "korea", "australia", "canada", "germany", "france", "italy", "spain",
  "care", "supportive care", "second opinion", "second opinions", "telehealth", "nurse", "nurses", "doctor", "doctors", "oncologist", "oncologists", "hospice", "the who", "who", "nih", "nhs", "fda", "ema", "eu", "us", "uk", "usa", "wellcome", "nice",
  "inc.", "target", "dart", "prism", "match trial", "mit", "open", "bispecific", "mrna", "ire", "cea", "state", "google", "sus", "national cancer institute", "nci", "cancercare", "clinicaltrials.gov", "blood cancer",
]);
/** Tokens shorter than this must match case-sensitively (acronyms and codes). */
const CASE_SENSITIVE_UNDER = 7;

const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const stripParens = (s: string) => s.replace(/\s*\([^)]*\)/g, "").trim();

type Tok = { text: string; id: string; kind: Kind; re: RegExp };

/** Names and aliases a record can be recognised by in another record's text. Long registry titles and locations in brackets are not aliases. */
function tokensFor(e: Entity): string[] {
  const out = new Set<string>();
  const add = (s: string) => { const t = s.trim(); if (t) out.add(t); };
  if (e.kind === "trial") { for (const a of e.aka) add(stripParens(a)); }
  else {
    for (const r of [e.name, ...e.aka]) {
      add(stripParens(r));
      // "Toll-like receptor 7 (TLR7)" -> also "TLR7"; only a single bracketed acronym, never "(MIT, open)" or "(Shanghai)".
      const m = /\(([A-Za-z0-9-]+)\)/.exec(r);
      if (m && ["target", "technology", "term", "cancer"].includes(e.kind) && /[A-Z].*[A-Z0-9]/.test(m[1])) add(m[1]);
    }
    if (e.kind === "drug") { if (e.brand) for (const b of e.brand.split(/[;,]/)) add(stripParens(b)); if (e.code) add(e.code); }
  }
  return [...out].filter((t) => {
    if (SKIP_TOKENS.has(t.toLowerCase()) || /^(a|an|the)\s/i.test(t)) return false;
    const acronym = /^[A-Z][A-Z0-9-]+$/.test(t);
    if (t.length < (acronym ? 3 : 4)) return false;
    if (e.kind === "term" && t.length < 10 && !t.includes(" ")) return false;
    if (e.kind === "trial" && t.length < 5) return false;
    return true;
  });
}

function buildIndex(entities: Entity[]): Tok[] {
  const toks: Tok[] = [];
  const owners = new Map<string, Set<string>>(); // kind|token -> ids, to drop names shared by several records
  for (const e of entities) {
    if (!LINK_KINDS.includes(e.kind)) continue;
    for (const t of tokensFor(e)) {
      const key = `${e.kind}|${t.toLowerCase()}`;
      owners.set(key, (owners.get(key) ?? new Set()).add(e.id));
      const sensitive = CASE_SENSITIVE_KINDS.has(e.kind) || t.length < CASE_SENSITIVE_UNDER || /^[A-Z0-9-]+$/.test(t);
      // Hyphens are loose: "Antibody-drug conjugate" matches "Antibody Drug Conjugate"; codes such as "TLX-101" also match "TLX101" and "TLX 101".
      const body = (/\d/.test(t) ? esc(t).replace(/([A-Za-z])(\d)/g, "$1[-\\s]?$2") : esc(t)).replace(/\\-/g, "[-\\s]?");
      toks.push({ text: t, id: e.id, kind: e.kind, re: new RegExp(`(^|[^A-Za-z0-9])${body}(?=$|[^A-Za-z0-9])`, sensitive ? "" : "i") });
    }
  }
  // "Instituto Nacional del Cáncer" names three institutions; a bare match cannot tell them apart.
  return toks.filter((t) => (owners.get(`${t.kind}|${t.text.toLowerCase()}`)?.size ?? 0) === 1);
}

/** "HER2-negative" or "HR+/HER2-" names the target only to exclude it; skip unless the text also selects for it. */
function negatedTarget(text: string, token: string): boolean {
  const t = esc(token);
  const neg = new RegExp(`${t}(-|\\s)?(negative|neg\\b|-(?![A-Za-z0-9]))`, "i");
  const pos = new RegExp(`${t}[-\\s]?(positive|pos\\b|\\+|expressing|mutant|mutation|amplif|fusion|alter|overexpress|targeted|directed|inhibitor|agonist|antagonist|blockade|antibody|car)|(anti|targeting|against|inhibitor of|expressing)[-\\s]${t}`, "i");
  return neg.test(text) && !pos.test(text);
}

function sentenceAround(text: string, at: number): string {
  let a = text.lastIndexOf(". ", at); a = a < 0 ? 0 : a + 2;
  let b = text.indexOf(". ", at); b = b < 0 ? text.length : b + 1;
  return text.slice(a, b).trim();
}

function textOf(e: Entity): string {
  const parts = [e.name, e.tldr, e.summary];
  if (e.kind === "trial") parts.push(e.setting);
  if (e.kind === "person") parts.push(e.role, ...e.specialisms);
  if (e.kind === "collection") parts.push(e.holds);
  if (e.kind === "journal") parts.push(e.scope);
  return parts.join(". ");
}

export type Proposal = { from: Entity; field: RelField; add: Entity; token: string; sentence: string };

export function plan(kinds: Set<Kind>): { proposals: Proposal[]; weak: Entity[]; noText: Entity[] } {
  const g = graph();
  const weak = g.entities.filter((e) => e.kind !== "section" && kinds.has(e.kind) && g.degree(e.id) < 3);
  const toks = buildIndex(g.entities);
  const journalByName = new Map<string, Entity>();
  for (const j of g.kind("journal")) for (const n of [j.name, ...j.aka, ...j.matchNames]) journalByName.set(n.toLowerCase(), j);
  const proposals: Proposal[] = [];
  const noText: Entity[] = [];
  for (const w of weak) {
    const text = textOf(w);
    const lower = text.toLowerCase();
    const before = proposals.length;
    const have = new Set<string>();
    for (const f of Object.values(FIELD_FOR)) for (const id of (w as unknown as Record<string, string[]>)[f!] ?? []) have.add(id);
    if (w.kind === "company") { for (const inv of w.investors) have.add(inv); if (w.acquiredBy) have.add(w.acquiredBy); }
    if (w.kind === "person" && w.institutionId) have.add(w.institutionId);
    have.add(w.id);
    for (const t of toks) {
      if (have.has(t.id)) continue;
      if (!/\d/.test(t.text) && !lower.includes(t.text.toLowerCase())) continue;
      const m = t.re.exec(text);
      if (!m) continue;
      const field = FIELD_FOR[t.kind]!;
      // Registry trials already carry cancers matched from condition terms; do not re-derive them from the title, and
      // registry boilerplate names glossary terms and other trials constantly without meaning them.
      if (w.kind === "trial" && (t.kind === "cancer" || t.kind === "trial")) continue;
      if (t.kind === "target" && negatedTarget(text, t.text)) continue;
      if (REJECT.has(`${w.id}>${t.id}`)) continue;
      have.add(t.id);
      proposals.push({ from: w, field, add: g.must(t.id), token: t.text, sentence: sentenceAround(text, m.index + m[1].length) });
    }
    // A person's selected papers name the journals they were published in; journal records carry matchNames for exactly this.
    if (w.kind === "person") {
      for (const paper of w.papers) {
        if (!paper.journal) continue;
        const j = journalByName.get(paper.journal.toLowerCase());
        if (!j || have.has(j.id)) continue;
        have.add(j.id);
        proposals.push({ from: w, field: "journals", add: j, token: paper.journal, sentence: `paper: ${paper.title} (${paper.journal}${paper.year ? ` ${paper.year}` : ""})` });
      }
    }
    if (w.kind === "trial" && w.sponsor && !w.companies.length) {
      const r = resolveSponsor(w.sponsor);
      const c = r.matched && r.id ? g.get(r.id) : undefined;
      if (c && (c.kind === "company" || c.kind === "institution") && !have.has(c.id)) { have.add(c.id); proposals.push({ from: w, field: FIELD_FOR[c.kind]!, add: c, token: `sponsor "${w.sponsor}"`, sentence: `sponsor: ${w.sponsor}` }); }
    }
    if (proposals.length === before) noText.push(w);
  }
  return { proposals, weak, noText };
}

/** Relation arrays whose existing entries may be mirrored back onto the weak record; cancers, terms and fronts are left alone so those pages do not fill by reverse edge. */
const MIRROR_FIELDS: RelField[] = ["drugs", "targets", "technologies", "companies", "institutions", "trials", "people", "related"];

/**
 * Reverse edges: the other record lists the weak one. Trials get the full set for their new links (that is how trials reach
 * drug and company pages); other kinds only what is needed to reach three, first from the new links, then from the relations
 * the weak record already declared (a target's own `drugs` entry becomes that drug's `targets` entry, as scripts/orphan-links.ts does for orphans).
 */
export function reverseEdits(proposals: Proposal[], weak: Entity[], g = graph()): Edit[] {
  const out: Edit[] = [];
  const gain = new Map<string, number>();
  for (const p of proposals) gain.set(p.from.id, (gain.get(p.from.id) ?? 0) + 1);
  const seen = new Set<string>();
  const push = (w: Entity, b: Entity, why: string, always: boolean): void => {
    const field = FIELD_FOR[w.kind];
    if (!field || b.kind === "section") return;
    if (((b as unknown as Record<string, string[]>)[field] ?? []).includes(w.id)) return;
    if (!always) {
      if (g.degree(w.id) + (gain.get(w.id) ?? 0) >= 3) return;
      if (b.kind === "cancer" || b.kind === "term") return;
    }
    const key = `${b.id}|${field}|${w.id}`;
    if (seen.has(key)) return;
    seen.add(key);
    gain.set(w.id, (gain.get(w.id) ?? 0) + 1);
    out.push({ targetId: b.id, targetKind: b.kind, targetName: b.name, field, add: w.id, why });
  };
  for (const p of proposals) {
    const w = p.from;
    if (w.kind === "trial" && p.add.kind === "cancer" && !cancerEligible(w, false)) continue;
    push(w, p.add, `reverse of ${w.id}.${p.field}`, w.kind === "trial");
  }
  for (const w of weak) {
    if (g.degree(w.id) + (gain.get(w.id) ?? 0) >= 3) continue;
    for (const f of MIRROR_FIELDS) for (const id of (w as unknown as Record<string, string[]>)[f] ?? []) {
      const b = g.get(id);
      if (b && b.id !== w.id) push(w, b, `mirror of ${w.id}.${f}`, false);
    }
    if (w.kind === "trial" && cancerEligible(w, false)) for (const id of w.cancers) push(w, g.must(id), `mirror of ${w.id}.cancers (phase ${w.phase}${w.result ? ", result" : ""})`, true);
  }
  return out;
}

if (process.argv[1]?.endsWith("backlink-fill.ts")) {
  const write = process.argv.includes("--apply");
  const k = process.argv.indexOf("--kinds");
  const kinds = new Set<Kind>(k >= 0 ? (process.argv[k + 1].split(",") as Kind[]) : (["trial", "person", "company", "journal", "collection", "institution", "target", "drug", "idea", "technology", "term", "bottleneck", "paper", "pathway", "pairing", "roadmap"] as Kind[]));
  const { proposals, weak, noText } = plan(kinds);
  const forward: Edit[] = proposals.map((p) => ({ targetId: p.from.id, targetKind: p.from.kind, targetName: p.from.name, field: p.field, add: p.add.id, why: `text names ${p.add.kind} "${p.token}"` }));
  const reverse = reverseEdits(proposals, weak);
  if (!write) {
    for (const p of proposals) console.log(`${p.from.kind}\t${p.from.id}\t${p.field}\t+= ${p.add.id}\t[${p.token}]\t${p.sentence.slice(0, 220)}`);
    for (const r of reverse) console.log(`REVERSE\t${r.targetKind}\t${r.targetId}\t${r.field}\t+= ${r.add}\t(${r.why})`);
    console.log(`\n${weak.length} weak records, ${proposals.length} forward edits, ${reverse.length} reverse edits; ${noText.length} records whose text names nothing in the corpus`);
    const byTok = new Map<string, number>();
    for (const p of proposals) byTok.set(`${p.add.kind}:${p.token}`, (byTok.get(`${p.add.kind}:${p.token}`) ?? 0) + 1);
    console.log("most matched tokens: " + [...byTok.entries()].sort((a, b) => b[1] - a[1]).slice(0, 40).map(([t, n]) => `${t} ${n}`).join(", "));
    console.log("no text match: " + noText.map((e) => `${e.kind}:${e.id}`).join(", "));
  } else {
    const { changed, skipped } = applyEdits([...forward, ...reverse], true);
    for (const c of changed) console.log("EDIT  " + c);
    for (const s of skipped) console.log("SKIP  " + s);
    console.log(`${changed.length} applied, ${skipped.length} skipped`);
  }
}
