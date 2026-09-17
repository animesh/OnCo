/**
 * Machine translation batch for the long English summaries (roadmap row 128). Writes one cached file per record and
 * language to public/i18n/summaries/<lang>/<recordId>.json, keyed by the sha256 of the English it was made from, so
 * src/lib/summary-translations.ts shows a translation only while the English is unchanged and this script regenerates
 * exactly the records whose English moved.
 *
 *   npx tsx scripts/translate-summaries.ts --lang zh --kind cancer --limit 50 --priority
 *   npx tsx scripts/translate-summaries.ts --lang es,pt --priority --limit 200
 *   npx tsx scripts/translate-summaries.ts --lang zh pcr tnbc                 named records
 *   npx tsx scripts/translate-summaries.ts --lang zh --kind term --dry-run    print prompts, call nothing
 *   npx tsx scripts/translate-summaries.ts --lang zh --kind drug --force      redo records whose stored hash matches
 *
 * --priority orders the queue by patient-traffic proxies available in the graph: cancers first, then drugs with an
 * approval (own `approvals`, curated regional row or status "approved"), then glossary terms in "Clinic basics" and
 * "Treatment jargon", then trials, then everything else; ties by graph degree. Without it the queue follows the corpus.
 * Records whose stored hash matches the current English are skipped (hand-written examples included) unless --force.
 *
 * Environment:
 *   ANTHROPIC_API_KEY   required for live calls; without it the script prints the queue and exits 0
 *   TRANSLATE_MODEL     model id, default "claude-fable-5-1"; the served model id is written to each file
 *
 * Every reply is validated (non-empty, no English sentence left over, every NCT id, dose and gene symbol from the
 * source present) before it is written. A failed or refused call writes nothing; nothing is ever fabricated.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { graph } from "../src/lib/graph";
import { KINDS, type Entity, type Kind } from "../src/lib/schema";
import { LANGS } from "../src/lib/layer";
import { approvedRegions, hasAnchorApproval, regionalApprovals } from "../src/data/regional-approvals";
import { readSummaryTranslation, summaryHash, summaryTranslationPath, SUMMARY_LANGS, validateTranslation, type SummaryLang, type SummaryTranslationFile } from "../src/lib/summary-translations";

const argv = process.argv.slice(2);
const flag = (name: string) => argv.includes(`--${name}`);
const VALUED = new Set(["lang", "kind", "limit"]);
const opt = (name: string): string | undefined => {
  const eq = argv.find((a) => a.startsWith(`--${name}=`));
  if (eq) return eq.slice(name.length + 3);
  const i = argv.indexOf(`--${name}`);
  return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[i + 1] : undefined;
};
const ids = argv.filter((a, i) => !a.startsWith("--") && !(argv[i - 1]?.startsWith("--") && VALUED.has(argv[i - 1].slice(2))));

const langs = (opt("lang") ?? "").split(",").map((s) => s.trim()).filter(Boolean) as SummaryLang[];
if (!langs.length || langs.some((l) => !SUMMARY_LANGS.includes(l))) {
  console.error(`Give --lang <code>[,code] from: ${SUMMARY_LANGS.join(", ")}`);
  process.exit(1);
}
const kindOpt = opt("kind");
if (kindOpt && !KINDS.includes(kindOpt as Kind)) { console.error(`Unknown kind "${kindOpt}". Kinds: ${KINDS.join(", ")}`); process.exit(1); }
const limit = Number(opt("limit") ?? Infinity);
const priority = flag("priority");
const force = flag("force");
const dryRun = flag("dry-run");

const API_KEY = process.env.ANTHROPIC_API_KEY;
const MODEL_ID = process.env.TRANSLATE_MODEL?.trim() || "claude-fable-5-1";
const API_URL = "https://api.anthropic.com/v1/messages";
const today = new Date().toISOString().slice(0, 10);

const g = graph();

// ---- queue --------------------------------------------------------------------------------------------------------

const PRIORITY_TERM_CATEGORIES = new Set(["Clinic basics", "Treatment jargon"]);

function hasApproval(e: Entity): boolean {
  if (e.kind !== "drug") return false;
  if (e.status === "approved" || hasAnchorApproval(e)) return true;
  const row = regionalApprovals[e.id];
  return !!row && approvedRegions(row).length > 0;
}

/** Lower is sooner. Patient-traffic proxies: what a newly diagnosed reader looks up first. */
export function priorityTier(e: Entity): number {
  if (e.kind === "cancer") return 0;
  if (hasApproval(e)) return 1;
  if (e.kind === "term" && PRIORITY_TERM_CATEGORIES.has(e.category)) return 2;
  if (e.kind === "trial") return 3;
  return 4;
}
const TIER_LABEL = ["cancer", "approved drug", "clinic term", "trial", "other"];

