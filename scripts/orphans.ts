/**
 * Orphan detector: records that no other record links to (they can only be found by search).
 *   npx tsx scripts/orphans.ts            list by kind, newest records first
 *   npx tsx scripts/orphans.ts --json     machine-readable
 *   npx tsx scripts/orphans.ts --write    lower the floor in src/data/orphans-floor.json to the current count
 * The test src/data/orphans.test.ts fails when the count rises above the floor, so new records must arrive with an inbound link.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { graph } from "../src/lib/graph";

export function orphanRecords() {
  const g = graph();
  return (g.entities as Array<{ id: string; kind: string; name: string; asOf?: string }>).filter((e) => e.kind !== "section" && g.incoming(e.id).size === 0);
}

if (process.argv[1]?.endsWith("orphans.ts")) {
  const orphans = orphanRecords();
  const floorPath = "src/data/orphans-floor.json";
  const floor = JSON.parse(readFileSync(floorPath, "utf8")).count as number;
  if (process.argv.includes("--json")) console.log(JSON.stringify(orphans.map((e) => ({ id: e.id, kind: e.kind })), null, 0));
  else {
    const by = new Map<string, typeof orphans>();
    for (const e of orphans) by.set(e.kind, [...(by.get(e.kind) ?? []), e]);
    for (const [k, list] of [...by.entries()].sort((a, b) => b[1].length - a[1].length)) {
      list.sort((a, b) => (b.asOf ?? "").localeCompare(a.asOf ?? ""));
      console.log(k, list.length, "|", list.slice(0, 15).map((e) => e.id).join(" "), list.length > 15 ? "..." : "");
    }
    console.log("total", orphans.length, "| floor", floor, orphans.length > floor ? "| ABOVE FLOOR" : "");
  }
  if (process.argv.includes("--write") && orphans.length < floor) { writeFileSync(floorPath, JSON.stringify({ count: orphans.length, updated: new Date().toISOString().slice(0, 10) }, null, 2) + "\n"); console.log("floor lowered to", orphans.length); }
}
