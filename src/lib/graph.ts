import { EntitySchema, KINDS, REL_FIELDS, type Entity, type Kind, type RelField } from "./schema";
import { ALL_INPUTS } from "@/data";

export type Backlink = { from: Entity; via: RelField | "pairing" | "roadmap" | "history" | "pipeline" | "standardOfCare" | "pathway-node" | "investors" | "acquiredBy" | "parent" };

class Graph {
  readonly entities: Entity[];
  readonly byId: Map<string, Entity>;
  readonly byKind: Map<Kind, Entity[]>;
  private backlinks: Map<string, Backlink[]>;

  constructor(inputs: unknown[]) {
    const parsed: Entity[] = [];
    const errors: string[] = [];
    for (const raw of inputs) {
      const r = EntitySchema.safeParse(raw);
      if (r.success) parsed.push(r.data);
      else {
        const name = (raw as { id?: string })?.id ?? "<no id>";
        errors.push(`${name}: ${r.error.issues.map((i) => `${i.path.join(".")} ${i.message}`).join("; ")}`);
      }
    }
    if (errors.length) throw new Error(`Invalid entities:\n${errors.join("\n")}`);

    this.entities = parsed;
    this.byId = new Map();
    for (const e of parsed) {
      if (this.byId.has(e.id)) throw new Error(`Duplicate id: ${e.id}`);
      this.byId.set(e.id, e);
    }
    this.byKind = new Map(KINDS.map((k) => [k, parsed.filter((e) => e.kind === k).sort((a, b) => a.name.localeCompare(b.name))]));
    this.backlinks = new Map();
    const dangling: string[] = [];
    for (const e of parsed) {
      for (const [to, via] of outgoing(e)) {
        if (!this.byId.has(to)) { dangling.push(`${e.id} (${e.kind}) -> "${to}" via ${via}`); continue; }
        if (to === e.id) continue;
        const list = this.backlinks.get(to) ?? [];
        list.push({ from: e, via });
        this.backlinks.set(to, list);
      }
    }
    if (dangling.length) throw new Error(`Dangling references:\n${dangling.join("\n")}`);
  }

  get(id: string): Entity | undefined {
    return this.byId.get(id);
  }

  must(id: string): Entity {
    const e = this.byId.get(id);
    if (!e) throw new Error(`Unknown entity ${id}`);
    return e;
  }

  kind<K extends Kind>(k: K): Extract<Entity, { kind: K }>[] {
    return (this.byKind.get(k) ?? []) as Extract<Entity, { kind: K }>[];
  }

  /** Everything that links to `id`, grouped by the kind of the linking entity. */
  incoming(id: string): Map<Kind, Entity[]> {
    const seen = new Set<string>();
    const out = new Map<Kind, Entity[]>();
    for (const b of this.backlinks.get(id) ?? []) {
      if (seen.has(b.from.id)) continue;
      seen.add(b.from.id);
      const list = out.get(b.from.kind) ?? [];
      list.push(b.from);
      out.set(b.from.kind, list);
    }
    for (const list of out.values()) list.sort((a, b) => a.name.localeCompare(b.name));
    return out;
  }

  /** Outgoing + incoming neighbours, grouped by kind, de-duplicated. */
  neighbours(id: string): Map<Kind, Entity[]> {
    const e = this.must(id);
    const seen = new Set<string>([id]);
    const out = new Map<Kind, Entity[]>();
    const add = (n: Entity) => {
      if (seen.has(n.id)) return;
      seen.add(n.id);
      const list = out.get(n.kind) ?? [];
      list.push(n);
      out.set(n.kind, list);
    };
    for (const [to] of outgoing(e)) {
      const n = this.byId.get(to);
      if (n) add(n);
    }
    for (const b of this.backlinks.get(id) ?? []) add(b.from);
    for (const list of out.values()) list.sort((a, b) => a.name.localeCompare(b.name));
    return out;
  }

  /** Everything relevant to a cancer: direct links plus things linked to its drugs/targets. */
  forCancer(cancerId: string): Map<Kind, Entity[]> {
    const direct = this.neighbours(cancerId);
    const out = new Map<Kind, Set<Entity>>();
    const add = (n: Entity) => {
      if (n.id === cancerId) return;
      const s = out.get(n.kind) ?? new Set();
      s.add(n);
      out.set(n.kind, s);
    };
    for (const list of direct.values()) list.forEach(add);
    for (const d of direct.get("drug") ?? []) {
      for (const t of d.targets) add(this.must(t));
      for (const c of d.companies) add(this.must(c));
      for (const t of d.technologies) add(this.must(t));
    }
    const res = new Map<Kind, Entity[]>();
    for (const [k, s] of out) res.set(k, [...s].sort((a, b) => a.name.localeCompare(b.name)));
    return res;
  }

  degree(id: string): number {
    return (this.backlinks.get(id)?.length ?? 0) + outgoing(this.must(id)).length;
  }
}

function outgoing(e: Entity): Array<[string, Backlink["via"]]> {
  const out: Array<[string, Backlink["via"]]> = [];
  for (const f of REL_FIELDS) for (const to of e[f]) out.push([to, f]);
  if (e.kind === "pairing") {
    out.push([e.a, "pairing"], [e.b, "pairing"]);
  }
  if (e.kind === "roadmap") for (const s of e.steps) for (const r of s.refs) out.push([r, "roadmap"]);
  if (e.kind === "cancer") {
    for (const h of e.history) for (const r of h.refs) out.push([r, "history"]);
    for (const p of e.pipeline) out.push([p, "pipeline"]);
    for (const s of e.standardOfCare) for (const r of s.refs) out.push([r, "standardOfCare"]);
    if (e.parent) out.push([e.parent, "parent"]);
  }
  if (e.kind === "pathway") for (const n of e.nodes) if (n.targetId) out.push([n.targetId, "pathway-node"]);
  if (e.kind === "company") {
    // Startup graph: a company names its investors and its acquirer; investors get their portfolio by backlink.
    for (const inv of e.investors) out.push([inv, "investors"]);
    if (e.acquiredBy) out.push([e.acquiredBy, "acquiredBy"]);
  }
  return out;
}

let cached: Graph | undefined;
export function graph(): Graph {
  if (!cached) cached = new Graph(ALL_INPUTS);
  return cached;
}

export type { Graph };
