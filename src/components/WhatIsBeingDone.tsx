import Link from "next/link";
import type { Entity } from "@/lib/schema";
import { routeFor } from "@/lib/schema";
import { graph } from "@/lib/graph";
import { statusClass } from "@/lib/text";
import { StatusName, TL } from "./T";

/**
 * Pairs a problem with the work on it. Given a problem topic (or a free-text problem sentence), assembles
 * from the graph the technologies and products available now, the products and trials in progress, and the
 * ideas and roadmaps that address it, plus the bottleneck page that explains how the field plans to fix it.
 * Everything comes from existing records via term aliases, tags and relations; nothing is invented, and if
 * nothing in the corpus matches the topic the component renders nothing. Server-safe (uses graph()).
 */
export type ProblemTopic = "recurrence" | "spread" | "resistance" | "side-effects" | "late-diagnosis" | "access" | "rare" | "no-target";

type TopicMeta = {
  label: string;
  /** One calm sentence framing the problem and the direction of travel. */
  frame: string;
  /** Bottleneck ids: the first is linked as "how the field plans to fix it"; all seed the pool. */
  bottlenecks: string[];
  /** Entity ids that address the problem directly (checked against the graph at render time). */
  seeds: string[];
  /** Words that identify the topic in free text (open problems, notes, summaries). */
  keywords: RegExp;
  /** Pages on OnCo that go deeper. */
  pages: Array<{ label: string; href: string }>;
  /** Some bottleneck records list the technologies that cause the problem (toxicity, price); skip those relations. */
  skipBottleneckRelations?: boolean;
};

