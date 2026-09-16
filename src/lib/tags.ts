/**
 * Tags that record how a record entered the corpus (which list or fetcher produced it) rather than
 * anything about the subject. They stay on the record for audits and the JSON API but are hidden from
 * reader-facing pills and excluded from similarity scoring, so two records are never "similar" merely
 * because both were gap-filled from the same list.
 */
export const INTERNAL_TAGS: ReadonlySet<string> = new Set([
  "gap-fill", "chembl-gap", "ctgov-ingest", "ctgov-sponsor", "nci-list", "nci-coverage", "ema-list", "spike",
]);

export function isInternalTag(tag: string): boolean {
  return INTERNAL_TAGS.has(tag) || tag.startsWith("lesson:") || tag.startsWith("evidence:");
}

/** Reader-facing tags only. */
export function publicTags(tags: readonly string[]): string[] {
  return tags.filter((t) => !isInternalTag(t));
}
