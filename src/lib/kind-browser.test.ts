import { describe, expect, it } from "vitest";
import { buildBrowser } from "./kind-browser";
import { fallbackSlot, hasVisual, visualSource } from "./row-visual";
import type { Kind } from "./schema";

/**
 * Every row in the kind index tables must show something in its picture slot: a molecule, a drawing, an organ
 * icon, a logo, an initials tile or, failing all of those, the kind's own symbol tile. The owner found rows on
 * /ideas/?maturity=Being+tested+at+scale with an empty gap where the neighbours had organ icons; this guards it.
 */
const LISTS: Kind[] = ["idea", "technology", "drug", "company", "institution", "person"];

describe("kind index rows always have a visual", () => {
  for (const k of LISTS) {
    it(`${k}: no row is left with an empty picture slot`, () => {
      const { rows } = buildBrowser(k);
      expect(rows.length).toBeGreaterThan(0);
      const gaps = rows.filter((r) => !hasVisual(r)).map((r) => r.id);
      expect(gaps).toEqual([]);
      // Every row carries its kind, so the shared fallback can always draw the kind symbol.
      expect(rows.every((r) => r.kind === k)).toBe(true);
    });
  }

  it("ideas borrow the organ icon of their cancer, then their technology's drawing, then their product's molecule", () => {
    const { rows } = buildBrowser("idea");
    for (const r of rows) {
      const src = visualSource(r);
      expect(["cancer", "schematic", "molecule", "kind"]).toContain(src);
      if (r.cancerIcon) expect(src).toBe("cancer");
    }
    // The stand-in tile takes the wide drawing slot, the same size as the organ icons beside it.
    expect(fallbackSlot(rows)).toEqual({ className: "h-10 w-14", round: false });
  });

  it("technologies show their drawing and treatments their molecule slot", () => {
    expect(buildBrowser("technology").rows.every((r) => visualSource(r) === "schematic")).toBe(true);
    expect(buildBrowser("drug").rows.every((r) => visualSource(r) === "molecule")).toBe(true);
  });

  it("organisations and people fall back to an initials tile, never to nothing", () => {
    for (const k of ["company", "institution", "person"] as const) {
      const { rows } = buildBrowser(k);
      expect(rows.every((r) => r.avatar === (k === "person" ? "person" : "org"))).toBe(true);
    }
    expect(fallbackSlot(buildBrowser("person").rows)).toEqual({ className: "h-7 w-7", round: true });
  });

  it("trials, roadmaps, pairings, journals and key papers have no gaps either", () => {
    for (const k of ["trial", "roadmap", "pairing", "journal", "paper", "pathway", "bottleneck"] as const) {
      const gaps = buildBrowser(k).rows.filter((r) => !hasVisual(r)).map((r) => r.id);
      expect(gaps, k).toEqual([]);
    }
  });
});

describe("fallbackSlot", () => {
  it("returns null for a table with no pictures and the avatar size for a logo table", () => {
    expect(fallbackSlot([{ kind: "term" }])).toBeNull();
    expect(fallbackSlot([{ logo: "/x.png", avatar: "org" }, { kind: "paper" }])).toEqual({ className: "h-7 w-7", round: false });
    expect(fallbackSlot([{ molecule: "d1" }, { kind: "drug" }])).toEqual({ className: "h-10 w-10", round: false });
  });
});