export const TOPICS: Record<ProblemTopic, TopicMeta> = {
  recurrence: {
    label: "Recurrence and residual disease",
    frame: "Adjuvant therapy exists to remove the cells that surgery leaves behind, and blood tests for residual disease now find them months before a scan would.",
    bottlenecks: ["b-dormancy-mrd"],
    seeds: ["mrd-testing", "liquid-biopsy", "ngs-mrd-clonoseq", "flow-cytometry-mrd", "ctdna-lymphoma-monitoring", "signatera", "neoantigen-mrna-vaccine", "shared-antigen-vaccine", "structured-exercise-survivorship", "dynamic", "circulate-japan", "imvigor011", "cambria", "natalee", "monarche", "olympia", "adaura", "keynote-522", "mrd", "ctdna", "late-recurrence", "relapse-recurrence", "neoadjuvant-adjuvant", "tumor-dormancy", "disseminated-tumor-cells"],
    keywords: /\b(recurr\w*|relaps\w*|residual disease|minimal residual|molecular residual|\bmrd\b|dorman\w*|come back|came back|disease-free|microscopic disease)/i,
    pages: [{ label: "Treatment journeys", href: "/journeys/" }, { label: "Survivorship planner", href: "/survivorship/" }],
  },
  spread: {
    label: "Advanced and metastatic disease",
    frame: "Most drugs approved in the last decade were approved for advanced disease, and imaging now finds spread earlier and treats a few sites with focused radiotherapy.",
    bottlenecks: ["b-metastasis-biology", "b-brain-delivery"],
    seeds: ["sbrt", "radioligand-therapy", "targeted-alpha-therapy", "psma-pet", "whole-body-mri", "pet-ct", "liquid-biopsy", "hipec", "bone-modifying-agents", "radioembolisation-tare", "bbb-focused-ultrasound", "thermal-ablation", "radium-223", "pluvicto", "tucatinib", "trastuzumab-deruxtecan", "mslt-ii", "oligometastatic", "oligoprogression", "metastasis", "peritoneal-metastasis", "emt", "organ-tropism-seed-soil", "blood-brain-barrier-metastasis", "activating-invasion-metastasis"],
    keywords: /\b(metasta\w*|spread\w*|advanced disease|stage iv|stage 4|distant|secondary (cancer|tumour)|disseminat\w*|brain (lesion|involvement)|leptomening\w*|peritoneal)/i,
    pages: [{ label: "Atlas of advanced disease", href: "/atlas/spread/" }, { label: "Invasion and metastasis", href: "/mechanics/#metastasis" }],
  },
  resistance: {
    label: "Resistance to treatment",
    frame: "Each resistance route that is understood becomes a target: next-generation inhibitors, degraders, ADCs that bypass the genotype, and blood tests that catch the escaping clone early.",
    bottlenecks: ["b-resistance", "b-tumor-heterogeneity"],
    seeds: ["protac-degrader", "dual-payload-adc", "bispecific-adc", "liquid-biopsy", "kinase-inhibitors", "adc-payload-neutralizer", "single-cell-spatial", "osimertinib", "amivantamab", "camizestrant", "pirtobrutinib", "bgb-16673", "lorlatinib", "serena-6", "mariposa", "flaura2", "bruin-cll-321", "resistance", "efflux-pump", "cross-resistance", "antigen-escape", "gatekeeper-mutation", "adc-sequencing", "esr1-mutation", "c797s"],
    keywords: /\b(resist\w*|refractory|stops? working|stopped working|escape\w*|bypass|progression on|no longer (works|respond)|reversion|cross-resist\w*)/i,
    pages: [{ label: "Resistance atlas", href: "/resistance/" }, { label: "Lines of therapy", href: "/sequencing/" }],
  },
  "side-effects": {
    label: "Side effects and quality of life",
    frame: "Toxicity is now a design target: gentler conjugates, response-adapted de-escalation, and supportive care with trial evidence behind it.",
    bottlenecks: ["b-toxicity-qol", "b-cachexia-supportive"],
    seeds: ["scalp-cooling", "cardio-oncology", "exercise-oncology", "geriatric-assessment", "masked-adc", "site-specific-conjugation", "proton-therapy", "imrt-igrt", "sentinel-node", "robotic-surgery", "nutrition-screening-mnt", "structured-exercise-survivorship", "irae", "toxicity-grade", "quality-of-life", "de-escalation", "ctcae-grading", "supportive-care"],
    keywords: /\b(toxic\w*|side[- ]effect\w*|adverse|irae\w*|neuropath\w*|cardiotox\w*|quality of life|late effect\w*|cytokine release|neurotox\w*|infertil\w*|hearing loss|fatigue|nausea|morbidity|tolerab\w*)/i,
    pages: [{ label: "Side effects by symptom", href: "/side-effects/" }, { label: "Immune-related side effects", href: "/irae/" }, { label: "Toxicity compare", href: "/toxicity/" }, { label: "Survivorship planner", href: "/survivorship/" }],
    skipBottleneckRelations: true,
  },
  "late-diagnosis": {
    label: "Finding cancer earlier",
    frame: "Stage at diagnosis is the single biggest lever on outcomes, and screening, blood tests and AI-read imaging are moving it.",
    bottlenecks: ["b-early-detection"],
    seeds: ["mced", "liquid-biopsy", "fragmentomics", "low-dose-ct-screening", "radiology-ai-screening", "mammography", "colorectal-screening", "hcc-surveillance", "pancreatic-surveillance", "methylation-profiling", "hpv-vaccine", "hpv-testing", "galleri", "shield", "nhs-galleri", "pathfinder-2", "nlst-nelson", "stage-shift", "screening", "early-detection-term", "early-detection-roadmap"],
    keywords: /\b(late (diagnosis|presentation|stage)|found late|diagnosed late|screening|early detection|diagnosed at stage|present with advanced|no (screening|symptom)|stage shift|surveillance uptake|detect\w* early)/i,
    pages: [{ label: "Symptoms and red flags", href: "/symptoms/" }, { label: "Early detection roadmap", href: "/roadmaps/early-detection-roadmap/" }],
  },
  access: {
    label: "Cost and access",
    frame: "Biosimilars, generics, assistance programmes and health-technology decisions decide who actually receives what trials proved.",
    bottlenecks: ["b-drug-pricing", "b-global-access"],
    seeds: ["trastuzumab-biosimilars", "imatinib", "hpv-vaccine", "biosimilar", "accelerated-approval", "real-world-evidence", "idea-single-dose-hpv-self-sampling-elimination"],
    keywords: /\b(\bcost\w*|access\w*|afford\w*|pric\w*|low- and middle|lmic\w*|inequit\w*|dispar\w*|supply|shortage\w*|capacity|unavailable|reimburse\w*|coverage)/i,
    pages: [{ label: "Financial help", href: "/assistance/" }, { label: "Coverage by country", href: "/coverage/" }, { label: "HTA decisions", href: "/hta/" }],
    skipBottleneckRelations: true,
  },
  rare: {
    label: "Rare cancers and small trials",
    frame: "Tumour-agnostic approvals, basket trials, reference centres and international cooperative groups are how rare cancers get evidence.",
    bottlenecks: ["b-rare-cancers", "b-trial-enrolment"],
    seeds: ["ai-trial-matching", "organoids", "functional-drug-testing", "cgp", "tumour-agnostic", "basket-umbrella-platform", "orphan-drug", "centralisation", "larotrectinib", "selpercatinib", "tovorafenib", "nirogacestat", "dinutuximab"],
    keywords: /\b(\brare\b|rarity|orphan|few (patients|cases)|too rare|small trials|trial (size|feasibility)|no randomised|fragment\w* (trials|evidence)|cooperative group)/i,
    pages: [{ label: "Find a trial", href: "/find/" }, { label: "Expert centres", href: "/institutions/" }],
  },
  "no-target": {
    label: "Cancers without a drug target",
    frame: "'Undruggable' has turned out to mean 'not yet': KRAS inhibitors, degraders, antisense and vaccines against shared mutations are the first serious assault on this class.",
    bottlenecks: ["b-undruggable-targets"],
    seeds: ["kras-inhibitors", "protac-degrader", "antisense-sirna", "synthetic-lethality-approaches", "ai-drug-design", "shared-antigen-vaccine", "crispr-screens", "sotorasib", "adagrasib", "daraxonrasib", "zoldonrasib", "revumenib", "eli-002-7p", "rasolute-302", "kras-roadmap"],
    keywords: /\b(undrugg\w*|undrugged|no (targeted|approved|effective) (therap\w*|drug\w*|option\w*|inhibitor)|no target\w*|no drug\w*|lacks? targets|few targets|beyond (egfr|pd-1)|transcription factor|no (new )?first-line regimen)/i,
    pages: [{ label: "Targets", href: "/targets/" }, { label: "KRAS roadmap", href: "/roadmaps/kras-roadmap/" }],
  },
};

