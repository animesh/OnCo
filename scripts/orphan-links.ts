/**
 * Reverse links for orphaned drugs and companies (records nothing links to, see scripts/orphans.ts).
 *
 * The orphan's own relation arrays already assert the relationship; this script adds the reverse edge on the
 * other record so the orphan gets an inbound link. Nothing is invented: only ids the orphan names are used.
 *   drug     -> its companies list it in `drugs`; its trials list it in `drugs`; its cancers list it in `pipeline`
 *               (trial-stage drugs) or in a standardOfCare row's `refs` when that row's approach text names it;
 *               fallback when none of those exist: its technologies, then its targets, list it in `drugs`.
 *   company  -> its drugs list it in `companies`; its institutions and technologies list it in `companies`;
 *               fallback: its trials list it in `companies`.
 *   trial    -> (--trials) its drugs, companies and technologies list it in `trials`; when it names no company, the
 *               sponsor string is resolved through src/data/sponsor-aliases.ts and an existing company record lists it;
 *               its cancers list it in `trials` only when it is phase 3, phase 2/3, platform, or carries a `result`
 *               (--phase3-only: phase 3 or a result), so cancer pages do not fill with early registry entries; a cancer
 *               gains at most 60 trials a run (--cancer-cap N), preferring trials the cancer alone would de-orphan, then
 *               trials with a result, then the largest by enrolment. The rest stay reachable through drugs and companies.
 *
 *   npx tsx scripts/orphan-links.ts                     plan only for drugs and companies: print every edit and every skip
 *   npx tsx scripts/orphan-links.ts --trials            plan only for trials, with the largest cancer `trials` arrays before and after
 *   npx tsx scripts/orphan-links.ts --apply             apply the edits in place and print what changed (combine with --trials)
 *   npx tsx scripts/orphan-links.ts --trials --phase3-only --cancer-cap 40   tighter cancer rule and a lower per-cancer cap
 *
 * The editor finds the target record's object literal by `id: "<id>"` and checks the `name` literal (and `kind` when
 * present) before touching anything; it only appends to the one array, or adds the array after the `id` property when
 * the record lacks it and has no spread that might already supply it. Anything uncertain is skipped and reported.
 */
import { readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";
import { graph } from "../src/lib/graph";
import { resolveSponsor } from "../src/data/sponsor-aliases";
import type { Entity } from "../src/lib/schema";

type SocRow = { setting: string; approach: string };
type Edit = { targetId: string; targetKind: string; targetName: string; field: string; add: string; soc?: SocRow; why: string };
type Mode = { kinds: Array<Entity["kind"]>; phase3Only: boolean; cancerCap: number };

const TRIAL_STAGE = new Set(["phase-3", "phase-2", "phase-1", "preclinical", "concept", "emerging", "planned", "recruiting", "active"]);
/** Phases whose trials may be listed on a cancer page; early registry entries stay reachable through drugs and companies. */
const CANCER_PHASES = new Set(["3", "2/3", "platform"]);
/** A cancer page gains at most this many trials in one run (--cancer-cap N, 0 for no cap); the rest stay reachable through their drugs and companies. */
const CANCER_GAIN_CAP = 60;
const DATA_DIR = join(process.cwd(), "src", "data");

// ---------------------------------------------------------------- planning

function nameTokens(d: Extract<Entity, { kind: "drug" }>): string[] {
  const raw = [d.name, d.brand, d.code, ...(d.aka ?? [])].filter((s): s is string => typeof s === "string" && s.trim().length >= 4);
  return [...new Set(raw.map((s) => s.trim()))];
}
function mentions(text: string, tokens: string[]): boolean {
  return tokens.some((t) => new RegExp(`(^|[^A-Za-z0-9])${t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?=$|[^A-Za-z0-9])`, "i").test(text));
}

type TrialEntity = Extract<Entity, { kind: "trial" }>;

/** Whether an orphan trial is mature enough to appear in a cancer's `trials` list. A trial with a curated headline result always is. */
export function cancerEligible(t: TrialEntity, phase3Only: boolean): boolean {
  if (t.result) return true;
  return phase3Only ? t.phase === "3" : CANCER_PHASES.has(t.phase);
}

/** Order candidates for a capped cancer: trials the cancer alone would de-orphan, then trials with a result, then the largest. */
function cancerPriority(a: { t: TrialEntity; otherLink: boolean }, b: { t: TrialEntity; otherLink: boolean }): number {
  return Number(a.otherLink) - Number(b.otherLink) || Number(Boolean(b.t.result)) - Number(Boolean(a.t.result)) || (b.t.enrolled ?? 0) - (a.t.enrolled ?? 0) || a.t.id.localeCompare(b.t.id);
}

export type Plan = { edits: Edit[]; noRelations: Array<{ id: string; kind: string }>; notes: string[] };

export function planEdits(mode: Mode = { kinds: ["drug", "company"], phase3Only: false, cancerCap: CANCER_GAIN_CAP }): Plan {
  const g = graph();
  const kinds = new Set<string>(mode.kinds);
  const orphans = (g.entities as Entity[]).filter((e) => kinds.has(e.kind) && g.incoming(e.id).size === 0);
  const edits: Edit[] = [];
  const noRelations: Array<{ id: string; kind: string }> = [];
  const notes: string[] = [];
  const seen = new Set<string>();
  const linked = new Set<string>();
  const push = (target: Entity, field: string, add: string, why: string, soc?: SocRow) => {
    const key = `${target.id}|${field}|${add}|${soc?.setting ?? ""}`;
    if (seen.has(key)) return; // a drug may list the same trial more than once
    seen.add(key);
    linked.add(add);
    edits.push({ targetId: target.id, targetKind: target.kind, targetName: target.name, field, add, why, soc });
  };
  let sponsorToCompany = 0, sponsorNotCompany = 0, sponsorUnmatched = 0, cancerHeldBack = 0;
  /** Cancer links are decided after the loop so a per-cancer cap can prefer the trials that most need them. */
  const cancerCandidates = new Map<string, Array<{ t: TrialEntity; otherLink: boolean }>>();
  for (const o of orphans) {
    const before = edits.length;
    if (o.kind === "trial") {
      for (const d of o.drugs) push(g.must(d), "trials", o.id, "trial.drugs");
      for (const c of o.companies) push(g.must(c), "trials", o.id, "trial.companies");
      if (!o.companies.length && o.sponsor) {
        const r = resolveSponsor(o.sponsor);
        const target = r.matched && r.id ? g.get(r.id) : undefined;
        if (target?.kind === "company") { sponsorToCompany++; push(target, "trials", o.id, `trial.sponsor "${o.sponsor}" -> ${r.id}`); }
        else if (target) sponsorNotCompany++; // sponsor aliases also name institutions; only companies are asked for here
        else sponsorUnmatched++;
      }
      for (const t of o.technologies) push(g.must(t), "trials", o.id, "trial.technologies");
      if (cancerEligible(o, mode.phase3Only)) for (const c of o.cancers) cancerCandidates.set(c, [...(cancerCandidates.get(c) ?? []), { t: o, otherLink: edits.length > before }]);
      else if (o.cancers.length) cancerHeldBack++;
      continue; // noRelations for trials is settled after the cancer pass
    } else if (o.kind === "drug") {
      const tokens = nameTokens(o);
      for (const c of o.companies) push(g.must(c), "drugs", o.id, "drug.companies");
      for (const t of o.trials) push(g.must(t), "drugs", o.id, "drug.trials");
      for (const cid of o.cancers) {
        const c = g.must(cid);
        if (c.kind !== "cancer") continue;
        let named = false;
        for (const row of c.standardOfCare) {
          if (row.refs.includes(o.id) || !mentions(row.approach, tokens)) continue;
          named = true;
          push(c, "standardOfCare.refs", o.id, "drug.cancers (approach names it)", { setting: row.setting, approach: row.approach });
        }
        if (!named && o.status && TRIAL_STAGE.has(o.status) && !c.pipeline.includes(o.id)) push(c, "pipeline", o.id, `drug.cancers (${o.status})`);
      }
      if (edits.length === before) for (const t of o.technologies) { const tech = g.must(t); if (tech.kind === "technology") push(tech, "drugs", o.id, "drug.technologies (fallback)"); }
      if (edits.length === before) for (const t of o.targets) push(g.must(t), "drugs", o.id, "drug.targets (fallback)");
    } else {
      for (const d of o.drugs) push(g.must(d), "companies", o.id, "company.drugs");
      for (const i of o.institutions) push(g.must(i), "companies", o.id, "company.institutions");
      for (const t of o.technologies) push(g.must(t), "companies", o.id, "company.technologies");
      if (edits.length === before) for (const t of o.trials) push(g.must(t), "companies", o.id, "company.trials (fallback)");
    }
    if (edits.length === before) noRelations.push({ id: o.id, kind: o.kind });
  }
  const capped: string[] = [];
  for (const [cid, list] of cancerCandidates) {
    const c = g.must(cid);
    const keep = mode.cancerCap > 0 && list.length > mode.cancerCap ? [...list].sort(cancerPriority).slice(0, mode.cancerCap) : list;
    if (keep.length < list.length) capped.push(`${cid} ${keep.length} of ${list.length}`);
    for (const { t } of keep) push(c, "trials", t.id, `trial.cancers (phase ${t.phase}${t.result ? ", result" : ""})`);
  }
  for (const o of orphans) if (o.kind === "trial" && !linked.has(o.id)) noRelations.push({ id: o.id, kind: o.kind });
  if (kinds.has("trial")) {
    notes.push(`sponsor fallback (trials naming no company): ${sponsorToCompany} resolved to a company, ${sponsorNotCompany} resolved to a non-company record (skipped), ${sponsorUnmatched} unmatched`);
    notes.push(`cancer rule (${mode.phase3Only ? "phase 3, or a result" : "phase 3, 2/3, platform, or a result"}): ${cancerHeldBack} trials held back from cancer pages`);
    notes.push(`cancer cap ${mode.cancerCap || "off"}: ${capped.length ? `kept ${capped.join(", ")}` : "no cancer capped"}`);
  }
  return { edits, noRelations, notes };
}

/** Largest cancer `trials` arrays now and after the planned edits, plus the largest gain. */
export function cancerTrialSizes(edits: Edit[], top = 8): { before: Array<[string, number]>; after: Array<[string, number]>; maxGain: [string, number] } {
  const g = graph();
  const gain = new Map<string, number>();
  for (const e of edits) if (e.targetKind === "cancer" && e.field === "trials") gain.set(e.targetId, (gain.get(e.targetId) ?? 0) + 1);
  const cancers = g.kind("cancer");
  const desc = (rows: Array<[string, number]>) => rows.sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, top);
  const before = desc(cancers.map((c) => [c.id, c.trials.length] as [string, number]));
  const after = desc(cancers.map((c) => [c.id, c.trials.length + (gain.get(c.id) ?? 0)] as [string, number]));
  const maxGain = desc([...gain.entries()])[0] ?? ["none", 0];
  return { before, after, maxGain };
}

