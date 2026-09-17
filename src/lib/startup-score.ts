import { graph, type Graph } from "./graph";
import { routeFor, type Bottleneck, type Cancer, type Entity, type Idea, type Target } from "./schema";
import { SURVIVAL_SITES } from "@/data/survival-map";
import { GLOBOCAN, rowsForCancer } from "./globocan";
import { readPublicJson } from "./feed-meta";

/**
 * Ranking of the requests for startups (roadmap row 112). Two axes, each 0 to 100, from disclosed dimensions:
 *
 *   Urgency (patient need)
 *     survival         five-year relative survival of the worst-served cancer the idea names (SEER, public/survival/index.json); lower is more urgent
 *     approvedOptions  approved treatments or tests in the corpus for the least-served cancer named; fewer is more urgent
 *     incidence        new cases a year worldwide across the cancers named (GLOBOCAN, public/globocan); more is more urgent
 *     bottleneck       severity of the worst bottleneck record that names the idea (critical 3, major 2, moderate 1, none 0)
 *
 *   Commerciality
 *     addressable      incidence times the share the idea reaches: the target's prevalence in the cancer when the idea names a target with
 *                      a sourced prevalence, otherwise every diagnosed patient (no narrowing field on the record)
 *     payerPath        how clear the route to being paid is, by solution type (see PAYER_PATH)
 *     routeYears       years to first revenue by regulatory route, by solution type (see ROUTE_YEARS)
 *     competitors      companies and trials in the corpus on the same technologies and cancers; fewer is more whitespace
 *     capital          the idea's own cost band (small under 1m, medium 1 to 50m, large over 50m dollars); smaller is better
 *     evidence         the idea's maturity field (speculative 0 to being tested at scale 3)
 *
 * Every dimension is min-max normalised against the whole set (counts on a log scale), then the axis score is the weighted mean of
 * the dimensions that could be scored. A dimension with no input is marked "not scored" and dropped from the mean rather than guessed.
 * The composite is the geometric mean of the two axes, so a request needs both need and a market to rise.
 *
 * Solution type: ideas whose actor is "data" are software; otherwise it is read from the technology records the idea links to
 * (TECH_TYPE_RULES). An idea with neither has no type and the type-based dimensions are not scored.
 */

export type Axis = "urgency" | "commerciality";
export type SolutionType = "software" | "diagnostic" | "device" | "drug" | "research-tool";
export type DimensionKey = "survival" | "approvedOptions" | "incidence" | "bottleneck" | "addressable" | "payerPath" | "routeYears" | "competitors" | "capital" | "evidence";

export type Source = { label: string; href: string; note?: string };
/** One raw input, before normalisation. `raw` null means the corpus has no figure and the dimension is not scored. */
export type DimensionInput = { raw: number | null; rawText: string; sources: Source[]; note?: string };

export type DimensionDef = {
  key: DimensionKey;
  axis: Axis;
  label: string;
  /** Plain-English one-liner for the legend. */
  plain: string;
  /** Weight within its axis; the weights of each axis sum to 1. */
  weight: number;
  /** Whether a higher raw value scores higher. */
  higherIsBetter: boolean;
  /** Counts are normalised on log1p to tame the long tail of incidence and competitor counts. */
  log?: boolean;
};

