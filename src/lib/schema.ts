import { z } from "zod";

/**
 * OnCo data model.
 *
 * Every object in the hub is an Entity with a `kind`. All entities share the base
 * fields; each kind adds a few typed fields. Relationships are expressed as arrays
 * of entity ids. Backlinks are derived at build time (see graph.ts), so a link only
 * needs to be declared once, on whichever side is most natural.
 *
 * Content rules (mirrors the Open Medical Registry):
 *  - `tldr` is for a non-technical reader. One or two plain sentences, no jargon.
 *  - `summary` is for a clinician, scientist, or engineer.
 *  - `asOf` is the date the facts were last checked. Facts change; say when.
 *  - Do not invent numbers. Prefer a source link over a remembered figure.
 */

export const KINDS = [
  "cancer",
  "section",
  "technology",
  "target",
  "drug",
  "company",
  "institution",
  "pathway",
  "term",
  "trial",
  "pairing",
  "roadmap",
  "idea",
  "collection",
  "person",
  "bottleneck",
  "paper",
  "journal",
] as const;
export type Kind = (typeof KINDS)[number];

export const STATUSES = [
  "approved",
  "phase-3",
  "phase-2",
  "phase-1",
  "preclinical",
  "concept",
  "standard-of-care",
  "established",
  "emerging",
  "historic",
  "withdrawn",
  "active",
  "completed",
  "recruiting",
  "positive",
  "negative",
  "mixed",
  "planned",
] as const;
export type Status = (typeof STATUSES)[number];

const id = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "ids are kebab-case");
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "YYYY-MM-DD");
const url = z.string().url();

export const ExternalLinkSchema = z.object({
  label: z.string().min(1),
  url,
});
export type ExternalLink = z.infer<typeof ExternalLinkSchema>;

export const TimelineEventSchema = z.object({
  year: z.union([z.number().int(), z.string()]),
  title: z.string().min(1),
  note: z.string().optional(),
  /** Entity ids this event is about. */
  refs: z.array(id).default([]),
});
export type TimelineEvent = z.infer<typeof TimelineEventSchema>;

const Base = z.object({
  id,
  kind: z.enum(KINDS),
  name: z.string().min(1),
  aka: z.array(z.string()).default([]),
  /** Plain-language explanation for someone with no background. */
  tldr: z.string().min(1),
  /** Technical summary. Markdown-light: paragraphs separated by blank lines. */
  summary: z.string().min(1),
  status: z.enum(STATUSES).optional(),
  asOf: isoDate,
  wikipedia: url.optional(),
  links: z.array(ExternalLinkSchema).default([]),
  tags: z.array(z.string()).default([]),
  /** Free-form related entity ids (any kind). */
  related: z.array(id).default([]),
  /** Typed relationship arrays. Each holds ids of the named kind. */
  cancers: z.array(id).default([]),
  sections: z.array(id).default([]),
  technologies: z.array(id).default([]),
  targets: z.array(id).default([]),
  drugs: z.array(id).default([]),
  companies: z.array(id).default([]),
  institutions: z.array(id).default([]),
  pathways: z.array(id).default([]),
  terms: z.array(id).default([]),
  trials: z.array(id).default([]),
  people: z.array(id).default([]),
  /** Bottlenecks of the war on cancer this object bears on (ideas attack them; technologies, trials, collections relieve them). */
  bottlenecks: z.array(id).default([]),
  /** Key papers (kind "paper") this object rests on or is discussed in. */
  keyPapers: z.array(id).default([]),
  /** Journals (kind "journal") this object was published in or is tied to. */
  journals: z.array(id).default([]),
  /** Why this matters / what is hard about it. Optional editorial notes. */
  notes: z.array(z.string()).default([]),
  /** Even simpler explanation (about a 12-year-old reading age). Optional. */
  simple: z.string().optional(),
  /** Who last substantively edited this record (name or handle) and when. */
  provenance: z.object({ editedBy: z.string(), editedOn: isoDate, note: z.string().optional() }).optional(),
  /** Named probability estimate for speculative content. */
  confidence: z.object({ probability: z.tuple([z.number().min(0).max(1), z.number().min(0).max(1)]), by: z.string(), on: isoDate, note: z.string().optional() }).optional(),
});

