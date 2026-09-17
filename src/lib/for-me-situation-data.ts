import type { Graph } from "./graph";
import { routeFor, type Cancer, type Entity } from "./schema";
import { buildDecisionSections, decisionsRoute, slugify } from "./decisions";
import { redCardsForCancer, standardOfCareDrugs } from "./red-cards";
import { questionsFor } from "./questions";
import { buildGuide, buildSheet, WEEKS, type GuideSectionId } from "./first-60-days";
import { LINE_ORDER } from "./sequencing";
import { regionalApprovals, type Region } from "@/data/regional-approvals";
import { biomarkers } from "@/data/biomarkers";
import { geneTokens, type SituationBiomarker, type SituationData, type SituationDrug, type SituationLink, type SituationRow, type SituationTrial } from "./for-me-situation";

/**
 * Server side of the situation view: reads one cancer's records off the graph into the plain `SituationData`
 * that src/lib/for-me-situation.ts assembles in the browser. Nothing here is written by hand; every field is
 * copied from a record (standard of care, decisions, red cards, regional approvals, trials, questions, the
 * first-60-days guide and the appointment sheet).
 */

type TargetRecord = Extract<Entity, { kind: "target" }>;
type DrugRecord = Extract<Entity, { kind: "drug" }>;
type TrialRecord = Extract<Entity, { kind: "trial" }>;

const GUIDE_TITLES: Record<GuideSectionId, string> = {
  now: "What happens now", team: "Who is on your team", decisions: "Decisions coming up", questions: "Questions to ask at each visit",
  trials: "Trials to ask about", free: "Help that costs nothing", read: "What to read next",
};
const HOPEFUL = (e: Entity) => !["negative", "withdrawn", "historic"].includes(e.status ?? "");
const RED_CARDS = 12;

const link = (e: Entity): SituationLink => ({ id: e.id, name: e.name, route: routeFor(e), kind: e.kind, tldr: e.tldr, status: e.status });

/**
 * Target records a biomarker's wording names: by a shared gene-like token with a target's symbol, name or alias
 * ("BRAF V600E" names BRAF), and through the curated biomarker catalogue (src/data/biomarkers.ts) where an entry
 * typical for this cancer is worded with the same tokens ("PD-L1 CPS ≥ 10" maps to PD-L1 and PD-1).
 */
export function resolveBiomarkerTargets(label: string, targets: readonly TargetRecord[], cancerId?: string, catalogueTargets: readonly TargetRecord[] = targets): TargetRecord[] {
  const toks = new Set(geneTokens(label).map((t) => t.toUpperCase()));
  if (!toks.size) return [];
  const byId = new Map(catalogueTargets.map((t) => [t.id, t]));
  const out = new Map<string, TargetRecord>();
  for (const t of targets) if ([t.symbol ?? "", t.name, ...t.aka].some((s) => geneTokens(s).some((tok) => toks.has(tok.toUpperCase())))) out.set(t.id, t);
  for (const b of biomarkers) {
    if (cancerId && b.typical && !b.typical.includes(cancerId)) continue;
    const bt = geneTokens(b.label).map((t) => t.toUpperCase());
    if (!bt.some((t) => toks.has(t))) continue;
    for (const id of b.matches.targets ?? []) { const t = byId.get(id); if (t) out.set(t.id, t); }
  }
  return [...out.values()];
}

function drugRow(d: DrugRecord, inStandardOfCare: boolean): SituationDrug {
  const regional: SituationDrug["regional"] = {};
  const row = regionalApprovals[d.id];
  if (row) for (const r of Object.keys(row) as Region[]) { const e = row[r]; if (e) regional[r] = { status: e.status, year: e.year, indication: e.indication, source: e.source, note: e.note }; }
  return { ...link(d), modality: d.modality, targets: d.targets, inStandardOfCare, regional, anchorApprovals: d.approvals.map((a) => ({ region: a.region, year: a.year, indication: a.indication })) };
}

