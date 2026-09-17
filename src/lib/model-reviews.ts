import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { z } from "zod";
import type { Entity } from "./schema";

/**
 * Model panel: machine commentary on records.
 *
 * A panel of AI models reads a record and says what is right, what is missing and what is disputed,
 * each claim tied to one of the record's own sources. The output is commentary by a named model on a
 * date. It is not a clinical review and never replaces one: the human review path (src/data/reviews.ts,
 * /review/) sits below the panel on every page.
 *
 * Storage: one JSON file per record under public/reviews/models/<recordId>.json holding an array of
 * ModelReview. A batch (scripts/model-reviews.ts) writes them without touching TypeScript; this module
 * validates them with Zod when the static export is built and derives where models disagree.
 *
 * `example: true` marks hand-written illustrations of the shape (rendered with an "Example" badge). A
 * live batch run for the same record removes them.
 */

const id = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "ids are kebab-case");
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "YYYY-MM-DD");

export const STANCES = ["supports", "disputes", "missing", "unclear"] as const;
export type Stance = (typeof STANCES)[number];

export const STANCE_META: Record<Stance, { label: string; blurb: string; cls: string }> = {
  supports: { label: "Right", blurb: "The record states this and the source backs it.", cls: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200" },
  disputes: { label: "Disputed", blurb: "The model reads the source differently from the record.", cls: "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200" },
  missing: { label: "Missing", blurb: "Something the record should cover and does not.", cls: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200" },
  unclear: { label: "Unclear", blurb: "The model could not settle this from the record's own sources.", cls: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300" },
};

export const CONFIDENCES = ["low", "medium", "high"] as const;
export type Confidence = (typeof CONFIDENCES)[number];

export const ModelIdentitySchema = z.object({
  /** Provider model id, e.g. "claude-fable-5-1". */
  id: z.string().min(1),
  /** Display name shown on the panel, e.g. "Fable". */
  name: z.string().min(1),
  provider: z.string().min(1),
  version: z.string().min(1),
});
export type ModelIdentity = z.infer<typeof ModelIdentitySchema>;

export const VerdictSchema = z.object({
  claim: z.string().min(1),
  stance: z.enum(STANCES),
  note: z.string().min(1),
  source: z.object({ label: z.string().min(1), url: z.string().url() }).optional(),
});
export type Verdict = z.infer<typeof VerdictSchema>;

export const ModelReviewSchema = z.object({
  recordId: id,
  model: ModelIdentitySchema,
  date: isoDate,
  verdicts: z.array(VerdictSchema).min(1),
  /** One paragraph. */
  summary: z.string().min(1),
  confidence: z.enum(CONFIDENCES),
  /** Hand-written illustration of the shape, not a model's output. Rendered with an "Example" badge. */
  example: z.boolean().optional(),
});
export type ModelReview = z.infer<typeof ModelReviewSchema>;

export const ModelReviewFileSchema = z.array(ModelReviewSchema);

/**
 * The panel. Display names map to provider model ids here; the batch reads MODEL_REVIEW_MODELS
 * (comma-separated ids) and looks each one up in this table for its name, provider and version.
 * Owner: edit this table to add or rename panel members. Ids not listed are shown by their raw id.
 */
export const MODEL_PANEL: ModelIdentity[] = [
  { id: "claude-fable-5-1", name: "Fable", provider: "Anthropic", version: "5.1" },
  // Placeholder mapping for the second panel member: point "Astra" at the model id it should call.
  { id: "claude-opus-5", name: "Astra", provider: "Anthropic", version: "5" },
];

export const DEFAULT_MODEL_ID = "claude-fable-5-1";

export function panelModel(modelId: string): ModelIdentity {
  return MODEL_PANEL.find((m) => m.id === modelId) ?? { id: modelId, name: modelId, provider: "unknown", version: "unknown" };
}

export const MODEL_REVIEWS_DIR = join(process.cwd(), "public", "reviews", "models");

/** URLs a model may cite for a record: its links, its Wikipedia page, guideline and regulatory sources on its own rows. */
export function recordSources(e: Entity): Array<{ label: string; url: string }> {
  const out = new Map<string, string>();
  for (const l of e.links) out.set(l.url, l.label);
  if (e.wikipedia) out.set(e.wikipedia, "Wikipedia");
  if (e.kind === "cancer") {
    for (const row of e.standardOfCare) {
      const g = (row as { guideline?: { version?: string; url?: string } }).guideline;
      if (g?.url && !out.has(g.url)) out.set(g.url, g.version ? `${g.version} (${row.setting})` : `Guideline (${row.setting})`);
    }
  }
  const events = (e as { regulatoryEvents?: Array<{ source?: string; note?: string; date?: string }> }).regulatoryEvents ?? [];
  for (const ev of events) if (ev.source && !out.has(ev.source)) out.set(ev.source, ev.note ? ev.note.slice(0, 80) : `Regulatory notice ${ev.date ?? ""}`.trim());
  return [...out].map(([url, label]) => ({ label, url }));
}

/** Verdict sources that are not among the record's own sources. Empty when the review is properly sourced. */
export function foreignSources(review: ModelReview, e: Entity): string[] {
  const allowed = new Set(recordSources(e).map((s) => s.url));
  return review.verdicts.flatMap((v) => (v.source && !allowed.has(v.source.url) ? [v.source.url] : []));
}

/** Parse and validate one record's file content. Throws with the record id on invalid data. */
export function parseModelReviews(recordId: string, raw: string): ModelReview[] {
  const r = ModelReviewFileSchema.safeParse(JSON.parse(raw));
  if (!r.success) throw new Error(`public/reviews/models/${recordId}.json: ${r.error.issues.map((i) => `${i.path.join(".")} ${i.message}`).join("; ")}`);
  for (const rev of r.data) if (rev.recordId !== recordId) throw new Error(`public/reviews/models/${recordId}.json: review for ${rev.recordId} in the wrong file`);
  return r.data.sort((a, b) => b.date.localeCompare(a.date) || a.model.name.localeCompare(b.model.name));
}

const cache = new Map<string, ModelReview[]>();
let allCache: Map<string, ModelReview[]> | undefined;

/** Model reviews for one record, read from the filesystem at build time. Empty when the record has none. */
export function loadModelReviews(recordId: string, dir = MODEL_REVIEWS_DIR): ModelReview[] {
  const key = `${dir}:${recordId}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const file = join(dir, `${recordId}.json`);
  const list = existsSync(file) ? parseModelReviews(recordId, readFileSync(file, "utf8")) : [];
  cache.set(key, list);
  return list;
}

/** Every record with model reviews. */
export function allModelReviews(dir = MODEL_REVIEWS_DIR): Map<string, ModelReview[]> {
  if (allCache && dir === MODEL_REVIEWS_DIR) return allCache;
  const out = new Map<string, ModelReview[]>();
  if (existsSync(dir)) {
    for (const f of readdirSync(dir).filter((f) => f.endsWith(".json")).sort()) {
      const recordId = f.slice(0, -5);
      const list = loadModelReviews(recordId, dir);
      if (list.length) out.set(recordId, list);
    }
  }
  if (dir === MODEL_REVIEWS_DIR) allCache = out;
  return out;
}

export type Disagreement = {
  claim: string;
  positions: Array<{ model: ModelIdentity; stance: Stance; note: string; source?: Verdict["source"] }>;
};

const normClaim = (s: string) => s.toLowerCase().replace(/[\s]+/g, " ").replace(/[.!?]+$/, "").trim();

/**
 * Claims two or more models judged with different stances. Claims are matched on normalised text
 * (case, whitespace and trailing punctuation ignored), so the batch prompt asks models to quote the
 * record's own wording for each claim.
 */
export function disagreementsFor(reviews: ModelReview[]): Disagreement[] {
  const byClaim = new Map<string, Disagreement>();
  for (const r of reviews) {
    for (const v of r.verdicts) {
      const k = normClaim(v.claim);
      const d = byClaim.get(k) ?? { claim: v.claim, positions: [] };
      if (!d.positions.some((p) => p.model.id === r.model.id)) d.positions.push({ model: r.model, stance: v.stance, note: v.note, source: v.source });
      byClaim.set(k, d);
    }
  }
  return [...byClaim.values()].filter((d) => new Set(d.positions.map((p) => p.stance)).size > 1);
}

export type PanelModelRow = ModelIdentity & { records: number; latest?: string; onPanel: boolean };
export type PanelRecordRow = { recordId: string; models: number; disagreements: number; latest: string; example: boolean };

/** Overview for /review/: who is on the panel, how much each has covered, and which records split the panel. */
export function panelOverview(dir = MODEL_REVIEWS_DIR): { models: PanelModelRow[]; records: PanelRecordRow[] } {
  const all = allModelReviews(dir);
  const counts = new Map<string, { records: number; latest?: string; identity: ModelIdentity }>();
  for (const m of MODEL_PANEL) counts.set(m.id, { records: 0, identity: m });
  const records: PanelRecordRow[] = [];
  for (const [recordId, list] of all) {
    const seen = new Set<string>();
    for (const r of list) {
      const c = counts.get(r.model.id) ?? { records: 0, identity: r.model };
      if (!seen.has(r.model.id)) { c.records += 1; seen.add(r.model.id); }
      if (!c.latest || r.date > c.latest) c.latest = r.date;
      counts.set(r.model.id, c);
    }
    records.push({ recordId, models: seen.size, disagreements: disagreementsFor(list).length, latest: list.reduce((m, r) => (r.date > m ? r.date : m), ""), example: list.some((r) => r.example) });
  }
  records.sort((a, b) => b.disagreements - a.disagreements || b.models - a.models || b.latest.localeCompare(a.latest) || a.recordId.localeCompare(b.recordId));
  const models: PanelModelRow[] = [...counts.entries()].map(([mid, c]) => ({ ...c.identity, records: c.records, latest: c.latest, onPanel: MODEL_PANEL.some((m) => m.id === mid) }));
  models.sort((a, b) => Number(b.onPanel) - Number(a.onPanel) || b.records - a.records || a.name.localeCompare(b.name));
  return { models, records };
}