export const CancerSchema = Base.extend({
  kind: z.literal("cancer"),
  /** ICD-O / organ system grouping, e.g. "breast", "lung", "blood". */
  group: z.string(),
  /** Roughly how common, in words. */
  burden: z.string().optional(),
  subtypes: z.array(z.string()).default([]),
  /** Key biomarkers a clinician tests for. */
  biomarkers: z.array(z.string()).default([]),
  standardOfCare: z.array(z.object({
    setting: z.string(), approach: z.string(), refs: z.array(id).default([]),
    /** Guideline mapping: NCCN category (e.g. "1", "2A", "preferred"), ESMO-MCBS grade (e.g. "A", "4"), guideline version/URL. */
    guideline: z.object({ nccn: z.string().optional(), esmoMcbs: z.string().optional(), version: z.string().optional(), url: url.optional() }).optional(),
  })).default([]),
  /** What is state of the art today, in one paragraph per point. */
  stateOfArt: z.array(z.string()).default([]),
  history: z.array(TimelineEventSchema).default([]),
  /** What is coming: ids of drugs/technologies/trials/ideas. */
  pipeline: z.array(id).default([]),
  openProblems: z.array(z.string()).default([]),
  /** The broader cancer this record is a subtype of (pleural mesothelioma -> mesothelioma); the parent page lists its subtypes at the top. */
  parent: id.optional(),
});

export const SectionSchema = Base.extend({
  kind: z.literal("section"),
  order: z.number().int(),
  icon: z.string().optional(),
});

export const TechnologySchema = Base.extend({
  kind: z.literal("technology"),
  /** How it works, for a technical reader. */
  principle: z.string(),
  /** Which generation of the idea this is, if the field talks in generations. */
  generation: z.string().optional(),
  strengths: z.array(z.string()).default([]),
  limitations: z.array(z.string()).default([]),
  /** Year first used in humans or first approved, if meaningful. */
  since: z.union([z.number().int(), z.string()]).optional(),
});

export const TargetSchema = Base.extend({
  kind: z.literal("target"),
  /** Gene symbol / protein name. */
  symbol: z.string().optional(),
  biology: z.string(),
  /** Expression or alteration by cancer, free text. */
  whereFound: z.array(z.string()).default([]),
  targetClass: z.enum(["surface-antigen", "kinase", "checkpoint", "nuclear-receptor", "enzyme", "transcription", "oncogene", "tumor-suppressor", "stroma", "other"]).default("other"),
  /** Fraction of each cancer that expresses or carries the alteration, sourced. `pct` is 0-100 or a range string like "15-20". */
  prevalence: z.array(z.object({ cancerId: id, pct: z.union([z.number(), z.string()]), measure: z.string().optional(), source: url.optional(), note: z.string().optional() })).default([]),
});

export const ApprovalSchema = z.object({
  region: z.string(),
  year: z.number().int(),
  indication: z.string(),
  note: z.string().optional(),
});

export const DrugSchema = Base.extend({
  kind: z.literal("drug"),
  brand: z.string().optional(),
  code: z.string().optional(),
  /** Modality, e.g. "ADC", "small molecule", "mAb", "radioligand", "cell therapy", "vaccine", "device". */
  modality: z.string(),
  payload: z.string().optional(),
  linker: z.string().optional(),
  mechanism: z.string(),
  approvals: z.array(ApprovalSchema).default([]),
  /** Step-by-step mechanism for the animated mechanism card. */
  mechanismSteps: z.array(z.string()).default([]),
  dosing: z.object({ route: z.string(), schedule: z.string(), modifications: z.string().optional(), monitoring: z.string().optional(), source: url.optional() }).optional(),
  /** Adverse events with rates in percent, from the label or pivotal trial. */
  toxicity: z.array(z.object({ event: z.string(), anyGradePct: z.number().optional(), grade3PlusPct: z.number().optional(), source: url.optional(), note: z.string().optional() })).default([]),
  /** Cost and access by country. */
  access: z.array(z.object({ country: z.string(), listPrice: z.string().optional(), reimbursement: z.string().optional(), assistance: z.string().optional(), generic: z.boolean().optional(), source: url.optional(), asOf: isoDate.optional() })).default([]),
  regulatoryEvents: z.array(z.object({ date: z.string(), type: z.enum(["designation", "filing", "pdufa", "approval", "crl", "withdrawal", "label-change", "advisory-committee"]), region: z.string(), note: z.string(), source: url.optional() })).default([]),
});

