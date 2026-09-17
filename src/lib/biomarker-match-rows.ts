/** Server-only: builds the biomarker match rows from the graph. Kept apart from biomarker-match.ts so that client components importing the scoring helpers do not pull the whole corpus into their JavaScript. */
import { graph } from "./graph";
import type { Kind } from "./schema";
import type { MatchRow } from "./biomarker-match";
import { routeFor } from "./schema";

const KINDS: Kind[] = ["drug", "technology", "trial", "pairing", "idea", "target"];

export function matchRows(): MatchRow[] {
  const g = graph();
  const relevance = new Map<string, Set<string>>();
  for (const c of g.kind("cancer")) for (const list of g.forCancer(c.id).values()) for (const e of list) (relevance.get(e.id) ?? relevance.set(e.id, new Set()).get(e.id)!).add(c.id);

  return g.entities.filter((e) => KINDS.includes(e.kind)).map((e) => {
    // A drug's technologies count for matching; a technology's own id counts as a technology match.
    const technologies = e.kind === "technology" ? [e.id, ...e.technologies] : e.technologies;
    const meta = e.kind === "drug" ? e.modality : e.kind === "trial" ? `Phase ${e.phase}` : e.kind === "pairing" ? e.pairingType.replace("-", " → ") : e.kind === "idea" ? e.maturity.replace(/-/g, " ") : e.kind === "target" ? e.targetClass.replace("-", " ") : "";
    return {
      id: e.id, kind: e.kind, name: e.name, tldr: e.tldr, route: routeFor(e), status: e.status, meta,
      targets: e.kind === "target" ? [e.id, ...e.targets] : e.targets, terms: e.terms, technologies, tags: e.tags,
      cancers: [...(relevance.get(e.id) ?? [])],
      pair: e.kind === "pairing" ? { a: e.a, b: e.b, caution: e.pairingType === "caution" } : undefined,
    };
  });
}

/** Which of the selected biomarkers an entity matches (labels), using its targets, terms, technologies and tags. Shared with the Explore personaliser. */
