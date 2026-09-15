import type { Institution } from "./schema";
import { graph } from "./graph";

/**
 * OnCo institution score. Deliberately simple and fully disclosed:
 *
 *   newsweekPoints  = max(0, 60 - rank)            Newsweek/Statista 2026 Oncology rank (1 → 59 points, 40 → 20, unranked → 0)
 *   nciPoints       = comprehensive 15 | clinical 8 | basic 8 | none 0
 *   linkPoints      = 2 × (distinct objects in this corpus, excluding people, that link to or from the institution)
 *
 *   score = newsweekPoints + nciPoints + linkPoints
 *
 * The third term rewards institutions that appear in the evidence base (trials led, drugs
 * developed, technologies pioneered) as recorded here. It is therefore also a measure of
 * how well this corpus covers an institution, and will change as the corpus grows.
 */
export type RankedInstitution = {
  institution: Institution;
  newsweekPoints: number;
  nciPoints: number;
  links: number;
  linkPoints: number;
  score: number;
  rank: number;
};

export function rankInstitutions(): RankedInstitution[] {
  const g = graph();
  const rows = g.kind("institution").map((inst) => {
    const newsweekPoints = inst.newsweekOncology2026 ? Math.max(0, 60 - inst.newsweekOncology2026) : 0;
    const nciPoints = inst.nci === "comprehensive" ? 15 : inst.nci ? 8 : 0;
    const neighbours = g.neighbours(inst.id);
    // People are excluded: how many staff we happen to have listed reflects our coverage, not the institution's output.
    // For networks, societies and government bodies, links from other institutions are also excluded: those are
    // memberships pointing at the body (188 centres list the OECI), not evidence about its own work.
    const network = inst.institutionType === "consortium" || inst.institutionType === "government";
    let links = 0;
    for (const [kind, list] of neighbours) { if (kind === "person") continue; if (network && kind === "institution") continue; links += list.length; }
    const linkPoints = 2 * links;
    return { institution: inst, newsweekPoints, nciPoints, links, linkPoints, score: newsweekPoints + nciPoints + linkPoints, rank: 0 };
  });
  rows.sort((a, b) => b.score - a.score || a.institution.name.localeCompare(b.institution.name));
  rows.forEach((r, i) => (r.rank = i + 1));
  return rows;
}

/** Universities: group institutions by their `university` field (or themselves if type university). */
export type UniversityRow = { university: string; institutions: Institution[]; score: number; links: number; rank: number };

export function rankUniversities(): UniversityRow[] {
  const ranked = rankInstitutions();
  const map = new Map<string, UniversityRow>();
  for (const r of ranked) {
    const uni = r.institution.university ?? (r.institution.institutionType === "university" ? r.institution.name : undefined);
    if (!uni) continue;
    const row = map.get(uni) ?? { university: uni, institutions: [], score: 0, links: 0, rank: 0 };
    row.institutions.push(r.institution);
    row.score += r.score;
    row.links += r.links;
    map.set(uni, row);
  }
  const rows = [...map.values()].sort((a, b) => b.score - a.score);
  rows.forEach((r, i) => (r.rank = i + 1));
  return rows;
}
