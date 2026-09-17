/**
 * Corpus health: coverage metrics computed from the graph at build time.
 *
 * Each metric asks one question of every record it applies to ("does this drug have a molecule or an
 * explained placeholder?") and reports how many pass, how many were checked, the worst offenders, and
 * the one action that would fix a failing record. The Roadmap page renders these as gauges and uses
 * them to downgrade any idea whose "shipped" claim the corpus contradicts.
 *
 * To add a metric, append a definition to METRIC_DEFS. Give it a stable id (used in URL anchors and in
 * HubIdea.metric), a plain sentence, an action, and a `check` that returns the records checked and the
 * failing ones in worst-first order. Nothing else needs to change.
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { graph, type Graph } from "./graph";
import { completeness } from "./completeness";
import { KINDS, KIND_META, routeFor, type Entity, type Kind } from "./schema";
import { hasMolecule } from "./structures";
import { SCHEMATIC_ALIAS, SPECIFIC_IDS, hasAnimation } from "@/data/schematics";
import { hasAnchorApproval, isDiagnostic, regionalApprovals, regionSpecific } from "@/data/regional-approvals";
import { reviews } from "@/data/reviews";
import { simple } from "@/data/simple";
import { tldr_es } from "@/data/i18n/es";
import { tldr_fr } from "@/data/i18n/fr";
import { tldr_de } from "@/data/i18n/de";
import { tldr_ja } from "@/data/i18n/ja";
import { tldr_ar } from "@/data/i18n/ar";
import { tldr_zh } from "@/data/i18n/zh";
import { tldr_pt } from "@/data/i18n/pt";
import { tldr_hi } from "@/data/i18n/hi";

export type Offender = { id: string; name: string; route: string; detail?: string };

export type HealthMetric = {
  id: string;
  label: string;
  /** One plain sentence saying what the metric measures and why it matters. */
  plain: string;
  /** Records passing the check. */
  value: number;
  /** Records checked. */
  total: number;
  /** value / total as a percentage, one decimal. 100 when nothing was checked. */
  pct: number;
  /** Percentage at or above which the metric counts as met (and a "shipped" claim stands). */
  target: number;
  met: boolean;
  kind?: Kind;
  /** Up to 25 failing records, worst first, each linking to its page. */
  worst: Offender[];
  /** What a contributor should do to fix a failing record. */
  action: string;
  /** GitHub issue link prefilled with the metric name, current value, and the worst offenders. */
  issueUrl: string;
  /** Where the check lives, for people who want to change the rule. */
  code: string;
};

type CheckResult = { total: number; failing: Offender[] };
export type MetricDef = {
  id: string;
  label: string;
  plain: string;
  action: string;
  kind?: Kind;
  /** Default 95. Lower for fields that can never be complete (translations, reviews). */
  target?: number;
  check: (g: Graph, ctx: Ctx) => CheckResult;
};

const REPO = "https://github.com/judegomila/OnCo";
const WORST_MAX = 25;
const STALE_DAYS = 60;
const MIN_PER_KIND = 25;
const MIN_IDEAS_PER_BOTTLENECK = 10;

/** Build-time inputs that are not part of the graph: generated snapshots under public/. */
type Ctx = { today: Date; provenance: Set<string>; papers: Set<string>; trials: Set<string>; logos: Set<string> };

function keysOf(file: string, pick?: (j: unknown) => Record<string, unknown>): Set<string> {
  const p = join(process.cwd(), "public", file);
  if (!existsSync(p)) return new Set();
  try {
    const j = JSON.parse(readFileSync(p, "utf8")) as unknown;
    return new Set(Object.keys(pick ? pick(j) : (j as Record<string, unknown>)));
  } catch {
    return new Set();
  }
}

function off(e: Entity, detail?: string): Offender {
  return { id: e.id, name: e.name, route: routeFor(e), detail };
}

/** Records in `list` that fail `fails`; failing sorted by `badness` descending when given. */
function fails<E extends Entity>(list: E[], test: (e: E) => string | null | false, badness?: (e: E) => number): CheckResult {
  const failing: Array<{ e: E; d: string | null | false }> = [];
  for (const e of list) { const d = test(e); if (d !== null && d !== false) failing.push({ e, d }); }
  if (badness) failing.sort((a, b) => badness(b.e) - badness(a.e));
  return { total: list.length, failing: failing.map(({ e, d }) => off(e, d || undefined)) };
}

