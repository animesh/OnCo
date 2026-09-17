import type { Region } from "@/data/regional-approvals";
import type { Question } from "@/data/questions";
import type { RedCard } from "./red-cards";

/**
 * "For me" from a real situation (roadmap item 101). The reader picks a cancer, then may add a treatment setting,
 * biomarkers, treatments already had, a country and whether trials are wanted. This file is the pure assembler:
 * it takes plain per-cancer data built on the server (src/lib/for-me-situation-data.ts) plus the reader's inputs
 * and returns ordered sections, each pointing at the records it was read from. It imports no corpus and no graph,
 * so the browser can run it. Every statement is copied from a record field; where the inputs match no record the
 * section says so in `empty` rather than guessing. Orientation, not medical advice.
 */

export type SituationLink = { id: string; name: string; route: string; kind?: string; tldr?: string; status?: string };

export type SituationRow = {
  /** Anchor of the matching decision section, unique within the cancer. */
  id: string;
  setting: string;
  approach: string;
  line: string;
  lineLabel: string;
  /** Position of the line in a typical course (0 = screening), for "what may come next". */
  lineRank: number;
  refs: SituationLink[];
  guideline?: string;
  guidelineUrl?: string;
  /** The standard-of-care table on the cancer page. */
  socHref: string;
  /** The decision section for this row. */
  decisionHref: string;
  /** Drugs and technologies the row names. */
  optionIds: string[];
  /** Trials the row names as evidence. */
  evidence: SituationLink[];
  questions: Question[];
};

export type RegionalNote = { status: string; year?: number; indication?: string; source?: string; note?: string };
export type SituationDrug = SituationLink & {
  modality: string;
  targets: string[];
  inStandardOfCare: boolean;
  /** Rows of src/data/regional-approvals.ts for this product. Absent region = not researched, not "not approved". */
  regional: Partial<Record<Region, RegionalNote>>;
  /** The product record's own approvals (region, year, indication). */
  anchorApprovals: Array<{ region: string; year: number; indication: string }>;
};

export type SituationBiomarker = { key: string; label: string; targets: SituationLink[] };
export type SituationTrial = SituationLink & { nct?: string; phase: string; setting: string; drugs: string[]; targets: string[] };

export type SituationData = {
  cancer: SituationLink & { group: string };
  rows: SituationRow[];
  /** The cancer record's `biomarkers` field, each resolved to the target records its wording names. */
  biomarkers: SituationBiomarker[];
  /** Drugs named in the standard of care plus drugs relevant to the cancer that aim at one of the resolved targets. */
  drugs: SituationDrug[];
  /** Trials recruiting now for this cancer. */
  trials: SituationTrial[];
  /** Red cards for the drugs in the standard of care (src/lib/red-cards.ts). */
  redCards: RedCard[];
  /** Questions not tied to one standard-of-care row ("Newly diagnosed", "Any stage"). */
  generalQuestions: Question[];
  guide: { route: string; steps: Array<{ id: string; week: string; title: string }> };
  sheet: { route: string; questions: number; terms: number; treatments: number };
  trialsRoute: string;
};

/** Reader's inputs. `setting` is a row id; `biomarkers` are keys from `SituationData.biomarkers` or NOT_TESTED. */
export type Situation = { setting?: string; biomarkers: string[]; hadTreatments: string[]; wantsTrials: boolean; diagnosedRecently: boolean; region: Region | null };

export const NOT_TESTED = "not-tested";
export const EMPTY_SITUATION: Situation = { biomarkers: [], hadTreatments: [], wantsTrials: true, diagnosedRecently: false, region: null };

