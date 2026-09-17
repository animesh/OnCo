import { graph } from "./graph";
import { routeFor, type Cancer, type Entity } from "./schema";
import { lineOf, LINE_LABEL, type Line } from "./sequencing";
import { evidenceFor } from "./evidence";
import { singleFlags, type SingleFlag } from "./interactions";
import { questionsFor } from "./questions";
import type { Question } from "@/data/questions";

/**
 * Decision pages (roadmap item 107): one section per standard-of-care row of a cancer, laying out the options
 * the row names, what each is for (the referenced records' TL;DRs), the evidence behind them (the trials in
 * `refs` with their recorded result), the trade-offs the corpus records for each option (label or trial
 * toxicities with a source, interaction flags, a technology's own limitations) and questions to ask.
 *
 * Pure builders over a lookup function so the tests can feed synthetic records; `decisionsFor` wires the graph.
 * No figure is invented here: every number is copied from a record field that carries its own source.
 */

export type Lookup = (id: string) => Entity | undefined;

export type SideEffect = { event: string; anyGradePct?: number; grade3PlusPct?: number; source?: string; note?: string };

export type DecisionOption = {
  id: string;
  name: string;
  route: string;
  kind: "drug" | "technology";
  tldr: string;
  status?: string;
  /** Drug modality ("ADC", "small molecule") or technology generation, for the pill. */
  modality?: string;
  /** Worst recorded toxicities, highest grade 3+ rate first; only rows carrying a source. */
  sideEffects: SideEffect[];
  /** Interaction flags from the interaction data (food, QT, liver, kidney) and a technology's recorded limitations. */
  cautions: string[];
  /** A technology's recorded strengths. */
  strengths: string[];
};

export type OutcomeArm = { name: string; value?: number; n?: number; note?: string };
export type DecisionEvidence = {
  id: string;
  name: string;
  route: string;
  nct?: string;
  phase: string;
  setting: string;
  result?: string;
  yearReported?: number;
  enrolled?: number;
  /** Evidence-strength score 0-100 from src/lib/evidence.ts, or null when not scorable. */
  evidence: number | null;
  /** The primary endpoint (or the first recorded one) with its arms. */
  primary?: { endpoint: string; unit?: string; arms: OutcomeArm[]; hr?: number; source?: string };
  /** Options in this section the trial is linked to. */
  optionIds: string[];
};

/** A ref that is neither an option nor a trial: a target, a term, a pairing, a paper. Shown as context. */
export type DecisionContext = { id: string; name: string; route: string; kind: Entity["kind"]; tldr: string };

export type DecisionSection = {
  /** URL-safe anchor, unique within the cancer. */
  id: string;
  setting: string;
  approach: string;
  line: Line;
  lineLabel: string;
  options: DecisionOption[];
  evidence: DecisionEvidence[];
  context: DecisionContext[];
  questions: Question[];
  guideline?: Cancer["standardOfCare"][number]["guideline"];
  /** Fewer than two options named: the page shows the single path plainly. */
  singlePath: boolean;
};

export type DecisionPage = {
  cancer: { id: string; name: string; route: string; group: string };
  sections: DecisionSection[];
  /** Sections carrying at least two options. */
  forks: number;
};

export function slugify(s: string): string {
  return s.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "setting";
}

/** Anchors for each row's setting, made unique with a numeric suffix where two rows share a setting. */
export function sectionIds(settings: readonly string[]): string[] {
  const seen = new Map<string, number>();
  return settings.map((s) => {
    const base = slugify(s);
    const n = seen.get(base) ?? 0;
    seen.set(base, n + 1);
    return n === 0 ? base : `${base}-${n + 1}`;
  });
}

const MAX_SIDE_EFFECTS = 4;

function optionFrom(e: Entity, flags: (id: string) => SingleFlag[]): DecisionOption | null {
  if (e.kind === "drug") {
    const sideEffects = e.toxicity
      .filter((t) => t.source && (t.grade3PlusPct !== undefined || t.anyGradePct !== undefined))
      .sort((a, b) => (b.grade3PlusPct ?? -1) - (a.grade3PlusPct ?? -1) || (b.anyGradePct ?? -1) - (a.anyGradePct ?? -1))
      .slice(0, MAX_SIDE_EFFECTS)
      .map((t) => ({ event: t.event, anyGradePct: t.anyGradePct, grade3PlusPct: t.grade3PlusPct, source: t.source, note: t.note }));
    const cautions = flags(e.id).map((f) => f.text);
    return { id: e.id, name: e.name, route: routeFor(e), kind: "drug", tldr: e.tldr, status: e.status, modality: e.modality, sideEffects, cautions, strengths: [] };
  }
  if (e.kind === "technology") {
    return { id: e.id, name: e.name, route: routeFor(e), kind: "technology", tldr: e.tldr, status: e.status, modality: e.generation, sideEffects: [], cautions: e.limitations.slice(0, 3), strengths: e.strengths.slice(0, 3) };
  }
  return null;
}

function evidenceFrom(e: Extract<Entity, { kind: "trial" }>, optionIds: string[]): DecisionEvidence {
  const o = e.outcomes.find((x) => x.primary) ?? e.outcomes[0];
  const linked = optionIds.filter((id) => e.drugs.includes(id) || e.technologies.includes(id));
  return {
    id: e.id, name: e.name, route: routeFor(e), nct: e.nct, phase: e.phase, setting: e.setting, result: e.result, yearReported: e.yearReported, enrolled: e.enrolled,
    evidence: evidenceFor(e)?.score ?? null,
    primary: o ? { endpoint: o.endpoint, unit: o.unit, arms: o.arms.map((a) => ({ name: a.name, value: a.value, n: a.n, note: a.note })), hr: o.hr, source: o.source } : undefined,
    optionIds: linked,
  };
}