/** Which kinds matter most when the same gap appears everywhere: a cancer without a source outranks an idea without one. */
const KIND_PRIORITY: Kind[] = ["cancer", "drug", "target", "trial", "technology", "pathway", "company", "institution", "person", "paper", "journal", "collection", "bottleneck", "roadmap", "pairing", "term", "idea", "section"];
const prio = (e: Entity) => KIND_PRIORITY.length - KIND_PRIORITY.indexOf(e.kind);

const daysSince = (iso: string, now: Date) => Math.floor((now.getTime() - new Date(iso).getTime()) / 86400000);
const endsWithStop = (s: string) => /[.!?]["')\]]?\s*$/.test(s);

/**
 * Modalities that legitimately have no small-molecule drawing (mirrors placeholderKind in
 * components/MoleculeSlot.tsx, which cannot be imported here because that module is client-only).
 */
/** Mirrors the modality groups in components/MoleculeSlot.tsx (placeholderKind); keep the two in step. */
const EXPLAINED_PLACEHOLDER = /antibody-drug|adc|conjugate|bispecific|engager|antibody|mab\b|checkpoint|car-t|car t|tcr|til\b|cell therapy|cell-therapy|nk cell|lymphocyte|vaccine|mrna|oncolytic|virus|gene therapy|bacteri|oligonucleotide|nucleic acid|radioligand|radiopharm|isotope|lutetium|actinium|radium|iodine|alpha therapy|emitter|test|assay|diagnostic|sequencing|panel|classifier|device|software|imaging|cytokine|fusion|enzyme|protein|peptide|hormone analogue|recombinant|erythropoietin|interferon|growth factor|colony-stimulating|interleukin|il-\d|superagonist|toxin|nanoparticle|not yet disclosed|undisclosed/i;

const APPROVED = new Set(["approved", "standard-of-care"]);

export const METRIC_DEFS: MetricDef[] = [
  {
    id: "sources", label: "Records with a primary source",
    plain: "Every record should cite at least one external source (a label, paper, registry, or regulator page) so a reader can check it.",
    action: "Add a `links` entry with a primary source URL and a label. For trials an `nct` id counts.",
    check: (g) => fails(g.entities, (e) => (e.links.length === 0 && !(e.kind === "trial" && e.nct) ? (e.wikipedia ? "Wikipedia only" : "no source") : null), (e) => (e.wikipedia ? 0 : 100) + prio(e)),
  },
  {
    id: "backlinks", label: "Records with three or more relations",
    plain: "A hub is made of links: a record with fewer than three relations is a dead end for readers and invisible to the graph tools.",
    action: "Add ids to the typed relation arrays (`cancers`, `targets`, `drugs`, `trials`, `terms`...) on this record or on the records that should point to it.",
    check: (g) => fails(g.entities.filter((e) => e.kind !== "section"), (e) => { const d = g.degree(e.id); return d < 3 ? `${d} relation${d === 1 ? "" : "s"}` : null; }, (e) => (3 - g.degree(e.id)) * 100 + prio(e)),
  },
  {
    id: "orphans", label: "Records something links to",
    plain: "A record nothing links to can only be found by search; it should be referenced by at least one other page.",
    action: "Find the cancer, product, trial, or idea this record belongs with and add this id to its relation arrays.",
    check: (g) => fails(g.entities.filter((e) => e.kind !== "section"), (e) => (g.incoming(e.id).size === 0 ? "no incoming links" : null), prio),
  },
  {
    id: "tldr", label: "TL;DRs that are full sentences",
    plain: "The plain-language TL;DR is the first thing a patient reads; it should be at least one complete sentence of 60 characters or more.",
    action: "Rewrite `tldr` as one or two plain sentences ending in a full stop; no jargon, no fragments.",
    check: (g) => fails(g.entities, (e) => (e.tldr.trim().length < 60 ? `${e.tldr.trim().length} characters` : !endsWithStop(e.tldr) ? "no full stop" : null), (e) => 1000 - e.tldr.length),
  },
  {
    id: "summary", label: "Summaries of 300 characters or more",
    plain: "The technical summary should say what the thing is, how it works, and what the evidence shows; under 300 characters it cannot.",
    action: "Expand `summary` with mechanism, evidence, and open questions, in paragraphs separated by blank lines.",
    check: (g) => fails(g.entities, (e) => (e.summary.trim().length < 300 ? `${e.summary.trim().length} characters` : null), (e) => (300 - e.summary.length) * 100 + prio(e)),
  },
  {
    id: "cancer-depth", label: "Cancers with a deep dive", kind: "cancer",
    plain: "Every cancer page should reach TNBC depth: at least three standard-of-care settings, three history events, and a pipeline.",
    action: "Add `standardOfCare` rows by setting with refs, `history` events with refs, and `pipeline` ids; see cancers.ts for the TNBC model.",
    check: (g) => fails(g.kind("cancer"), (c) => {
      const why = [c.standardOfCare.length < 3 ? `${c.standardOfCare.length} standard-of-care rows` : null, c.history.length < 3 ? `${c.history.length} history events` : null, c.pipeline.length === 0 ? "empty pipeline" : null].filter(Boolean);
      return why.length ? why.join(", ") : null;
    }, (c) => -(c.standardOfCare.length + c.history.length + c.pipeline.length)),
  },
  {
    id: "regional-approvals", label: "Approved products with regional rows", kind: "drug",
    plain: "An approved product should say where it is approved (US, EU, UK, Japan, China, Australia), not just that it is; at minimum the FDA or EMA verdict, unless the product is approved only elsewhere.",
    action: "Add a row for this product in regional-approvals.ts with a regulator source per region (US or EU at least).",
    check: (g) => fails(g.kind("drug").filter((d) => APPROVED.has(d.status ?? "") && !isDiagnostic(d.modality)), (d) => { const row = regionalApprovals[d.id]; return !row ? (hasAnchorApproval(d) ? null : "no regional row") : row.US || row.EU || regionSpecific(row) ? null : "no US or EU row"; }),
  },
  {
    id: "molecules", label: "Products with a molecule or an explained placeholder", kind: "drug",
    plain: "Small molecules should rotate on their page; biologics, cells, and tests should show a placeholder that says why there is no molecule.",
    action: "Add the product to structures.ts (PubChem CID or PDB id) and run `npm run fetch:structures`, or set a `modality` the placeholder recognises.",
    check: (g) => fails(g.kind("drug"), (d) => (hasMolecule(d.id) || EXPLAINED_PLACEHOLDER.test(d.modality) ? null : `modality "${d.modality}" has no structure or placeholder`)),
  },
  {
    id: "schematics", label: "Technologies with a specific schematic", kind: "technology",
    plain: "Each technology page should show a wireframe schematic of its mechanism, its own or an aliased drawing of the same process, not the generic one borrowed from its front.",
    action: "Add a builder for this id in data/schematics.ts (static) or data/animated.ts (animated).",
    target: 80,
    check: (g) => { const specific = new Set(SPECIFIC_IDS); return fails(g.kind("technology"), (t) => (hasAnimation(t.id) || specific.has(t.id) || (t.id in SCHEMATIC_ALIAS && (specific.has(SCHEMATIC_ALIAS[t.id]) || hasAnimation(SCHEMATIC_ALIAS[t.id]))) ? null : "generic schematic")); },
  },
  {
    id: "target-prevalence", label: "Targets with sourced prevalence", kind: "target",
    plain: "For each target we should say how common it is in each cancer, with a source, so the prevalence matrix is complete.",
    action: "Add `prevalence` rows ({ cancerId, pct, measure, source }) to the target record.",
    check: (g) => fails(g.kind("target"), (t) => (t.prevalence.length === 0 ? "no prevalence rows" : null)),
  },
  {
    id: "trial-outcomes", label: "Trials with structured outcomes", kind: "trial",
    plain: "Every trial should carry arms, N, endpoints, and hazard ratios so pictograms and evidence scores can render.",
    action: "Add an entry in trial-outcomes.ts with the primary endpoint, arms, and the source publication.",
    // Only trials that have reported can carry outcomes; recruiting, active and planned trials are not gaps.
    check: (g) => fails(g.kind("trial").filter((t) => ["positive", "negative", "mixed", "completed", "approved", "standard-of-care", "withdrawn"].includes(t.status ?? "")), (t) => (t.outcomes.length === 0 ? (t.result ? "result text only" : "no outcomes") : null), (t) => (t.result ? 0 : 1)),
  },
  {
    id: "institution-people", label: "Institutions with people", kind: "institution",
    plain: "An institution page should name the clinicians and scientists who work there.",
    action: "Add person records under data/people/ with `institutionId` set to this institution.",
    target: 80,
    check: (g) => fails(g.kind("institution"), (i) => ((g.incoming(i.id).get("person") ?? []).length === 0 ? "no people" : null)),
  },
  {
    id: "people-papers", label: "People with papers", kind: "person",
    plain: "A person record should list selected publications so the claim of expertise can be checked.",
    action: "Add `papers` entries (title, journal, year, url or doi) to the person record.",
    check: (g) => fails(g.kind("person"), (p) => (p.papers.length === 0 ? "no papers" : null)),
  },
  {
    id: "bottleneck-ideas", label: "Bottlenecks with ten or more ideas", kind: "bottleneck",
    plain: "Each bottleneck should have at least ten ideas attacking it; fewer means the ideas board has not reached it yet.",
    action: "Add idea records under data/ideas-waves/ with this bottleneck id in `bottlenecks`.",
    check: (g) => fails(g.kind("bottleneck"), (b) => { const n = (g.incoming(b.id).get("idea") ?? []).length; return n < MIN_IDEAS_PER_BOTTLENECK ? `${n} idea${n === 1 ? "" : "s"}` : null; }, (b) => -(g.incoming(b.id).get("idea") ?? []).length),
  },
  {
    id: "term-wikipedia", label: "Terms with a Wikipedia link", kind: "term",
    plain: "Glossary terms promise a Wikipedia link for readers who want the long version.",
    action: "Set `wikipedia` on the term record to the matching article URL.",
    check: (g) => fails(g.kind("term"), (t) => (t.wikipedia ? null : "no Wikipedia link")),
  },
  {
    id: "stale", label: `Records checked in the last ${STALE_DAYS} days`,
    plain: `Every record says when its facts were last checked (asOf); older than ${STALE_DAYS} days means nobody has looked recently.`,
    action: "Re-verify the record against its sources and update `asOf`; if something changed, log it in CORRECTIONS.md.",
    target: 90,
    check: (g, ctx) => fails(g.entities, (e) => { const d = daysSince(e.asOf, ctx.today); return d > STALE_DAYS ? `${d} days (${e.asOf})` : null; }, (e) => daysSince(e.asOf, ctx.today)),
  },
  {
    id: "kind-size", label: `Kinds with ${MIN_PER_KIND} or more records`,
    plain: `A kind with fewer than ${MIN_PER_KIND} records is a placeholder, not a collection.`,
    action: "Run a per-kind expansion wave: enumerate the universe, diff against the corpus, add records with sources.",
    check: (g) => {
      const failing = KINDS.filter((k) => g.kind(k).length < MIN_PER_KIND).sort((a, b) => g.kind(a).length - g.kind(b).length)
        .map((k) => ({ id: k, name: KIND_META[k].title ?? KIND_META[k].plural, route: `/${KIND_META[k].route}/`, detail: `${g.kind(k).length} records` }));
      return { total: KINDS.length, failing };
    },
  },
  {
    id: "reviewed", label: "Records with a review badge",
    plain: "Pages should carry a named expert or patient-advocate reviewer with a date and a conflict-of-interest statement.",
    action: "Recruit a reviewer for this record and add an entry to data/reviews.ts (track, reviewer, role, date, coi).",
    target: 10,
    check: (g) => fails(g.entities.filter((e) => e.kind !== "section"), (e) => ((reviews[e.id] ?? []).length ? null : "not reviewed")),
  },
  {
    id: "simple", label: "Records with a simple explanation",
    plain: "The 'simple' reading layer (about a 12-year-old reading age) needs its own text on every record.",
    action: "Add a sentence for this id in the next data/simple/part-*.ts file (see src/data/simple.ts for the registered parts).",
    target: 80,
    check: (g) => fails(g.entities, (e) => (e.simple || simple[e.id] ? null : "no simple text")),
  },
  {
    id: "translations", label: "Records with a TL;DR in all eight languages",
    plain: "Multilingual TL;DRs (Spanish, Mandarin, Portuguese, Hindi, French, German, Japanese, Arabic) count only where every language has a translation for the record.",
    action: "Add the TL;DR translation for this id in data/i18n/{es,zh,pt,hi,fr,de,ja,ar}.ts, marked machine-assisted until reviewed.",
    target: 50,
    check: (g) => fails(g.entities, (e) => { const missing = [["es", tldr_es], ["zh", tldr_zh], ["pt", tldr_pt], ["hi", tldr_hi], ["fr", tldr_fr], ["de", tldr_de], ["ja", tldr_ja], ["ar", tldr_ar]].filter(([, t]) => !(t as Record<string, string>)[e.id]).map(([c]) => c); return missing.length ? `missing ${missing.join(", ")}` : null; }, (e) => [tldr_es, tldr_zh, tldr_pt, tldr_hi].filter((t) => !t[e.id]).length),
  },
  {
    id: "provenance", label: "Records with git provenance",
    plain: "Every page should show its last commit, author, and diff; that comes from public/provenance.json, rebuilt weekly.",
    action: "Run `npm run provenance` (the weekly fact-check workflow does this) so new records get a provenance line.",
    check: (g, ctx) => fails(g.entities, (e) => (ctx.provenance.has(e.id) ? null : "no provenance entry")),
  },
  {
    id: "papers-snapshot", label: "Records with a Europe PMC snapshot",
    plain: "Drug, target, cancer, and technology pages show what the literature is publishing; that needs a snapshot per record.",
    action: "Run `npm run fetch:papers` (weekly workflow) so new records are included in public/papers/.",
    check: (g, ctx) => fails(g.entities.filter((e) => ["drug", "target", "cancer", "technology"].includes(e.kind)), (e) => (ctx.papers.has(e.id) ? null : "no papers snapshot")),
  },
  {
    id: "trials-snapshot", label: "Products with a ClinicalTrials.gov snapshot", kind: "drug",
    plain: "The pipeline tracker should show live phase 2/3 counts for every product, not just the ones it was first run on.",
    action: "Run `npm run fetch:trials` (weekly workflow) for the missing products; check the query term if a product returns nothing.",
    check: (g, ctx) => fails(g.kind("drug"), (d) => (ctx.trials.has(d.id) ? null : "no trials snapshot")),
  },
  {
    id: "logos", label: "Organisations with a logo",
    plain: "Companies, institutions, and collections should show a self-hosted logo so lists are scannable.",
    action: "Run `npm run fetch:logos`; add a Wikidata QID override in the script if the automatic match fails.",
    target: 90,
    check: (g, ctx) => fails(g.entities.filter((e) => ["company", "institution", "collection"].includes(e.kind)), (e) => (ctx.logos.has(e.id) ? null : "no logo")),
  },
  {
    id: "completeness", label: "External denominators at least half covered",
    plain: "Each scope on /completeness/ sets OnCo's count against a sourced count of what exists (FDA-approved cancer drugs, NCI centres, OECI members, oncology journals); this counts the scopes where OnCo holds at least half.",
    action: "Open /completeness/, pick the scope, and add the missing items through the prefilled new-object forms (or add an alias to a record the matcher missed).",
    target: 50,
    check: () => {
      const rows = completeness().filter((c) => c.pct !== null && c.den.total !== null);
      const failing = rows.filter((c) => (c.pct ?? 0) < 50).sort((a, b) => (a.pct ?? 0) - (b.pct ?? 0)).map((c) => ({ id: c.den.id, name: c.den.scope, route: `/completeness/#${c.den.id}`, detail: `${c.ours.toLocaleString("en-GB")} of ${c.den.approx ? "about " : ""}${(c.den.total ?? 0).toLocaleString("en-GB")} (${c.pct}%)` }));
      return { total: rows.length, failing };
    },
  },
];

function issueUrl(m: Omit<HealthMetric, "issueUrl">): string {
  const body = [
    `Metric: **${m.label}** (\`${m.id}\`) is at ${m.value}/${m.total} (${m.pct}%; target ${m.target}%).`, "",
    m.plain, "", `What to do: ${m.action}`, "",
    m.worst.length ? `Worst offenders:\n${m.worst.slice(0, 10).map((w) => `- \`${w.id}\`${w.detail ? ` (${w.detail})` : ""}`).join("\n")}` : "",
    "", `Gauge: https://onco.cc/roadmap/#metric-${m.id}`, `Check: ${m.code}`,
  ].join("\n");
  const p = new URLSearchParams({ title: `gap: ${m.label}`, labels: "gap,help wanted", body });
  return `${REPO}/issues/new?${p.toString()}`;
}

let cached: HealthMetric[] | undefined;

/** All metrics, computed once per build. */
export function health(now = new Date()): HealthMetric[] {
  if (cached) return cached;
  const g = graph();
  const ctx: Ctx = {
    today: now,
    provenance: keysOf("provenance.json"),
    papers: keysOf("papers/index.json", (j) => ((j as { entities?: Record<string, unknown> }).entities ?? {})),
    trials: keysOf("trials/index.json"),
    logos: keysOf("logos/index.json"),
  };
  cached = METRIC_DEFS.map((d) => {
    const { total, failing } = d.check(g, ctx);
    const value = total - failing.length;
    const pct = total === 0 ? 100 : Math.round((value / total) * 1000) / 10;
    const target = d.target ?? 95;
    const base = { id: d.id, label: d.label, plain: d.plain, value, total, pct, target, met: pct >= target, kind: d.kind, worst: failing.slice(0, WORST_MAX), action: d.action, code: `${REPO}/blob/main/src/lib/health.ts` };
    return { ...base, issueUrl: issueUrl(base) };
  });
  return cached;
}

export function metric(id: string): HealthMetric | undefined {
  return health().find((m) => m.id === id);
}