export function buildSituationData(c: Cancer, g: Graph): SituationData {
  const route = routeFor(c);
  const rel = g.forCancer(c.id);
  const linkedTargets = (rel.get("target") ?? []).filter((t): t is TargetRecord => t.kind === "target");

  // Rows: one per standard-of-care row, sharing the decision page's anchors, options, evidence and questions.
  const sections = buildDecisionSections(c.standardOfCare, (id) => g.get(id), { extraQuestions: questionsFor(c).items });
  const rows: SituationRow[] = sections.map((s, i) => {
    const soc = c.standardOfCare[i];
    const gl = [soc.guideline?.nccn ? `NCCN category ${soc.guideline.nccn}` : "", soc.guideline?.esmoMcbs ? `ESMO-MCBS ${soc.guideline.esmoMcbs}` : "", soc.guideline?.version ?? ""].filter(Boolean).join(", ");
    return {
      id: s.id, setting: s.setting, approach: s.approach, line: s.line, lineLabel: s.lineLabel, lineRank: LINE_ORDER.indexOf(s.line),
      refs: soc.refs.map((id) => g.get(id)).filter((e): e is Entity => !!e).map(link),
      guideline: gl || undefined, guidelineUrl: soc.guideline?.url, socHref: `${route}#sec-care`, decisionHref: decisionsRoute(c.id, s.id),
      optionIds: s.options.map((o) => o.id), evidence: s.evidence.map((e) => ({ id: e.id, name: e.name, route: e.route, kind: "trial" })), questions: s.questions,
    };
  });

  // Biomarkers: the record's wording, each resolved to the linked targets it names; duplicates by key are merged.
  const biomarkerRows: SituationBiomarker[] = [];
  for (const label of c.biomarkers) {
    const key = slugify(label.replace(/\s*\(.*?\)\s*/g, " "));
    if (biomarkerRows.some((b) => b.key === key)) continue;
    biomarkerRows.push({ key, label, targets: resolveBiomarkerTargets(label, linkedTargets, c.id, g.kind("target")).map((t) => ({ id: t.id, name: t.name, route: routeFor(t), kind: "target" })) });
  }
  const resolved = new Set(biomarkerRows.flatMap((b) => b.targets.map((t) => t.id)));

  // Drugs: named in the standard of care, plus any drug relevant to the cancer that aims at a resolved target.
  const socDrugs = standardOfCareDrugs(g, c);
  const socIds = new Set(socDrugs.map((d) => d.id));
  const drugs: SituationDrug[] = socDrugs.map((d) => drugRow(d, true));
  for (const d of rel.get("drug") ?? []) if (d.kind === "drug" && !socIds.has(d.id) && HOPEFUL(d) && d.targets.some((t) => resolved.has(t))) drugs.push(drugRow(d, false));

  // Trials recruiting now, linked either way.
  const seen = new Set<string>();
  const trials: SituationTrial[] = [];
  for (const t of [...(rel.get("trial") ?? []), ...c.trials.map((id) => g.get(id))]) {
    if (!t || t.kind !== "trial" || seen.has(t.id) || t.status !== "recruiting") continue;
    seen.add(t.id);
    const tr = t as TrialRecord;
    trials.push({ id: tr.id, name: tr.name, route: routeFor(tr), kind: "trial", nct: tr.nct, phase: tr.phase, setting: tr.setting === tr.name ? "" : tr.setting, drugs: tr.drugs, targets: tr.targets });
  }
  trials.sort((a, b) => a.name.localeCompare(b.name));

  const rowSettings = new Set(rows.map((r) => r.setting));
  const generalQuestions = questionsFor(c).items.filter((q) => !rowSettings.has(q.setting));
  const guide = buildGuide(c, g);
  const sheet = buildSheet(c, g);

  return {
    cancer: { id: c.id, name: c.name, route, group: c.group, tldr: c.tldr },
    rows, biomarkers: biomarkerRows, drugs, trials,
    redCards: redCardsForCancer(g, c, RED_CARDS),
    generalQuestions,
    guide: { route: `/first-60-days/${c.id}/`, steps: guide.sections.map((id) => ({ id, week: WEEKS[id], title: GUIDE_TITLES[id] })) },
    sheet: { route: `/prep/${c.id}/`, questions: sheet.questions.length, terms: sheet.terms.length, treatments: sheet.treatments.length },
    trialsRoute: route,
  };
}