function pickRecords(): Entity[] {
  let list: Entity[];
  if (ids.length) list = ids.map((id) => g.must(id));
  else list = kindOpt ? g.kind(kindOpt as Kind).slice() : g.entities.slice();
  list = list.filter((e) => e.summary.trim().length > 0);
  if (priority) list.sort((a, b) => priorityTier(a) - priorityTier(b) || g.degree(b.id) - g.degree(a.id) || a.name.localeCompare(b.name));
  return list;
}

type Job = { e: Entity; lang: SummaryLang; state: "new" | "stale" | "done" | "example" };

function plan(records: Entity[]): Job[] {
  const jobs: Job[] = [];
  for (const lang of langs) {
    for (const e of records) {
      const have = readSummaryTranslation(lang, e.id);
      const state: Job["state"] = !have ? "new" : have.source_hash !== summaryHash(e.summary) ? "stale" : have.example ? "example" : "done";
      jobs.push({ e, lang, state });
    }
  }
  return jobs;
}

// ---- prompt -------------------------------------------------------------------------------------------------------

/** Per-language register and terminology notes. Drug names, gene symbols, trial ids and doses stay as written whatever the language. */
const LANG_NOTES: Record<SummaryLang, string> = {
  zh: "Simplified Chinese as used in mainland China. Use the standard terminology of the NMPA (国家药品监督管理局) and Chinese clinical guidelines for diseases, procedures and endpoints. Keep drug names in Latin script exactly as written.",
  es: "Neutral international Spanish. Use the standard medical terminology of Spanish-language oncology (SEOM, AEMPS) for diseases, procedures and endpoints.",
  pt: "Portuguese readable in Brazil and Portugal. Use the standard medical terminology of Portuguese-language oncology (ANVISA, INFARMED).",
  fr: "French. Use the standard medical terminology of French-language oncology (ANSM, HAS).",
  de: "German. Use the standard medical terminology of German-language oncology (BfArM, AWMF).",
  ja: "Japanese. Use the standard medical terminology of Japanese oncology (PMDA, JSCO); write drug names in Latin script exactly as in the English.",
  hi: "Hindi in Devanagari. Use the terms used by Indian oncology services; keep drug names, gene symbols and trial ids in Latin script.",
  ar: "Modern Standard Arabic. Use the standard medical terminology of Arabic-language oncology; keep drug names, gene symbols and trial ids in Latin script.",
};

const SYSTEM = [
  "You are a medical translator working on OnCo, a public, cited knowledge graph of oncology. You translate one English summary at a time.",
  "Translate faithfully: every statement in the English appears in the translation with the same meaning, hedging and order; nothing is added, dropped, softened or explained.",
  "Keep unchanged, exactly as written: drug names (generic and brand), gene and protein symbols, trial names and NCT ids, doses and units, database ids, and the names of companies and institutions.",
  "Use the standard medical terms of the target language rather than literal renderings.",
  "Plain register: the text is read by patients and clinicians alike. No honorifics, no marketing tone, no em-dashes.",
  "Keep paragraph breaks where the English has them.",
  "Return only the translation. No preface, no notes, no quotation marks around it, no code fences.",
].join("\n");

function buildPrompt(e: Entity, lang: SummaryLang): { system: string; user: string } {
  const name = LANGS.find((l) => l.code === lang);
  const user = [
    `Target language: ${name?.label ?? lang} (${lang}). ${LANG_NOTES[lang]}`,
    "",
    `Record: ${e.name} (${e.kind}, id ${e.id}).`,
    "English summary to translate:",
    "",
    e.summary.trim(),
  ].join("\n");
  return { system: SYSTEM, user };
}

// ---- API ----------------------------------------------------------------------------------------------------------

type ApiResponse = { model: string; stop_reason: string; content: Array<{ type: string; text?: string }>; stop_details?: { category?: string | null } };

