/** Server-only: builds the power view rows from the graph; relevance.ts keeps the pure scoring helpers for client components. */
import { graph } from "./graph";
import { approvedRegions, regionalApprovals } from "@/data/regional-approvals";
import type { PowerRow, Signals } from "./relevance";
import type { Entity } from "./schema";
import { routeFor } from "./schema";

const EVIDENCE: Record<string, number> = { approved: 10, "standard-of-care": 10, positive: 8, "phase-3": 6, established: 6, completed: 5, recruiting: 4, active: 4, "phase-2": 4, emerging: 3, "phase-1": 2, preclinical: 1, concept: 0, mixed: 3, historic: 1, negative: 0, withdrawn: 0, planned: 1 };

function yearOf(e: Entity): number | undefined {
  if (e.kind === "drug") return e.approvals.length ? Math.max(...e.approvals.map((a) => a.year)) : undefined;
  if (e.kind === "trial") return e.yearReported;
  if (e.kind === "technology") return typeof e.since === "number" ? e.since : undefined;
  return undefined;
}

function metaOf(e: Entity): string {
  switch (e.kind) {
    case "drug": return e.modality;
    case "technology": return e.generation ?? "";
    case "target": return e.targetClass.replace("-", " ");
    case "company": return `${e.companyType.replace("-", " ")} · ${e.hq}`;
    case "institution": return `${e.city}, ${e.country}`;
    case "trial": return `Phase ${e.phase}${e.sponsor ? ` · ${e.sponsor}` : ""}`;
    case "pairing": return e.pairingType.replace("-", " → ");
    case "idea": return e.maturity.replace(/-/g, " ");
    case "term": return e.category;
    case "collection": return e.maintainer ?? "";
    default: return "";
  }
}

function regionsOf(e: Entity): string[] {
  if (e.kind !== "drug") return [];
  const out = new Set<string>();
  for (const a of e.approvals) { const r = REGION_ALIAS[a.region.toLowerCase()]; if (r) out.add(r); if (/^(global|who)$/i.test(a.region)) ["US", "EU", "UK", "JP", "CN", "AU"].forEach((x) => out.add(x)); }
  const row = regionalApprovals[e.id];
  if (row) for (const r of approvedRegions(row)) out.add(r);
  return [...out];
}

const REGION_ALIAS: Record<string, string> = { us: "US", usa: "US", fda: "US", eu: "EU", ema: "EU", europe: "EU", uk: "UK", mhra: "UK", jp: "JP", japan: "JP", pmda: "JP", cn: "CN", china: "CN", nmpa: "CN", au: "AU", australia: "AU", tga: "AU" };

export function powerRows(): PowerRow[] {
  const g = graph();
  const rows = new Map<string, PowerRow>();
  for (const e of g.entities) {
    if (e.kind === "cancer" || e.kind === "section") continue;
    rows.set(e.id, {
      id: e.id, kind: e.kind, name: e.name, tldr: e.tldr, route: routeFor(e), status: e.status, degree: g.degree(e.id), year: yearOf(e), evidence: EVIDENCE[e.status ?? ""] ?? 0, tags: e.tags, meta: metaOf(e), rel: {},
      targets: e.kind === "target" ? [e.id, ...e.targets] : e.targets, terms: e.terms, technologies: e.kind === "technology" ? [e.id, ...e.technologies] : e.technologies, regions: regionsOf(e), soc: {},
    });
  }
  const mark = (id: string, cancerId: string, s: keyof Signals) => { const r = rows.get(id); if (r) (r.rel[cancerId] ??= {})[s] = 1; };

  for (const c of g.kind("cancer")) {
    for (const row of c.standardOfCare) for (const id of row.refs) { mark(id, c.id, "soc"); const r = rows.get(id); if (r) (r.soc[c.id] ??= []).push(row.setting); }
    for (const id of c.pipeline) mark(id, c.id, "pipeline");
    for (const h of c.history) for (const id of h.refs) mark(id, c.id, "history");
    for (const [, list] of g.neighbours(c.id)) for (const n of list) mark(n.id, c.id, "direct");
    for (const d of g.neighbours(c.id).get("drug") ?? []) {
      for (const id of [...d.targets, ...d.companies, ...d.technologies]) { const r = rows.get(id); if (r && !r.rel[c.id]) mark(id, c.id, "indirect"); }
    }
  }
  return [...rows.values()];
}

/** Does a standard-of-care setting label ("Metastatic, first line", "Localised", "Relapsed") fit a profile stage? */