/** Broad company type. `investor` is a venture fund, corporate venture arm or disease foundation that finances the others; its portfolio is derived from the `investors` field on the companies it backs. */
export const COMPANY_TYPES = ["pharma", "biotech", "diagnostics", "imaging", "devices", "ai-software", "radiopharma", "cell-therapy", "cro-services", "nonprofit", "investor"] as const;
export type CompanyType = (typeof COMPANY_TYPES)[number];

/** Where a company is in its life: a venture-backed startup, a later-stage private company, listed, a large private group, acquired, or wound down. */
export const STAGES = ["startup", "growth", "public", "private-large", "acquired", "defunct"] as const;
export type Stage = (typeof STAGES)[number];

/** One financing round. `amountUsd` only when the cited source states the figure; `source` is the press release, SEC filing or trade report. */
export const FundingRoundSchema = z.object({
  /** "Seed", "Series A", "Series B", "IPO", "Grant", "Crossover", ... */
  round: z.string().min(1),
  year: z.number().int().min(1990).max(2100),
  amountUsd: z.number().positive().optional(),
  source: url,
  note: z.string().optional(),
});
export type FundingRound = z.infer<typeof FundingRoundSchema>;

export const CompanySchema = Base.extend({
  kind: z.literal("company"),
  hq: z.string(),
  country: z.string().length(2),
  companyType: z.enum(COMPANY_TYPES),
  website: url.optional(),
  ticker: z.string().optional(),
  founded: z.number().int().optional(),
  stage: z.enum(STAGES).optional(),
  /** Y Combinator batch, e.g. "W21", "S24", "X26" (Spring), "F25" (Fall). */
  ycBatch: z.string().regex(/^[WSXF]\d{2}$/, "YC batch like W21, S24, X26 or F25").optional(),
  /** Ids of investor records (companies with `companyType: "investor"`) that have backed this company. Backlinks give each investor its portfolio. */
  investors: z.array(id).default([]),
  /** Sourced financing rounds; omit rather than guess. */
  funding: z.array(FundingRoundSchema).default([]),
  /** Company id of the acquirer, when `stage` is "acquired" and the acquirer is in OnCo. */
  acquiredBy: id.optional(),
});

export const InstitutionSchema = Base.extend({
  kind: z.literal("institution"),
  city: z.string(),
  country: z.string().length(2),
  lat: z.number(),
  lng: z.number(),
  institutionType: z.enum(["cancer-center", "university", "hospital", "research-institute", "government", "consortium"]),
  website: url.optional(),
  /** NCI designation, US only. */
  nci: z.enum(["comprehensive", "clinical", "basic"]).optional(),
  /** Newsweek / Statista World's Best Specialized Hospitals 2026, Oncology rank. */
  newsweekOncology2026: z.number().int().optional(),
  /** Parent university, when the institution is a cancer centre inside one. */
  university: z.string().optional(),
  programs: z.array(z.string()).default([]),
});

export const PathwayNodeSchema = z.object({ id: z.string(), label: z.string(), x: z.number(), y: z.number(), targetId: id.optional() });
export const PathwayEdgeSchema = z.object({ from: z.string(), to: z.string(), type: z.enum(["activates", "inhibits"]).default("activates") });

export const PathwaySchema = Base.extend({
  kind: z.literal("pathway"),
  /** Layman explanation using an analogy. */
  analogy: z.string(),
  nodes: z.array(PathwayNodeSchema),
  edges: z.array(PathwayEdgeSchema),
  /** How drugs attack it. */
  interventions: z.array(z.string()).default([]),
});

export const TermSchema = Base.extend({
  kind: z.literal("term"),
  category: z.string(),
});