// ---------------------------------------------------------------- source scanning

/** mask[i] is true for characters inside strings, template literals or comments; depth[i] is the number of brackets strictly enclosing i; match[i] is the partner of a bracket. */
type Scan = { mask: Uint8Array; depth: Int32Array; match: Int32Array };

function scan(src: string): Scan {
  const n = src.length;
  const mask = new Uint8Array(n);
  const depth = new Int32Array(n);
  const match = new Int32Array(n).fill(-1);
  const stack: number[] = [];
  let i = 0;
  while (i < n) {
    const ch = src[i];
    const next = src[i + 1];
    if (ch === "/" && next === "/") { while (i < n && src[i] !== "\n") { mask[i] = 1; depth[i] = stack.length; i++; } continue; }
    if (ch === "/" && next === "*") { const end = src.indexOf("*/", i + 2); const stop = end < 0 ? n : end + 2; while (i < stop) { mask[i] = 1; depth[i] = stack.length; i++; } continue; }
    if (ch === '"' || ch === "'" || ch === "`") {
      const q = ch; mask[i] = 1; depth[i] = stack.length; i++;
      while (i < n && src[i] !== q) { if (src[i] === "\\") { mask[i] = 1; depth[i] = stack.length; i++; } mask[i] = 1; depth[i] = stack.length; i++; }
      if (i < n) { mask[i] = 1; depth[i] = stack.length; i++; }
      continue;
    }
    if (ch === "{" || ch === "[" || ch === "(") { depth[i] = stack.length; stack.push(i); i++; continue; }
    if (ch === "}" || ch === "]" || ch === ")") { const open = stack.pop(); depth[i] = stack.length; if (open !== undefined) { match[open] = i; match[i] = open; } i++; continue; }
    depth[i] = stack.length; i++;
  }
  return { mask, depth, match };
}

