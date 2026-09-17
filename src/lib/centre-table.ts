import { graph } from "./graph";
import { routeFor, type Cancer, type Entity, type Institution } from "./schema";
import { readPublicJson } from "./feed-meta";
import type { ResearchIndex } from "./research";
import { trialLeadership } from "./trial-leadership";

/**
 * Centre table for one cancer (roadmap item 108): the measurable things the corpus holds on each institution
 * linked to the cancer. Every column is a record field or a count over the graph:
 *
 *   newsweek       institution.newsweekOncology2026 (Newsweek/Statista 2026 oncology rank)
 *   nci            institution.nci (NCI designation, US only)
 *   designations   institution.tags such as oeci-accredited, cruk-centre, nhs-cancer-alliance, unicancer, irccs
 *   programmes     institution.programs entries that name this cancer
 *   trials         trials in the corpus linked to both the institution and the cancer
 *   research       public/openalex/research-index.json: oncology works and citations in the fetch window (OpenAlex, CC0)
 *   technologies   institution.technologies: the machines and methods the record lists for the centre
 *   leadershipRank position in src/lib/trial-leadership.ts
 *
 * The institution schema has no case-volume or outcome field, so none is shown; the legend says so. Pure
 * builders take a lookup so the tests can run on synthetic records; `centreRowsFor` wires the graph.
 */

export type CentreDesignation = { key: string; label: string; href?: string };

/** Tags on institution records that name an accreditation, designation or network membership. */
export const DESIGNATION_LABELS: Record<string, { label: string; body?: string }> = {
  "nci-designated": { label: "NCI-designated", body: "nci" },
  "oeci-accredited": { label: "OECI accredited", body: "oeci" },
  "oeci-comprehensive-cancer-centre": { label: "OECI Comprehensive Cancer Centre", body: "oeci" },
  "oeci-cancer-centre": { label: "OECI Cancer Centre", body: "oeci" },
  "oeci-comprehensive-cancer-network": { label: "OECI Comprehensive Cancer Network", body: "oeci" },
  "oeci-in-accreditation": { label: "OECI accreditation in progress", body: "oeci" },
  "cruk-centre": { label: "CRUK Centre", body: "cruk" },
  "cruk-centre-partner": { label: "CRUK Centre partner", body: "cruk" },
  "nhs-cancer-alliance": { label: "NHS Cancer Alliance" },
  "nhs-cancer-centre": { label: "NHS cancer centre" },
  "nhs-specialist-cancer-centre": { label: "NHS specialist cancer centre" },
  unicancer: { label: "Unicancer" },
  irccs: { label: "IRCCS" },
  "fcct-directory": { label: "FCCT directory" },
  "provincial-cancer-agency": { label: "Provincial cancer agency" },
};

const NCI_LABEL: Record<NonNullable<Institution["nci"]>, string> = { comprehensive: "NCI comprehensive", clinical: "NCI clinical", basic: "NCI basic laboratory" };

/** Designations from the record: the `nci` field first, then recognised tags. `hrefFor` resolves a body id (nci, oeci, cruk) to a page. */
export function designationsFor(inst: Pick<Institution, "tags" | "nci">, hrefFor: (bodyId: string) => string | undefined = () => undefined): CentreDesignation[] {
  const out: CentreDesignation[] = [];
  if (inst.nci) out.push({ key: `nci-${inst.nci}`, label: NCI_LABEL[inst.nci], href: `/institutions/?nci=${encodeURIComponent(inst.nci[0].toUpperCase() + inst.nci.slice(1))}` });
  for (const t of inst.tags) {
    const d = DESIGNATION_LABELS[t];
    if (!d) continue;
    if (t === "nci-designated" && inst.nci) continue;
    out.push({ key: t, label: d.label, href: d.body ? hrefFor(d.body) : undefined });
  }
  return out;
}

