import type { Cancer, Drug, Term } from "./schema";
import { routeFor } from "./schema";
import type { Graph } from "./graph";
import { redFlagsFor, type RedFlagAction, type RedFlagSet } from "@/data/red-flags";
import { checkPairs, singleFlags, type Flag, type SingleFlag } from "./interactions";

/**
 * Red cards: the few warnings a patient should know for a cancer, read only from records that carry them.
 * Three sources, in order of urgency: the "when to call" red-flag sets that apply to the drugs in the cancer's
 * standard of care (src/data/red-flags.ts, each line quoting its label or guideline), interaction flags among
 * those drugs and their single-agent cautions (src/lib/interactions.ts), and glossary terms in the "Side effects"
 * category linked to those drugs. No thresholds are written here; every card points at its source.
 */
export type RedCardTone = "emergency" | "call-now" | "call-today" | "caution" | "info";
export type RedCardKind = "red-flag" | "interaction" | "side-effect";

export type RedCardDrug = { id: string; name: string; route: string };

export type RedCard = {
  id: string;
  kind: RedCardKind;
  tone: RedCardTone;
  /** What it is, in a few words. */
  title: string;
  /** One plain sentence: the threshold or mechanism as the source phrases it. */
  body: string;
  /** Which drugs or treatments it concerns. */
  concerns: RedCardDrug[];
  source: { label: string; url?: string };
};

export type RedCardInput = {
  /** Drugs in the cancer's standard of care. */
  drugs: Array<RedCardDrug & { modality: string }>;
  /** Red-flag sets for one drug; injected so the builder stays pure. */
  flagSets: (drugId: string, modality: string) => RedFlagSet[];
  /** Pairwise interaction flags among `drugs`. */
  pairs: Flag[];
  /** Single-agent cautions among `drugs`. */
  singles: SingleFlag[];
  /** Glossary terms in the "Side effects" category, with the drug ids they link to. */
  sideEffectTerms: Array<{ id: string; name: string; tldr: string; route: string; drugs: string[] }>;
};

export const RED_CARD_MAX = 6;

export const TONE_LABEL: Record<RedCardTone, string> = {
  emergency: "Emergency services now", "call-now": "Call the 24-hour line now", "call-today": "Call the team today", caution: "Check before combining", info: "Good to know",
};

const TONE_ORDER: RedCardTone[] = ["emergency", "call-now", "call-today", "caution", "info"];
const ACTION_TONE: Record<RedFlagAction, RedCardTone> = { emergency: "emergency", "call-now": "call-now", "call-today": "call-today" };
const SINGLE_LABEL: Record<SingleFlag["kind"], string> = { food: "Food and drink", qt: "Heart rhythm (QT)", hepatic: "Liver", renal: "Kidneys" };

const byName = (a: RedCardDrug, b: RedCardDrug) => a.name.localeCompare(b.name);

