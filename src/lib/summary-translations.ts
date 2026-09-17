import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { Lang } from "./layer";
import { DOSE_RE } from "./translate";

/**
 * Machine translations of the long English summaries, cached on disk and shown only while the English they were
 * made from is unchanged.
 *
 * Store: public/i18n/summaries/<lang>/<recordId>.json, one small file per record and language:
 *   { "source_hash": sha256 of the trimmed English summary, "text": the translation, "model": served model id,
 *     "date": YYYY-MM-DD, "example"?: true for hand-written illustrations }
 * One file per translation rather than one per kind so the batch script rewrites a few hundred bytes at a time, two
 * agents translating different languages or kinds never touch the same file, and an agent or a reader can fetch a
 * single translation by URL (/i18n/summaries/zh/pcr.json) without downloading a kind's worth of text.
 *
 * Staleness: the loader compares `source_hash` with the hash of the record's current summary and returns nothing on
 * a mismatch, so an edited English summary silently drops its old translations until scripts/translate-summaries.ts
 * regenerates them. Nothing here fabricates text; the only writer is that script.
 *
 * This module reads the filesystem, so it is for server components, scripts and tests. Pages pass the small
 * per-record map from `summaryTranslationsFor` to the client component that renders it (src/components/SummaryText.tsx).
 */
export const SUMMARY_TRANSLATIONS_DIR = join(process.cwd(), "public", "i18n", "summaries");

export type SummaryLang = Exclude<Lang, "en">;
export const SUMMARY_LANGS: readonly SummaryLang[] = ["es", "zh", "pt", "hi", "fr", "de", "ja", "ar"];

/** The file as written on disk. */
export type SummaryTranslationFile = { source_hash: string; text: string; model: string; date: string; example?: boolean };

/** What a page needs: the text plus the provenance shown under it. */
export type SummaryTranslation = { text: string; model: string; date: string; example?: boolean };

/** Per-record map for the client: only languages with a translation whose hash matches the current English. */
export type SummaryTranslations = Partial<Record<SummaryLang, SummaryTranslation>>;

/** sha256 (hex) of the trimmed English summary: the key that ties a translation to the text it was made from. */
export function summaryHash(summary: string): string {
  return createHash("sha256").update(summary.trim(), "utf8").digest("hex");
}