/** Programme names on the institution record that mention this cancer (by name or alias, shortest useful token). */
export function programmesFor(inst: Pick<Institution, "programs">, cancer: Pick<Cancer, "name" | "aka">): string[] {
  const base = cancer.name.replace(/\s*\(.*?\)\s*$/, "").toLowerCase();
  // "Non-small cell lung cancer" also matches a "Lung cancer" programme: the organ plus "cancer" is the last two words.
  const organ = base.match(/(\S+)\s+cancer$/)?.[1];
  const needles = [base, ...cancer.aka.map((a) => a.toLowerCase()), ...(organ ? [`${organ} cancer`] : [])]
    .flatMap((n) => [n, n.replace(/\s+cancer$/, ""), n.replace(/\s+(carcinoma|tumou?rs?|leukaemia|lymphoma|myeloma)$/, "")])
    .map((n) => n.trim())
    .filter((n) => n.length >= 4);
  return inst.programs.filter((p) => { const s = p.toLowerCase(); return needles.some((n) => s.includes(n)); });
}

export type CentreResearch = { works: number; cited: number; clinicalTrials: number; years: [number, number] };

export type CentreRow = {
  id: string;
  name: string;
  route: string;
  website?: string;
  city: string;
  country: string;
  institutionType: Institution["institutionType"];
  /** How the centre is linked to this cancer in the corpus ("this cancer", trial and product names). May be trimmed in packed form; `viaTotal` keeps the full count. */
  via: string[];
  viaTotal: number;
  newsweek?: number;
  nci?: Institution["nci"];
  designations: CentreDesignation[];
  programmes: string[];
  /** Trials in the corpus linked to both this centre and this cancer. */
  trials: Array<{ id: string; name: string; route: string }>;
  research: CentreResearch | null;
  technologies: Array<{ id: string; name: string; route: string }>;
  leadershipRank?: number;
};

export type CentreInput = { inst: Institution; via: string[] };

export type CentreContext = {
  lookup: (id: string) => Entity | undefined;
  /** Ids of the trials that belong to this cancer. */
  cancerTrialIds: ReadonlySet<string>;
  /** Trial ids linked to an institution (either direction). */
  trialsOf: (instId: string) => string[];
  research: ResearchIndex | null;
  rank?: ReadonlyMap<string, number>;
};

/** Sort: Newsweek rank, then trials for this cancer, then research works, then name. */
export function sortCentreRows(rows: CentreRow[]): CentreRow[] {
  return [...rows].sort((a, b) => (a.newsweek ?? 999) - (b.newsweek ?? 999) || b.trials.length - a.trials.length || (b.research?.works ?? -1) - (a.research?.works ?? -1) || a.name.localeCompare(b.name));
}

export function buildCentreRows(cancer: Pick<Cancer, "name" | "aka">, inputs: CentreInput[], ctx: CentreContext): CentreRow[] {
  const hrefFor = (bodyId: string) => { const e = ctx.lookup(bodyId); return e ? routeFor(e) : undefined; };
  const rows = inputs.map(({ inst, via }) => {
    const trials = ctx.trialsOf(inst.id).filter((id) => ctx.cancerTrialIds.has(id)).map((id) => ctx.lookup(id)).filter((e): e is Entity => !!e).map((t) => ({ id: t.id, name: t.name, route: routeFor(t) })).sort((a, b) => a.name.localeCompare(b.name));
    const r = ctx.research?.institutions[inst.id];
    const research: CentreResearch | null = r ? { works: r.works, cited: r.cited, clinicalTrials: r.clinicalTrials, years: ctx.research!.years } : null;
    const technologies = inst.technologies.map((id) => ctx.lookup(id)).filter((e): e is Entity => !!e).map((t) => ({ id: t.id, name: t.name, route: routeFor(t) }));
    return {
      id: inst.id, name: inst.name, route: routeFor(inst), website: inst.website, city: inst.city, country: inst.country, institutionType: inst.institutionType, via, viaTotal: via.length,
      newsweek: inst.newsweekOncology2026, nci: inst.nci, designations: designationsFor(inst, hrefFor), programmes: programmesFor(inst, cancer), trials, research, technologies, leadershipRank: ctx.rank?.get(inst.id),
    };
  });
  return sortCentreRows(rows);
}

/** Same selection as the original ExpertCentres list: institutions linked to the cancer directly or via its pipeline, trials, guideline refs and history. */
export function centreInputsFor(c: Cancer): CentreInput[] {
  const g = graph();
  const found = new Map<string, { inst: Institution; via: Set<string> }>();
  const add = (inst: Institution, via: string) => {
    const cur = found.get(inst.id) ?? { inst, via: new Set<string>() };
    cur.via.add(via);
    found.set(inst.id, cur);
  };
  for (const inst of g.forCancer(c.id).get("institution") ?? []) if (inst.kind === "institution") add(inst, "this cancer");
  const relatedIds = [...c.pipeline, ...c.trials, ...c.standardOfCare.flatMap((s) => s.refs), ...c.history.flatMap((h) => h.refs)];
  for (const id of new Set(relatedIds)) {
    const e = g.get(id);
    if (!e) continue;
    for (const inst of g.neighbours(id).get("institution") ?? []) if (inst.kind === "institution") add(inst, e.name);
  }
  return [...found.values()].map(({ inst, via }) => ({ inst, via: [...via] }));
}

