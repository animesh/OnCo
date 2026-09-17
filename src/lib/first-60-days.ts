import { graph } from "./graph";

type Graph = ReturnType<typeof graph>;
import { routeFor, type Cancer, type Entity, type Trial } from "./schema";
import { questionsFor } from "./questions";
import { guidelineCancerIds } from "./guidelines";
import { sequencingIndex } from "./sequencing";
import { stagingSystems } from "@/data/staging";
import { JOURNEYS } from "@/data/journeys";
import type { Question } from "@/data/questions";

/**
 * "The first 60 days": a per-cancer, week-by-week orientation for someone newly diagnosed, built only from
 * what the corpus records for that cancer. Every section is optional: when the record has nothing to say,
 * the section is left out rather than filled with generic text. The week labels are a typical order, not a
 * schedule. Also feeds the one-page appointment sheet at /prep/[id]/.
 */

export type GuideLink = { id: string; name: string; route: string; kind?: string; tldr?: string; meta?: string };
export type GuideSocRow = { setting: string; approach: string; refs: GuideLink[]; guideline?: string; guidelineUrl?: string; href: string };
export type GuideRole = { role: string; because: string; href: string };
export type GuideTrial = GuideLink & { phase: string; status?: string; setting: string; nct?: string };
export type GuideJourney = { id: string; title: string; stage: string; route: string; diagnosis: string[]; decisions: string[] };
export type GuideSectionId = "now" | "team" | "decisions" | "questions" | "trials" | "free" | "read";

export type Guide = {
  cancer: GuideLink & { group: string };
  /** Staging tests: "Diagnosis" rows of the standard of care, the diagnostic technologies linked to the cancer, staging systems, biomarkers. */
  now?: { rows: GuideSocRow[]; technologies: GuideLink[]; staging: GuideLink[]; biomarkers: string[]; journeyDiagnosis: string[] };
  /** Specialties, derived from the sections of the technologies and drugs named in the standard of care. */
  team?: { roles: GuideRole[] };
  /** Standard-of-care settings in the order they occur, plus the decision points of any recorded journey. */
  decisions?: { rows: GuideSocRow[]; journeys: GuideJourney[] };
  questions?: { source: "handwritten" | "generated"; groups: Array<[string, Question[]]> };
  trials?: GuideTrial[];
  free: { links: GuideLink[] };
  read: { pages: GuideLink[]; terms: GuideLink[] };
  /** Ids of the sections present, in page order. */
  sections: GuideSectionId[];
};

export const WEEKS: Record<GuideSectionId, string> = {
  now: "Weeks 1 to 2", team: "Weeks 1 to 3", decisions: "Weeks 2 to 6", questions: "Every visit", trials: "Weeks 3 to 8", free: "From day one", read: "Any time",
};

const DIAGNOSIS = /diagnos|staging|work-?up/i;
const DX_SECTIONS = new Set(["imaging", "diagnostics", "early-detection"]);
const OPEN_TRIAL = new Set(["recruiting", "active", "planned"]);
const PHASE_RANK: Record<string, number> = { "3": 0, "2/3": 1, platform: 2, "2": 3, "1/2": 4, "1": 5, "4": 6, observational: 7 };
const STATUS_RANK: Record<string, number> = { "standard-of-care": 0, established: 1, approved: 2 };

/** Where a standard-of-care setting falls in a typical course, for ordering; ties keep record order. */
export function settingRank(setting: string): number {
  const s = setting.toLowerCase();
  if (/prevent|screen/.test(s)) return 0;
  if (DIAGNOSIS.test(s)) return 1;
  if (/maintenance|surveillance|survivorship|supportive/.test(s)) return 7;
  if (/relaps|refractory|second line|second-line|later|third|beyond|resistan|intoleran|platinum|pretreated|previously treated/.test(s)) return 6;
  if (/locally advanced|stage iii|unresectable|high risk|high-risk/.test(s)) return 4;
  if (/first line|first-line|frontline|metastatic|advanced|recurrent|brain/.test(s)) return 5;
  if (/early|localis|localiz|stage i\b|stage i-ii|stage ii\b|resectable|primary tumour|limited|low risk|intermediate|adjuvant|surgery|children|infant|newly|muscle-invasive/.test(s)) return 3;
  return 5;
}