/** Pick, order and cap the cards. Deterministic: tone, then how many drugs a card concerns, then title. */
export function buildRedCards(input: RedCardInput, max = RED_CARD_MAX): RedCard[] {
  const drugById = new Map(input.drugs.map((d) => [d.id, d]));
  const cards: RedCard[] = [];

  // One card per red-flag set: the most urgent line in the set, naming every standard-of-care drug it applies to.
  const sets = new Map<string, { set: RedFlagSet; drugs: RedCardDrug[] }>();
  for (const d of input.drugs) for (const s of input.flagSets(d.id, d.modality)) {
    const cur = sets.get(s.id) ?? { set: s, drugs: [] };
    if (!cur.drugs.some((x) => x.id === d.id)) cur.drugs.push({ id: d.id, name: d.name, route: d.route });
    sets.set(s.id, cur);
  }
  for (const { set, drugs } of sets.values()) {
    const top = [...set.flags].sort((a, b) => TONE_ORDER.indexOf(ACTION_TONE[a.action]) - TONE_ORDER.indexOf(ACTION_TONE[b.action]))[0];
    if (!top) continue;
    cards.push({ id: `flag:${set.id}`, kind: "red-flag", tone: ACTION_TONE[top.action], title: top.symptom, body: top.threshold, concerns: drugs.sort(byName), source: top.source });
  }

  // Interactions among the standard-of-care drugs themselves: only the two severities a patient must not miss.
  for (const p of input.pairs) {
    if (p.severity !== "contraindicated" && p.severity !== "major") continue;
    const a = drugById.get(p.a), b = drugById.get(p.b);
    if (!a || !b) continue;
    cards.push({ id: `pair:${[p.a, p.b].sort().join("+")}:${p.rule}`, kind: "interaction", tone: "caution", title: `${a.name} with ${b.name}: ${p.severity === "contraindicated" ? "do not combine" : "major interaction"}`, body: `${p.mechanism}. ${p.management}`, concerns: [a, b].map(({ id, name, route }) => ({ id, name, route })).sort(byName), source: { label: p.source ?? "US prescribing information", url: p.source } });
  }
  for (const s of input.singles) {
    const d = drugById.get(s.id);
    if (!d) continue;
    cards.push({ id: `single:${s.id}:${s.kind}`, kind: "interaction", tone: "caution", title: `${SINGLE_LABEL[s.kind]}: ${d.name}`, body: s.text, concerns: [{ id: d.id, name: d.name, route: d.route }], source: { label: "Interaction checker", url: `/interactions/?drugs=${encodeURIComponent(d.id)}` } });
  }

  // Side-effect terms the drugs link to: what the word means, in plain English.
  for (const t of input.sideEffectTerms) {
    const concerns = t.drugs.map((id) => drugById.get(id)).filter((x): x is RedCardInput["drugs"][number] => !!x).map(({ id, name, route }) => ({ id, name, route })).sort(byName);
    if (!concerns.length) continue;
    cards.push({ id: `term:${t.id}`, kind: "side-effect", tone: "info", title: t.name, body: t.tldr, concerns, source: { label: "Glossary", url: t.route } });
  }

  return cards
    .sort((a, b) => TONE_ORDER.indexOf(a.tone) - TONE_ORDER.indexOf(b.tone) || b.concerns.length - a.concerns.length || a.title.localeCompare(b.title))
    .slice(0, max);
}

/** Drugs named in a cancer's standard of care, in order of first mention. */
export function standardOfCareDrugs(g: Graph, c: Cancer): Drug[] {
  const out: Drug[] = [];
  const seen = new Set<string>();
  for (const s of c.standardOfCare) for (const id of s.refs) {
    const e = g.get(id);
    if (e && e.kind === "drug" && !seen.has(id)) { seen.add(id); out.push(e); }
  }
  return out;
}

/** The red cards for a cancer, or an empty list when its standard of care names no drug that carries a warning. */
export function redCardsForCancer(g: Graph, c: Cancer, max = RED_CARD_MAX): RedCard[] {
  const drugs = standardOfCareDrugs(g, c);
  if (!drugs.length) return [];
  const ids = drugs.map((d) => d.id);
  const idSet = new Set(ids);
  const sideEffectTerms = (g.kind("term") as Term[])
    .filter((t) => t.category === "Side effects")
    .map((t) => ({ id: t.id, name: t.name, tldr: t.tldr, route: routeFor(t), drugs: [...new Set([...t.drugs.filter((id) => idSet.has(id)), ...drugs.filter((d) => d.terms.includes(t.id)).map((d) => d.id)])] }))
    .filter((t) => t.drugs.length);
  return buildRedCards({
    drugs: drugs.map((d) => ({ id: d.id, name: d.name, route: routeFor(d), modality: d.modality })),
    flagSets: redFlagsFor,
    pairs: checkPairs(ids),
    singles: singleFlags(ids),
    sideEffectTerms,
  }, max);
}