export const TrialSchema = Base.extend({
  kind: z.literal("trial"),
  nct: z.string().optional(),
  phase: z.enum(["1", "1/2", "2", "2/3", "3", "4", "observational", "platform"]),
  setting: z.string(),
  sponsor: z.string().optional(),
  /** Headline result in one or two sentences, with numbers only if sourced. */
  result: z.string().optional(),
  yearReported: z.number().int().optional(),
  enrolled: z.number().int().optional(),
  /** Structured outcomes; values in the arm's unit (months, percent). Enables pictograms and comparisons. */
  outcomes: z.array(z.object({
    endpoint: z.string(),
    primary: z.boolean().optional(),
    unit: z.string().optional(),
    arms: z.array(z.object({ name: z.string(), n: z.number().int().optional(), value: z.number().optional(), note: z.string().optional() })).min(1),
    hr: z.number().optional(),
    ci: z.tuple([z.number(), z.number()]).optional(),
    p: z.string().optional(),
    source: url.optional(),
  })).default([]),
  /** Has an independent trial or real-world study confirmed the effect? */
  replication: z.string().optional(),
});

export const PairingSchema = Base.extend({
  kind: z.literal("pairing"),
  a: id,
  b: id,
  /** Why the pair works better than either alone. */
  rationale: z.string(),
  evidence: z.string(),
  pairingType: z.enum(["combination", "sequence", "diagnostic-therapeutic", "platform", "caution"]),
});

export const RoadmapStepSchema = z.object({
  era: z.string(),
  title: z.string(),
  description: z.string(),
  refs: z.array(id).default([]),
  status: z.enum(["historic", "current", "emerging", "speculative"]),
});

export const RoadmapSchema = Base.extend({
  kind: z.literal("roadmap"),
  steps: z.array(RoadmapStepSchema).min(2),
});

export const IdeaSchema = Base.extend({
  kind: z.literal("idea"),
  hypothesis: z.string(),
  rationale: z.string(),
  /** What experiment or trial would confirm or kill it. */
  test: z.string(),
  maturity: z.enum(["speculative", "preclinical-evidence", "early-clinical", "being-tested-at-scale"]),
  /** Who would have to act: research, clinic, industry, regulator, payer, policy, patients, data, philanthropy. */
  actor: z.enum(["research", "clinic", "industry", "regulator", "payer", "policy", "patients", "data", "philanthropy", "engineering"]).optional(),
  /** Rough cost to try: small (<$1M), medium ($1-50M), large (>$50M). */
  cost: z.enum(["small", "medium", "large"]).optional(),
  /** Time to first evidence of impact in years. */
  horizonYears: z.number().int().min(0).max(30).optional(),
});

/** A key paper: a landmark publication explained. One page each: what it found, what it means, and what to be careful about. */
export const PaperSchema = Base.extend({
  kind: z.literal("paper"),
  journal: z.string(),
  year: z.number().int(),
  doi: z.string().optional(),
  pmid: z.string().optional(),
  /** "Surname A, Surname B, et al." */
  authors: z.string(),
  paperType: z.enum(["rct", "meta-analysis", "observational", "real-world", "basic", "translational", "review", "guideline", "methods"]),
  /** The key results, one per item, with the numbers. */
  findings: z.array(z.string()).default([]),
  /** Plain English: what this changes for patients, clinicians or the field. */
  whatItMeans: z.string(),
  /** Limitations, open questions, disputes. */
  caveats: z.array(z.string()).default([]),
  /** Did it change guidelines or approvals? */
  changedPractice: z.boolean().optional(),
  /** Roughly how many participants, for trials and cohorts. */
  participants: z.number().int().optional(),
});

/** A journal or publication venue: where the evidence is published, with its stance, access model and the key papers it carried. */
export const JournalSchema = Base.extend({
  kind: z.literal("journal"),
  publisher: z.string(),
  url,
  issn: z.string().optional(),
  /** Broad scope: general medicine, oncology, haematology, basic science, radiology, etc. */
  scope: z.string(),
  /** Open access model: subscription, hybrid, open access, diamond. */
  access: z.enum(["subscription", "hybrid", "open-access", "diamond"]).optional(),
  founded: z.number().int().optional(),
  /** Latest impact factor or citation metric, with the year it refers to. Optional and clearly labelled. */
  impactFactor: z.object({ value: z.number(), year: z.number().int(), source: z.string().optional() }).optional(),
  /** Names as they appear in paper records, so papers can be matched to this journal. */
  matchNames: z.array(z.string()).default([]),
  society: z.string().optional(),
});

