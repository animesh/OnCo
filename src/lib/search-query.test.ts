import { describe, expect, it } from "vitest";
import { askHref, looksLikeQuestion, MAX_QUERY, normaliseQuery, parseKind, parseSearchState, searchHref, searchQueryString, searchTerms, usefulSuggestions } from "./search-query";

describe("normaliseQuery", () => {
  it("trims, collapses whitespace and straightens curly quotes", () => {
    expect(normaliseQuery("  HER2   low  ")).toBe("HER2 low");
    expect(normaliseQuery("what’s “Enhertu”")).toBe(`what's "Enhertu"`);
    expect(normaliseQuery(null)).toBe("");
    expect(normaliseQuery(undefined)).toBe("");
  });
  it("strips wrapping quotes but keeps case", () => {
    expect(normaliseQuery('"TROP2"')).toBe("TROP2");
    expect(normaliseQuery("'psma'")).toBe("psma");
    expect(normaliseQuery('"')).toBe('"');
  });
  it("caps very long input", () => {
    expect(normaliseQuery("a".repeat(500)).length).toBe(MAX_QUERY);
  });
});

describe("searchTerms", () => {
  it("drops trailing question marks and full stops", () => {
    expect(searchTerms("what is HER2?")).toBe("what is HER2");
    expect(searchTerms("Enhertu.")).toBe("Enhertu");
    expect(searchTerms("PSMA PET")).toBe("PSMA PET");
  });
});

describe("looksLikeQuestion", () => {
  it("accepts a question mark or a question opener followed by something", () => {
    expect(looksLikeQuestion("Enhertu approved?")).toBe(true);
    expect(looksLikeQuestion("what is TNBC")).toBe(true);
    expect(looksLikeQuestion("How does Enhertu work")).toBe(true);
    expect(looksLikeQuestion("why do tumours resist")).toBe(true);
    expect(looksLikeQuestion("Is HER2-low breast cancer treatable")).toBe(true);
    expect(looksLikeQuestion("does pembrolizumab help in TNBC")).toBe(true);
    expect(looksLikeQuestion("can PSMA PET miss lesions")).toBe(true);
  });
  it("rejects names, codes and lone openers", () => {
    expect(looksLikeQuestion("Enhertu")).toBe(false);
    expect(looksLikeQuestion("NCT03529110")).toBe(false);
    expect(looksLikeQuestion("what")).toBe(false);
    expect(looksLikeQuestion("")).toBe(false);
    expect(looksLikeQuestion("Whatever Pharma")).toBe(false);
    expect(looksLikeQuestion("isatuximab myeloma")).toBe(false);
  });
});

describe("state and URLs", () => {
  const kinds = ["drug", "cancer", "page"];
  it("parses ?q= and ?kind=, ignoring unknown kinds", () => {
    expect(parseSearchState("?q=her2+low&kind=drug", kinds)).toEqual({ q: "her2 low", kind: "drug" });
    expect(parseSearchState("q=x&kind=bogus", kinds)).toEqual({ q: "x", kind: null });
    expect(parseSearchState("", kinds)).toEqual({ q: "", kind: null });
    expect(parseKind(" Drug ", kinds)).toBe("drug");
  });
  it("round-trips every state through a shareable query string", () => {
    expect(searchQueryString({ q: "models", kind: "page" })).toBe("?q=models&kind=page");
    expect(searchQueryString({ q: "", kind: "page" })).toBe("");
    expect(searchQueryString({ q: "  ", kind: null })).toBe("");
    expect(searchHref("PSMA PET")).toBe("/search/?q=PSMA+PET");
    expect(searchHref("PSMA PET", "drug")).toBe("/search/?q=PSMA+PET&kind=drug");
    expect(askHref("what is TNBC?")).toBe("/ask/?q=what%20is%20TNBC%3F");
    expect(parseSearchState(searchQueryString({ q: "her2 low", kind: "cancer" }), kinds)).toEqual({ q: "her2 low", kind: "cancer" });
  });
});

describe("usefulSuggestions", () => {
  it("drops echoes of the query and duplicates, keeps order, caps the count", () => {
    const s = [{ suggestion: "enhertu" }, { suggestion: "Enhertu" }, { suggestion: "enhertu her2" }, { suggestion: "enhertu tnbc" }, { suggestion: "enhertu lung" }, { suggestion: "enhertu gastric" }];
    expect(usefulSuggestions("enhertu?", s)).toEqual(["enhertu her2", "enhertu tnbc", "enhertu lung"]);
    expect(usefulSuggestions("x", [])).toEqual([]);
  });
});
