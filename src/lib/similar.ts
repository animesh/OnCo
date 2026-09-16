/**
 * "Pages like this": similarity between records that are not directly linked, from the links they share.
 *
 *   score = weighted Jaccard of neighbour sets + 0.5 x Jaccard of tag sets
 *
 * A shared neighbour counts 1 / log2(2 + degree), so sharing a rarely linked object (a specific trial)
 * says more than sharing a hub (a front or a common term). Fronts are ignored entirely. Direct neighbours
 * are excluded because they already appear under "Connected". Server-side only (imports the corpus);
 * scripts/build-similar.ts writes the result to public/api/v1/similar.json.
 */
import { graph } from "./graph";
import { publicTags } from "./tags";
import { routeFor, type Kind } from "./schema";

export type Similar = { id: string; score: number; shared: string[]; sharedTags: string[] };
export type SimilarLink = { id: string; kind: Kind; name: string; route: string; score: number; shared: Array<{ id: string; name: string; route: string }>; sharedTags: string[] };

export const TOP_N = 8;
const MIN_SCORE = 0.04;
/** Nodes with more links than this are not used to find candidates (they would nominate everything), but still count when shared. */
const HUB = 250;

let cache: Map<string, Similar[]> | undefined;

export function similarAll(): Map<string, Similar[]> {
  if (cache) return cache;
  const g = graph();
  const ids = g.entities.filter((e) => e.kind !== "section").map((e) => e.id);
  const sets = new Map<string, Set<string>>();
  const weight = new Map<string, number>();
  for (const id of ids) {
    const s = new Set<string>();
    for (const [k, list] of g.neighbours(id)) if (k !== "section") for (const n of list) s.add(n.id);
    sets.set(id, s);
    weight.set(id, 1 / Math.log2(2 + s.size));
  }
  const tagSets = new Map(ids.map((id) => [id, new Set(publicTags(g.must(id).tags))]));
  const w = (id: string) => weight.get(id) ?? 1 / Math.log2(2 + g.degree(id));

  const out = new Map<string, Similar[]>();
  for (const id of ids) {
    const A = sets.get(id)!, tagsA = tagSets.get(id)!;
    const candidates = new Set<string>();
    for (const n of A) if ((sets.get(n)?.size ?? g.degree(n)) <= HUB) for (const c of sets.get(n) ?? []) if (c !== id && !A.has(c) && sets.has(c)) candidates.add(c);
    if (tagsA.size) for (const c of ids) if (c !== id && !A.has(c) && [...tagsA].some((t) => tagSets.get(c)!.has(t))) candidates.add(c);
    const scored: Similar[] = [];
    for (const c of candidates) {
      const B = sets.get(c)!, tagsB = tagSets.get(c)!;
      let inter = 0, union = 0;
      const shared: string[] = [];
      for (const n of A) { if (B.has(n)) { inter += w(n); shared.push(n); } union += w(n); }
      for (const n of B) if (!A.has(n)) union += w(n);
      const sharedTags = [...tagsA].filter((t) => tagsB.has(t));
      const tagUnion = new Set([...tagsA, ...tagsB]).size;
      const score = (union ? inter / union : 0) + 0.5 * (tagUnion ? sharedTags.length / tagUnion : 0);
      if (score >= MIN_SCORE && (shared.length + sharedTags.length) >= 2) scored.push({ id: c, score: Math.round(score * 1000) / 1000, shared: shared.sort((x, y) => w(y) - w(x)), sharedTags });
    }
    scored.sort((x, y) => y.score - x.score || x.id.localeCompare(y.id));
    out.set(id, scored.slice(0, TOP_N));
  }
  cache = out;
  return out;
}

export function similarFor(id: string): Similar[] { return similarAll().get(id) ?? []; }

/** Resolved for rendering: names and routes of the similar page and of the links that explain the match (up to `explain`). */
export function similarLinks(id: string, explain = 4): SimilarLink[] {
  const g = graph();
  return similarFor(id).map((s) => {
    const e = g.must(s.id);
    return { id: e.id, kind: e.kind, name: e.name, route: routeFor(e), score: s.score, shared: s.shared.slice(0, explain).map((n) => { const x = g.must(n); return { id: x.id, name: x.name, route: routeFor(x) }; }), sharedTags: s.sharedTags };
  });
}
