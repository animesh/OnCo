import { agents, SOURCES, type Agent, type Severity, type Strength, type Victim } from "@/data/interactions";

/**
 * Interaction rule engine. Given a set of agent ids, derive every pairwise flag from the agents' pharmacological
 * properties, add the label-named pairs, and collect the single-agent flags (food, QT, hepatic, renal).
 * Pure functions so the checker runs in the browser and the tests run in node.
 */
export type Flag = {
  a: string; b: string;
  severity: Severity;
  /** Short mechanism, e.g. "CYP3A4: ketoconazole (strong inhibitor) raises venetoclax exposure". */
  mechanism: string;
  management: string;
  /** Rule that fired, for tests and for grouping in the UI. */
  rule: string;
  source?: string;
};

export const SEVERITY_ORDER: Severity[] = ["contraindicated", "major", "moderate", "minor"];
export const SEVERITY_LABEL: Record<Severity, string> = { contraindicated: "Contraindicated", major: "Major", moderate: "Moderate", minor: "Minor" };
export const SEVERITY_CLASS: Record<Severity, string> = {
  contraindicated: "bg-rose-200 text-rose-950 dark:bg-rose-800/70 dark:text-rose-50",
  major: "bg-rose-100 text-rose-900 dark:bg-rose-900/40 dark:text-rose-100",
  moderate: "bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-100",
  minor: "bg-foreground/5 text-muted",
};

const byId = new Map(agents.map((a) => [a.id, a]));
export function agentById(id: string): Agent | undefined { return byId.get(id); }

const strengthWord = (s: Strength) => `${s} inhibitor`;

/** Victim-side management text, or a generic line. */
function manage(victim: Agent, key: Victim, fallback: string): string {
  return victim.management?.[key] ?? fallback;
}

/** One-directional rules: `p` perpetrates, `v` is the victim. */
function directional(p: Agent, v: Agent): Flag[] {
  const out: Flag[] = [];
  const pp = p.props, vp = v.props;
  // CYP3A4 inhibition.
  if (vp.cyp3a4Substrate && pp.cyp3a4Inhibitor && pp.cyp3a4Inhibitor !== "weak") {
    const sensitive = vp.cyp3a4Substrate === "sensitive";
    const strong = pp.cyp3a4Inhibitor === "strong";
    const severity: Severity = strong && sensitive ? "major" : strong || sensitive ? "moderate" : "minor";
    out.push({ a: v.id, b: p.id, severity, rule: "cyp3a4-inhibitor", mechanism: `CYP3A4: ${p.name} (${strengthWord(pp.cyp3a4Inhibitor)}) raises ${v.name} exposure${sensitive ? " (sensitive substrate)" : ""}.`, management: manage(v, "cyp3a4Inhibitor", strong ? "Avoid strong CYP3A4 inhibitors or reduce the dose per label; monitor for toxicity." : "Monitor for increased toxicity; consider dose reduction."), source: SOURCES.fdaCyp.url });
  }
  // CYP3A4 induction.
  if (vp.cyp3a4Substrate && pp.cyp3a4Inducer && pp.cyp3a4Inducer !== "weak") {
    const strong = pp.cyp3a4Inducer === "strong";
    const severity: Severity = strong ? "major" : "moderate";
    out.push({ a: v.id, b: p.id, severity, rule: "cyp3a4-inducer", mechanism: `CYP3A4: ${p.name} (${pp.cyp3a4Inducer} inducer) lowers ${v.name} exposure and may cause loss of efficacy.`, management: manage(v, "cyp3a4Inducer", "Avoid strong inducers; if unavoidable, consider a dose increase per label and monitor response."), source: SOURCES.fdaCyp.url });
  }
  // Acid-dependent absorption.
  if (vp.acidDependent && pp.acidReducer) {
    const severity: Severity = pp.acidReducer === "ppi" ? "major" : "moderate";
    out.push({ a: v.id, b: p.id, severity, rule: "acid-reducer", mechanism: `Absorption: ${p.name} raises gastric pH and lowers ${v.name} absorption.`, management: manage(v, "acidReducer", pp.acidReducer === "ppi" ? "Avoid PPIs; use an H2 antagonist or antacid separated in time per label." : "Separate dosing per label (typically the TKI 2 hours before or 10 hours after an H2 antagonist)."), source: v.source });
  }
  // P-gp.
  if (vp.pgpSubstrate && pp.pgpInhibitor) {
    out.push({ a: v.id, b: p.id, severity: "moderate", rule: "pgp-inhibitor", mechanism: `P-glycoprotein: ${p.name} inhibits P-gp and raises ${v.name} exposure.`, management: manage(v, "pgpInhibitor", "Monitor for toxicity; reduce dose per label where one is given."), source: SOURCES.fdaCyp.url });
  }
  // CYP2D6.
  if (vp.cyp2d6Substrate && pp.cyp2d6Inhibitor && pp.cyp2d6Inhibitor !== "weak") {
    const severity: Severity = pp.cyp2d6Inhibitor === "strong" ? "major" : "moderate";
    out.push({ a: v.id, b: p.id, severity, rule: "cyp2d6-inhibitor", mechanism: `CYP2D6: ${p.name} (${strengthWord(pp.cyp2d6Inhibitor)}) alters ${v.name} metabolism${v.id === "tamoxifen" ? ", lowering active endoxifen" : ""}.`, management: manage(v, "cyp2d6Inhibitor", "Avoid strong CYP2D6 inhibitors or monitor effect."), source: SOURCES.fdaCyp.url });
  }
  // CYP2C8.
  if (vp.cyp2c8Substrate && pp.cyp2c8Inhibitor && pp.cyp2c8Inhibitor !== "weak") {
    out.push({ a: v.id, b: p.id, severity: pp.cyp2c8Inhibitor === "strong" ? "major" : "moderate", rule: "cyp2c8-inhibitor", mechanism: `CYP2C8: ${p.name} (${strengthWord(pp.cyp2c8Inhibitor)}) raises ${v.name} exposure.`, management: manage(v, "cyp2c8Inhibitor", "Avoid strong CYP2C8 inhibitors or reduce the dose per label."), source: SOURCES.fdaCyp.url });
  }
  // CYP1A2.
  if (vp.cyp1a2Substrate && pp.cyp1a2Inhibitor && pp.cyp1a2Inhibitor !== "weak") {
    out.push({ a: v.id, b: p.id, severity: pp.cyp1a2Inhibitor === "strong" ? "major" : "moderate", rule: "cyp1a2-inhibitor", mechanism: `CYP1A2: ${p.name} (${strengthWord(pp.cyp1a2Inhibitor)}) raises ${v.name} exposure.`, management: manage(v, "cyp1a2Inhibitor", "Avoid or reduce the substrate dose; monitor."), source: SOURCES.fdaCyp.url });
  }
  // Bleeding: anticoagulant or antiplatelet with a drug that raises bleeding risk.
  if (vp.bleedingRisk && pp.anticoagulant) {
    out.push({ a: v.id, b: p.id, severity: "major", rule: "bleeding", mechanism: `Bleeding: ${v.name} raises bleeding risk and ${p.name} is an anticoagulant or antiplatelet.`, management: manage(v, "anticoagulant", "Weigh the indication for anticoagulation; monitor for bleeding; hold around procedures."), source: v.source });
  }
  // Warfarin-specific label statements.
  if (vp.warfarin && p.id === "warfarin") {
    out.push({ a: v.id, b: p.id, severity: /contraindicated|boxed/i.test(vp.warfarin) ? "major" : "moderate", rule: "warfarin", mechanism: `Warfarin: ${vp.warfarin}`, management: "Monitor INR closely; consider a LMWH or DOAC instead.", source: v.source });
  }
  return out;
}