const TOPIC_IDS = Object.keys(TOPICS) as ProblemTopic[];

/** Topics mentioned in a free-text problem sentence, most specific first, at most `max`. */
export function topicsForText(text: string, max = 2): ProblemTopic[] {
  const hits: Array<[ProblemTopic, number]> = [];
  for (const id of TOPIC_IDS) {
    const m = text.match(TOPICS[id].keywords);
    if (m) hits.push([id, m.index ?? 0]);
  }
  return hits.sort((a, b) => a[1] - b[1]).slice(0, max).map(([id]) => id);
}

/** Resolve a topic id or a free-text sentence to a topic; undefined when nothing matches. */
export function topicFor(input: string): ProblemTopic | undefined {
  if ((TOPIC_IDS as string[]).includes(input)) return input as ProblemTopic;
  return topicsForText(input, 1)[0];
}

const NOW = new Set(["approved", "standard-of-care", "established"]);
const LATER = new Set(["phase-3", "phase-2", "phase-1", "recruiting", "active", "positive", "completed", "planned", "emerging", "preclinical", "mixed"]);
const SKIP = new Set(["negative", "withdrawn", "historic"]);
const LIMIT = 6;

type Assembled = { now: Entity[]; trials: Entity[]; ideas: Entity[]; background: Entity[]; bottleneck?: Entity };

/** The assembled lists behind the card, exported so scripts and tests can check what each topic resolves to. */
export function assembleTopic(topic: ProblemTopic, cancerId?: string): Assembled | null {
  const g = graph();
  const meta = TOPICS[topic];
  const pool = new Map<string, Entity>();
  const add = (id: string | undefined) => { if (!id) return; const e = g.get(id); if (e && !pool.has(e.id)) pool.set(e.id, e); };
  meta.seeds.forEach(add);
  for (const bid of meta.bottlenecks) {
    const b = g.get(bid);
    if (!b) continue;
    if (!meta.skipBottleneckRelations) [...b.technologies, ...b.drugs, ...b.trials, ...b.terms, ...b.pathways].forEach(add);
    b.related.forEach(add);
    for (const [kind, list] of g.incoming(bid)) if (["idea", "trial", "collection", "roadmap"].includes(kind) || (!meta.skipBottleneckRelations && (kind === "technology" || kind === "drug"))) list.forEach((e) => add(e.id));
  }
  // Cancer-specific additions: anything directly linked to the cancer whose own text names the problem.
  const linked = new Set<string>();
  if (cancerId && g.get(cancerId)) {
    for (const [kind, list] of g.neighbours(cancerId)) {
      for (const e of list) {
        linked.add(e.id);
        if (["drug", "technology", "trial", "idea", "roadmap"].includes(kind) && meta.keywords.test(`${e.name} ${e.tldr}`)) add(e.id);
      }
    }
  }
  const relevant = (e: Entity) => !cancerId || linked.has(e.id) || e.cancers.includes(cancerId);
  const rank = (a: Entity, b: Entity) => Number(relevant(b)) - Number(relevant(a)) || a.name.localeCompare(b.name);
  const items = [...pool.values()].filter((e) => !SKIP.has(e.status ?? "") && !meta.bottlenecks.includes(e.id) && relevant(e));
  const now = items.filter((e) => (e.kind === "drug" || e.kind === "technology") && NOW.has(e.status ?? "")).sort(rank).slice(0, LIMIT);
  const trials = items.filter((e) => e.kind === "trial" || ((e.kind === "drug" || e.kind === "technology") && LATER.has(e.status ?? ""))).sort(rank).slice(0, LIMIT);
  const ideas = items.filter((e) => e.kind === "idea" || e.kind === "roadmap" || (e.kind === "technology" && e.status === "concept")).sort(rank).slice(0, LIMIT);
  const background = items.filter((e) => e.kind === "term" || e.kind === "pathway").sort(rank).slice(0, 5);
  const bottleneck = meta.bottlenecks.map((id) => g.get(id)).find((b): b is Entity => !!b);
  if (!now.length && !trials.length && !ideas.length) return null;
  return { now, trials, ideas, background, bottleneck };
}