// Weights within each axis. Survival carries most of urgency because it is the outcome the others only proxy; whitespace and
// addressable market carry most of commerciality because the type-based constants are coarse. Each axis sums to 1.
export const DIMENSIONS: DimensionDef[] = [
  { key: "survival", axis: "urgency", label: "Five-year survival", plain: "How many people with the worst-served cancer this idea names are alive five years on (SEER). Lower survival, higher urgency.", weight: 0.35, higherIsBetter: false },
  { key: "approvedOptions", axis: "urgency", label: "Approved options", plain: "How many approved treatments or tests the corpus lists for the least-served cancer named. Fewer options, higher urgency.", weight: 0.25, higherIsBetter: false, log: true },
  { key: "incidence", axis: "urgency", label: "Annual incidence", plain: "New cases a year worldwide across the cancers named (GLOBOCAN). More people affected, higher urgency.", weight: 0.2, higherIsBetter: true, log: true },
  { key: "bottleneck", axis: "urgency", label: "Bottleneck named", plain: "Whether a bottleneck record in the war on cancer names this idea, and how severe that bottleneck is.", weight: 0.2, higherIsBetter: true },
  { key: "addressable", axis: "commerciality", label: "Addressable patients", plain: "Incidence times the share the solution reaches: the target's prevalence when the idea names one, otherwise every diagnosed patient.", weight: 0.2, higherIsBetter: true, log: true },
  { key: "payerPath", axis: "commerciality", label: "Payer path", plain: "How clear the route to being paid is for this kind of solution: drugs and devices have codes, software rarely does.", weight: 0.15, higherIsBetter: true },
  { key: "routeYears", axis: "commerciality", label: "Time to first revenue", plain: "Years to first revenue by regulatory route: software, diagnostics and research tools under a year, devices two to three, drugs seven plus.", weight: 0.15, higherIsBetter: false },
  { key: "competitors", axis: "commerciality", label: "Competitive whitespace", plain: "Companies and trials already in the corpus on the same technologies and cancers. Fewer means more open ground.", weight: 0.2, higherIsBetter: false, log: true },
  { key: "capital", axis: "commerciality", label: "Capital to proof", plain: "The idea's own cost band: small under one million dollars, medium one to fifty, large over fifty. Less capital scores higher.", weight: 0.15, higherIsBetter: false },
  { key: "evidence", axis: "commerciality", label: "Evidence readiness", plain: "The idea's maturity: speculative, preclinical evidence, early clinical or being tested at scale.", weight: 0.15, higherIsBetter: true },
];

export const GLOBOCAN_SOURCE_LABEL = `GLOBOCAN ${GLOBOCAN.year}`;

export const TYPE_LABEL: Record<SolutionType, string> = { software: "Software or data", diagnostic: "Diagnostic", device: "Device", drug: "Drug or biologic", "research-tool": "Research tool" };

/** Ordinal payer path by solution type, from the row text: is there a reimbursed comparator or a clear CPT, DRG or NICE route. */
export const PAYER_PATH: Record<SolutionType, { rank: number; text: string }> = {
  drug: { rank: 4, text: "Formulary and reimbursement follow approval; the clearest payer route" },
  device: { rank: 3, text: "DRG or procedure code once cleared" },
  diagnostic: { rank: 2, text: "CPT or NICE route exists but coverage decisions are slow" },
  software: { rank: 1, text: "Few reimbursement codes; usually sold to providers or pharma" },
  "research-tool": { rank: 0, text: "No payer; sold to research budgets" },
};

/** Years to first revenue by regulatory route, from the row text: software or diagnostic under a year, device two to three, drug seven plus. */
export const ROUTE_YEARS: Record<SolutionType, { years: number; text: string }> = {
  software: { years: 1, text: "Under a year; usually no pre-market approval" },
  diagnostic: { years: 1, text: "Under a year as a laboratory-developed test; longer for a kit" },
  "research-tool": { years: 1, text: "Under a year; no regulator" },
  device: { years: 2.5, text: "Two to three years to clearance" },
  drug: { years: 7, text: "Seven years or more to approval" },
};

export const SEVERITY_RANK: Record<Bottleneck["severity"], number> = { critical: 3, major: 2, moderate: 1 };
export const COST_RANK: Record<NonNullable<Idea["cost"]>, number> = { small: 0, medium: 1, large: 2 };
export const COST_TEXT: Record<NonNullable<Idea["cost"]>, string> = { small: "Small: under about one million dollars to try", medium: "Medium: one to fifty million dollars", large: "Large: over fifty million dollars" };
export const MATURITY_RANK: Record<Idea["maturity"], number> = { speculative: 0, "preclinical-evidence": 1, "early-clinical": 2, "being-tested-at-scale": 3 };

