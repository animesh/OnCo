import { describe, expect, it } from "vitest";
import { breakCycles, buildDag, chokepoints, countCrossings, criticalPath, downstream, edgesFromDependsOn, findCycles, hints, layering, layout, orderLayers, subgraph, upstream } from "./dag";

// A small supply chain: plasmid -> vector -> car-t -> armoured; apheresis -> car-t; apheresis -> dc-vaccine; release -> car-t, dc-vaccine.
const DEPS: Array<[string, string[]]> = [
  ["vector", ["plasmid"]],
  ["car-t", ["vector", "apheresis", "release"]],
  ["armoured", ["car-t"]],
  ["dc-vaccine", ["apheresis", "release"]],
  ["isolated", []],
];
const dag = buildDag(DEPS.map(([id]) => id), edgesFromDependsOn(DEPS));

describe("buildDag", () => {
  it("adds edge endpoints missing from the node list and drops self-loops and duplicates", () => {
    const d = buildDag(["a"], [{ from: "a", to: "a" }, { from: "b", to: "a" }, { from: "b", to: "a" }]);
    expect(d.nodes).toEqual(["a", "b"]);
    expect(d.edges).toEqual([{ from: "b", to: "a" }]);
    expect(d.up.get("a")).toEqual(["b"]);
    expect(d.down.get("b")).toEqual(["a"]);
  });
});

describe("closures", () => {
  it("upstream is everything a node needs, transitively", () => {
    expect([...upstream(dag, "armoured")].sort()).toEqual(["apheresis", "car-t", "plasmid", "release", "vector"]);
    expect(upstream(dag, "plasmid").size).toBe(0);
  });
  it("downstream is everything that needs a node", () => {
    expect([...downstream(dag, "plasmid")].sort()).toEqual(["armoured", "car-t", "vector"]);
    expect([...downstream(dag, "release")].sort()).toEqual(["armoured", "car-t", "dc-vaccine"]);
  });
  it("subgraph keeps the root, its closure and the induced edges", () => {
    const s = subgraph(dag, "vector");
    expect(s.nodes).toEqual(["armoured", "car-t", "plasmid", "vector"]);
    expect(s.edges.some((e) => e.from === "apheresis")).toBe(false);
  });
});

describe("layering and ordering", () => {
  it("places each node one layer past its deepest dependency", () => {
    const l = layering(dag);
    expect(l.get("plasmid")).toBe(0);
    expect(l.get("apheresis")).toBe(0);
    expect(l.get("isolated")).toBe(0);
    expect(l.get("vector")).toBe(1);
    expect(l.get("dc-vaccine")).toBe(1);
    expect(l.get("car-t")).toBe(2);
    expect(l.get("armoured")).toBe(3);
  });
  it("orders layers deterministically and keeps every node exactly once", () => {
    const layers = orderLayers(dag, layering(dag));
    expect(layers.flat().sort()).toEqual([...dag.nodes].sort());
    expect(layers.length).toBe(4);
    expect(orderLayers(dag, layering(dag))).toEqual(layers);
  });
  it("barycentre sweeps do not increase crossings on a crossing-prone fixture", () => {
    // Two parallel chains whose alphabetical order puts them crossed: a->z2, b->y2 with z2 < y2 not alphabetical.
    const d = buildDag([], [{ from: "a", to: "z" }, { from: "b", to: "y" }, { from: "c", to: "x" }]);
    const l = layering(d);
    const naive: string[][] = [["a", "b", "c"], ["x", "y", "z"]];
    const before = countCrossings(d, naive);
    const after = countCrossings(d, orderLayers(d, l));
    expect(before).toBe(3);
    expect(after).toBe(0);
  });
});

describe("cycles", () => {
  const cyc = buildDag([], [{ from: "x", to: "y" }, { from: "y", to: "z" }, { from: "z", to: "x" }, { from: "z", to: "w" }]);
  it("reports each loop once rather than throwing", () => {
    const cycles = findCycles(cyc);
    expect(cycles).toHaveLength(1);
    expect([...cycles[0]].sort()).toEqual(["x", "y", "z"]);
    expect(findCycles(dag)).toEqual([]);
  });
  it("breaks cycles by dropping one edge per loop so layering can proceed", () => {
    const { dag: acyclic, removed, cycles } = breakCycles(cyc);
    expect(cycles).toHaveLength(1);
    expect(removed).toHaveLength(1);
    expect(findCycles(acyclic)).toEqual([]);
    expect(() => layering(acyclic)).not.toThrow();
    const lay = layout(cyc);
    expect(lay.layers.flat().sort()).toEqual(["w", "x", "y", "z"]);
    expect(lay.cycles).toHaveLength(1);
  });
  it("layering throws on a cycle it was not told about", () => {
    expect(() => layering(cyc)).toThrow(/cycle/);
  });
});

describe("hints", () => {
  it("finds the longest chain upstream first", () => {
    expect(criticalPath(dag)).toEqual(["plasmid", "vector", "car-t", "armoured"]);
  });
  it("finds chokepoints: articulation points that something depends on", () => {
    // Removing car-t separates armoured from the rest; removing vector separates plasmid. Apheresis and release
    // each have an alternative path around them, so they are not chokepoints.
    expect(chokepoints(dag)).toEqual(["car-t", "vector"]);
  });
  it("lists single-vendor nodes", () => {
    const h = hints(dag, new Map([["vector", 1], ["release", 3], ["plasmid", 1]]));
    expect(h.singleVendor).toEqual(["plasmid", "vector"]);
    expect(h.criticalPath[0]).toBe("plasmid");
  });
});