export type SituationSectionId = "where" | "standard" | "biomarkers" | "trials" | "warnings" | "questions" | "first60" | "sheet";
export const SECTION_ORDER: SituationSectionId[] = ["where", "standard", "biomarkers", "trials", "warnings", "questions", "first60", "sheet"];
export const SECTION_TITLE: Record<SituationSectionId, string> = {
  where: "Where you are", standard: "What is standard for this setting", biomarkers: "What your biomarkers change", trials: "Trials that fit",
  warnings: "Warnings", questions: "Questions for your next visit", first60: "The first 60 days", sheet: "Appointment sheet",
};

export type SituationTone = "plain" | "had" | "match" | "approved" | "unknown" | "caution";
export type SituationItem = { id: string; name: string; route: string; badge?: string; tone?: SituationTone; note?: string; source?: { label: string; url: string } };
export type SituationSection = {
  id: SituationSectionId;
  title: string;
  /** One or two sentences read from the records; the first thing under the heading. */
  lead: string;
  /** Plain statement when the inputs match no record. */
  empty?: string;
  items: SituationItem[];
  questions?: Question[];
  redCards?: RedCard[];
  /** Where the section was read from. */
  links: Array<{ label: string; href: string }>;
};

const STATUS_WORD: Record<string, string> = { approved: "Approved", conditional: "Conditional approval", "under-review": "Under review", "not-filed": "Not filed", withdrawn: "Withdrawn", rejected: "Rejected" };
const TRIAL_CAP = 12;
const NEXT_CAP = 3;
const QUESTION_CAP = 10;
const PHASE_RANK: Record<string, number> = { "3": 0, "2/3": 1, platform: 2, "2": 3, "1/2": 4, "1": 5, "4": 6, observational: 7 };

export const firstSentence = (s: string) => { const m = /^(.+?[.!?])(\s|$)/.exec(s.trim()); return m ? m[1] : s.trim(); };
const list = (xs: string[]) => xs.length <= 1 ? xs.join("") : `${xs.slice(0, -1).join(", ")} and ${xs[xs.length - 1]}`;
const n = (count: number, one: string, many = `${one}s`) => `${count} ${count === 1 ? one : many}`;

/** Has the reader told OnCo anything beyond the cancer? */
export function hasSituation(s: Situation): boolean {
  return !!s.setting || s.biomarkers.length > 0 || s.hadTreatments.length > 0 || s.diagnosedRecently || !s.wantsTrials;
}

/** Gene-like tokens in a label: upper-case symbols and alterations such as EGFR, PD-L1, G12C, BRCA1; "HER2-low" and "c-MET" yield HER2 and MET. */
export function geneTokens(label: string): string[] {
  const out = new Set<string>();
  const geneLike = (t: string) => t.length >= 2 && /[A-Z]/.test(t) && /^[A-Z0-9][A-Z0-9-]*$/.test(t);
  for (const raw of label.replace(/\(.*?\)/g, " ").split(/[^A-Za-z0-9-]+/)) {
    const t = raw.replace(/^-+|-+$/g, "");
    if (geneLike(t)) out.add(t);
    else for (const part of t.split("-")) if (geneLike(part)) out.add(part);
  }
  return [...out];
}

/** Phrases of a standard-of-care setting worth looking for in a trial title: "first line", "stage ii-iii", "pd-l1 cps ≥10". Single generic words are dropped. */
const GENERIC = new Set(["metastatic", "advanced", "early", "recurrent", "relapsed", "refractory", "later", "lines", "line", "stage", "screening", "unresectable", "driver-positive", "driver-negative", "special", "other", "newly", "diagnosed", "first", "second", "third"]);
export function settingPhrases(setting: string): string[] {
  return [...new Set(setting.toLowerCase().replace(/\s*[/–-]\s*/g, "-").split(/[,;()]+|\band\b|\bor\b/).map((p) => p.trim().replace(/\s+/g, " ")).filter((p) => p.length >= 4 && !GENERIC.has(p)))];
}
const norm = (s: string) => s.toLowerCase().replace(/\s*[/–-]\s*/g, "-").replace(/\s+/g, " ");