export function summaryTranslationPath(lang: SummaryLang, recordId: string, dir = SUMMARY_TRANSLATIONS_DIR): string {
  return join(dir, lang, `${recordId}.json`);
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** Parse one stored file; undefined when the JSON is malformed or the shape is wrong (never throws on bad data). */
export function parseSummaryTranslation(raw: string): SummaryTranslationFile | undefined {
  try {
    const v = JSON.parse(raw) as Partial<SummaryTranslationFile>;
    if (!v || typeof v !== "object") return undefined;
    if (typeof v.source_hash !== "string" || !/^[0-9a-f]{64}$/.test(v.source_hash)) return undefined;
    if (typeof v.text !== "string" || !v.text.trim()) return undefined;
    if (typeof v.model !== "string" || !v.model) return undefined;
    if (typeof v.date !== "string" || !ISO_DATE.test(v.date)) return undefined;
    return { source_hash: v.source_hash, text: v.text, model: v.model, date: v.date, ...(v.example ? { example: true } : {}) };
  } catch { return undefined; }
}

/** The stored file for a record and language whatever its hash (for the batch script's skip check), or undefined. */
export function readSummaryTranslation(lang: SummaryLang, recordId: string, dir = SUMMARY_TRANSLATIONS_DIR): SummaryTranslationFile | undefined {
  const file = summaryTranslationPath(lang, recordId, dir);
  return existsSync(file) ? parseSummaryTranslation(readFileSync(file, "utf8")) : undefined;
}

/**
 * The translation of `summary` into `lang` for a record, only when its source_hash matches the current English.
 * Example files (hand-written, `example: true`) count like real ones; stale or malformed files return undefined.
 */
export function loadSummaryTranslation(recordId: string, lang: SummaryLang, summary: string, dir = SUMMARY_TRANSLATIONS_DIR): SummaryTranslation | undefined {
  const f = readSummaryTranslation(lang, recordId, dir);
  if (!f || f.source_hash !== summaryHash(summary)) return undefined;
  return { text: f.text, model: f.model, date: f.date, ...(f.example ? { example: true } : {}) };
}

/** Every valid translation of a record's summary, keyed by language. A few kilobytes at most; safe to pass to the client. */
export function summaryTranslationsFor(e: { id: string; summary: string }, dir = SUMMARY_TRANSLATIONS_DIR): SummaryTranslations {
  const out: SummaryTranslations = {};
  if (!e.summary.trim()) return out;
  for (const lang of SUMMARY_LANGS) {
    const t = loadSummaryTranslation(e.id, lang, e.summary, dir);
    if (t) out[lang] = t;
  }
  return out;
}

/** Record ids with a file under each language directory, split by whether the hash still matches. For coverage. */
export function summaryTranslationIndex(entities: ReadonlyArray<{ id: string; summary: string }>, dir = SUMMARY_TRANSLATIONS_DIR): Record<SummaryLang, { valid: Set<string>; stale: Set<string> }> {
  const byId = new Map(entities.map((e) => [e.id, e.summary]));
  const out = Object.fromEntries(SUMMARY_LANGS.map((l) => [l, { valid: new Set<string>(), stale: new Set<string>() }])) as Record<SummaryLang, { valid: Set<string>; stale: Set<string> }>;
  for (const lang of SUMMARY_LANGS) {
    const d = join(dir, lang);
    if (!existsSync(d)) continue;
    for (const f of readdirSync(d)) {
      if (!f.endsWith(".json")) continue;
      const id = f.slice(0, -5);
      const parsed = parseSummaryTranslation(readFileSync(join(d, f), "utf8"));
      const summary = byId.get(id);
      if (!parsed || summary === undefined) { out[lang].stale.add(id); continue; }
      (parsed.source_hash === summaryHash(summary) ? out[lang].valid : out[lang].stale).add(id);
    }
  }
  return out;
}

// ---- validation of a candidate translation -------------------------------------------------------------------------

/** Trial registry ids the translation must carry through unchanged. */
const NCT_RE = /\bNCT\d{8}\b/g;

/**
 * Gene and protein symbols, heuristically: an upper-case token of two to six letters that carries a digit (HER2, BRCA1,
 * TP53, CDK4, PD-L1, IL-6), or one of the common digit-free symbols below. Plain acronyms (FDA, TNBC, EU) are left out
 * because a faithful translation may localise them.
 */
const GENE_RE = /\b[A-Z]{1,5}\d[A-Z0-9]{0,4}(?:-[A-Z0-9]{1,3})?\b|\b(?:PD-L?\d|IL-\d{1,2})\b/g;
const GENE_WORDS = new Set(["KRAS", "NRAS", "HRAS", "BRAF", "EGFR", "ALK", "RET", "MET", "KIT", "PTEN", "MYC", "APC", "VHL", "BCMA", "PSMA", "TIGIT", "VEGF", "VEGFR", "FGFR", "PDGFRA", "PDGFRB", "NTRK", "PIK3CA", "ERBB", "CTLA", "BRCA", "ESR", "HER", "FLT", "JAK", "TROP", "DLL", "CLDN", "MSI", "MMR", "TMB", "HRD", "ATR", "PARP", "PRMT", "MEK", "ERK", "AKT", "MTOR", "PDGFR", "NECTIN", "GPRC", "FCRH", "SSTR", "CEACAM", "MUC", "EPCAM", "NKG", "CDK", "KLK"]);

/** English function words: a sentence rich in these is English, whatever the target language. */
// Words that are also common in a target language are left out: "a" (es, fr, pt), "an" and "in" and "was" (de), "on" (fr), "as" (pt), "has" (es).
const EN_STOP = new Set(["the", "and", "of", "is", "are", "with", "for", "that", "to", "were", "be", "have", "not", "by", "it", "this", "which", "from", "when", "after", "than", "but", "its", "their", "who", "these", "those", "into", "while", "where", "been", "also", "most", "more", "other", "such", "then", "can", "may", "should", "does", "did", "would", "there", "they", "them", "about", "over", "under", "between", "without", "within", "because", "if", "so", "each", "both", "same", "very", "only", "still", "yet", "now", "here"]);

export type TranslationCheck = { ok: true } | { ok: false; problems: string[] };

/** Tokens the translation must preserve exactly: NCT ids and gene symbols. */
export function protectedTokens(source: string): string[] {
  const ncts = source.match(NCT_RE) ?? [];
  const genes: string[] = [...(source.match(GENE_RE) ?? []), ...source.split(/[^A-Za-z0-9]+/).filter((w) => GENE_WORDS.has(w))];
  return [...new Set([...ncts, ...genes])];
}

/** Spaces and separators out, so "7.4 GBq" and "7,4 GBq", "150 mg" and "150mg" compare equal. */
const flatten = (s: string) => s.replace(/[\s.,]/g, "").replace(/×/g, "x").toLowerCase();

/** Doses in the English `text` (see DOSE_RE), flattened. The output is searched flattened too, so full-width punctuation after a dose does not hide it. */
export function doseTokens(text: string): string[] {
  return (text.match(DOSE_RE) ?? []).map(flatten);
}

/**
 * Sentences that are still English: nine words or more (space-separated, so Chinese and Japanese prose never reaches
 * nine) with at least two English function words making up a seventh or more of them. Trial names, drug names and ids
 * stay untranslated but are short, so they never trigger it.
 */
export function englishSentences(text: string): string[] {
  const out: string[] = [];
  for (const raw of text.split(/(?<=[.!?。！？])\s+|\n+/)) {
    const s = raw.trim();
    if (!s) continue;
    const words = s.split(/\s+/).filter(Boolean);
    if (words.length <= 8) continue;
    const lower = words.map((w) => w.toLowerCase().replace(/^[^a-z]+|[^a-z]+$/g, ""));
    const stop = lower.filter((w) => EN_STOP.has(w)).length;
    if (stop >= 2 && stop / words.length >= 0.15) out.push(s);
  }
  return out;
}

/**
 * The checks a machine translation must pass before it is written: non-empty, not left in English, and every NCT id,
 * dose and gene symbol from the English present in the output. Heuristic by design; a failing check means the
 * translation is not written and the record stays English, never that a translation is patched up.
 */
export function validateTranslation(source: string, output: string): TranslationCheck {
  const problems: string[] = [];
  const text = output.trim();
  if (!text) return { ok: false, problems: ["empty output"] };
  // Chinese and Japanese run to roughly a third of the English character count; anything under a fifth is a truncation.
  if (text.length < source.trim().length * 0.2) problems.push(`output is much shorter than the source (${text.length} vs ${source.trim().length} characters)`);
  const english = englishSentences(text);
  if (english.length) problems.push(`English sentence left untranslated: "${english[0].slice(0, 80)}"`);
  for (const tok of protectedTokens(source)) if (!text.includes(tok)) problems.push(`missing token ${tok}`);
  const flat = flatten(text);
  for (const d of new Set(doseTokens(source))) if (!flat.includes(d)) problems.push(`missing dose ${d}`);
  return problems.length ? { ok: false, problems } : { ok: true };
}