type Prop = { key: string; start: number; end: number; vStart: number; vEnd: number; spread: boolean };

/** Top-level elements of the bracketed span starting at `open`, trimmed, parsed as `key: value` when they look like it. */
function elements(src: string, s: Scan, open: number): Prop[] {
  const close = s.match[open];
  const inner = s.depth[open] + 1;
  const out: Prop[] = [];
  let start = open + 1;
  const flush = (end: number) => {
    let a = start, b = end;
    while (a < b && /\s/.test(src[a])) a++;
    while (b > a && /\s/.test(src[b - 1])) b--;
    if (a >= b) return;
    const text = src.slice(a, b);
    const m = /^(?:([A-Za-z_$][\w$]*)|"([^"]+)")\s*:/.exec(text);
    if (m) { let vStart = a + m[0].length; while (vStart < b && /\s/.test(src[vStart])) vStart++; out.push({ key: m[1] ?? m[2], start: a, end: b, vStart, vEnd: b, spread: false }); }
    else out.push({ key: text.startsWith("...") ? "..." : text, start: a, end: b, vStart: a, vEnd: b, spread: text.startsWith("...") });
  };
  for (let i = open + 1; i < close; i++) {
    if (s.mask[i] || s.depth[i] !== inner) continue;
    if (src[i] === ",") { flush(i); start = i + 1; }
  }
  flush(close);
  return out;
}

function stringLiteral(src: string, p: Prop | undefined): string | undefined {
  if (!p) return undefined;
  const v = src.slice(p.vStart, p.vEnd);
  if (/^"(?:[^"\\]|\\.)*"$/.test(v)) { try { return JSON.parse(v) as string; } catch { return undefined; } }
  if (/^'(?:[^'\\]|\\.)*'$/.test(v)) return v.slice(1, -1).replace(/\\'/g, "'");
  return undefined;
}

function dataFiles(dir = DATA_DIR): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) { if (name !== "i18n") out.push(...dataFiles(p)); continue; }
    if (name.endsWith(".ts") && !name.endsWith(".test.ts") && !name.endsWith(".d.ts")) out.push(p);
  }
  return out;
}

type Located = { file: string; open: number; props: Prop[] };

/** Every object literal in the corpus whose `id` and `name` literals match the record (and whose `kind`, when written, matches). */
function locate(files: string[], texts: Map<string, string>, scans: Map<string, Scan>, id: string, kind: string, name: string): Located[] {
  const found: Located[] = [];
  const re = new RegExp(`\\bid:\\s*"${id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"`, "g");
  for (const file of files) {
    const src = texts.get(file)!;
    if (!src.includes(`"${id}"`)) continue;
    const s = scans.get(file)!;
    for (const m of src.matchAll(re)) {
      const at = m.index;
      if (s.mask[at]) continue;
      // innermost enclosing "{"
      let open = -1;
      for (let i = at - 1; i >= 0; i--) if (!s.mask[i] && src[i] === "{" && s.match[i] > at && s.depth[i] === s.depth[at] - 1) { open = i; break; }
      if (open < 0) continue;
      const props = elements(src, s, open);
      const byKey = (k: string) => props.find((p) => p.key === k);
      if (stringLiteral(src, byKey("id")) !== id) continue;
      if (stringLiteral(src, byKey("name")) !== name) continue;
      const k = byKey("kind");
      if (k && stringLiteral(src, k) !== kind) continue;
      // Non-entity tables (interaction agents, lookups) reuse entity ids and names: an entity literal carries `kind`, or `tldr` and `summary` when a helper adds the kind.
      if (!k && !(byKey("tldr") && byKey("summary"))) continue;
      found.push({ file, open, props });
    }
  }
  return found;
}

