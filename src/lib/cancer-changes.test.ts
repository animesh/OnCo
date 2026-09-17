import { describe, expect, it } from "vitest";
import { cancerNeedles, dateKey, groupByMonth, matchesCancer, monthLabel, sortChanges, splitUpcoming, yearOf, type ChangeItem } from "./cancer-changes";

const item = (date: string, kind: ChangeItem["kind"], title: string = kind): ChangeItem => ({ date, kind, title, href: "/x/", ref: { id: "x", name: "X", kind: "drug" }, field: "test" });

describe("cancer-changes builders", () => {
  it("reads a year out of the free-text forms the corpus uses, and refuses to invent one", () => {
    expect(yearOf(2024)).toBe(2024);
    expect(yearOf("FY2024")).toBe(2024);
    expect(yearOf("2023/24")).toBe(2023);
    expect(yearOf("2024 updates")).toBe(2024);
    expect(yearOf("2025-03")).toBe(2025);
    expect(yearOf("NCCN Guidelines: Breast Cancer")).toBeUndefined();
    expect(yearOf(undefined)).toBeUndefined();
  });

  it("pads dates so day, month and year precision sort together", () => {
    expect(dateKey("2024")).toBe("2024-00-00");
    expect(dateKey("2025-03")).toBe("2025-03-00");
    expect(dateKey("2026-08-28")).toBe("2026-08-28");
    expect(dateKey("2026-Q2")).toBe("2026-06-00");
    expect(monthLabel("2026-Q2")).toBe("Q2 2026");
  });

  it("orders newest first, dated items ahead of year-only ones in the same year, approvals before trials on a tie", () => {
    const sorted = sortChanges([
      item("2024", "trial", "old trial"),
      item("2026-08-28", "regulatory"),
      item("2025", "history"),
      item("2025-03", "regulatory", "march"),
      item("2024", "approval", "approval a"),
      item("2024", "approval", "approval b"),
    ]);
    expect(sorted.map((x) => `${x.date}:${x.title}`)).toEqual([
      "2026-08-28:regulatory", "2025-03:march", "2025:history", "2024:approval a", "2024:approval b", "2024:old trial",
    ]);
  });

  it("groups by month with a plain label, and by year when only a year is known", () => {
    const groups = groupByMonth(sortChanges([item("2026-08-28", "regulatory"), item("2026-08-02", "approval"), item("2026-07", "guideline"), item("2024", "trial")]));
    expect(groups.map((g) => [g.label, g.items.length])).toEqual([["August 2026", 2], ["July 2026", 1], ["2024", 1]]);
    expect(monthLabel("2025-13")).toBe("2025");
    const quarters = groupByMonth(sortChanges([item("2026-06-15", "approval"), item("2026-Q2", "regulatory"), item("2026-05", "trial")]));
    expect(quarters.map((g) => g.label)).toEqual(["June 2026", "Q2 2026", "May 2026"]);
  });

  it("sets aside items dated after today as coming up, but keeps the current year's year-only items as changes", () => {
    const { upcoming, past } = splitUpcoming([item("2027-Q4", "regulatory"), item("2027", "trial"), item("2026-12-01", "regulatory"), item("2026", "approval"), item("2026-09-01", "approval"), item("2024", "trial")], "2026-09-17");
    expect(upcoming.map((x) => x.date)).toEqual(["2027-Q4", "2027", "2026-12-01"]);
    expect(past.map((x) => x.date)).toEqual(["2026", "2026-09-01", "2024"]);
  });

  it("matches approvals to a cancer by name, alias or bracketed abbreviation, and trusts narrowly used drugs", () => {
    const needles = cancerNeedles({ id: "nsclc", name: "Non-small cell lung cancer (NSCLC)", aka: ["Non-small-cell lung carcinoma"] });
    expect(needles).toContain("non-small cell lung cancer");
    expect(needles).toContain("nsclc");
    expect(matchesCancer("Metastatic NSCLC with EGFR exon 19 deletions", needles, 8)).toBe(true);
    expect(matchesCancer("Unresectable melanoma", needles, 8)).toBe(false);
    expect(matchesCancer("Unresectable melanoma", needles, 2)).toBe(false);
    expect(matchesCancer("Unresectable melanoma", needles, 1)).toBe(true);
  });
});