/** Trials open now, best phase first, at most `n`. */
export function openTrials(c: Cancer, g: Graph, n = 5): GuideTrial[] {
  if (!g.get(c.id)) return [];
  const seen = new Set<string>();
  const out: Trial[] = [];
  for (const t of [...(g.forCancer(c.id).get("trial") ?? []), ...c.trials.map((id) => g.get(id))]) {
    if (!t || t.kind !== "trial" || seen.has(t.id) || !OPEN_TRIAL.has(t.status ?? "")) continue;
    seen.add(t.id); out.push(t);
  }
  return out
    .sort((a, b) => (PHASE_RANK[a.phase] ?? 9) - (PHASE_RANK[b.phase] ?? 9) || a.name.localeCompare(b.name))
    .slice(0, n)
    .map((t) => ({ id: t.id, name: t.name, route: routeFor(t), kind: "trial", tldr: t.tldr, phase: t.phase, status: t.status, setting: t.setting, nct: t.nct }));
}

/** Glossary terms linked to the cancer (either direction): terms specific to few cancers first, then the best connected. */
export function cancerTerms(c: Cancer, g: Graph, n = 10): GuideLink[] {
  if (!g.get(c.id)) return [];
  const terms = (g.neighbours(c.id).get("term") ?? []).filter((t) => t.kind === "term");
  return terms
    .map((t) => ({ t, d: g.degree(t.id), spread: (g.neighbours(t.id).get("cancer") ?? []).length }))
    .sort((a, b) => a.spread - b.spread || b.d - a.d || a.t.name.localeCompare(b.t.name))
    .slice(0, n)
    .map(({ t }) => ({ id: t.id, name: t.name, route: routeFor(t), kind: "term", tldr: firstSentence(t.tldr) }));
}

/** Diagnostic and imaging technologies linked to the cancer, standard ones first. */
export function diagnosticTechnologies(c: Cancer, g: Graph, n = 8): GuideLink[] {
  if (!g.get(c.id)) return [];
  const techs = (g.forCancer(c.id).get("technology") ?? []).filter((t) => t.sections.some((s) => DX_SECTIONS.has(s)));
  return techs
    .sort((a, b) => (STATUS_RANK[a.status ?? ""] ?? 5) - (STATUS_RANK[b.status ?? ""] ?? 5) || a.name.localeCompare(b.name))
    .slice(0, n)
    .map((t) => link(t));
}

const link = (e: Entity): GuideLink => ({ id: e.id, name: e.name, route: routeFor(e), kind: e.kind, tldr: e.tldr });

export const firstSentence = (s: string) => { const m = /^(.+?[.!?])(\s|$)/.exec(s.trim()); return m ? m[1] : s.trim(); };

function socRow(c: Cancer, row: Cancer["standardOfCare"][number], g: Graph): GuideSocRow {
  const refs = row.refs.map((id) => g.get(id)).filter((e): e is Entity => !!e).map(link);
  const gl = [row.guideline?.nccn ? `NCCN category ${row.guideline.nccn}` : "", row.guideline?.esmoMcbs ? `ESMO-MCBS ${row.guideline.esmoMcbs}` : "", row.guideline?.version ?? ""].filter(Boolean).join(", ");
  return { setting: row.setting, approach: row.approach, refs, guideline: gl || undefined, guidelineUrl: row.guideline?.url, href: `${routeFor(c)}#sec-care` };
}

