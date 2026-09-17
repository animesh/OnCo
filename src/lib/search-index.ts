import { graph } from "./graph";
import { NAV_GROUPS } from "./nav";
import { routeFor, type Kind } from "./schema";

export type SearchDoc = { id: string; kind: Kind | "page"; name: string; aka: string; tldr: string; tags: string; route: string; status?: string };

/** Compact documents for the client-side search index. */
/** The site's own tool and landing pages, so a search for "models" or "pivot" reaches the page and not only the records. */
function pageDocs(): SearchDoc[] {
  const seen = new Set<string>();
  const out: SearchDoc[] = [];
  for (const gp of NAV_GROUPS) for (const it of [{ href: gp.href, label: gp.label, blurb: gp.blurb }, ...gp.items]) {
    if (seen.has(it.href)) continue; seen.add(it.href);
    out.push({ id: "page:" + it.href, kind: "page", name: it.label, aka: "", tldr: it.blurb, tags: "page", route: it.href, status: "" });
  }
  return out;
}

export function searchDocs(): SearchDoc[] {
  return graph().entities.map((e) => ({
    id: e.id,
    kind: e.kind,
    name: e.name,
    aka: e.aka.join(" "),
    tldr: e.tldr,
    tags: e.tags.join(" "),
    route: routeFor(e),
    status: e.status,
  }));
}

/** What the site ships as search.json: the tool pages first, then every record. Pages are not entities, so callers that resolve ids against the graph should use searchDocs(). */
export function siteSearchDocs(): SearchDoc[] {
  return [...pageDocs(), ...searchDocs()];
}
