/** Server-only: checks the interaction table against the graph; interactions.ts keeps the checker used by the client page. */
import { graph } from "./graph";
import { agentById } from "./interactions";
import { agents } from "@/data/interactions";

export function validateInteractions(): void {
  const g = graph();
  const errors: string[] = [];
  const seen = new Set<string>();
  for (const a of agents) {
    if (seen.has(a.id)) errors.push(`${a.id}: duplicate agent id`);
    seen.add(a.id);
    const e = g.get(a.id);
    if (a.external) { if (e) errors.push(`${a.id}: marked external but exists in the corpus as a ${e.kind}`); }
    else if (!e || e.kind !== "drug") errors.push(`${a.id}: not a product in the corpus (mark external or fix the id)`);
    if (!/^https?:\/\//.test(a.source)) errors.push(`${a.id}: source is not a URL`);
    for (const p of a.pairs ?? []) if (!agentById(p.with)) errors.push(`${a.id}: pair target "${p.with}" is not an agent`);
  }
  if (errors.length) throw new Error(`Invalid interaction data:\n${errors.join("\n")}`);
}