/** Technology id patterns, tested in order; the first match wins. Lab tools before software (so "pdx-models" is a research tool, not a model), hardware and procedures before tests, tests before drugs, so "psma-pet" is a diagnostic and "pet-ct" a device. */
export const TECH_TYPE_RULES: Array<[SolutionType, RegExp]> = [
  ["research-tool", /organoid|pdx|mouse-model|cell-line|crispr|functional-drug-testing|on-chip|screening-librar|biobank|preanalytic|structural-biology|high-throughput|encyclopedia|bh3-profiling|single-cell|spatial|proteomics|rna-seq|long-read|short-read|imaging-mass|multiplex-immuno|manufacturing|fill-finish|cdmo|cold-chain|apheresis|release-testing|isotope-supply|generators-kits|cyclotron|radiopharmacy|reference-laborator|contract-research/],
  ["software", /(^|-)ai(-|$)|software|foundation-model|platforms?$|digital|federated|matching|registr|real-world-data|ehr|telehealth|telemedicine|epro|remote-patient|twin|bioinformatics|cloud|knowledgebase|planning-system|auto-contouring|dosimetry|radiomics|models?$|-model-|alphafold|alphagenome|alphamissense|esm3|evo2|geneformer|scgpt|virchow|phikon|hibou|h-optimus|prov-gigapath|uni-conch|chief|musk|titan|pluto|kaiko|medsam|merlin|mirai|sybil|foresight|med-gemini|tempus|boltz|chai-1|chemistry42|rfdiffusion|bionemo|transcriptformer|nucleotide-transformer|enformer|cellfm|c2s-scale|nicheformer|universal-cell-embedding|scfoundation|genept|state-arc|bioemu|radfm|ct-fm|gears|atlas-aignostics|aidoc/],
  ["device", /radiotherapy|radiosurgery|brachytherapy|proton|carbon-ion|imrt|vmat|sbrt|sabr|flash-rt|linac|teletherapy|surgery|surgical|ablation|hifu|histotripsy|electroporation|ttfields|litt|focused-ultrasound|hyperthermia|robotic|infusion-devices|scalp-cooling|frozen-gloves|ultrasound$|^mri$|mp-mri|whole-body-mri|^ct$|pet-ct|pet-mri|spect|total-body-pet|mammography$|scanners|instruments|autostainers|endoscop|bronchoscopy|cystoscopy|colposcopy|hardware|hipec|tace|tare|perfusion|stenting|bnct|vhee|photothermal|sonodynamic|photoimmunotherapy|magnetic-nanoparticle|nanorobots|prosthesis/],
  ["diagnostic", /testing|-test$|biopsy|ctdna|cfdna|mrd|screening|sequencing|ngs|wes-wgs|cgp|companion-diagnostic|profiling|methylation|assay|pathology|ihc|cytometry|fish|-pet$|^pet$|fragmentomics|ctc-capture|breath-vocs|dermoscopy|surveillance|tmb|msi|hrd|germline|polygenic|classifier|prognostic|fna|monitoring|mced|thyroid-fna|colorectal-screening|skin-cancer|oral-visual|hpv-testing|psa/],
  ["drug", /adc|antibod|inhibitor|car-t|car-nk|cell-therapy|nk-cell|til-therapy|tcr-t|gamma-delta|vaccine|degrader|protac|glue|celmod|radioligand|alpha-therapy|prrt|radioimmuno|radioiodine|mibg|auger|astatine|chemotherapy|platinum|cytokine|engager|agonist|antagonist|blockade|oncolytic|bacteria|phage|conjugate|therapy$|therapeutics|drugs?$|repurposing|antisense|sirna|gene-editing|epigenetic|kinase|hormone|endocrine|androgen|serd|antiangiogenic|radiosensitis|radioprotect|g-csf|bone-modifying|antiemetic|cachexia|senescence|exosome|immunocytokine|rna$|analogue|glp1/],
];