let researchCache: ResearchIndex | null | undefined;
/** The OpenAlex research index snapshot, read once per build; null when the file is absent. */
export function researchIndex(): ResearchIndex | null {
  if (researchCache === undefined) researchCache = readPublicJson<ResearchIndex>("openalex/research-index.json");
  return researchCache;
}

let rankCache: Map<string, number> | undefined;
function leadershipRank(): Map<string, number> {
  if (!rankCache) rankCache = new Map(trialLeadership().map((r) => [r.institution.id, r.rank]));
  return rankCache;
}

/** Trials that belong to a cancer: linked either way, named in its standard of care or history. */
export function cancerTrialIdsFor(c: Cancer): Set<string> {
  const g = graph();
  const ids = new Set<string>();
  for (const t of g.forCancer(c.id).get("trial") ?? []) ids.add(t.id);
  for (const id of [...c.trials, ...c.standardOfCare.flatMap((s) => s.refs), ...c.history.flatMap((h) => h.refs)]) if (g.get(id)?.kind === "trial") ids.add(id);
  return ids;
}

export function centreRowsFor(cancerId: string): CentreRow[] {
  const g = graph();
  const c = g.get(cancerId);
  if (!c || c.kind !== "cancer") return [];
  const ctx: CentreContext = {
    lookup: (id) => g.get(id),
    cancerTrialIds: cancerTrialIdsFor(c),
    trialsOf: (instId) => (g.neighbours(instId).get("trial") ?? []).map((t) => t.id),
    research: researchIndex(),
    rank: leadershipRank(),
  };
  return buildCentreRows(c, centreInputsFor(c), ctx);
}

/**
 * Packed form for pages that carry every cancer's centres at once (the second-opinion finder): institution-level
 * facts once per institution, trial names once per trial, and per cancer only the link (how it is linked, which
 * trial ids, which programmes). About a seventh of the size of the full rows; `unpackCentreRows` restores them.
 */
export type CentreBase = Omit<CentreRow, "via" | "viaTotal" | "trials" | "programmes">;
export type CentreLink = { i: string; v: string[]; vn: number; t: string[]; p: string[] };
export type CentrePack = { institutions: Record<string, CentreBase>; trials: Record<string, { name: string; route: string }> };

const VIA_KEEP = 5;

export function packCentreRows(byCancer: Record<string, CentreRow[]>): { pack: CentrePack; links: Record<string, CentreLink[]> } {
  const institutions: Record<string, CentreBase> = {};
  const trials: Record<string, { name: string; route: string }> = {};
  const links: Record<string, CentreLink[]> = {};
  for (const [cancerId, rows] of Object.entries(byCancer)) {
    links[cancerId] = rows.map((r) => {
      const { via, viaTotal, trials: ts, programmes, ...base } = r;
      void viaTotal;
      institutions[r.id] ??= base;
      for (const t of ts) trials[t.id] ??= { name: t.name, route: t.route };
      return { i: r.id, v: via.slice(0, VIA_KEEP), vn: via.length, t: ts.map((t) => t.id), p: programmes };
    });
  }
  return { pack: { institutions, trials }, links };
}

export function unpackCentreRows(links: CentreLink[], pack: CentrePack): CentreRow[] {
  const out: CentreRow[] = [];
  for (const l of links) {
    const base = pack.institutions[l.i];
    if (!base) continue;
    out.push({ ...base, via: l.v, viaTotal: l.vn, programmes: l.p, trials: l.t.map((id) => ({ id, ...(pack.trials[id] ?? { name: id, route: `/trials/${id}/` }) })) });
  }
  return out;
}

const displayNames = new Intl.DisplayNames(["en-GB"], { type: "region" });
export function countryName(code: string): string {
  try { return displayNames.of(code) ?? code; } catch { return code; }
}
