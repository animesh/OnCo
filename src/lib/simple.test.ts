import { describe, expect, it } from "vitest";
import { graph } from "./graph";
import { simple } from "@/data/simple";
import { simpleO } from "@/data/simple/part-o";
import { simpleP } from "@/data/simple/part-p";
import { simpleQ } from "@/data/simple/part-q";

/**
 * The "simple" reading layer (src/data/simple/part-*.ts) is one plain sentence per record.
 * Every sentence must be a finished sentence, free of em-dashes, and keyed by a record that exists.
 * Parts written from part-o onwards must also stay under 200 characters; older parts are ratcheted
 * so the number of over-long legacy sentences can only fall.
 */
const NEW_PARTS: Record<string, Record<string, string>> = { "part-o": simpleO, "part-p": simpleP, "part-q": simpleQ };
const isNewPart = (id: string) => Object.values(NEW_PARTS).some((p) => id in p);
const LEGACY_OVERLONG_CEILING = 691;

describe("simple layer", () => {
  const g = graph();
  const entries = Object.entries(simple);

  it("every sentence ends with a full stop", () => {
    const bad = entries.filter(([, s]) => !/[.!?]$/.test(s.trim())).map(([id]) => id);
    expect(bad, `sentences without a closing full stop: ${bad.slice(0, 10).join(", ")}`).toEqual([]);
  });

  it("no sentence contains an em-dash or en-dash", () => {
    const bad = entries.filter(([, s]) => /[—–]/.test(s)).map(([id]) => id);
    expect(bad, `sentences with dashes: ${bad.slice(0, 10).join(", ")}`).toEqual([]);
  });

  it("every key names an existing record", () => {
    const bad = entries.filter(([id]) => !g.byId.has(id)).map(([id]) => id);
    expect(bad, `simple text for unknown ids: ${bad.slice(0, 10).join(", ")}`).toEqual([]);
  });

  it("sentences from part-o onwards are under 200 characters", () => {
    for (const [name, part] of Object.entries(NEW_PARTS)) {
      const bad = Object.entries(part).filter(([, s]) => s.length >= 200).map(([id, s]) => `${id} (${s.length})`);
      expect(bad, `over-long sentences in ${name}: ${bad.slice(0, 10).join(", ")}`).toEqual([]);
    }
  });

  it("the count of over-long legacy sentences does not grow", () => {
    const overlong = entries.filter(([id, s]) => s.length >= 200 && !isNewPart(id)).length;
    expect(overlong).toBeLessThanOrEqual(LEGACY_OVERLONG_CEILING);
  });

  it("part-o holds at least 600 sentences", () => {
    expect(Object.keys(simpleO).length).toBeGreaterThanOrEqual(600);
  });

  it("part-p holds at least 700 sentences", () => {
    expect(Object.keys(simpleP).length).toBeGreaterThanOrEqual(700);
  });

  it("part-q holds at least 900 sentences", () => {
    expect(Object.keys(simpleQ).length).toBeGreaterThanOrEqual(900);
  });
});