/** Specialties named by the standard of care: read off the sections of the linked technologies and drugs, and the approach wording. */
export function teamRoles(c: Cancer, g: Graph): GuideRole[] {
  const hits = new Map<string, Set<string>>();
  const hit = (role: string, setting: string) => hits.set(role, (hits.get(role) ?? new Set()).add(setting));
  const systemic = c.group === "blood" ? "Haematologist" : "Medical oncologist";
  for (const row of c.standardOfCare) {
    const a = row.approach;
    const sections = new Set<string>();
    let hasDrug = false;
    for (const id of row.refs) {
      const e = g.get(id);
      if (!e) continue;
      if (e.kind === "drug") { hasDrug = true; for (const t of e.technologies) for (const s of g.get(t)?.sections ?? []) sections.add(s); }
      if (e.kind === "technology") for (const s of e.sections) sections.add(s);
    }
    if (sections.has("surgery") || /\bsurg|resect|excision|ectomy/i.test(a)) hit("Surgeon", row.setting);
    if (sections.has("radiation") || /radiother|radiation|brachy|sbrt|proton|chemoradi/i.test(a)) hit("Clinical oncologist (radiotherapy)", row.setting);
    if (hasDrug || sections.has("chemotherapy") || sections.has("targeted-therapy") || sections.has("immunotherapy") || sections.has("hormonal") || sections.has("adcs") || /chemo|inhibitor|antibod|immunother|hormon|endocrine|therapy|mab\b/i.test(a)) hit(systemic, row.setting);
    if (sections.has("cell-therapy") || /car-t|cell therapy|stem cell|transplant/i.test(a)) hit("Transplant and cell therapy team", row.setting);
    if (sections.has("imaging") || /\b(ct|mri|pet|ultrasound|mammogra|scan|imaging)\b/i.test(a)) hit("Radiologist", row.setting);
    if (sections.has("diagnostics") || /biops|patholog|histolog|ihc|sequenc|ngs|biomarker|cytogenet|flow cytometry|molecular/i.test(a)) hit("Pathologist", row.setting);
    if (sections.has("supportive-care") || /palliat|supportive|symptom control/i.test(a)) hit("Palliative and supportive care team", row.setting);
  }
  const order = ["Pathologist", "Radiologist", "Surgeon", systemic, "Clinical oncologist (radiotherapy)", "Transplant and cell therapy team", "Palliative and supportive care team"];
  return order.filter((r) => hits.has(r)).map((role) => {
    const settings = [...hits.get(role)!];
    return { role, because: `Named in the standard of care for: ${settings.slice(0, 4).join(", ")}${settings.length > 4 ? ` and ${settings.length - 4} more` : ""}.`, href: `${routeFor(c)}#sec-care` };
  });
}

/** Group questions by setting, keeping first-seen order. */
const groupQuestions = (qs: Question[]): Array<[string, Question[]]> => {
  const m = new Map<string, Question[]>();
  for (const q of qs) m.set(q.setting, [...(m.get(q.setting) ?? []), q]);
  return [...m.entries()];
};