/** A bottleneck: a systemic constraint that slows the whole war on cancer. Ideas link to bottlenecks; the fixes are derived by backlink. */
export const BottleneckSchema = Base.extend({
  kind: z.literal("bottleneck"),
  /** Where in the pipeline it bites. */
  stage: z.enum(["biology", "prevention-detection", "trials", "regulation-manufacturing", "access-delivery", "data-knowledge", "funding-incentives", "people-culture"]),
  severity: z.enum(["critical", "major", "moderate"]),
  /** Numbers that show the size of the problem, each with a source. */
  metrics: z.array(z.object({ label: z.string(), value: z.string(), source: z.string().optional(), url: url.optional() })).default([]),
  /** Root causes, plain English, one per item. */
  causes: z.array(z.string()).default([]),
  /** What is already being tried and by whom. */
  currentEfforts: z.array(z.string()).default([]),
  /** What would count as the bottleneck being broken. */
  successLooksLike: z.string().optional(),
});

export const CollectionSchema = Base.extend({
  kind: z.literal("collection"),
  url,
  holds: z.string(),
  license: z.string().optional(),
  maintainer: z.string().optional(),
});

export const PersonSchema = Base.extend({
  kind: z.literal("person"),
  /** Current role and affiliation in one line, e.g. "Chief, Breast Medicine Service". */
  role: z.string(),
  /** Primary institution id (also list in `institutions`). */
  institutionId: id.optional(),
  specialisms: z.array(z.string()).default([]),
  /** Professional links: profile, lab, Google Scholar, ORCID, PubMed, X/LinkedIn. */
  profiles: z.array(z.object({ label: z.string(), url })).default([]),
  /** Selected publications, most recent or most cited first. */
  papers: z.array(z.object({ title: z.string(), journal: z.string().optional(), year: z.number().int().optional(), url: url.optional(), doi: z.string().optional(), note: z.string().optional() })).default([]),
  orcid: z.string().optional(),
  hIndex: z.number().int().optional(),
});

export const EntitySchema = z.discriminatedUnion("kind", [
  CancerSchema,
  SectionSchema,
  TechnologySchema,
  TargetSchema,
  DrugSchema,
  CompanySchema,
  InstitutionSchema,
  PathwaySchema,
  TermSchema,
  TrialSchema,
  PairingSchema,
  RoadmapSchema,
  IdeaSchema,
  CollectionSchema,
  PersonSchema,
  BottleneckSchema,
  PaperSchema,
  JournalSchema,
]);

export type Entity = z.infer<typeof EntitySchema>;
export type Cancer = z.infer<typeof CancerSchema>;
export type Section = z.infer<typeof SectionSchema>;
export type Technology = z.infer<typeof TechnologySchema>;
export type Target = z.infer<typeof TargetSchema>;
export type Drug = z.infer<typeof DrugSchema>;
export type Company = z.infer<typeof CompanySchema>;
export type Institution = z.infer<typeof InstitutionSchema>;
export type Pathway = z.infer<typeof PathwaySchema>;
export type Term = z.infer<typeof TermSchema>;
export type Trial = z.infer<typeof TrialSchema>;
export type Pairing = z.infer<typeof PairingSchema>;
export type Roadmap = z.infer<typeof RoadmapSchema>;
export type Idea = z.infer<typeof IdeaSchema>;
export type Collection = z.infer<typeof CollectionSchema>;
export type Person = z.infer<typeof PersonSchema>;
export type Bottleneck = z.infer<typeof BottleneckSchema>;
export type Paper = z.infer<typeof PaperSchema>;
export type Journal = z.infer<typeof JournalSchema>;

/** Input types (before defaults are applied) — what authors write in data files. */
export type CancerInput = z.input<typeof CancerSchema>;
export type SectionInput = z.input<typeof SectionSchema>;
export type TechnologyInput = z.input<typeof TechnologySchema>;
export type TargetInput = z.input<typeof TargetSchema>;
export type DrugInput = z.input<typeof DrugSchema>;
export type CompanyInput = z.input<typeof CompanySchema>;
export type InstitutionInput = z.input<typeof InstitutionSchema>;
export type PathwayInput = z.input<typeof PathwaySchema>;
export type TermInput = z.input<typeof TermSchema>;
export type TrialInput = z.input<typeof TrialSchema>;
export type PairingInput = z.input<typeof PairingSchema>;
export type RoadmapInput = z.input<typeof RoadmapSchema>;
export type IdeaInput = z.input<typeof IdeaSchema>;
export type CollectionInput = z.input<typeof CollectionSchema>;
export type PersonInput = z.input<typeof PersonSchema>;
export type BottleneckInput = z.input<typeof BottleneckSchema>;
export type PaperInput = z.input<typeof PaperSchema>;
export type JournalInput = z.input<typeof JournalSchema>;
export type EntityInput = z.input<typeof EntitySchema>;

