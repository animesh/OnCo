import { describe, expect, it } from "vitest";
import type { RedFlagSet } from "@/data/red-flags";
import { buildRedCards, RED_CARD_MAX, type RedCardInput } from "./red-cards";

const src = { label: "US prescribing information", url: "https://dailymed.nlm.nih.gov/" };
const ICI: RedFlagSet = { id: "ici", label: "Immune checkpoint inhibitors", modalityRe: "checkpoint", flags: [
  { symptom: "New cough or breathlessness", threshold: "Pneumonitis is a labelled warning.", action: "call-now", source: src },
  { symptom: "Severe diarrhoea", threshold: "Colitis is a labelled warning.", action: "emergency", source: src },
] };
const CHEMO: RedFlagSet = { id: "chemo", label: "Chemotherapy", modalityRe: "chemo", flags: [{ symptom: "Fever", threshold: "38 C or above.", action: "call-today", source: src }] };

const drugs: RedCardInput["drugs"] = [
  { id: "pembrolizumab", name: "Pembrolizumab", route: "/drugs/pembrolizumab/", modality: "mAb, checkpoint" },
  { id: "nivolumab", name: "Nivolumab", route: "/drugs/nivolumab/", modality: "mAb, checkpoint" },
  { id: "carboplatin", name: "Carboplatin", route: "/drugs/carboplatin/", modality: "chemotherapy" },
  { id: "osimertinib", name: "Osimertinib", route: "/drugs/osimertinib/", modality: "small molecule" },
];
const flagSets = (_id: string, modality: string) => [ICI, CHEMO].filter((s) => new RegExp(s.modalityRe!, "i").test(modality));

const base: RedCardInput = { drugs, flagSets, pairs: [], singles: [], sideEffectTerms: [] };

describe("buildRedCards", () => {
  it("makes one card per red-flag class, headed by its most urgent line, naming every drug it applies to", () => {
    const cards = buildRedCards(base);
    expect(cards.map((c) => c.id)).toEqual(["flag:ici", "flag:chemo"]);
    expect(cards[0].tone).toBe("emergency");
    expect(cards[0].title).toBe("Severe diarrhoea");
    expect(cards[0].concerns.map((d) => d.name)).toEqual(["Nivolumab", "Pembrolizumab"]);
    expect(cards[0].source.url).toBe(src.url);
  });

  it("orders emergency, call now, call today, then interactions, then side-effect terms", () => {
    const cards = buildRedCards({
      ...base,
      pairs: [
        { a: "osimertinib", b: "carboplatin", severity: "major", rule: "qt", mechanism: "Both prolong QT", management: "ECG.", source: "https://x" },
        { a: "osimertinib", b: "nivolumab", severity: "minor", rule: "x", mechanism: "Minor", management: "None." },
      ],
      singles: [{ id: "osimertinib", kind: "qt", text: "Known QT prolongation." }],
      sideEffectTerms: [{ id: "anaemia", name: "Anaemia", tldr: "Too few red cells.", route: "/terms/anaemia/", drugs: ["carboplatin"] }],
    });
    expect(cards.map((c) => c.tone)).toEqual(["emergency", "call-today", "caution", "caution", "info"]);
    expect(cards.find((c) => c.kind === "interaction" && c.id.startsWith("pair:"))?.title).toBe("Osimertinib with Carboplatin: major interaction");
    expect(cards.some((c) => c.id.includes(":x"))).toBe(false);
    expect(cards.at(-1)?.source.url).toBe("/terms/anaemia/");
  });

  it("drops terms and pairs that concern no standard-of-care drug", () => {
    const cards = buildRedCards({ ...base, drugs: [drugs[3]], pairs: [{ a: "a", b: "b", severity: "contraindicated", rule: "r", mechanism: "m", management: "n" }], sideEffectTerms: [{ id: "t", name: "T", tldr: "t", route: "/terms/t/", drugs: ["nobody"] }] });
    expect(cards).toEqual([]);
  });

  it("caps the strip at six", () => {
    const terms = Array.from({ length: 10 }, (_, i) => ({ id: `t${i}`, name: `Term ${i}`, tldr: "t", route: `/terms/t${i}/`, drugs: ["carboplatin"] }));
    expect(buildRedCards({ ...base, sideEffectTerms: terms })).toHaveLength(RED_CARD_MAX);
    expect(buildRedCards({ ...base, sideEffectTerms: terms }, 3)).toHaveLength(3);
  });
});
