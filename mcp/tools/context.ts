/**
 * Shared state for the MCP tools: the graph, the two search indexes, the power-view rows, and helpers.
 * Built once at startup from the same data files as the site; no network access.
 */
import MiniSearch from "minisearch";
import { graph } from "../../src/lib/graph";
import { routeFor, type Entity, type Kind } from "../../src/lib/schema";
import { searchDocs, type SearchDoc } from "../../src/lib/search-index";
import { buildSemanticIndex, fuseRanks, semanticSearch, type SemanticHit } from "../../src/lib/semantic";
import { semanticDocs } from "../../src/lib/semantic-docs";
import { powerRows } from "../../src/lib/relevance-rows";

export const SITE = "https://onco.cc";
export const g = graph();
export const url = (e: { kind: Kind; id: string }) => SITE + routeFor(e);
export const brief = (e: Entity) => ({ id: e.id, kind: e.kind, name: e.name, status: e.status, tldr: e.tldr, url: url(e) });

export const text = (data: unknown) => ({ content: [{ type: "text" as const, text: typeof data === "string" ? data : JSON.stringify(data, null, 2) }] });
export const fail = (message: string) => ({ content: [{ type: "text" as const, text: JSON.stringify({ error: message }) }], isError: true });

export const ms = new MiniSearch<SearchDoc>({ fields: ["name", "aka", "tldr", "tags", "id"], storeFields: ["id", "kind", "name", "tldr", "route", "status"], searchOptions: { boost: { name: 4, aka: 3, id: 2 }, prefix: true, fuzzy: 0.2 } });
ms.addAll(searchDocs());
export const sem = buildSemanticIndex(semanticDocs());
export const rows = powerRows();

export type Retrieved = { id: string; lexical: boolean; concept: string[] };

/** Lexical and concept retrieval fused by reciprocal rank, with the reason each record matched. */
export function retrieve(query: string, k = 10): Retrieved[] {
  const lexical = ms.search(query).slice(0, Math.max(k, 12)).map((h) => ({ id: String(h.id) }));
  const concept: SemanticHit[] = semanticSearch(sem, query, Math.max(k, 12));
  const conceptById = new Map(concept.map((h) => [h.id, h.matched.slice(0, 4)]));
  const lexIds = new Set(lexical.map((h) => h.id));
  return fuseRanks([lexical, concept]).slice(0, k).map((f) => ({ id: f.id, lexical: lexIds.has(f.id), concept: conceptById.get(f.id) ?? [] }));
}