/** Insert `"add"` into the array literal spanning [vStart, vEnd). Returns the replacement text. */
function appendToArray(src: string, vStart: number, vEnd: number, add: string): string | undefined {
  if (src[vStart] !== "[" || src[vEnd - 1] !== "]") return undefined;
  const inner = src.slice(vStart + 1, vEnd - 1);
  if (inner.trim() === "") return `["${add}"]`;
  let k = inner.length - 1;
  while (k >= 0 && /\s/.test(inner[k])) k--;
  const trailing = inner.slice(k + 1);
  const quote = inner.trimStart()[0] === "'" ? "'" : '"';
  const item = `${quote}${add}${quote}`;
  return inner[k] === "," ? `[${inner.slice(0, k + 1)} ${item},${trailing}]` : `[${inner.slice(0, k + 1)}, ${item}${trailing}]`;
}

function lineOf(src: string, at: number): number { return src.slice(0, at).split("\n").length; }

export function applyEdits(edits: Edit[], write: boolean): { changed: string[]; skipped: string[]; applied: Edit[] } {
  const files = dataFiles();
  const texts = new Map(files.map((f) => [f, readFileSync(f, "utf8")] as const));
  const scans = new Map<string, Scan>();
  const rescan = (f: string) => scans.set(f, scan(texts.get(f)!));
  for (const f of files) rescan(f);
  const changed: string[] = [];
  const skipped: string[] = [];
  const applied: Edit[] = [];
  const touched = new Set<string>();
  const label = (e: Edit) => `${e.targetId}.${e.field}${e.soc ? `[${JSON.stringify(e.soc.setting)}]` : ""} += "${e.add}" (${e.why})`;

  for (const e of edits) {
    const hits = locate(files, texts, scans, e.targetId, e.targetKind, e.targetName);
    if (!hits.length) { skipped.push(`${label(e)}: record literal not found`); continue; }
    const withKind = hits.filter((h) => h.props.some((p) => p.key === "kind"));
    const chosen = (withKind.length ? withKind : hits)[0];
    const note = hits.length > 1 ? ` [${hits.length} literals share this id; edited the first]` : "";
    const src = texts.get(chosen.file)!;
    const s = scans.get(chosen.file)!;
    const rel = relative(process.cwd(), chosen.file);
    let replaceStart = -1, replaceEnd = -1, replacement = "", newField = false;

    if (e.field === "standardOfCare.refs" && e.soc) {
      const socProp = chosen.props.find((p) => p.key === "standardOfCare");
      if (!socProp || src[socProp.vStart] !== "[") { skipped.push(`${label(e)}: standardOfCare not an array literal in the record (row may live in a spike patch)`); continue; }
      const rows = elements(src, s, socProp.vStart).filter((r) => src[r.start] === "{");
      const row = rows.find((r) => { const ps = elements(src, s, r.start); return stringLiteral(src, ps.find((p) => p.key === "setting")) === e.soc!.setting && stringLiteral(src, ps.find((p) => p.key === "approach")) === e.soc!.approach; });
      if (!row) { skipped.push(`${label(e)}: standardOfCare row not found in the base record (probably a spike patch)`); continue; }
      const ps = elements(src, s, row.start);
      const refs = ps.find((p) => p.key === "refs");
      if (refs) {
        const r = appendToArray(src, refs.vStart, refs.vEnd, e.add);
        if (!r) { skipped.push(`${label(e)}: refs is not an array literal`); continue; }
        if (src.slice(refs.vStart, refs.vEnd).includes(`"${e.add}"`)) { skipped.push(`${label(e)}: already present`); continue; }
        replaceStart = refs.vStart; replaceEnd = refs.vEnd; replacement = r;
      } else {
        const approach = ps.find((p) => p.key === "approach")!;
        replaceStart = approach.end; replaceEnd = approach.end; replacement = `, refs: ["${e.add}"]`; newField = true;
      }
    } else {
      const prop = chosen.props.find((p) => p.key === e.field);
      if (prop) {
        if (src.slice(prop.vStart, prop.vEnd).includes(`"${e.add}"`)) { skipped.push(`${label(e)}: already present`); continue; }
        const r = appendToArray(src, prop.vStart, prop.vEnd, e.add);
        if (!r) { skipped.push(`${label(e)}: ${e.field} is not an array literal`); continue; }
        replaceStart = prop.vStart; replaceEnd = prop.vEnd; replacement = r;
      } else {
        if (chosen.props.some((p) => p.spread)) { skipped.push(`${label(e)}: record has no ${e.field} and uses a spread that may supply it`); continue; }
        const idProp = chosen.props.find((p) => p.key === "id")!;
        replaceStart = idProp.end; replaceEnd = idProp.end; replacement = `, ${e.field}: ["${e.add}"]`; newField = true;
      }
    }
    const next = src.slice(0, replaceStart) + replacement + src.slice(replaceEnd);
    texts.set(chosen.file, next);
    rescan(chosen.file);
    touched.add(chosen.file);
    changed.push(`${rel}:${lineOf(src, replaceStart)} ${label(e)}${newField ? " [new field]" : ""}${note}`);
    applied.push(e);
  }
  if (write) for (const f of touched) writeFileSync(f, texts.get(f)!);
  return { changed, skipped, applied };
}