export function rowFor(data: SituationData, s: Situation): SituationRow | undefined {
  return s.setting ? data.rows.find((r) => r.id === s.setting) : undefined;
}

/** The biomarkers the reader chose that the record knows, and whether "not tested" was chosen. */
export function chosenBiomarkers(data: SituationData, s: Situation): { chosen: SituationBiomarker[]; notTested: boolean } {
  return { chosen: data.biomarkers.filter((b) => s.biomarkers.includes(b.key)), notTested: s.biomarkers.includes(NOT_TESTED) };
}

/** Drugs whose `targets` include one of the given target ids: standard of care first, then approved, then by name. */
export function drugsForTargets(data: SituationData, targetIds: ReadonlySet<string>): SituationDrug[] {
  if (!targetIds.size) return [];
  const rank = (d: SituationDrug) => (d.inStandardOfCare ? 0 : 1) * 10 + (d.status === "approved" || d.status === "standard-of-care" ? 0 : 1);
  return data.drugs.filter((d) => d.targets.some((t) => targetIds.has(t))).sort((a, b) => rank(a) - rank(b) || a.name.localeCompare(b.name));
}

/** What the reader's regulator says about a product, read from the regional-approvals row; a plain "no record" when the region is not researched. */
export function regionalBadge(d: SituationDrug, region: Region | null): { badge: string; tone: SituationTone; source?: { label: string; url: string } } {
  if (region) {
    const e = d.regional[region];
    if (!e) return { badge: `No ${region} record`, tone: "unknown" };
    const word = STATUS_WORD[e.status] ?? e.status;
    const badge = `${word} in ${region}${e.year ? ` (${e.year})` : ""}`;
    const tone: SituationTone = e.status === "approved" || e.status === "conditional" ? "approved" : e.status === "withdrawn" || e.status === "rejected" ? "caution" : "unknown";
    return { badge, tone, source: e.source ? { label: `${region} regulator record`, url: e.source } : undefined };
  }
  const regions = (Object.keys(d.regional) as Region[]).filter((r) => { const st = d.regional[r]?.status; return st === "approved" || st === "conditional"; });
  if (regions.length) return { badge: `Approved: ${regions.join(", ")}`, tone: "approved" };
  if (d.anchorApprovals.length) return { badge: `Approved: ${[...new Set(d.anchorApprovals.map((a) => a.region))].join(", ")}`, tone: "approved" };
  return { badge: "No regulator record", tone: "unknown" };
}

export type TrialFit = { trial: SituationTrial; reasons: string[] };

/** Recruiting trials whose title or setting text names the chosen setting or a chosen biomarker, or that test a drug aimed at one of its targets. */
export function trialsThatFit(data: SituationData, row: SituationRow | undefined, chosen: SituationBiomarker[], biomarkerDrugIds: ReadonlySet<string>): TrialFit[] {
  const phrases = row ? settingPhrases(row.setting) : [];
  const tokens = chosen.flatMap((b) => geneTokens(b.label).map((t) => [b.label, t] as const));
  const targetIds = new Set(chosen.flatMap((b) => b.targets.map((t) => t.id)));
  const targetName = new Map(chosen.flatMap((b) => b.targets.map((t) => [t.id, t.name] as const)));
  const drugName = new Map(data.drugs.map((d) => [d.id, d.name]));
  const out: TrialFit[] = [];
  for (const t of data.trials) {
    const text = norm(`${t.name} ${t.setting}`);
    const reasons: string[] = [];
    for (const p of phrases) if (text.includes(norm(p))) reasons.push(`setting: "${p}"`);
    for (const [label, tok] of tokens) if (new RegExp(`(^|[^a-z0-9])${tok.toLowerCase().replace(/[-]/g, "[- ]?")}([^a-z0-9]|$)`).test(text)) reasons.push(`biomarker: ${label.replace(/\s*\(.*?\)\s*/g, "").trim()} (${tok})`);
    for (const id of t.targets) if (targetIds.has(id)) reasons.push(`target: ${targetName.get(id) ?? id}`);
    for (const id of t.drugs) if (biomarkerDrugIds.has(id)) reasons.push(`drug: ${drugName.get(id) ?? id}`);
    if (reasons.length) out.push({ trial: t, reasons: [...new Set(reasons)] });
  }
  return out.sort((a, b) => (PHASE_RANK[a.trial.phase] ?? 9) - (PHASE_RANK[b.trial.phase] ?? 9) || b.reasons.length - a.reasons.length || a.trial.name.localeCompare(b.trial.name));
}

