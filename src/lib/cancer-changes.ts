import type { Cancer, Drug, Kind, Trial } from "./schema";
import { routeFor } from "./schema";
import type { Graph } from "./graph";

/**
 * "What changed" for one cancer: dated events read straight off the records that link to it. Nothing here is
 * inferred; every item carries the date its source field carries, at the precision that field has (a year, a
 * month, or a day). The pure builders (`sortChanges`, `groupByMonth`, `matchesCancer`, `yearOf`) are unit tested;
 * `changesForCancer` is the graph-backed collector used by the page and the cancer tab.
 */
export type ChangeKind = "approval" | "regulatory" | "trial" | "guideline" | "history" | "record";

export type ChangeItem = {
  /** As carried by the source field: "2024", "2025-03" or "2026-08-28". */
  date: string;
  kind: ChangeKind;
  /** One line, plain English. */
  title: string;
  /** A second line where the record has one (indication, result, note). */
  detail?: string;
  /** Where the item links to: the record it came from. */
  href: string;
  /** The record the item concerns. */
  ref: { id: string; name: string; kind: Kind };
  /** Where the date was read from, for the provenance line. */
  field: string;
};

export type ChangeGroup = { key: string; label: string; items: ChangeItem[] };

export const CHANGE_KIND_LABEL: Record<ChangeKind, string> = {
  approval: "Approval", regulatory: "Regulatory", trial: "Trial result", guideline: "Guideline", history: "Milestone", record: "This record",
};

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

/** First four-digit year in a free-text field ("FY2024", "2023/24", "2024 updates"); undefined when there is none. */
export function yearOf(value: string | number | undefined): number | undefined {
  if (value === undefined) return undefined;
  const m = String(value).match(/(?<!\d)(1[89]\d{2}|20\d{2})(?!\d)/);
  return m ? Number(m[1]) : undefined;
}

/** The parts a corpus date carries: "2024", "2025-03", "2026-08-28" or a quarter such as "2026-Q2". */
export function parseDate(date: string): { y: string; m?: string; d?: string; q?: number } {
  const [y = "0000", m, d] = date.split("-");
  const q = m?.match(/^Q([1-4])$/i);
  if (q) return { y, q: Number(q[1]) };
  return { y, m, d };
}

/**
 * "2024" -> "2024-00-00", "2025-03" -> "2025-03-00", "2026-Q2" -> "2026-06-00": a key that sorts newest first with
 * dated items ahead of year-only ones, and a quarter among the months it spans (its last month, before that month's dated items).
 */
export function dateKey(date: string): string {
  const p = parseDate(date);
  const m = p.q ? String(p.q * 3) : p.m ?? "00";
  return `${p.y.padStart(4, "0")}-${m.padStart(2, "0")}-${(p.d ?? "00").padStart(2, "0")}`;
}

/**
 * Items dated after `today` (a decision date set for next year) are "coming up", not changes. A year-only date in
 * the current year is a change: the year has begun. Both lists keep their order.
 */
export function splitUpcoming(items: ChangeItem[], today: string): { upcoming: ChangeItem[]; past: ChangeItem[] } {
  const t = dateKey(today);
  const upcoming: ChangeItem[] = [], past: ChangeItem[] = [];
  for (const it of items) {
    const p = parseDate(it.date);
    const future = dateKey(it.date) > t && (!!p.m || !!p.q || p.y > t.slice(0, 4));
    (future ? upcoming : past).push(it);
  }
  return { upcoming, past };
}

const KIND_ORDER: ChangeKind[] = ["approval", "regulatory", "guideline", "trial", "history", "record"];

/** Newest first; within one date, approvals before regulatory steps before guidelines before trials; then by title. */
export function sortChanges(items: ChangeItem[]): ChangeItem[] {
  return [...items].sort((a, b) => {
    const k = dateKey(b.date).localeCompare(dateKey(a.date));
    if (k) return k;
    const o = KIND_ORDER.indexOf(a.kind) - KIND_ORDER.indexOf(b.kind);
    return o || a.title.localeCompare(b.title);
  });
}

/** Month label for a date at whatever precision it has: "March 2025", "Q2 2026" or, for a year-only date, "2024". */
export function monthLabel(date: string): string {
  const p = parseDate(date);
  if (p.q) return `Q${p.q} ${p.y}`;
  const mi = p.m ? Number(p.m) : 0;
  return mi >= 1 && mi <= 12 ? `${MONTHS[mi - 1]} ${p.y}` : p.y;
}

/** Items that share a label share a group: the month, the quarter, or the bare year. */
const groupKey = (date: string) => { const p = parseDate(date); return p.q ? `${p.y}-Q${p.q}` : dateKey(date).slice(0, 7); };

/** Group an already sorted list by month (year-only items form their own group per year), keeping order. */
export function groupByMonth(items: ChangeItem[]): ChangeGroup[] {
  const out: ChangeGroup[] = [];
  for (const it of items) {
    const key = groupKey(it.date);
    const last = out.at(-1);
    if (last && last.key === key) last.items.push(it);
    else out.push({ key, label: monthLabel(it.date), items: [it] });
  }
  return out;
}

