/**
 * Model panel batch: asks each model on the panel to comment on records and writes the reviews to
 * public/reviews/models/<recordId>.json (one file per record, an array of ModelReview).
 *
 * Per record and model:
 *   1. Build a prompt from the record's own fields, its linked records (names and TL;DRs) and the
 *      sources a model may cite (the record's links, Wikipedia page, guideline and regulatory URLs).
 *   2. Call the Anthropic Messages API with plain fetch, asking for JSON in the ModelReview shape.
 *   3. Validate the JSON with the Zod schema in src/lib/model-reviews.ts; reject any verdict whose
 *      source is not one of the record's own sources; record the model that actually served the reply.
 *   4. Merge into the record's file: earlier output from the same model is replaced, example entries
 *      (hand-written illustrations) are dropped once a live review exists.
 *
 * Nothing is fabricated: a failed or refused call writes nothing and is reported. Without an API key
 * the script prints the prompts it would send and exits 0.
 *
 * Environment:
 *   ANTHROPIC_API_KEY        required for live calls
 *   MODEL_REVIEW_MODELS      comma-separated model ids, default "claude-fable-5-1"; display names,
 *                            providers and versions come from MODEL_PANEL in src/lib/model-reviews.ts
 *
 * Run: npx tsx scripts/model-reviews.ts tnbc sacituzumab-govitecan
 *      npx tsx scripts/model-reviews.ts --kind cancer --limit 20
 *      npx tsx scripts/model-reviews.ts --kind drug --limit 5 --force      re-review records that already have output
 *      npx tsx scripts/model-reviews.ts tnbc --dry-run                     print prompts even when a key is set
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { graph } from "../src/lib/graph";
import { KINDS, REL_FIELDS, type Entity, type Kind } from "../src/lib/schema";
import { CONFIDENCES, DEFAULT_MODEL_ID, MODEL_REVIEWS_DIR, ModelReviewSchema, STANCES, foreignSources, panelModel, parseModelReviews, recordSources, type ModelReview } from "../src/lib/model-reviews";

const argv = process.argv.slice(2);
const flag = (name: string) => argv.includes(`--${name}`);
const opt = (name: string): string | undefined => {
  const eq = argv.find((a) => a.startsWith(`--${name}=`));
  if (eq) return eq.slice(name.length + 3);
  const i = argv.indexOf(`--${name}`);
  return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[i + 1] : undefined;
};
const kindOpt = opt("kind");
const limit = Number(opt("limit") ?? Infinity);
const force = flag("force");
const dryRun = flag("dry-run");
const ids = argv.filter((a, i) => !a.startsWith("--") && !(argv[i - 1] === "--kind" || argv[i - 1] === "--limit"));

const API_KEY = process.env.ANTHROPIC_API_KEY;
const MODEL_IDS = (process.env.MODEL_REVIEW_MODELS ?? DEFAULT_MODEL_ID).split(",").map((s) => s.trim()).filter(Boolean);
const API_URL = "https://api.anthropic.com/v1/messages";
const today = new Date().toISOString().slice(0, 10);

const g = graph();

function pickRecords(): Entity[] {
  if (ids.length) return ids.map((id) => g.must(id));
  if (kindOpt) {
    if (!KINDS.includes(kindOpt as Kind)) throw new Error(`Unknown kind "${kindOpt}". Kinds: ${KINDS.join(", ")}`);
    const list = g.kind(kindOpt as Kind).slice().sort((a, b) => g.degree(b.id) - g.degree(a.id) || a.name.localeCompare(b.name));
    return list.slice(0, Number.isFinite(limit) ? limit : list.length);
  }
  throw new Error("Give record ids, or --kind <kind> [--limit n].");
}

/** The record as the model sees it: every field except relation id arrays, which become named links. */
function recordView(e: Entity): Record<string, unknown> {
  const view: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(e)) {
    if ((REL_FIELDS as readonly string[]).includes(k)) continue;
    if (v === undefined || (Array.isArray(v) && v.length === 0)) continue;
    view[k] = v;
  }
  return view;
}

function linkedRecords(e: Entity): string[] {
  const lines: string[] = [];
  for (const [kind, list] of g.neighbours(e.id)) for (const n of list) lines.push(`- ${kind} "${n.name}" (${n.id}): ${n.tldr}`);
  return lines;
}

const SYSTEM = [
  "You are one model on a panel commenting on records in OnCo, a public, cited knowledge graph of oncology.",
  "Your output is machine commentary shown next to the record, clearly labelled as not a clinical review. Do not give treatment advice.",
  "Judge the record only against its own text and the sources listed. Never cite a URL that is not in the sources list. Never invent facts, trials, dates or figures.",
  "Each verdict is one claim, quoted or closely paraphrased from the record's wording so that other panel members can be matched against it, with a stance:",
  `  ${STANCES.join(", ")}. "supports" means the record states it and the source backs it; "disputes" means you read the source differently; "missing" means the record should cover it and does not; "unclear" means the record's own sources do not settle it.`,
  "Write in British English. No em-dashes. Reply with JSON only, no prose before or after it.",
].join("\n");

function buildPrompt(e: Entity): { system: string; user: string } {
  const sources = recordSources(e);
  const linked = linkedRecords(e);
  const user = [
    `Record (${e.kind}):`,
    "```json",
    JSON.stringify(recordView(e), null, 1),
    "```",
    "",
    `Linked records (${linked.length}):`,
    ...(linked.length ? linked : ["- none"]),
    "",
    `Sources you may cite (${sources.length}); use the label and url exactly as written:`,
    ...(sources.length ? sources.map((s, i) => `${i + 1}. ${s.label}: ${s.url}`) : ["- none: leave every source field out"]),
    "",
    "Return JSON with exactly these fields:",
    "{",
    '  "verdicts": [ { "claim": string, "stance": "' + STANCES.join('" | "') + '", "note": string, "source": { "label": string, "url": string } } ],',
    '  "summary": string,',
    '  "confidence": "' + CONFIDENCES.join('" | "') + '"',
    "}",
    "Between three and eight verdicts. Every verdict should carry a source from the list where one applies. The summary is one paragraph on what is right, what is missing and what is disputed. Confidence is how far the record's own sources let you check it.",
  ].join("\n");
  return { system: SYSTEM, user };
}

