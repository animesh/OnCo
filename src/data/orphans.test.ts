import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { graph } from "@/lib/graph";

/**
 * Orphan ratchet: records nothing links to can only be reached by search. The floor in orphans-floor.json is the count
 * at the last lowering; the test fails when new records arrive without an inbound link. Lower the floor with
 * \`npx tsx scripts/orphans.ts --write\` after a linking round.
 */
describe("orphan records", () => {
  it("do not grow past the recorded floor", () => {
    const g = graph();
    const floor = JSON.parse(readFileSync("src/data/orphans-floor.json", "utf8")).count as number;
    const orphans = (g.entities as Array<{ id: string; kind: string; asOf?: string }>).filter((e) => e.kind !== "section" && g.incoming(e.id).size === 0);
    const newest = orphans.sort((a, b) => (b.asOf ?? "").localeCompare(a.asOf ?? "")).slice(0, 20).map((e) => e.kind + ":" + e.id);
    expect(orphans.length, "orphan records above the floor; newest orphans: " + newest.join(", ")).toBeLessThanOrEqual(floor);
  });
});