export function buildGuide(c: Cancer, g: Graph = graph()): Guide {
  const route = routeFor(c);
  const guide: Guide = { cancer: { id: c.id, name: c.name, route, group: c.group, tldr: c.tldr }, free: { links: [] }, read: { pages: [], terms: [] }, sections: [] };

  const diagRows = c.standardOfCare.filter((r) => DIAGNOSIS.test(r.setting)).map((r) => socRow(c, r, g));
  const techs = diagnosticTechnologies(c, g);
  const staging = stagingSystems.filter((s) => s.cancerIds.includes(c.id)).map((s) => ({ id: s.id, name: s.name, route: `/staging/#${s.id}`, meta: s.source.label }));
  const journeys = JOURNEYS.filter((j) => j.cancer === c.id);
  const journeyDiagnosis = journeys.flatMap((j) => j.phases.filter((p) => p.type === "diagnosis").map((p) => p.detail));
  if (diagRows.length || techs.length || staging.length || c.biomarkers.length || journeyDiagnosis.length) {
    guide.now = { rows: diagRows, technologies: techs, staging, biomarkers: c.biomarkers, journeyDiagnosis: [...new Set(journeyDiagnosis)] };
    guide.sections.push("now");
  }

  const roles = teamRoles(c, g);
  if (roles.length) { guide.team = { roles }; guide.sections.push("team"); }

  const rows = c.standardOfCare.filter((r) => !DIAGNOSIS.test(r.setting)).map((r, i) => ({ r, i, k: settingRank(r.setting) })).sort((a, b) => a.k - b.k || a.i - b.i).map(({ r }) => socRow(c, r, g));
  const gj: GuideJourney[] = journeys.filter((j) => j.decisions.length).map((j) => ({ id: j.id, title: j.title, stage: j.stage, route: `/journeys/${j.id}/`, diagnosis: [], decisions: j.decisions.map((d) => d.question) }));
  if (rows.length || gj.length) { guide.decisions = { rows, journeys: gj }; guide.sections.push("decisions"); }

  const q = questionsFor(c);
  if (q.items.length) { guide.questions = { source: q.source, groups: groupQuestions(q.items) }; guide.sections.push("questions"); }

  const trials = openTrials(c, g);
  if (trials.length) { guide.trials = trials; guide.sections.push("trials"); }

  guide.free = { links: [
    { id: "free", name: "Free in oncology", route: "/free/", tldr: "Free testing, helplines, rides and lodging, second opinions and trial travel help, with who is eligible." },
    { id: "assistance", name: "Financial help", route: "/assistance/", tldr: "Manufacturer programmes, national schemes and charities by country and product." },
    { id: "second-opinion", name: "Second opinion", route: "/second-opinion/", tldr: "Expert centres for this cancer in your country and how referral works." },
  ] };
  guide.sections.push("free");

  const pages: GuideLink[] = [{ id: c.id, name: `${c.name}: the full page`, route, kind: "cancer", tldr: c.tldr }];
  pages.push({ id: "prep", name: "One-page appointment sheet", route: `/prep/${c.id}/`, tldr: "Your questions, the words you may hear, what to bring, and space for the answers. Print it." });
  for (const j of journeys) pages.push({ id: j.id, name: `Treatment journey: ${j.stage}`, route: `/journeys/${j.id}/`, tldr: j.tldr });
  if (guidelineCancerIds().includes(c.id)) pages.push({ id: "guidelines", name: "Guidelines compared", route: `/guidelines/${c.id}/`, tldr: "NCCN, ESMO and NICE side by side for this cancer." });
  if (sequencingIndex().some((s) => s.id === c.id)) pages.push({ id: "sequencing", name: "Treatment sequencing", route: `/sequencing/${c.id}/`, tldr: "Which treatment tends to follow which, line by line." });
  pages.push({ id: "navigator", name: "Navigator", route: "/navigator/", tldr: "Standard of care for your stage, what you have tried, and trials near you." });
  guide.read = { pages, terms: cancerTerms(c, g) };
  guide.sections.push("read");

  return guide;
}

/** Data for the printable appointment sheet at /prep/[id]/, all from the record. */
export type SheetData = {
  cancer: GuideLink & { group: string };
  source: "handwritten" | "generated";
  questions: Question[];
  terms: GuideLink[];
  tests: { rows: Array<{ setting: string; approach: string }>; technologies: GuideLink[]; biomarkers: string[] };
  treatments: Array<{ setting: string; approach: string; refs: GuideLink[] }>;
};

export function buildSheet(c: Cancer, g: Graph = graph()): SheetData {
  const q = questionsFor(c);
  const ordered = c.standardOfCare.map((r, i) => ({ r, i, k: settingRank(r.setting) })).sort((a, b) => a.k - b.k || a.i - b.i).map(({ r }) => r);
  return {
    cancer: { id: c.id, name: c.name, route: routeFor(c), group: c.group, tldr: c.tldr },
    source: q.source,
    questions: q.items,
    terms: cancerTerms(c, g, 10),
    tests: { rows: ordered.filter((r) => DIAGNOSIS.test(r.setting)).map((r) => ({ setting: r.setting, approach: r.approach })), technologies: diagnosticTechnologies(c, g, 6), biomarkers: c.biomarkers },
    treatments: ordered.filter((r) => !DIAGNOSIS.test(r.setting)).map((r) => ({ setting: r.setting, approach: r.approach, refs: r.refs.map((id) => g.get(id)).filter((e): e is Entity => !!e).map(link) })),
  };
}