/** Classify one technology id; undefined when no rule matches. */
export function techType(techId: string): SolutionType | undefined {
  return TECH_TYPE_RULES.find(([, re]) => re.test(techId))?.[0];
}

/** Longest route wins a tie, so a drug plus a companion test is scored as a drug programme. */
const TYPE_PRIORITY: SolutionType[] = ["drug", "device", "diagnostic", "software", "research-tool"];

/** The solution type of an idea and the record it was read from. */
export function solutionTypeOf(idea: Pick<Idea, "technologies" | "actor">): { type: SolutionType; from: string } | null {
  // The actor field is the record's own statement of who builds it: a data actor builds software whatever the technologies around it.
  if (idea.actor === "data") return { type: "software", from: "actor" };
  const votes = new Map<SolutionType, string[]>();
  for (const t of idea.technologies) {
    const ty = techType(t);
    if (ty) votes.set(ty, [...(votes.get(ty) ?? []), t]);
  }
  if (votes.size) {
    const best = [...votes.entries()].sort((a, b) => b[1].length - a[1].length || TYPE_PRIORITY.indexOf(a[0]) - TYPE_PRIORITY.indexOf(b[0]))[0];
    return { type: best[0], from: best[1][0] };
  }
  return null;
}

export type RequestInput = {
  id: string;
  name: string;
  type: SolutionType | null;
  /** Which technology record (or the actor field) the type was read from. */
  typeFrom: string | null;
  cost: NonNullable<Idea["cost"]> | null;
  dims: Record<DimensionKey, DimensionInput>;
};

export type ScoredDimension = DimensionDef & DimensionInput & { score: number | null };
export type AxisScore = { score: number | null; scored: number; total: number };
export type ScoredRequest<T extends RequestInput = RequestInput> = { input: T; dimensions: ScoredDimension[]; urgency: AxisScore; commerciality: AxisScore; composite: number | null; rank: number };

const clamp = (n: number) => Math.max(0, Math.min(100, n));
const geomean = (a: number, b: number) => Math.round(Math.sqrt(a * b));

/** Min-max normalise every dimension against the set, weight within each axis and take the geometric mean. Pure: no corpus access. */
export function scoreRequests<T extends RequestInput>(inputs: T[]): ScoredRequest<T>[] {
  const ranges = new Map<DimensionKey, { min: number; max: number }>();
  for (const d of DIMENSIONS) {
    const vals = inputs.map((i) => i.dims[d.key].raw).filter((v): v is number => v !== null).map((v) => (d.log ? Math.log1p(v) : v));
    if (vals.length) ranges.set(d.key, { min: Math.min(...vals), max: Math.max(...vals) });
  }
  const rows = inputs.map((input) => {
    const dimensions: ScoredDimension[] = DIMENSIONS.map((d) => {
      const inp = input.dims[d.key];
      const r = ranges.get(d.key);
      let score: number | null = null;
      if (inp.raw !== null && r) {
        const v = d.log ? Math.log1p(inp.raw) : inp.raw;
        // A dimension that is identical across the set carries no information: everyone gets the midpoint.
        const norm = r.max === r.min ? 0.5 : (v - r.min) / (r.max - r.min);
        score = clamp(Math.round(100 * (d.higherIsBetter ? norm : 1 - norm)));
      }
      return { ...d, ...inp, score };
    });
    const axis = (a: Axis): AxisScore => {
      const ds = dimensions.filter((d) => d.axis === a);
      const scored = ds.filter((d) => d.score !== null);
      const w = scored.reduce((s, d) => s + d.weight, 0);
      return { score: w ? Math.round(scored.reduce((s, d) => s + d.weight * (d.score as number), 0) / w) : null, scored: scored.length, total: ds.length };
    };
    const urgency = axis("urgency");
    const commerciality = axis("commerciality");
    const composite = urgency.score !== null && commerciality.score !== null ? geomean(urgency.score, commerciality.score) : urgency.score ?? commerciality.score;
    return { input, dimensions, urgency, commerciality, composite, rank: 0 };
  });
  rows.sort((a, b) => (b.composite ?? -1) - (a.composite ?? -1) || a.input.name.localeCompare(b.input.name));
  rows.forEach((r, i) => (r.rank = i + 1));
  return rows;
}

