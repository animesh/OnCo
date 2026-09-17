/**
 * How much of a page reads in the chosen language. Switching the site language translates menus, headings and TL;DRs
 * but not the long summaries and tables, so a record page is part translated; this estimates the share, per kind and
 * language, from the graph, with no build:
 *
 *   npx tsx scripts/translation-coverage.ts                    top eight kinds by record count, all eight languages
 *   npx tsx scripts/translation-coverage.ts --kinds drug,cancer --langs es,zh
 *   npx tsx scripts/translation-coverage.ts --top 12
 *   npx tsx scripts/translation-coverage.ts --html out/drugs/trastuzumab/index.html
 *
 * Graph mode counts the visible words of each record: the TL;DR (replaced by its translation when one exists) against the
 * summary, notes and every other text field a page shows. The share for a language is translated TL;DR words over all
 * record words, weighted by the English word counts, so Chinese and Japanese (few spaces) are compared fairly. Site
 * chrome (menus, headings, column labels) is always translated and left out of both sides.
 *
 * HTML mode reads one built page and reports words by `lang` attribute and how many sit inside translate="no", which is
 * what a browser translator and a screen reader see. Built pages are the English server render, so this checks the
 * markup (is the summary marked lang="en", are names marked untranslatable), not the client-side language swap.
 */
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { graph } from "../src/lib/graph";
import { KIND_META, KINDS, REL_FIELDS, type Entity, type Kind } from "../src/lib/schema";

const args = process.argv.slice(2);
const opt = (name: string): string | null => { const i = args.indexOf(name); return i >= 0 && args[i + 1] && !args[i + 1].startsWith("--") ? args[i + 1] : null; };

/** Fields that are not text a reader sees, or that are shown by chrome rather than as body text. */
const SKIP = new Set<string>(["id", "kind", "name", "aka", "tags", "status", "asOf", "tldr", "simple", "wikipedia", "links", "website", "url", "logo", "portrait", "parent", "route", "ticker", "doi", "pmid", "nct", "nctId", "orcid", "openalexId", "source", "sources", "ref", "file", ...REL_FIELDS]);
const URLISH = /^(https?:\/\/|\/)/;

export const words = (s: string): number => { const t = s.trim(); return t ? t.split(/\s+/).length : 0; };

/** Visible body words of a record apart from its TL;DR: strings and string arrays, plus strings inside row objects. */
export function bodyWords(e: Entity): number {
  let n = 0;
  const walk = (v: unknown, depth: number) => {
    if (typeof v === "string") { if (!URLISH.test(v)) n += words(v); return; }
    if (Array.isArray(v)) { for (const x of v) walk(x, depth + 1); return; }
    if (v && typeof v === "object" && depth < 3) for (const [k, x] of Object.entries(v as Record<string, unknown>)) if (!SKIP.has(k)) walk(x, depth + 1);
  };
  for (const [k, v] of Object.entries(e as unknown as Record<string, unknown>)) if (!SKIP.has(k)) walk(v, 0);
  return n;
}

async function loadTables(codes: string[]): Promise<Record<string, Record<string, string>>> {
  const dir = join(process.cwd(), "src", "data", "i18n");
  const have = new Set(readdirSync(dir).filter((f) => /^[a-z]{2}\.ts$/.test(f)).map((f) => f.slice(0, 2)));
  const out: Record<string, Record<string, string>> = {};
  for (const code of codes) {
    if (!have.has(code)) { console.warn(`no table for ${code}`); continue; }
    const mod = (await import(join(dir, `${code}.ts`))) as Record<string, unknown>;
    const t = mod[`tldr_${code}`];
    if (t && typeof t === "object") out[code] = t as Record<string, string>;
  }
  return out;
}

type Row = { kind: Kind; n: number; tldr: number; body: number; share: Record<string, number>; translated: Record<string, number> };

export function measure(entities: Entity[], tables: Record<string, Record<string, string>>, kinds: Kind[]): Row[] {
  const rows: Row[] = [];
  for (const kind of kinds) {
    const list = entities.filter((e) => e.kind === kind);
    if (!list.length) continue;
    const tldr = list.reduce((a, e) => a + words(e.tldr), 0);
    const body = list.reduce((a, e) => a + bodyWords(e), 0);
    const share: Record<string, number> = {}; const translated: Record<string, number> = {};
    for (const [code, table] of Object.entries(tables)) {
      const hit = list.filter((e) => !!table[e.id]);
      const got = hit.reduce((a, e) => a + words(e.tldr), 0);
      share[code] = tldr + body ? got / (tldr + body) : 0;
      translated[code] = hit.length / list.length;
    }
    rows.push({ kind, n: list.length, tldr, body, share, translated });
  }
  return rows;
}

const pct = (x: number) => `${Math.round(x * 100)}%`.padStart(5);
const pad = (s: string, w: number) => s.padEnd(w);