const link = (l: SituationLink, extra: Partial<SituationItem> = {}): SituationItem => ({ id: l.id, name: l.name, route: l.route, note: l.tldr ? firstSentence(l.tldr) : undefined, ...extra });

/** Assemble the ordered sections for one cancer and one reader. Pure: same inputs, same output. */
export function assembleSituation(data: SituationData, s: Situation): SituationSection[] {
  const c = data.cancer;
  const row = rowFor(data, s);
  const { chosen, notTested } = chosenBiomarkers(data, s);
  const targetIds = new Set(chosen.flatMap((b) => b.targets.map((t) => t.id)));
  const bmDrugs = drugsForTargets(data, targetIds);
  const bmDrugIds = new Set(bmDrugs.map((d) => d.id));
  const had = new Set(s.hadTreatments);
  const drugById = new Map(data.drugs.map((d) => [d.id, d]));
  const hadDrugs = s.hadTreatments.map((id) => drugById.get(id)).filter((d): d is SituationDrug => !!d);
  const rowsNaming = (id: string) => data.rows.filter((r) => r.optionIds.includes(id));
  const sections: SituationSection[] = [];

  // 1. Where you are: the matching decision section, what has been had, and the rows later in the course.
  {
    const items: SituationItem[] = [];
    const links = [{ label: `Decisions for ${c.name}`, href: data.rows[0]?.decisionHref.replace(/#.*$/, "") ?? c.route }, { label: "Standard of care on the cancer page", href: `${c.route}#sec-care` }];
    let lead: string;
    let empty: string | undefined;
    if (row) {
      lead = `You chose "${row.setting}" (${row.lineLabel.toLowerCase()}). OnCo records ${n(row.optionIds.length, "named option")} and ${n(row.evidence.length, "trial")} for this row.`;
      items.push({ id: row.id, name: row.setting, route: row.decisionHref, badge: row.lineLabel, tone: "match", note: firstSentence(row.approach) });
      for (const d of hadDrugs) {
        const named = rowsNaming(d.id);
        items.push(link(d, { badge: "already had", tone: "had", note: named.length ? `Named in the standard of care for: ${list(named.map((r) => r.setting))}.` : "Not named in any standard-of-care row for this cancer." }));
      }
      const next = data.rows.filter((r) => r.id !== row.id && r.lineRank > row.lineRank && r.line !== "special" && r.line !== "other").sort((a, b) => a.lineRank - b.lineRank).slice(0, NEXT_CAP);
      for (const r of next) items.push({ id: r.id, name: r.setting, route: r.decisionHref, badge: "may come later", tone: "plain", note: firstSentence(r.approach) });
      if (!next.length && data.rows.length > 1) lead += " No row later in the course is recorded after this one.";
    } else if (hadDrugs.length) {
      lead = `You have not chosen a setting. You said you have had ${list(hadDrugs.map((d) => d.name))}.`;
      for (const d of hadDrugs) {
        const named = rowsNaming(d.id);
        items.push(link(d, { badge: "already had", tone: "had", note: named.length ? `Named in the standard of care for: ${list(named.map((r) => r.setting))}.` : "Not named in any standard-of-care row for this cancer." }));
      }
      for (const r of [...new Set(hadDrugs.flatMap((d) => rowsNaming(d.id)))]) items.push({ id: r.id, name: r.setting, route: r.decisionHref, badge: r.lineLabel, tone: "plain", note: firstSentence(r.approach) });
    } else {
      lead = data.rows.length ? `No setting chosen yet. OnCo records ${n(data.rows.length, "treatment setting")} for ${c.name}; each is a decision page.` : `OnCo records no standard-of-care settings for ${c.name} yet.`;
      empty = data.rows.length ? undefined : "Nothing in the record places you in a setting; the cancer page is the best starting point.";
      for (const r of data.rows) items.push({ id: r.id, name: r.setting, route: r.decisionHref, badge: r.lineLabel, tone: "plain" });
    }
    sections.push({ id: "where", title: SECTION_TITLE.where, lead, empty, items, links });
  }

  // 2. What is standard for that setting: the standard-of-care row itself.
  {
    const links = row ? [{ label: "Standard-of-care row", href: row.socHref }, { label: "Decision page", href: row.decisionHref }, ...(row.guidelineUrl ? [{ label: row.guideline ?? "Guideline", href: row.guidelineUrl }] : [])] : [{ label: "Standard of care on the cancer page", href: `${c.route}#sec-care` }];
    if (row) {
      const items = row.refs.map((r) => link(r, had.has(r.id) ? { badge: "already had", tone: "had" } : r.kind === "trial" ? { badge: "evidence", tone: "plain" } : { badge: r.status ? r.status.replace(/-/g, " ") : r.kind, tone: r.status === "approved" || r.status === "standard-of-care" ? "approved" : "plain" }));
      sections.push({ id: "standard", title: SECTION_TITLE.standard, lead: row.approach, items, links, empty: row.refs.length ? undefined : "The row is described in words only; no product, technology or trial record is linked to it." });
    } else {
      sections.push({ id: "standard", title: SECTION_TITLE.standard, lead: "Choose a setting above to see the standard-of-care row that applies.", empty: data.rows.length ? `${n(data.rows.length, "row")} recorded for ${c.name}; none chosen.` : `No standard-of-care rows are recorded for ${c.name}.`, items: [], links });
    }
  }

  // 3. What your biomarkers change: drugs whose targets match, with the reader's regulator's word on each.
  {
    const links = [{ label: `Biomarkers on the ${c.name} page`, href: c.route }, { label: "Tumour board matcher", href: "/tumor-board/" }];
    const items: SituationItem[] = [];
    const unresolved = chosen.filter((b) => !b.targets.length);
    const resolved = chosen.filter((b) => b.targets.length);
    let lead: string;
    let empty: string | undefined;
    if (notTested && !chosen.length) {
      lead = data.biomarkers.length ? `You said your biomarkers have not been tested, or you do not know. The record lists ${n(data.biomarkers.length, "biomarker")} clinicians test in ${c.name}: ${list(data.biomarkers.map((b) => b.label.replace(/\s*\(.*?\)\s*/g, "").trim()))}.` : `You said your biomarkers have not been tested. The record for ${c.name} lists no biomarkers.`;
      empty = "Until results are back, no drug can be matched to a biomarker here. Ask which of these tests apply to you.";
    } else if (!chosen.length) {
      lead = data.biomarkers.length ? `No biomarkers chosen. The record lists ${n(data.biomarkers.length, "biomarker")} clinicians test in ${c.name}.` : `The record for ${c.name} lists no biomarkers, so there is nothing to choose here.`;
      empty = data.biomarkers.length ? "Choose the ones from your report above, or say they have not been tested." : undefined;
    } else {
      const parts: string[] = [];
      if (resolved.length) parts.push(`${list(resolved.map((b) => b.label.replace(/\s*\(.*?\)\s*/g, "").trim()))} resolve${resolved.length === 1 ? "s" : ""} to ${list([...new Set(resolved.flatMap((b) => b.targets.map((t) => t.name)))])}; ${n(bmDrugs.length, "drug")} in OnCo aim${bmDrugs.length === 1 ? "s" : ""} there.`);
      if (unresolved.length) parts.push(`OnCo has no target record linked to ${list(unresolved.map((b) => `"${b.label}"`))}, so it cannot say what ${unresolved.length === 1 ? "it" : "they"} change${unresolved.length === 1 ? "s" : ""}.`);
      if (notTested) parts.push("You also said some results are not tested or unknown.");
      lead = parts.join(" ");
      if (resolved.length && !bmDrugs.length) empty = `No drug in OnCo's record for ${c.name} aims at ${list([...new Set(resolved.flatMap((b) => b.targets.map((t) => t.name)))])}.`;
      for (const d of bmDrugs) {
        const rb = regionalBadge(d, s.region);
        const via = d.targets.filter((t) => targetIds.has(t)).map((t) => resolved.flatMap((b) => b.targets).find((x) => x.id === t)?.name ?? t);
        items.push(link(d, { badge: had.has(d.id) ? `already had · ${rb.badge}` : rb.badge, tone: had.has(d.id) ? "had" : rb.tone, source: rb.source, note: `${d.modality}; aims at ${list([...new Set(via)])}.${d.inStandardOfCare ? " Named in the standard of care." : ""}${s.region && d.regional[s.region]?.indication ? ` ${s.region}: ${d.regional[s.region]!.indication}.` : ""}` }));
      }
    }
    sections.push({ id: "biomarkers", title: SECTION_TITLE.biomarkers, lead, empty, items, links });
  }

  // 4. Trials that fit.
  {
    const links = [{ label: "Trials near you (navigator)", href: "/navigator/" }, { label: `Trials on the ${c.name} page`, href: data.trialsRoute }];
    if (!s.wantsTrials) {
      sections.push({ id: "trials", title: SECTION_TITLE.trials, lead: `You said not to look for trials now. ${n(data.trials.length, "recruiting trial")} ${data.trials.length === 1 ? "is" : "are"} recorded for ${c.name} when you want them.`, empty: "Switch trials back on above to see the ones that mention your setting or biomarkers.", items: [], links });
    } else if (!row && !chosen.length) {
      sections.push({ id: "trials", title: SECTION_TITLE.trials, lead: `${n(data.trials.length, "recruiting trial")} ${data.trials.length === 1 ? "is" : "are"} recorded for ${c.name}. Choose a setting or a biomarker to narrow them to ones that fit.`, empty: data.trials.length ? undefined : `No recruiting trial is recorded for ${c.name}.`, items: [], links });
    } else {
      const fits = trialsThatFit(data, row, chosen, bmDrugIds);
      const items = fits.slice(0, TRIAL_CAP).map(({ trial, reasons }) => ({ id: trial.id, name: trial.name, route: trial.route, badge: `Phase ${trial.phase}${trial.nct ? ` · ${trial.nct}` : ""}`, tone: "match" as const, note: `Fits because of ${list(reasons)}.` }));
      const criteria = [row ? `your setting "${row.setting}"` : "", chosen.length ? `your biomarker${chosen.length === 1 ? "" : "s"} ${list(chosen.map((b) => b.label.replace(/\s*\(.*?\)\s*/g, "").trim()))}` : ""].filter(Boolean);
      const lead = fits.length ? `${fits.length} of the ${n(data.trials.length, "recruiting trial")} recorded for ${c.name} mention ${list(criteria)}${chosen.length ? " or test a drug aimed at your targets" : ""}.${fits.length > TRIAL_CAP ? ` The first ${TRIAL_CAP} are shown.` : ""}` : `None of the ${n(data.trials.length, "recruiting trial")} recorded for ${c.name} mention ${list(criteria)}.`;
      sections.push({ id: "trials", title: SECTION_TITLE.trials, lead, empty: fits.length ? undefined : "A trial may still fit you; the registry text OnCo holds simply does not say so. Ask your team, or search the registry from the navigator.", items, links });
    }
  }

  // 5. Warnings: red cards for the drugs in play.
  {
    const inPlay = new Set<string>([...(row ? row.optionIds : []), ...bmDrugIds, ...had]);
    const cards = inPlay.size ? data.redCards.filter((card) => card.concerns.some((d) => inPlay.has(d.id))) : data.redCards;
    const names = [...inPlay].map((id) => drugById.get(id)?.name).filter((x): x is string => !!x);
    const lead = inPlay.size
      ? cards.length ? `${n(cards.length, "warning")} from the labels and guidelines behind ${list(names.slice(0, 4))}${names.length > 4 ? ` and ${names.length - 4} more` : ""}. Your team's thresholds win.` : `None of the red cards recorded for ${c.name} concern ${list(names.slice(0, 4))}${names.length > 4 ? ` and ${names.length - 4} more` : ""}.`
      : cards.length ? `No treatment chosen yet, so these are the ${n(cards.length, "red card")} for the whole standard of care of ${c.name}.` : `No red card is recorded for the standard of care of ${c.name}.`;
    sections.push({ id: "warnings", title: SECTION_TITLE.warnings, lead, empty: cards.length ? undefined : "OnCo only shows warnings quoted from a label or guideline; none applies to these records.", items: [], redCards: cards, links: [{ label: "Side effects", href: "/side-effects/" }, { label: "Interaction checker", href: "/interactions/" }] });
  }

  // 6. Questions for your next visit.
  {
    const wanted = new Set<string>(["Any stage", ...(s.diagnosedRecently || !row ? ["Newly diagnosed"] : [])]);
    const pool = [...(row ? row.questions : []), ...data.generalQuestions.filter((q) => wanted.has(q.setting))];
    const seen = new Set<string>();
    const questions = pool.filter((q) => { const k = q.question.toLowerCase(); if (seen.has(k)) return false; seen.add(k); return true; }).slice(0, QUESTION_CAP);
    const lead = row ? `Questions written for "${row.setting}"${s.diagnosedRecently ? " and for a new diagnosis" : ""}, from the decision page and the ${c.name} question set.` : `General questions for ${c.name}; choose a setting to add the ones written for it.`;
    sections.push({ id: "questions", title: SECTION_TITLE.questions, lead, empty: questions.length ? undefined : `No questions are recorded for ${c.name}.`, items: [], questions, links: [{ label: "Appointment prep", href: "/prep/" }, ...(row ? [{ label: "Decision page", href: row.decisionHref }] : [])] });
  }

  // 7. The first 60 days, only when the diagnosis is new.
  if (s.diagnosedRecently) {
    const items = data.guide.steps.map((st) => ({ id: st.id, name: st.title, route: `${data.guide.route}#sec-${st.id}`, badge: st.week, tone: "plain" as const }));
    sections.push({ id: "first60", title: SECTION_TITLE.first60, lead: `You said the diagnosis is recent. The ${c.name} guide has ${n(items.length, "step")}, each built only from the record.`, empty: items.length ? undefined : `No first-60-days guide is available for ${c.name}.`, items, links: [{ label: "Open the guide", href: data.guide.route }] });
  }

  // 8. Appointment sheet.
  sections.push({ id: "sheet", title: SECTION_TITLE.sheet, lead: `One printable page for ${c.name}: ${n(data.sheet.questions, "question")}, ${n(data.sheet.terms, "term")} you may hear and ${n(data.sheet.treatments, "treatment row")}, with space for the answers.`, items: [{ id: "sheet", name: `Appointment sheet: ${c.name}`, route: data.sheet.route, badge: "print", tone: "plain", note: "What you type on it stays in this browser." }], links: [{ label: "All appointment sheets", href: "/prep/" }] });

  return sections;
}
