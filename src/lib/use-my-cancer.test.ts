import { describe, expect, it } from "vitest";
import { pickMyCancer, shortCancerName } from "./use-my-cancer";

describe("shortCancerName", () => {
  it("prefers an upper-case abbreviation in brackets", () => {
    expect(shortCancerName("Non-small cell lung cancer (NSCLC)")).toBe("NSCLC");
    expect(shortCancerName("Atypical teratoid/rhabdoid tumour (ATRT)")).toBe("ATRT");
  });
  it("drops a descriptive bracket and keeps short names whole", () => {
    expect(shortCancerName("Ampullary cancer (ampulla of Vater)")).toBe("Ampullary cancer");
    expect(shortCancerName("Acute myeloid leukaemia")).toBe("Acute myeloid leukaemia");
  });
  it("cuts long names at a word boundary", () => {
    const s = shortCancerName("Appendiceal cancer and pseudomyxoma peritonei");
    expect(s.endsWith("…")).toBe(true);
    expect(s.length).toBeLessThanOrEqual(28);
    expect(s.startsWith("Appendiceal cancer")).toBe(true);
  });
});

describe("pickMyCancer", () => {
  const list = [{ id: "aml", name: "Acute myeloid leukaemia", route: "/cancers/aml/" }];
  it("resolves a remembered id and ignores unknown or unset ones", () => {
    expect(pickMyCancer(list, "aml")?.route).toBe("/cancers/aml/");
    expect(pickMyCancer(list, "gone")).toBeUndefined();
    expect(pickMyCancer(list, undefined)).toBeUndefined();
  });
});