async function callModel(system: string, user: string, key: string): Promise<ApiResponse> {
  const headers: Record<string, string> = { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" };
  const body = { model: MODEL_ID, max_tokens: 4096, system, messages: [{ role: "user", content: user }] };
  for (let attempt = 1; ; attempt++) {
    const res = await fetch(API_URL, { method: "POST", headers, body: JSON.stringify(body) });
    if (res.ok) return (await res.json()) as ApiResponse;
    const text = await res.text();
    const retry = (res.status === 429 || res.status >= 500) && attempt < 4;
    if (!retry) throw new Error(`HTTP ${res.status}: ${text.slice(0, 400)}`);
    const wait = Number(res.headers.get("retry-after")) * 1000 || attempt * 4000;
    console.warn(`  HTTP ${res.status}, retrying in ${wait / 1000}s`);
    await new Promise((r) => setTimeout(r, wait));
  }
}

/** The reply as plain text: fences and a stray wrapping quote pair removed, whitespace trimmed. */
export function cleanReply(text: string): string {
  let t = text.trim();
  const fenced = t.match(/^```[a-z]*\s*([\s\S]*?)\s*```$/);
  if (fenced) t = fenced[1].trim();
  if (/^["“「][\s\S]*["”」]$/.test(t) && !/["“「”」]/.test(t.slice(1, -1))) t = t.slice(1, -1).trim();
  return t;
}

async function translateOne(job: Job, key: string): Promise<string | null> {
  const { system, user } = buildPrompt(job.e, job.lang);
  const res = await callModel(system, user, key);
  if (res.stop_reason === "refusal") return `refused${res.stop_details?.category ? ` (${res.stop_details.category})` : ""}`;
  if (res.stop_reason !== "end_turn") return `stopped early (${res.stop_reason})`;
  const text = cleanReply(res.content.filter((b) => b.type === "text").map((b) => b.text ?? "").join("\n"));
  const check = validateTranslation(job.e.summary, text);
  if (!check.ok) return `failed validation: ${check.problems.join("; ")}`;
  const file: SummaryTranslationFile = { source_hash: summaryHash(job.e.summary), text, model: res.model || MODEL_ID, date: today };
  const path = summaryTranslationPath(job.lang, job.e.id);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify(file, null, 2) + "\n");
  return null;
}

// ---- main ---------------------------------------------------------------------------------------------------------

async function main() {
  const records = pickRecords();
  const jobs = plan(records);
  const todo = jobs.filter((j) => force || j.state === "new" || j.state === "stale");
  const queue = todo.slice(0, Number.isFinite(limit) ? limit : todo.length);
  const skipped = jobs.length - todo.length;
  console.log(`${records.length} records × ${langs.join(",")} = ${jobs.length} pairs; ${skipped} up to date, ${todo.length} to translate, ${queue.length} in this run${priority ? " (priority order)" : ""}; model ${MODEL_ID}`);

  if (!API_KEY || dryRun) {
    console.log(API_KEY ? "Dry run: printing prompts, calling nothing." : "ANTHROPIC_API_KEY is not set: printing the queue, writing nothing.");
    for (const j of queue) {
      const tier = priority ? `${TIER_LABEL[priorityTier(j.e)].padEnd(13)} ` : "";
      console.log(`  ${j.lang}  ${tier}${j.state.padEnd(5)} ${j.e.kind.padEnd(11)} ${j.e.id.padEnd(40)} ${j.e.summary.trim().length} chars`);
      if (dryRun && API_KEY) { const { system, user } = buildPrompt(j.e, j.lang); console.log(`--- system ---\n${system}\n--- user ---\n${user}\n`); }
    }
    return;
  }

  let ok = 0; let failed = 0;
  for (const j of queue) {
    process.stdout.write(`${j.lang} / ${j.e.id} (${j.state}): `);
    try {
      const problem = await translateOne(j, API_KEY);
      if (problem) { failed++; console.log(`NOT WRITTEN, ${problem}`); } else { ok++; console.log("written"); }
    } catch (err) {
      failed++;
      console.log(`NOT WRITTEN, ${(err as Error).message}`);
    }
    await new Promise((r) => setTimeout(r, 300));
  }
  console.log(`\n${ok} written, ${failed} failed. Files under public/i18n/summaries/<lang>/.`);
  if (failed) process.exitCode = 1;
}

const isMain = process.argv[1]?.endsWith("translate-summaries.ts");
if (isMain) main().catch((err) => { console.error(err); process.exit(1); });
