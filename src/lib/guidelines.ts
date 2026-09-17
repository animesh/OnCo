import { graph } from "./graph";
import { guidelineVersions, type GuidelineVersion } from "@/data/guideline-versions";
import { guidelineMap } from "@/data/guideline-map";

/** Helpers for /guidelines/: validation against the graph, version diffs and concordance judgements. */

export function validateGuidelines(): void {
  const g = graph();
  const errors: string[] = [];
  const seen = new Set<string>();
  for (const v of guidelineVersions) {
    if (seen.has(v.id)) errors.push(`${v.id}: duplicate version id`);
    seen.add(v.id);
    const c = g.get(v.cancerId);
    if (!c || c.kind !== "cancer") errors.push(`${v.id}: cancerId "${v.cancerId}" is not a cancer`);
    if (!/^\d{4}-\d{2}$/.test(v.date)) errors.push(`${v.id}: date "${v.date}" is not YYYY-MM`);
    if (!/^https?:\/\//.test(v.url)) errors.push(`${v.id}: url is not absolute`);
    if (!v.changes.length) errors.push(`${v.id}: no changes listed`);
    for (const ch of v.changes) for (const id of ch.refs) if (!g.get(id)) errors.push(`${v.id}: unknown ref "${id}" in "${ch.setting}"`);
  }
  const keys = new Set<string>();
  for (const e of guidelineMap) {
    if (keys.has(e.key)) errors.push(`${e.key}: duplicate map key`);
    keys.add(e.key);
    if (e.key !== `${e.cancerId}#${e.setting}`) errors.push(`${e.key}: key does not match cancerId#setting`);
    const c = g.get(e.cancerId);
    if (!c || c.kind !== "cancer") errors.push(`${e.key}: cancerId "${e.cancerId}" is not a cancer`);
    for (const id of e.refs) if (!g.get(id)) errors.push(`${e.key}: unknown ref "${id}"`);
    if (e.bodies.length < 2) errors.push(`${e.key}: needs at least two bodies to compare`);
    for (const b of e.bodies) if (!/^https?:\/\//.test(b.url)) errors.push(`${e.key}: ${b.body} url is not absolute`);
  }
  if (errors.length) throw new Error(`Invalid guideline data:\n${errors.join("\n")}`);
}

/** Versions for a cancer, oldest first. */
export function versionsFor(cancerId: string): GuidelineVersion[] {
  return guidelineVersions.filter((v) => v.cancerId === cancerId).sort((a, b) => a.date.localeCompare(b.date) || a.body.localeCompare(b.body));
}

/** Cancers that have any version history or concordance rows. */
export function guidelineCancerIds(): string[] {
  return [...new Set([...guidelineVersions.map((v) => v.cancerId), ...guidelineMap.map((e) => e.cancerId)])];
}

/**
 * Changes accumulated after version `from` up to and including version `to` (both ids; `from` may be null for
 * "from the beginning"). Each version lists what changed relative to its predecessor, so the diff between two
 * versions is the union of the intervening change lists, grouped by kind.
 */
export { diffVersions, concordanceOf, STANCE_LABEL, STANCE_CLASS, type Concordance } from "./guidelines-shared";
import { concordanceOf } from "./guidelines-shared";

export function concordanceSummary() {
  const rows = guidelineMap.map((e) => ({ e, verdict: concordanceOf(e) }));
  return { rows, concordant: rows.filter((r) => r.verdict === "concordant").length, discordant: rows.filter((r) => r.verdict === "discordant").length, partial: rows.filter((r) => r.verdict === "partial").length };
}