/** The relationship array fields shared by every entity. */
export const REL_FIELDS = [
  "related",
  "cancers",
  "sections",
  "technologies",
  "targets",
  "drugs",
  "companies",
  "institutions",
  "pathways",
  "terms",
  "trials",
  "people",
  "bottlenecks",
  "keyPapers",
  "journals",
] as const;
export type RelField = (typeof REL_FIELDS)[number];

export const KIND_META: Record<Kind, { plural: string; label: string; route: string; blurb: string; color: string; /** Display title where the plural is not the best public name (e.g. "Treatments & tests" for drugs, which also covers tests and devices). */ title?: string }> = {
  cancer: { plural: "cancers", label: "Cancer", route: "cancers", blurb: "One page per disease: state of the art, history, and what is coming.", color: "rose" },
  section: { plural: "fronts", label: "Front", route: "fronts", blurb: "The fronts of the war on cancer: from imaging and early detection to ADCs, radiopharma, and cell therapy.", color: "slate" },
  technology: { plural: "technologies", label: "Technology", route: "technologies", blurb: "Every way we see, measure, or attack a tumour, explained.", color: "sky" },
  target: { plural: "targets", label: "Target", route: "targets", blurb: "The molecules drugs and tracers aim at.", color: "violet" },
  drug: { plural: "drugs", label: "Treatment", route: "drugs", title: "Treatments & tests", blurb: "Approved and pipeline products, with what they hit and who makes them.", color: "emerald" },
  company: { plural: "companies", label: "Company", route: "companies", blurb: "Who is building what.", color: "amber" },
  institution: { plural: "institutions", label: "Institution", route: "institutions", blurb: "The centres and universities that matter, mapped and ranked.", color: "teal" },
  pathway: { plural: "pathways", label: "Pathway", route: "pathways", blurb: "The classic signalling circuits, drawn and explained.", color: "fuchsia" },
  term: { plural: "terms", label: "Term", route: "terms", title: "Glossary", blurb: "Glossary with plain-English TL;DRs and Wikipedia links.", color: "zinc" },
  trial: { plural: "trials", label: "Trial", route: "trials", blurb: "Landmark and current trials that define the standard of care.", color: "indigo" },
  pairing: { plural: "pairings", label: "Pairing", route: "pairings", blurb: "Things that work better together, and things that do not.", color: "orange" },
  roadmap: { plural: "roadmaps", label: "Roadmap", route: "roadmaps", blurb: "Where a technology has been and where it is heading.", color: "cyan" },
  idea: { plural: "ideas", label: "Idea", route: "ideas", blurb: "Hypotheses and new directions, linked to the evidence.", color: "lime" },
  collection: { plural: "collections", label: "Collection", route: "collections", blurb: "The open databases and registries the field runs on.", color: "stone" },
  person: { plural: "people", label: "Person", route: "people", blurb: "The clinicians and scientists doing the work: specialisms, bios, papers, and where to find them.", color: "pink" },
  journal: { plural: "journals", label: "Journal", route: "journals", blurb: "Where the evidence is published: the journals, their scope and access model, and the key papers each one carried.", color: "slate" },
  paper: { plural: "key papers", label: "Key paper", route: "key-papers", blurb: "The papers that changed practice or thinking, each explained: what it found, what it means, and what to be careful about.", color: "sky" },
  bottleneck: { plural: "bottlenecks", label: "Bottleneck", route: "bottlenecks", blurb: "The systemic constraints slowing the whole war on cancer, with the ideas that could break each one.", color: "red" },
};

export function routeFor(e: { kind: Kind; id: string }): string {
  return `/${KIND_META[e.kind].route}/${e.id}/`;
}
