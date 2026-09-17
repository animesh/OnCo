import { type Kind } from "./schema";
import { biomarkers, type Biomarker } from "@/data/biomarkers";

/**
 * Matching entities to biomarkers. Pure functions over compact rows so the same logic can run
 * on the server (build) and in the browser (/tumor-board/, and later /for-me/).
 *
 *  score = Σ over selected biomarkers of ( target match 3 · term match 2 · technology match 2 · tag match 1 )
 *          + 2 if the entity is relevant to the selected cancer (graph.forCancer)
 *          + evidence tier bonus (approved 2 · phase 3 / positive 1)
 */
export type MatchRow = {
  id: string; kind: Kind; name: string; tldr: string; route: string; status?: string; meta: string;
  targets: string[]; terms: string[]; technologies: string[]; tags: string[];
  /** Cancer ids the entity is relevant to (direct or via its drugs). */
  cancers: string[];
  /** For pairings: the two sides and whether it is a caution. */
  pair?: { a: string; b: string; caution: boolean };
};



export function biomarkerHits(row: { targets: string[]; terms: string[]; technologies: string[]; tags: string[] }, selected: Biomarker[]): string[] {
  const hits: string[] = [];
  for (const b of selected) {
    const hit = (b.matches.targets ?? []).some((t) => row.targets.includes(t)) || (b.matches.terms ?? []).some((t) => row.terms.includes(t))
      || (b.matches.technologies ?? []).some((t) => row.technologies.includes(t)) || (b.matches.tags ?? []).some((t) => row.tags.includes(t));
    if (hit) hits.push(b.label);
  }
  return hits;
}

/** Resolve profile biomarker ids to biomarker records, ignoring unknown ids. */
export function biomarkersById(ids: string[]): Biomarker[] {
  return ids.map((id) => biomarkers.find((b) => b.id === id)).filter((b): b is Biomarker => !!b);
}

export type Scored = { row: MatchRow; score: number; hits: string[] };

export function scoreRows(rows: MatchRow[], selected: Biomarker[], cancerId: string | null): Scored[] {
  const out: Scored[] = [];
  for (const row of rows) {
    let score = 0;
    const hits: string[] = [];
    for (const b of selected) {
      let s = 0;
      for (const t of b.matches.targets ?? []) if (row.targets.includes(t)) s += 3;
      for (const t of b.matches.terms ?? []) if (row.terms.includes(t)) s += 2;
      for (const t of b.matches.technologies ?? []) if (row.technologies.includes(t)) s += 2;
      for (const t of b.matches.tags ?? []) if (row.tags.includes(t)) s += 1;
      if (s > 0) { score += s; hits.push(b.label); }
    }
    if (!hits.length) continue;
    if (cancerId && row.cancers.includes(cancerId)) score += 2;
    if (row.status === "approved" || row.status === "standard-of-care") score += 2;
    else if (row.status === "phase-3" || row.status === "positive") score += 1;
    out.push({ row, score, hits });
  }
  return out.sort((a, b) => b.score - a.score || a.row.name.localeCompare(b.row.name));
}

/** Cautions: caution-type pairings whose sides or targets touch anything matched. */
export function cautionsFor(rows: MatchRow[], matched: Scored[], selected: Biomarker[]): MatchRow[] {
  const matchedIds = new Set(matched.map((m) => m.row.id));
  const selectedTargets = new Set(selected.flatMap((b) => b.matches.targets ?? []));
  return rows.filter((r) => r.pair?.caution && (matchedIds.has(r.pair.a) || matchedIds.has(r.pair.b) || r.targets.some((t) => selectedTargets.has(t)) || matched.some((m) => m.row.kind === "drug" && (r.pair!.a === m.row.id || r.pair!.b === m.row.id))));
}

export function biomarkerById(id: string): Biomarker | undefined {
  return biomarkers.find((b) => b.id === id);
}
