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
 *
 *   npx tsx scripts/orphan-links.ts            plan only: print every edit and every skip
 *   npx tsx scripts/orphan-links.ts --apply    apply the edits in place and print what changed
 *
 * The editor finds the target record's object literal by `id: "<id>"` and checks the `name` literal (and `kind` when
 * present) before touching anything; it only appends to the one array, or adds the array after the `id` property when
 * the record lacks it and has no spread that might already supply it. Anything uncertain is skipped and reported.
 */
import { readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";
import { graph } from "../src/lib/graph";
import type { Entity } from "../src/lib/schema";

type SocRow = { setting: string; approach: string };
type Edit = { targetId: string; targetKind: string; targetName: string; field: string; add: string; soc?: SocRow; why: string };

const TRIAL_STAGE = new Set(["phase-3", "phase-2", "phase-1", "preclinical", "concept", "emerging", "planned", "recruiting", "active"]);
const DATA_DIR = join(process.cwd(), "src", "data");

// ---------------------------------------------------------------- planning

function nameTokens(d: Extract<Entity, { kind: "drug" }>): string[] {
  const raw = [d.name, d.brand, d.code, ...(d.aka ?? [])].filter((s): s is string => typeof s === "string" && s.trim().length >= 4);
  return [...new Set(raw.map((s) => s.trim()))];
}
function mentions(text: string, tokens: string[]): boolean {
  return tokens.some((t) => new RegExp(`(^|[^A-Za-z0-9])${t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?=$|[^A-Za-z0-9])`, "i").test(text));
}

export function planEdits(): { edits: Edit[]; noRelations: Array<{ id: string; kind: string }> } {
  const g = graph();
  const orphans = (g.entities as Entity[]).filter((e) => (e.kind === "drug" || e.kind === "company") && g.incoming(e.id).size === 0);
  const edits: Edit[] = [];
  const noRelations: Array<{ id: string; kind: string }> = [];
  const seen = new Set<string>();
  const push = (target: Entity, field: string, add: string, why: string, soc?: SocRow) => {
    const key = `${target.id}|${field}|${add}|${soc?.setting ?? ""}`;
    if (seen.has(key)) return; // a drug may list the same trial more than once
    seen.add(key);
    edits.push({ targetId: target.id, targetKind: target.kind, targetName: target.name, field, add, why, soc });
  };
  for (const o of orphans) {
    const before = edits.length;
    if (o.kind === "drug") {
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
  return { edits, noRelations };
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

export function applyEdits(edits: Edit[], write: boolean): { changed: string[]; skipped: string[] } {
  const files = dataFiles();
  const texts = new Map(files.map((f) => [f, readFileSync(f, "utf8")] as const));
  const scans = new Map<string, Scan>();
  const rescan = (f: string) => scans.set(f, scan(texts.get(f)!));
  for (const f of files) rescan(f);
  const changed: string[] = [];
  const skipped: string[] = [];
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
  }
  if (write) for (const f of touched) writeFileSync(f, texts.get(f)!);
  return { changed, skipped };
}

if (process.argv[1]?.endsWith("orphan-links.ts")) {
  const write = process.argv.includes("--apply");
  const { edits, noRelations } = planEdits();
  const { changed, skipped } = applyEdits(edits, write);
  for (const c of changed) console.log((write ? "EDIT  " : "PLAN  ") + c);
  for (const s of skipped) console.log("SKIP  " + s);
  console.log(`\n${edits.length} edits planned, ${changed.length} ${write ? "applied" : "applicable"}, ${skipped.length} skipped`);
  console.log(`${noRelations.length} orphans with no relation to reverse: ${noRelations.map((n) => `${n.id} (${n.kind})`).join(", ")}`);
  console.log(`records touched: ${new Set(changed.map((c) => c.split(" ")[1].split(".")[0])).size}`);
}