if (process.argv[1]?.endsWith("orphan-links.ts")) {
  const write = process.argv.includes("--apply");
  const trials = process.argv.includes("--trials");
  const capArg = process.argv.indexOf("--cancer-cap");
  const mode: Mode = { kinds: trials ? ["trial"] : ["drug", "company"], phase3Only: process.argv.includes("--phase3-only"), cancerCap: capArg >= 0 ? Number(process.argv[capArg + 1]) : CANCER_GAIN_CAP };
  const { edits, noRelations, notes } = planEdits(mode);
  const sizes = trials ? cancerTrialSizes(edits) : undefined;
  const { changed, skipped, applied } = applyEdits(edits, write);
  for (const c of changed) console.log((write ? "EDIT  " : "PLAN  ") + c);
  for (const s of skipped) console.log("SKIP  " + s);
  console.log(`\n${edits.length} edits planned, ${changed.length} ${write ? "applied" : "applicable"}, ${skipped.length} skipped`);
  const tally = (key: (e: Edit) => string) => { const m = new Map<string, number>(); for (const e of applied) m.set(key(e), (m.get(key(e)) ?? 0) + 1); return [...m.entries()].sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${v}`).join(", "); };
  console.log(`by relation: ${tally((e) => e.why.split(" (")[0].split(' "')[0])}`);
  console.log(`by target kind: ${tally((e) => e.targetKind)}`);
  for (const n of notes) console.log(n);
  console.log(`${noRelations.length} orphans with no relation to reverse: ${noRelations.slice(0, 40).map((n) => `${n.id} (${n.kind})`).join(", ")}${noRelations.length > 40 ? " ..." : ""}`);
  console.log(`records touched: ${new Set(changed.map((c) => c.split(" ")[1].split(".")[0])).size}`);
  if (sizes) {
    console.log(`largest cancer trials arrays before: ${sizes.before.map(([id, n]) => `${id} ${n}`).join(", ")}`);
    console.log(`largest cancer trials arrays after:  ${sizes.after.map(([id, n]) => `${id} ${n}`).join(", ")}`);
    console.log(`largest gain: ${sizes.maxGain[0]} +${sizes.maxGain[1]}${sizes.maxGain[1] > CANCER_GAIN_CAP ? ` [ABOVE ${CANCER_GAIN_CAP}: rerun with --phase3-only or a lower --cancer-cap]` : ""}`);
  }
}
