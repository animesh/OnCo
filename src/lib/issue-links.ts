import type { Kind } from "./schema";
import { KIND_META, routeFor } from "./schema";
import { absoluteUrl } from "./seo";

/**
 * Every link from the site into the GitHub repository that asks for a change goes through here,
 * and every one of them opens an *issue form* or a *discussion*, never the file editor.
 *
 * Rule: there are no "edit this record on GitHub" links anywhere on OnCo. Corrections and
 * improvements enter through the issue gate (templates in .github/ISSUE_TEMPLATE) so they can be
 * safety-checked, sourced, and validated before a maintainer merges them. Read-only links to a
 * record's source (blob URLs) are fine; edit URLs are not.
 */
export const REPO = "https://github.com/judegomila/OnCo";
export const ISSUES_URL = `${REPO}/issues`;
export const DISCUSSIONS_URL = `${REPO}/discussions`;

/** Slug of the Discussions category that holds one thread per object. Created once in repository settings. */
export const DISCUSSION_CATEGORY = "objects";

export type IssueTemplate =
  | "suggest-edit"
  | "fact-correction"
  | "stale-fact"
  | "trial-readout"
  | "regional-approval"
  | "translation-fix"
  | "translation-review"
  | "accessibility"
  | "review"
  | "new-object"
  | "bug";

/** Default labels applied by each template (mirrors the `labels:` line of the form). */
const LABELS: Record<IssueTemplate, string> = {
  "suggest-edit": "suggested-edit",
  "fact-correction": "correction",
  "stale-fact": "correction,stale",
  "trial-readout": "trial-readout",
  "regional-approval": "regional-approval",
  "translation-fix": "translation",
  "translation-review": "translation,review",
  accessibility: "accessibility,bug",
  review: "review",
  "new-object": "new-object",
  bug: "bug",
};

/** Canonical public URL of an entity page, for issue bodies. */
export function pageUrl(kind: Kind, id: string): string {
  return absoluteUrl(routeFor({ kind, id }));
}

/** "id (kind)" as the forms expect it in their `entity` field. */
export function entityRef(kind: Kind, id: string): string {
  return `${id} (${KIND_META[kind].label.toLowerCase()})`;
}

/**
 * Open a prefilled issue form. `fields` are keyed by the form's field ids; GitHub fills inputs,
 * textareas and dropdowns from matching query parameters. Empty values are dropped.
 */
export function issueUrl(template: IssueTemplate, fields: Record<string, string | undefined> = {}, opts: { title?: string; labels?: string[] } = {}): string {
  const p = new URLSearchParams({ template: `${template}.yml` });
  if (opts.title) p.set("title", opts.title);
  p.set("labels", (opts.labels ?? LABELS[template].split(",")).join(","));
  for (const [k, v] of Object.entries(fields)) if (v) p.set(k, v);
  return `${ISSUES_URL}/new?${p.toString()}`;
}

/** The "Suggest an edit" issue for one record, with the page and record location in the body. */
export function suggestEditUrl(e: { kind: Kind; id: string; name: string }, extra: { field?: string; why?: string; recordUrl?: string } = {}): string {
  const where = [`Page: ${pageUrl(e.kind, e.id)}`, extra.recordUrl ? `Record: ${extra.recordUrl}` : ""].filter(Boolean).join(" · ");
  return issueUrl("suggest-edit", { entity: `${entityRef(e.kind, e.id)} · ${e.name}`, field: extra.field, why: extra.why ? `${extra.why} · ${where}` : where }, { title: `edit: ${e.id}${extra.field ? ` · ${extra.field}` : ""}` });
}

/**
 * The "Translation fix" issue for a machine-translated summary, with the record, the language (the form's dropdown
 * label, e.g. "Spanish") and where the text came from prefilled. The translated text itself is long, so the reader
 * pastes the sentence at fault rather than the URL carrying the whole summary.
 */
export function translationFixUrl(e: { kind: Kind; id: string; name: string }, language: string, extra: { model?: string; date?: string; field?: string } = {}): string {
  const what = `${extra.field ?? "Summary"}, machine translated${extra.model ? ` by ${extra.model}` : ""}${extra.date ? ` on ${extra.date}` : ""}. Page: ${pageUrl(e.kind, e.id)}`;
  return issueUrl("translation-fix", { entity: `${entityRef(e.kind, e.id)} · ${e.name}`, language, current: what }, { title: `translation: ${e.id} (${language})` });
}

/** Search the object's Discussions category for threads mentioning this id. */
export function discussionSearchUrl(id: string): string {
  const q = new URLSearchParams({ discussions_q: `category:${DISCUSSION_CATEGORY} ${id}` });
  return `${DISCUSSIONS_URL}?${q.toString()}`;
}

/** Start a thread about one object in the Objects category, prefilled from the discussion form. */
export function newDiscussionUrl(e: { kind: Kind; id: string; name: string }): string {
  const p = new URLSearchParams({ category: DISCUSSION_CATEGORY, title: `${e.id}: ${e.name}`, entity: entityRef(e.kind, e.id), page: pageUrl(e.kind, e.id) });
  return `${DISCUSSIONS_URL}/new?${p.toString()}`;
}