/** Questions generated from the shape of one decision: how many options, whether trials and toxicities are recorded. */
export function decisionQuestions(s: Pick<DecisionSection, "setting" | "options" | "evidence" | "guideline" | "singlePath">): Question[] {
  const out: Question[] = [];
  const names = s.options.map((o) => o.name);
  const setting = s.setting;
  if (s.options.length >= 2) {
    const list = names.length > 3 ? `${names.slice(0, 3).join(", ")} and the other options` : names.length === 2 ? names.join(" and ") : `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
    out.push({ setting, question: `Between ${list}, which do you recommend for me, and what about my case would make you choose differently?`, why: "Guidelines list several reasonable options; the choice turns on details of your tumour, your health and your priorities." });
  } else if (s.options.length === 1) {
    out.push({ setting, question: `Is ${names[0]} the only reasonable path for me, or is there a trial, a different sequence or a wait-and-see option?`, why: "A single standard does not mean a single choice; timing and trials are decisions too." });
  } else {
    out.push({ setting, question: "Which specific treatments are you proposing for this setting, and what are the alternatives?", why: "The standard of care here is described in words rather than named products; ask for the names." });
  }
  out.push({ setting, question: "What is each option trying to achieve: cure, long control, or relief of symptoms, and over what time?", why: "The aim shapes how much side effect and disruption is worth accepting." });
  if (s.evidence.length) {
    const t = s.evidence.slice(0, 2).map((e) => e.name).join(" and ");
    out.push({ setting, question: `How closely do I match the people in ${t}, and does that change what the results mean for me?`, why: "Trial populations are selected; age, fitness, prior treatment and biomarkers all affect how far results carry." });
  }
  const withTox = s.options.filter((o) => o.sideEffects.length);
  if (withTox.length) {
    out.push({ setting, question: `Which side effects of ${withTox.slice(0, 2).map((o) => o.name).join(" or ")} are most likely for me, which are reversible, and which would make us stop?`, why: "The recorded rates below come from labels and trials; your own risk depends on dose, other medicines and your health." });
  }
  out.push({ setting, question: "What happens if I delay, or decline this step for now? Is the decision reversible?", why: "Some decisions can wait for a second opinion or a trial slot; others cannot. Knowing which is part of the choice." });
  if (s.guideline?.version || s.guideline?.nccn || s.guideline?.esmoMcbs) {
    out.push({ setting, question: `Does your recommendation follow the current guideline${s.guideline.version ? ` (${s.guideline.version})` : ""}, and if it departs from it, why?`, why: "Departures from guidelines are sometimes right for an individual; they should be explained." });
  }
  return out;
}

/**
 * Build the decision sections for a cancer's standard-of-care rows.
 * `lookup` resolves ids to records; `flags` supplies interaction flags for a drug id (defaults to the corpus rules);
 * `extraQuestions` are appended to each section where their `setting` matches the row.
 */
export function buildDecisionSections(
  rows: Cancer["standardOfCare"],
  lookup: Lookup,
  opts: { flags?: (id: string) => SingleFlag[]; extraQuestions?: Question[] } = {},
): DecisionSection[] {
  const flags = opts.flags ?? ((id: string) => singleFlags([id]));
  const ids = sectionIds(rows.map((r) => r.setting));
  return rows.map((row, i) => {
    const refs = row.refs.map((id) => lookup(id)).filter((e): e is Entity => !!e);
    const options = refs.map((e) => optionFrom(e, flags)).filter((o): o is DecisionOption => !!o);
    const optionIds = options.map((o) => o.id);
    const evidence = refs.filter((e): e is Extract<Entity, { kind: "trial" }> => e.kind === "trial").map((t) => evidenceFrom(t, optionIds));
    const context = refs.filter((e) => e.kind !== "drug" && e.kind !== "technology" && e.kind !== "trial").map((e) => ({ id: e.id, name: e.name, route: routeFor(e), kind: e.kind, tldr: e.tldr }));
    const line = lineOf(row.setting);
    const partial = { setting: row.setting, options, evidence, guideline: row.guideline, singlePath: options.length < 2 };
    const seen = new Set<string>();
    const questions = [...decisionQuestions(partial), ...(opts.extraQuestions ?? []).filter((q) => q.setting === row.setting)].filter((q) => { const k = q.question.toLowerCase(); if (seen.has(k)) return false; seen.add(k); return true; });
    return { id: ids[i], setting: row.setting, approach: row.approach, line, lineLabel: LINE_LABEL[line], options, evidence, context, questions, guideline: row.guideline, singlePath: options.length < 2 };
  });
}

/** Decision page for one cancer, or null when the id is not a cancer or it has no standard-of-care rows. */
export function decisionsFor(cancerId: string): DecisionPage | null {
  const g = graph();
  const c = g.get(cancerId);
  if (!c || c.kind !== "cancer" || !c.standardOfCare.length) return null;
  const sections = buildDecisionSections(c.standardOfCare, (id) => g.get(id), { extraQuestions: questionsFor(c).items });
  return { cancer: { id: c.id, name: c.name, route: routeFor(c), group: c.group }, sections, forks: sections.filter((s) => !s.singlePath).length };
}

/** Every cancer with a decision page, for static params and the cancer index. */
export function decisionCancerIds(): string[] {
  return graph().kind("cancer").filter((c) => c.standardOfCare.length).map((c) => c.id);
}

export function decisionsRoute(cancerId: string, sectionId?: string): string {
  return `/cancers/${cancerId}/decisions/${sectionId ? `#${sectionId}` : ""}`;
}