function printGraphTable(rows: Row[], codes: string[]) {
  const head = [pad("kind", 12), pad("records", 8), pad("TL;DR w/rec", 12), pad("body w/rec", 11), pad("TL;DR share", 12), ...codes.map((c) => pad(c, 6))];
  console.log(head.join(" "));
  console.log("-".repeat(head.join(" ").length));
  for (const r of rows) {
    const cols = [pad(r.kind, 12), pad(String(r.n), 8), pad((r.tldr / r.n).toFixed(0), 12), pad((r.body / r.n).toFixed(0), 11), pad(pct(r.tldr / (r.tldr + r.body)), 12), ...codes.map((c) => pad(pct(r.share[c] ?? 0), 6))];
    console.log(cols.join(" "));
  }
  console.log("\nTranslated TL;DR share = words of a record page in the chosen language (TL;DR share is the ceiling when every TL;DR is translated).");
  console.log("Records with a translated TL;DR:");
  for (const r of rows) console.log(`  ${pad(r.kind, 12)} ${codes.map((c) => `${c} ${pct(r.translated[c] ?? 0)}`).join("  ")}`);
}

/** Words of a built page by declared language, plus how many sit in translate="no" (names and ids a translator leaves alone). */
export function htmlWords(html: string): { byLang: Record<string, number>; noTranslate: number; total: number } {
  const byLang: Record<string, number> = {}; let noTranslate = 0, total = 0;
  const stack: Array<{ tag: string; lang: string; nt: boolean }> = [{ tag: "#root", lang: "en", nt: false }];
  const VOID = new Set(["br", "hr", "img", "input", "meta", "link", "path", "circle", "rect", "line", "use", "source", "wbr", "area", "base", "col", "embed", "track"]);
  const SKIPPED = new Set(["script", "style", "noscript", "template", "svg", "title", "head"]);
  const re = /<!--[\s\S]*?-->|<(\/?)([a-zA-Z][\w:-]*)([^>]*?)(\/?)>|([^<]+)/g;
  let m: RegExpExecArray | null;
  const decode = (s: string) => s.replace(/&nbsp;|&#160;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, "\"").replace(/&#x27;|&#39;/g, "'");
  while ((m = re.exec(html))) {
    if (m[0].startsWith("<!--")) continue;
    if (m[5] !== undefined) {
      const top = stack[stack.length - 1];
      if (stack.some((s) => SKIPPED.has(s.tag))) continue;
      const n = words(decode(m[5]));
      if (!n) continue;
      total += n; byLang[top.lang] = (byLang[top.lang] ?? 0) + n; if (top.nt) noTranslate += n;
      continue;
    }
    const closing = m[1] === "/", tag = m[2].toLowerCase(), attrs = m[3] ?? "", selfClose = m[4] === "/";
    if (closing) { for (let i = stack.length - 1; i > 0; i--) if (stack[i].tag === tag) { stack.length = i; break; } continue; }
    if (selfClose || VOID.has(tag)) continue;
    const top = stack[stack.length - 1];
    const lang = /\blang="([^"]*)"/.exec(attrs)?.[1] ?? top.lang;
    const nt = top.nt || /\btranslate="no"/.test(attrs) || /\bclass="[^"]*\bnotranslate\b/.test(attrs);
    stack.push({ tag, lang, nt });
  }
  return { byLang, noTranslate, total };
}

async function main() {
  const html = opt("--html");
  if (html) {
    const r = htmlWords(readFileSync(html, "utf8"));
    console.log(`${html}: ${r.total} visible words`);
    for (const [lang, n] of Object.entries(r.byLang).sort((a, b) => b[1] - a[1])) console.log(`  lang=${pad(lang, 6)} ${String(n).padStart(7)} ${pct(n / r.total)}`);
    console.log(`  translate="no" ${String(r.noTranslate).padStart(7)} ${pct(r.noTranslate / r.total)}  (names, symbols, ids)`);
    return;
  }
  const g = graph();
  const all = g.entities;
  const wanted = opt("--kinds")?.split(",").map((k) => k.trim()).filter((k): k is Kind => (KINDS as readonly string[]).includes(k));
  const top = Number(opt("--top") ?? 8);
  const counts = new Map<Kind, number>();
  for (const e of all) counts.set(e.kind, (counts.get(e.kind) ?? 0) + 1);
  const kinds = wanted?.length ? wanted : [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, top).map(([k]) => k);
  const codes = (opt("--langs") ?? "es,zh,pt,hi,fr,de,ja,ar").split(",").map((c) => c.trim()).filter(Boolean);
  const tables = await loadTables(codes);
  const rows = measure(all, tables, kinds);
  console.log(`Share of a record page's words in the chosen language, by kind (${all.length} records; ${kinds.map((k) => KIND_META[k].plural).join(", ")})\n`);
  printGraphTable(rows, Object.keys(tables));
}

const isMain = process.argv[1]?.endsWith("translation-coverage.ts");
if (isMain) main().catch((e) => { console.error(e); process.exit(1); });