/** Words that identify a cancer in free text: its name without brackets, its aliases and its id with hyphens as spaces. Subtypes are left out: many are biomarker names shared across cancers. */
export function cancerNeedles(c: Pick<Cancer, "id" | "name" | "aka">): string[] {
  const bare = c.name.replace(/\s*\([^)]*\)\s*$/, "");
  const inBrackets = c.name.match(/\(([^)]+)\)/)?.[1];
  return [...new Set([bare, inBrackets, ...c.aka, c.id.replace(/-/g, " ")].filter((s): s is string => !!s && s.length > 2).map((s) => s.toLowerCase()))];
}

/**
 * Does a free-text field (an approval's indication, a regulatory note) concern this cancer? A drug tied to this
 * cancer alone is taken to be about it; a drug used in several cancers only contributes lines that name this one.
 */
export function matchesCancer(text: string, needles: string[], drugCancerCount: number): boolean {
  if (drugCancerCount <= 1) return true;
  const t = text.toLowerCase();
  return needles.some((n) => t.includes(n));
}

const REG_LABEL: Record<Drug["regulatoryEvents"][number]["type"], string> = {
  designation: "designation granted", filing: "filing accepted", pdufa: "decision date set", approval: "approval", crl: "complete response letter", withdrawal: "withdrawal", "label-change": "label change", "advisory-committee": "advisory committee",
};

const firstSentence = (s: string) => { const m = s.match(/^[^.!?]+[.!?]/); return (m ? m[0] : s).trim(); };

/** Every dated change for a cancer, newest first. */
export function changesForCancer(g: Graph, c: Cancer): ChangeItem[] {
  const items: ChangeItem[] = [];
  const needles = cancerNeedles(c);
  const near = g.forCancer(c.id);
  const cancerHref = routeFor(c);

  for (const d of (near.get("drug") ?? []) as Drug[]) {
    // Trust a drug only when its own cancers field names this cancer alone; anything reached indirectly must name the cancer in the text.
    const n = d.cancers.includes(c.id) ? d.cancers.length : Number.POSITIVE_INFINITY;
    for (const a of d.approvals) {
      if (!a.year || !matchesCancer(`${a.indication} ${a.note ?? ""}`, needles, n)) continue;
      items.push({ date: String(a.year), kind: "approval", title: `${d.name} approved in ${a.region}`, detail: a.indication, href: routeFor(d), ref: { id: d.id, name: d.name, kind: "drug" }, field: "approvals" });
    }
    for (const ev of d.regulatoryEvents) {
      if (!yearOf(ev.date) || !matchesCancer(ev.note, needles, n)) continue;
      items.push({ date: ev.date, kind: "regulatory", title: `${d.name}: ${REG_LABEL[ev.type]} (${ev.region})`, detail: ev.note, href: routeFor(d), ref: { id: d.id, name: d.name, kind: "drug" }, field: "regulatoryEvents" });
    }
  }

  for (const t of (near.get("trial") ?? []) as Trial[]) {
    if (!t.yearReported || !t.result) continue;
    items.push({ date: String(t.yearReported), kind: "trial", title: `${t.name} reported`, detail: firstSentence(t.result), href: routeFor(t), ref: { id: t.id, name: t.name, kind: "trial" }, field: "yearReported" });
  }

  for (const h of c.history) {
    const y = yearOf(h.year);
    if (!y) continue;
    const ref = h.refs.map((id) => g.get(id)).find((e) => !!e);
    items.push({ date: String(y), kind: "history", title: h.title, detail: h.note, href: ref ? routeFor(ref) : `${cancerHref}#history`, ref: ref ? { id: ref.id, name: ref.name, kind: ref.kind } : { id: c.id, name: c.name, kind: "cancer" }, field: "history" });
  }

  for (const s of c.standardOfCare) {
    const y = yearOf(s.guideline?.version);
    if (!y || !s.guideline) continue;
    const bits = [s.guideline.nccn ? `NCCN ${s.guideline.nccn}` : "", s.guideline.esmoMcbs ? `ESMO-MCBS ${s.guideline.esmoMcbs}` : ""].filter(Boolean).join(", ");
    items.push({ date: String(y), kind: "guideline", title: `Guideline ${s.guideline.version}: ${s.setting}`, detail: bits ? `${s.approach} (${bits})` : s.approach, href: s.guideline.url ?? `${cancerHref}#care`, ref: { id: c.id, name: c.name, kind: "cancer" }, field: "standardOfCare.guideline.version" });
  }

  if (c.provenance) items.push({ date: c.provenance.editedOn, kind: "record", title: `Record edited by ${c.provenance.editedBy}`, detail: c.provenance.note, href: cancerHref, ref: { id: c.id, name: c.name, kind: "cancer" }, field: "provenance.editedOn" });
  items.push({ date: c.asOf, kind: "record", title: "Facts on this page last checked", href: cancerHref, ref: { id: c.id, name: c.name, kind: "cancer" }, field: "asOf" });

  return sortChanges(items);
}
