/**
 * Server-side document builder for the concept search index (see semantic.ts). Imports the corpus,
 * so this file is only used by scripts, tests and server components, never by client components.
 */
import { graph } from "./graph";
import { KIND_META, type Entity } from "./schema";
import type { SemanticDoc } from "./semantic";

const rep = (s: string, n: number) => Array(n).fill(s).join(" ");

/** Kind-specific fields worth indexing, as plain text. */
export function fieldText(e: Entity): string {
  switch (e.kind) {
    case "cancer": return [e.group, e.burden ?? "", ...e.subtypes, ...e.biomarkers, ...e.standardOfCare.map((s) => `${s.setting} ${s.approach}`), ...e.stateOfArt, ...e.openProblems].join(" ");
    case "technology": return [e.principle, e.generation ?? "", ...e.strengths, ...e.limitations].join(" ");
    case "target": return [e.symbol ?? "", e.biology, e.targetClass, ...e.whereFound].join(" ");
    case "drug": return [e.brand ?? "", e.code ?? "", e.modality, e.payload ?? "", e.linker ?? "", e.mechanism, ...e.approvals.map((a) => `${a.region} ${a.indication}`), ...e.toxicity.map((t) => t.event)].join(" ");
    case "company": return [e.hq, e.companyType].join(" ");
    case "institution": return [e.city, e.institutionType, e.university ?? "", ...e.programs].join(" ");
    case "pathway": return [e.analogy, ...e.interventions, ...e.nodes.map((n) => n.label)].join(" ");
    case "term": return e.category;
    case "trial": return [e.nct ?? "", `phase ${e.phase}`, e.setting, e.sponsor ?? "", e.result ?? "", ...e.outcomes.map((o) => o.endpoint)].join(" ");
    case "pairing": return [e.rationale, e.evidence, e.pairingType].join(" ");
    case "roadmap": return e.steps.map((s) => `${s.title} ${s.description}`).join(" ");
    case "idea": return [e.hypothesis, e.rationale, e.test, e.maturity, e.actor ?? ""].join(" ");
    case "paper": return [e.journal, e.authors, e.paperType, ...e.findings, e.whatItMeans, ...e.caveats].join(" ");
    case "journal": return [e.publisher, e.scope, e.society ?? ""].join(" ");
    case "bottleneck": return [e.stage, e.severity, ...e.causes, ...e.currentEfforts, e.successLooksLike ?? ""].join(" ");
    case "collection": return [e.holds, e.maintainer ?? ""].join(" ");
    case "person": return [e.role, ...e.specialisms].join(" ");
    default: return "";
  }
}

/** One weighted text per entity: name and aliases count most, then tags, TL;DR, fields, summary, neighbour names. */
export function semanticText(e: Entity, neighbourNames: string[]): string {
  return [
    rep(e.name, 3), rep(e.aka.join(" "), 2), rep(e.tags.join(" "), 2), KIND_META[e.kind].label,
    rep(e.tldr, 2), fieldText(e), e.summary, e.simple ?? "", neighbourNames.join(" "),
  ].join("\n");
}

export function semanticDocs(): SemanticDoc[] {
  const g = graph();
  return g.entities.map((e) => {
    const names: string[] = [];
    for (const [k, list] of g.neighbours(e.id)) if (k !== "section") for (const n of list) names.push(n.name);
    return { id: e.id, kind: e.kind, text: semanticText(e, names), ...(e.tags.includes("ctgov-ingest") ? { weight: 0.6 } : {}) };
  });
}