type ApiResponse = { model: string; stop_reason: string; content: Array<{ type: string; text?: string }>; stop_details?: { category?: string | null; explanation?: string } };

async function callModel(modelId: string, system: string, user: string, key: string): Promise<ApiResponse> {
  // Server-side refusal fallbacks are only accepted on the Fable and Opus 5 families; the served model is recorded either way.
  const fallbacks = /^claude-(fable|opus-5)/.test(modelId);
  const headers: Record<string, string> = { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" };
  if (fallbacks) headers["anthropic-beta"] = "server-side-fallback-2026-07-01";
  const body = { model: modelId, max_tokens: 16000, system, messages: [{ role: "user", content: user }], ...(fallbacks ? { fallbacks: "default" } : {}) };
  for (let attempt = 1; ; attempt++) {
    const res = await fetch(API_URL, { method: "POST", headers, body: JSON.stringify(body) });
    if (res.ok) return (await res.json()) as ApiResponse;
    const text = await res.text();
    const retry = (res.status === 429 || res.status >= 500) && attempt < 4;
    if (!retry) throw new Error(`HTTP ${res.status}: ${text.slice(0, 400)}`);
    const wait = Number(res.headers.get("retry-after")) * 1000 || attempt * 4000;
    console.warn(`  ${modelId}: HTTP ${res.status}, retrying in ${wait / 1000}s`);
    await new Promise((r) => setTimeout(r, wait));
  }
}

function extractJson(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const body = fenced ? fenced[1] : text;
  const start = body.indexOf("{");
  const end = body.lastIndexOf("}");
  if (start < 0 || end <= start) throw new Error("no JSON object in reply");
  return JSON.parse(body.slice(start, end + 1));
}

function fileFor(id: string) { return join(MODEL_REVIEWS_DIR, `${id}.json`); }

function existing(id: string): ModelReview[] {
  const f = fileFor(id);
  return existsSync(f) ? parseModelReviews(id, readFileSync(f, "utf8")) : [];
}

function save(id: string, review: ModelReview) {
  const kept = existing(id).filter((r) => !r.example && r.model.id !== review.model.id);
  const list = [...kept, review].sort((a, b) => b.date.localeCompare(a.date) || a.model.name.localeCompare(b.model.name));
  mkdirSync(MODEL_REVIEWS_DIR, { recursive: true });
  writeFileSync(fileFor(id), JSON.stringify(list, null, 2) + "\n");
}

async function reviewOne(e: Entity, modelId: string, key: string): Promise<string | null> {
  const { system, user } = buildPrompt(e);
  const res = await callModel(modelId, system, user, key);
  if (res.stop_reason === "refusal") return `refused${res.stop_details?.category ? ` (${res.stop_details.category})` : ""}`;
  if (res.stop_reason !== "end_turn") return `stopped early (${res.stop_reason})`;
  const text = res.content.filter((b) => b.type === "text").map((b) => b.text ?? "").join("\n");
  let parsed: unknown;
  try { parsed = extractJson(text); } catch (err) { return `unparseable reply: ${(err as Error).message}`; }
  const served = panelModel(res.model || modelId);
  const candidate = { recordId: e.id, model: served, date: today, ...(typeof parsed === "object" && parsed ? parsed : {}) };
  const v = ModelReviewSchema.safeParse(candidate);
  if (!v.success) return `invalid JSON: ${v.error.issues.map((i) => `${i.path.join(".")} ${i.message}`).join("; ")}`;
  const foreign = foreignSources(v.data, e);
  if (foreign.length) return `cited sources outside the record: ${foreign.join(", ")}`;
  save(e.id, v.data);
  return null;
}

async function main() {
  const records = pickRecords();
  console.log(`${records.length} record${records.length === 1 ? "" : "s"}, models: ${MODEL_IDS.join(", ")}`);
  if (!API_KEY || dryRun) {
    console.log(API_KEY ? "Dry run: printing prompts, calling nothing." : "ANTHROPIC_API_KEY is not set: printing the prompts that would be sent, writing nothing.");
    for (const e of records) {
      const { system, user } = buildPrompt(e);
      console.log(`\n===== ${e.id} (${e.kind}) =====\n--- system ---\n${system}\n--- user ---\n${user}`);
    }
    return;
  }
  let ok = 0; let failed = 0;
  for (const e of records) {
    const have = new Set(existing(e.id).filter((r) => !r.example).map((r) => r.model.id));
    for (const modelId of MODEL_IDS) {
      if (!force && have.has(modelId)) { console.log(`${e.id} / ${modelId}: already reviewed, skipping (use --force)`); continue; }
      process.stdout.write(`${e.id} / ${modelId}: `);
      try {
        const problem = await reviewOne(e, modelId, API_KEY);
        if (problem) { failed++; console.log(`NOT WRITTEN, ${problem}`); } else { ok++; console.log("written"); }
      } catch (err) {
        failed++;
        console.log(`NOT WRITTEN, ${(err as Error).message}`);
      }
      await new Promise((r) => setTimeout(r, 500));
    }
  }
  console.log(`\n${ok} written, ${failed} failed. Files under public/reviews/models/.`);
  if (failed) process.exitCode = 1;
}

main().catch((err) => { console.error(err); process.exit(1); });
