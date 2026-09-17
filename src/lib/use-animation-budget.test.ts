import { describe, expect, it } from "vitest";
import { allocateSlots, deriveActive, isLowBudget, motionFlags } from "./use-animation-budget";

const base = { reduced: false, low: false, hidden: false, visible: true, hovered: false, tapped: false, slot: true };

describe("isLowBudget", () => {
  it("is low with Save-Data or four or fewer cores", () => {
    expect(isLowBudget({ connection: { saveData: true }, hardwareConcurrency: 8 })).toBe(true);
    expect(isLowBudget({ hardwareConcurrency: 4 })).toBe(true);
    expect(isLowBudget({ hardwareConcurrency: 2 })).toBe(true);
  });
  it("is not low on an eight-core desktop or when the core count is unknown", () => {
    expect(isLowBudget({ hardwareConcurrency: 8 })).toBe(false);
    expect(isLowBudget({ connection: { saveData: false } })).toBe(false);
    expect(isLowBudget({})).toBe(false);
    expect(isLowBudget(undefined)).toBe(false);
  });
  it("honours prefers-reduced-data and the local override", () => {
    expect(isLowBudget({ hardwareConcurrency: 8 }, true)).toBe(true);
    expect(isLowBudget({ hardwareConcurrency: 8 }, false, "low")).toBe(true);
    expect(isLowBudget({ hardwareConcurrency: 2 }, true, "full")).toBe(false);
  });
});

describe("deriveActive", () => {
  it("runs a visible, unconstrained animation on a fast device", () => {
    expect(deriveActive(base)).toBe(true);
  });
  it("stops off screen, in a hidden tab and under reduced motion", () => {
    expect(deriveActive({ ...base, visible: false })).toBe(false);
    expect(deriveActive({ ...base, hidden: true })).toBe(false);
    expect(deriveActive({ ...base, reduced: true })).toBe(false);
    expect(deriveActive({ ...base, reduced: true, hovered: true, tapped: true })).toBe(false);
  });
  it("draws a static frame on a low budget until a tap, and a hover wakes it", () => {
    expect(deriveActive({ ...base, low: true })).toBe(false);
    expect(deriveActive({ ...base, low: true, tapped: true })).toBe(true);
    expect(deriveActive({ ...base, low: true, hovered: true })).toBe(true);
  });
  it("waits for a pool slot unless hovered", () => {
    expect(deriveActive({ ...base, slot: false })).toBe(false);
    expect(deriveActive({ ...base, slot: false, hovered: true })).toBe(true);
    expect(deriveActive({ ...base, slot: false, low: true, tapped: true })).toBe(false);
  });
});

describe("allocateSlots", () => {
  it("grants at most max slots to visible members, in order", () => {
    const members = Array.from({ length: 8 }, () => ({ visible: true, slot: false }));
    const out = allocateSlots(members, 6);
    expect(out.filter(Boolean).length).toBe(6);
    expect(out.slice(0, 6).every(Boolean)).toBe(true);
    expect(out[6]).toBe(false);
    expect(out[7]).toBe(false);
  });
  it("holders keep their slot; a freed slot goes to the next visible member", () => {
    const members = [
      { visible: false, slot: true },  // scrolled away: releases
      { visible: true, slot: true },
      { visible: true, slot: false },
      { visible: true, slot: false },
    ];
    expect(allocateSlots(members, 2)).toEqual([false, true, true, false]);
  });
  it("never grants a slot off screen", () => {
    expect(allocateSlots([{ visible: false, slot: false }, { visible: false, slot: true }], 6)).toEqual([false, false]);
  });
});

describe("motionFlags", () => {
  it("lists the signals that are on, in a fixed order", () => {
    expect(motionFlags({ low: false, reduced: false, hidden: false })).toBe("");
    expect(motionFlags({ low: true, reduced: false, hidden: true })).toBe("low hidden");
    expect(motionFlags({ low: true, reduced: true, hidden: true })).toBe("low reduced hidden");
  });
});