/** Ideas that name industry, engineering or data as the actor and have no company in the corpus attached: the seed list of a request for startups. */
export function openIdeas(g: Graph = graph()): Idea[] {
  return g.kind("idea").filter((i) => i.actor && ["industry", "engineering", "data"].includes(i.actor) && !i.companies.length && !(g.incoming(i.id).get("company") ?? []).length);
}

type SurvivalSnapshot = { fetched: string; sourceUrl: string; sites: Record<string, { url: string; overall?: { pct: number; period: string } }> };

const link = (e: Entity, note?: string): Source => ({ label: e.name, href: routeFor(e), note });
const fmtInt = (n: number) => n.toLocaleString("en-GB");
/** "15-20" -> 17.5; "95" -> 95. */
export function prevalencePct(pct: number | string): number | null {
  if (typeof pct === "number") return pct;
  const m = pct.match(/^\s*(\d+(?:\.\d+)?)\s*(?:-\s*(\d+(?:\.\d+)?))?/);
  if (!m) return null;
  return m[2] ? (Number(m[1]) + Number(m[2])) / 2 : Number(m[1]);
}

const notScored = (why: string, sources: Source[] = []): DimensionInput => ({ raw: null, rawText: "Not scored", sources, note: why });

/** Build the raw inputs for every open idea from the corpus and the SEER and GLOBOCAN snapshots. Server only. */
export function gatherStartupRequests(g: Graph = graph(), snapshot: SurvivalSnapshot | null = readPublicJson<SurvivalSnapshot>("survival/index.json")): Array<RequestInput & { idea: Idea }> {
  const approvedByCancer = new Map<string, number>();
  for (const d of g.kind("drug")) {
    if (!(d.approvals.length || d.status === "approved" || d.status === "standard-of-care")) continue;
    for (const c of d.cancers) approvedByCancer.set(c, (approvedByCancer.get(c) ?? 0) + 1);
  }
  const globocanSrc: Source = { label: `GLOBOCAN ${GLOBOCAN.year}`, href: GLOBOCAN.sourceUrl, note: "IARC Global Cancer Observatory, world estimate" };

  return openIdeas(g).map((idea) => {
    const cancers = idea.cancers.map((c) => g.get(c)).filter((c): c is Cancer => c?.kind === "cancer");
    const noCancer = "The idea names no cancer, so patient figures cannot be attached";
    const noCancerSrc = [link(idea, "cancers field is empty")];
    const ty = solutionTypeOf(idea);
    const typeSrc: Source[] = ty ? [ty.from === "actor" ? { label: `${idea.name}: actor field`, href: routeFor(idea), note: `actor "${idea.actor}" read as software or data` } : link(g.must(ty.from), "technology record the type was read from")] : [];

    // Urgency: survival (worst-served cancer)
    let survival: DimensionInput;
    if (!cancers.length) survival = notScored(noCancer, noCancerSrc);
    else {
      const hits = cancers.flatMap((c) => { const site = SURVIVAL_SITES[c.id]; const s = site && snapshot?.sites[site.slug]; return s?.overall ? [{ c, pct: s.overall.pct, period: s.overall.period, url: s.url, shared: site.shared }] : []; });
      if (!hits.length) survival = notScored("None of the cancers named has a SEER survival figure in the snapshot", cancers.map((c) => link(c)));
      else {
        const worst = hits.reduce((a, b) => (b.pct < a.pct ? b : a));
        survival = { raw: worst.pct, rawText: `${worst.pct}% five-year relative survival, ${worst.c.name} (${worst.period} diagnoses)`, sources: [link(worst.c), { label: "SEER Cancer Stat Facts", href: worst.url, note: worst.shared }], note: hits.length > 1 ? `Lowest of ${hits.length} cancers named` : undefined };
      }
    }

    // Urgency: approved options (least-served cancer)
    let approvedOptions: DimensionInput;
    if (!cancers.length) approvedOptions = notScored(noCancer, noCancerSrc);
    else {
      const least = cancers.map((c) => ({ c, n: approvedByCancer.get(c.id) ?? 0 })).reduce((a, b) => (b.n < a.n ? b : a));
      approvedOptions = { raw: least.n, rawText: `${least.n} approved treatment${least.n === 1 ? "" : "s"} or test${least.n === 1 ? "" : "s"} in the corpus for ${least.c.name}`, sources: [link(least.c, "counted from drug records with an approval that list this cancer")], note: cancers.length > 1 ? `Fewest of ${cancers.length} cancers named` : undefined };
    }

    // Urgency: incidence (sum across mapped cancers)
    let incidence: DimensionInput;
    const mapped = cancers.flatMap((c) => { const w = rowsForCancer(c.id).world; return w?.cases ? [{ c, cases: w.cases, mapping: rowsForCancer(c.id).mapping }] : []; });
    if (!cancers.length) incidence = notScored(noCancer, noCancerSrc);
    else if (!mapped.length) incidence = notScored("None of the cancers named is mapped to a GLOBOCAN site", cancers.map((c) => link(c)));
    else {
      const total = mapped.reduce((s, m) => s + m.cases, 0);
      const shared = mapped.filter((m) => m.mapping.shared).map((m) => `${m.c.name}: ${m.mapping.note ?? "shares a GLOBOCAN site"}`);
      incidence = { raw: total, rawText: `${fmtInt(total)} new cases a year worldwide (${mapped.map((m) => m.c.name).join(", ")})`, sources: [...mapped.map((m) => link(m.c)), globocanSrc], note: [mapped.length < cancers.length ? `${cancers.length - mapped.length} cancer(s) named have no GLOBOCAN estimate and are left out` : "", ...shared].filter(Boolean).join(". ") || undefined };
    }

    // Urgency: bottleneck named
    const bns = idea.bottlenecks.map((b) => g.get(b)).filter((b): b is Bottleneck => b?.kind === "bottleneck");
    const worstB = bns.length ? bns.reduce((a, b) => (SEVERITY_RANK[b.severity] > SEVERITY_RANK[a.severity] ? b : a)) : null;
    const bottleneck: DimensionInput = worstB
      ? { raw: SEVERITY_RANK[worstB.severity], rawText: `Named by ${bns.length} bottleneck${bns.length === 1 ? "" : "s"}; worst severity ${worstB.severity}`, sources: bns.map((b) => link(b, `severity ${b.severity}`)) }
      : { raw: 0, rawText: "No bottleneck record names this idea", sources: [link(idea, "bottlenecks field is empty")] };

    // Commerciality: addressable patients
    let addressable: DimensionInput;
    if (incidence.raw === null) addressable = notScored(incidence.note ?? noCancer, incidence.sources);
    else {
      const targets = idea.targets.map((t) => g.get(t)).filter((t): t is Target => t?.kind === "target");
      const prev = targets.flatMap((t) => t.prevalence.filter((p) => idea.cancers.includes(p.cancerId)).map((p) => ({ t, p, pct: prevalencePct(p.pct) }))).filter((x): x is typeof x & { pct: number } => x.pct !== null).sort((a, b) => b.pct - a.pct)[0];
      const reach = prev ? prev.pct / 100 : 1;
      const n = Math.round(incidence.raw * reach);
      addressable = prev
        ? { raw: n, rawText: `${fmtInt(n)} patients a year: ${fmtInt(incidence.raw)} cases times ${prev.pct}% ${prev.p.measure ?? "prevalence"} of ${prev.t.name}`, sources: [link(prev.t, `prevalence field for ${g.must(prev.p.cancerId).name}`), globocanSrc] }
        : { raw: n, rawText: `${fmtInt(n)} patients a year: every new case counted`, sources: incidence.sources, note: "The idea names no target with a prevalence figure, so no narrowing is applied" };
    }

    // Commerciality: payer path and route, by type
    const noType = "No technology record on the idea matches a solution type, so type-based dimensions are not scored";
    const payerPath: DimensionInput = ty ? { raw: PAYER_PATH[ty.type].rank, rawText: `${TYPE_LABEL[ty.type]}: ${PAYER_PATH[ty.type].text}`, sources: typeSrc } : notScored(noType, [link(idea)]);
    const routeYears: DimensionInput = ty ? { raw: ROUTE_YEARS[ty.type].years, rawText: `${TYPE_LABEL[ty.type]}: ${ROUTE_YEARS[ty.type].text}`, sources: typeSrc } : notScored(noType, [link(idea)]);

    // Commerciality: competitors on the same technologies and cancers
    const onTech = new Map<string, Entity>();
    for (const t of idea.technologies) for (const k of ["company", "trial"] as const) for (const e of g.incoming(t).get(k) ?? []) onTech.set(e.id, e);
    const onCancer = new Map<string, Entity>();
    for (const c of idea.cancers) for (const k of ["company", "trial"] as const) for (const e of g.incoming(c).get(k) ?? []) onCancer.set(e.id, e);
    let competitors: DimensionInput;
    if (!idea.technologies.length && !idea.cancers.length) competitors = notScored("The idea names neither a technology nor a cancer to match companies and trials against", [link(idea)]);
    else {
      const pool = idea.technologies.length && idea.cancers.length ? [...onTech.values()].filter((e) => onCancer.has(e.id)) : idea.technologies.length ? [...onTech.values()] : [...onCancer.values()];
      const companies = pool.filter((e) => e.kind === "company").length;
      const trials = pool.length - companies;
      const basis = [idea.technologies.length ? `${idea.technologies.length} technolog${idea.technologies.length === 1 ? "y" : "ies"}` : "", idea.cancers.length ? `${idea.cancers.length} cancer${idea.cancers.length === 1 ? "" : "s"}` : ""].filter(Boolean).join(" and ");
      competitors = { raw: pool.length, rawText: `${companies} compan${companies === 1 ? "y" : "ies"} and ${trials} trial${trials === 1 ? "" : "s"} in the corpus on the same ${basis}`, sources: [...idea.technologies.map((t) => link(g.must(t), "matched technology")), ...idea.cancers.map((c) => link(g.must(c), "matched cancer")), ...pool.slice(0, 5).map((e) => link(e, e.kind === "company" ? "company on it" : "trial on it"))], note: pool.length > 5 ? `Showing 5 of ${pool.length} matches` : undefined };
    }

    // Commerciality: capital and evidence, from the idea's own fields
    const capital: DimensionInput = idea.cost ? { raw: COST_RANK[idea.cost], rawText: COST_TEXT[idea.cost], sources: [link(idea, "cost field")] } : notScored("The idea has no cost band", [link(idea)]);
    const evidence: DimensionInput = { raw: MATURITY_RANK[idea.maturity], rawText: idea.maturity.replace(/-/g, " "), sources: [link(idea, "maturity field")] };

    return { id: idea.id, name: idea.name, type: ty?.type ?? null, typeFrom: ty?.from ?? null, cost: idea.cost ?? null, idea, dims: { survival, approvedOptions, incidence, bottleneck, addressable, payerPath, routeYears, competitors, capital, evidence } };
  });
}

/** The ranked requests for startups, ready for the page. */
export function scoreStartupRequests(g: Graph = graph()) {
  return scoreRequests(gatherStartupRequests(g));
}