function Column({ title, items }: { title: string; items: Entity[] }) {
  return (
    <div className="min-w-0">
      <div className="kicker mb-1.5"><TL text={title} /></div>
      {items.length === 0 ? <p className="text-xs text-muted">Nothing recorded yet.</p> : (
        <ul className="space-y-1">
          {items.map((e) => (
            <li key={e.id} className="leading-snug">
              <Link href={routeFor(e)} className="hover:underline">{e.name}</Link>
              {e.status && <span className={`chip ms-1.5 align-middle text-[10px] ${statusClass(e.status)}`}><StatusName status={e.status} /></span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/**
 * "What is being done about this": three columns (available now, in trials, ideas and roadmaps), each item
 * linked, with the matching bottleneck page. `topic` is a topic id or a free-text problem sentence;
 * `cancerId` limits the lists to work directly linked to that cancer or explicitly tagged for it. Renders nothing when no topic matches
 * or the corpus has nothing on it.
 */
export function WhatIsBeingDone({ topic, cancerId, compact = false, className = "" }: { topic: ProblemTopic | string; cancerId?: string; compact?: boolean; className?: string }) {
  const id = topicFor(topic);
  if (!id) return null;
  const data = assembleTopic(id, cancerId);
  if (!data) return null;
  const meta = TOPICS[id];
  return (
    <div className={`card p-4 text-sm ${className}`}>
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 mb-2">
        <div>
          <div className="kicker"><TL text="What is being done about this" /></div>
          <div className="font-semibold mt-0.5">{meta.label}</div>
        </div>
        {data.bottleneck && <Link href={routeFor(data.bottleneck)} className="text-sm underline text-muted hover:text-foreground">and how the field plans to fix it →</Link>}
      </div>
      {!compact && <p className="text-sm text-foreground/85 mb-3 max-w-3xl">{meta.frame}</p>}
      <div className="grid gap-4 sm:grid-cols-3">
        <Column title="Available now" items={data.now} />
        <Column title="In trials" items={data.trials} />
        <Column title="Ideas and roadmaps" items={data.ideas} />
      </div>
      {(data.background.length > 0 || meta.pages.length > 0) && (
        <p className="text-xs text-muted mt-3 leading-relaxed">
          {data.background.length > 0 && <>Background: {data.background.map((e, i) => <span key={e.id}>{i > 0 && ", "}<Link className="underline" href={routeFor(e)}>{e.name}</Link></span>)}. </>}
          {meta.pages.length > 0 && <>Also on OnCo: {meta.pages.map((p, i) => <span key={p.href}>{i > 0 && " · "}<Link className="underline" href={p.href}>{p.label}</Link></span>)}.</>}
        </p>
      )}
    </div>
  );
}

/** One card per topic found in a free-text problem sentence (for lists of open problems). Renders nothing when no topic matches. */
export function WhatIsBeingDoneFor({ text, cancerId, max = 1 }: { text: string; cancerId?: string; max?: number }) {
  const topics = topicsForText(text, max);
  if (!topics.length) return null;
  return <div className="space-y-3">{topics.map((t) => <WhatIsBeingDone key={t} topic={t} cancerId={cancerId} compact />)}</div>;
}
