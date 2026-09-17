/**
 * Shortest paths between any two objects in the knowledge graph, with every hop labelled by the relationship
 * that created it. Pure functions over a compact labelled graph (built server-side by paths-data.ts) so the
 * same code runs at build time, in the browser (/path/) and in the MCP server.
 */
import type { Kind } from "./schema";

export type PathNode = { id: string; kind: Kind; name: string; route: string };
/** [from, to, via] where `via` indexes `vias` and the edge was declared on `from`. */
export type PathEdge = [number, number, number];
export type PathData = { nodes: PathNode[]; edges: PathEdge[]; vias: string[] };

export type Hop = { node: number; via: string; forward: boolean };
export type Path = { start: number; hops: Hop[] };

/** Plain-English label for a relationship field, read in the direction of travel. */
export function hopLabel(via: string, forward: boolean, fromKind: Kind, toKind: Kind): string {
  const to = toKind, from = fromKind;
  void to; void from;
  switch (via) {
    case "related": return "related to";
    case "pairing": return forward ? "pairs" : "is paired in";
    case "roadmap": return forward ? "roadmap step cites" : "cited in roadmap";
    case "history": return forward ? "history cites" : "in the history of";
    case "pipeline": return forward ? "pipeline includes" : "in the pipeline of";
    case "standardOfCare": return forward ? "standard of care uses" : "standard of care for";
    case "pathway-node": return forward ? "pathway node" : "sits in pathway";
    case "keyPapers": return forward ? "rests on paper" : "paper underpins";
    case "dependsOn": return forward ? "depends on" : "needed by";
    case "investors": return forward ? "backed by" : "invests in";
    case "acquiredBy": return forward ? "acquired by" : "acquired";
    default: {
      // Typed relationship arrays: "cancers", "targets", "drugs", "trials", "people" ...
      const noun = via.replace(/s$/, "");
      return forward ? `links ${noun}` : `${noun} of`;
    }
  }
}

type Adj = Array<Array<{ to: number; via: number; forward: boolean }>>;

export function adjacency(data: PathData): Adj {
  const adj: Adj = data.nodes.map(() => []);
  for (const [a, b, via] of data.edges) {
    adj[a].push({ to: b, via, forward: true });
    adj[b].push({ to: a, via, forward: false });
  }
  return adj;
}

/** BFS distances from `target` to every node (Infinity when unreachable). */
export function distances(adj: Adj, target: number): number[] {
  const dist = new Array<number>(adj.length).fill(Infinity);
  dist[target] = 0;
  const queue = [target];
  for (let qi = 0; qi < queue.length; qi++) {
    const n = queue[qi];
    for (const e of adj[n]) if (dist[e.to] === Infinity) { dist[e.to] = dist[n] + 1; queue.push(e.to); }
  }
  return dist;
}

/**
 * Up to `k` shortest paths from `from` to `to`. All returned paths have the minimum length; ties are broken
 * by preferring low-degree intermediate nodes (specific links over hubs) and then by name order, so the
 * result is deterministic. Returns [] when unreachable or when from === to.
 */
export function findPaths(data: PathData, from: number, to: number, k = 3, maxDepth = 6): Path[] {
  if (from === to || from < 0 || to < 0 || from >= data.nodes.length || to >= data.nodes.length) return [];
  const adj = adjacency(data);
  const dist = distances(adj, to);
  const d = dist[from];
  if (!Number.isFinite(d) || d > maxDepth) return [];
  const out: Path[] = [];
  const degree = (i: number) => adj[i].length;
  const walk = (node: number, hops: Hop[]) => {
    if (out.length >= k) return;
    if (node === to) { out.push({ start: from, hops: [...hops] }); return; }
    const next = adj[node].filter((e) => dist[e.to] === dist[node] - 1)
      .sort((a, b) => degree(a.to) - degree(b.to) || data.nodes[a.to].name.localeCompare(data.nodes[b.to].name) || a.via - b.via);
    const seenNode = new Set<number>();
    for (const e of next) {
      if (seenNode.has(e.to)) continue; // one edge per neighbour is enough for a distinct path
      seenNode.add(e.to);
      hops.push({ node: e.to, via: data.vias[e.via], forward: e.forward });
      walk(e.to, hops);
      hops.pop();
      if (out.length >= k) return;
    }
  };
  walk(from, []);
  return out;
}

/** "A -[links target]-> B -[drug of]-> C" for logs, tests and the MCP tool. */
export function describePath(data: PathData, p: Path): string {
  let prev = data.nodes[p.start];
  const parts = [prev.name];
  for (const h of p.hops) {
    const n = data.nodes[h.node];
    parts.push(`-[${hopLabel(h.via, h.forward, prev.kind, n.kind)}]->`, n.name);
    prev = n;
  }
  return parts.join(" ");
}
