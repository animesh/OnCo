import { describe, it, expect } from "vitest";
import { graph } from "../lib/graph";
import { TERM_CATEGORIES } from "./term-categories";
import { hasTermAnimation } from "./schematics";

describe("glossary categories", () => {
  it("every term carries one of the canonical categories and every category has an animation", () => {
    const g = graph();
    const canonical = new Set<string>(TERM_CATEGORIES);
    const off = g.kind("term").filter((t) => !canonical.has(t.category)).map((t) => `${t.id}: ${t.category}`);
    expect(off).toEqual([]);
    const silent = TERM_CATEGORIES.filter((c) => !hasTermAnimation(c));
    expect(silent).toEqual([]);
  });
  it("uses twenty categories so the grid fills evenly at two, four and five columns", () => {
    expect(TERM_CATEGORIES.length).toBe(20);
  });
});