/** Symmetric rules. */
function symmetric(a: Agent, b: Agent): Flag[] {
  const out: Flag[] = [];
  if (a.props.qt && b.props.qt) {
    const both = a.props.qt === "known" && b.props.qt === "known";
    out.push({ a: a.id, b: b.id, severity: both ? "major" : "moderate", rule: "qt", mechanism: `QT: both ${a.name} and ${b.name} prolong the QT interval (${a.props.qt} and ${b.props.qt} risk).`, management: a.management?.qt ?? b.management?.qt ?? "Avoid combining QT-prolonging drugs where possible; ECG and electrolytes at baseline and after starting.", source: SOURCES.crediblemeds.url });
  }
  return out;
}

const key = (x: string, y: string) => [x, y].sort().join("|");

/** Every flag among the chosen agents, de-duplicated per pair and rule, most severe first. */
export function checkPairs(ids: string[]): Flag[] {
  const chosen = [...new Set(ids)].map(agentById).filter((x): x is Agent => !!x);
  const out: Flag[] = [];
  const seen = new Set<string>();
  const push = (f: Flag) => { const k = `${key(f.a, f.b)}#${f.rule}`; if (!seen.has(k)) { seen.add(k); out.push(f); } };
  for (let i = 0; i < chosen.length; i++) for (let j = i + 1; j < chosen.length; j++) {
    const a = chosen[i], b = chosen[j];
    directional(a, b).forEach(push);
    directional(b, a).forEach(push);
    symmetric(a, b).forEach(push);
    for (const [x, y] of [[a, b], [b, a]] as const) for (const p of x.pairs ?? []) if (p.with === y.id) push({ a: x.id, b: y.id, severity: p.severity, rule: "label-pair", mechanism: p.mechanism, management: p.management, source: p.source ?? x.source });
  }
  return out.sort((x, y) => SEVERITY_ORDER.indexOf(x.severity) - SEVERITY_ORDER.indexOf(y.severity) || x.a.localeCompare(y.a));
}

export type SingleFlag = { id: string; kind: "food" | "qt" | "hepatic" | "renal"; text: string };

/** Per-agent flags worth showing even with one drug selected. */
export function singleFlags(ids: string[]): SingleFlag[] {
  const out: SingleFlag[] = [];
  for (const id of new Set(ids)) {
    const a = agentById(id);
    if (!a) continue;
    if (a.food) out.push({ id, kind: "food", text: a.food });
    if (a.props.qt) out.push({ id, kind: "qt", text: `${a.props.qt === "known" ? "Known" : "Possible"} QT prolongation. ${a.management?.qt ?? "Check ECG and electrolytes; review other QT-prolonging drugs."}` });
    if (a.hepatic) out.push({ id, kind: "hepatic", text: a.hepatic });
    if (a.renal) out.push({ id, kind: "renal", text: a.renal });
  }
  return out;
}

/** Highest severity among a set of flags, or null. */
export function worst(flags: Flag[]): Severity | null {
  return flags.length ? flags.reduce((w, f) => (SEVERITY_ORDER.indexOf(f.severity) < SEVERITY_ORDER.indexOf(w) ? f.severity : w), flags[0].severity) : null;
}

/** Build-time validation: product ids resolve to drugs, external ids do not collide with corpus ids, pair targets exist. */
