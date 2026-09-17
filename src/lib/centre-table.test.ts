import { describe, expect, it } from "vitest";
import { buildCentreRows, centreRowsFor, designationsFor, packCentreRows, programmesFor, sortCentreRows, unpackCentreRows, type CentreContext, type CentreRow } from "./centre-table";
import { graph } from "./graph";
import type { Entity, Institution } from "./schema";
import type { ResearchIndex } from "./research";

const base = { aka: [], tldr: "t", summary: "s", asOf: "2026-01-01", links: [], related: [], cancers: [], sections: [], targets: [], drugs: [], companies: [], institutions: [], pathways: [], terms: [], trials: [], people: [], bottlenecks: [], keyPapers: [], journals: [], dependsOn: [], notes: [] };
const inst = (id: string, extra: Partial<Institution> = {}): Institution => ({
  ...base, id, kind: "institution", name: id, city: "City", country: "GB", lat: 0, lng: 0, institutionType: "cancer-center", tags: [], technologies: [], programs: [], ...extra,
} as Institution);
const entity = (id: string, kind: Entity["kind"], name = id): Entity => ({ ...base, id, kind, name, tags: [], technologies: [] } as unknown as Entity);

describe("centre table: designations from record fields", () => {
  it("reads the nci field and recognised tags, skipping unknown tags and the redundant nci-designated tag", () => {
    const d = designationsFor({ nci: "comprehensive", tags: ["nci-designated", "oeci-accredited", "gap-fill", "cruk-centre"] }, (body) => `/institutions/${body}/`);
    expect(d.map((x) => x.label)).toEqual(["NCI comprehensive", "OECI accredited", "CRUK Centre"]);
    expect(d[0].href).toBe("/institutions/?nci=Comprehensive");
    expect(d[1].href).toBe("/institutions/oeci/");
    expect(d[2].href).toBe("/institutions/cruk/");
  });
  it("keeps the nci-designated tag when the nci field is absent, and leaves hrefs empty for bodies without a page", () => {
    const d = designationsFor({ tags: ["nci-designated", "nhs-cancer-alliance"] });
    expect(d.map((x) => x.label)).toEqual(["NCI-designated", "NHS Cancer Alliance"]);
    expect(d.every((x) => x.href === undefined)).toBe(true);
  });
});

describe("centre table: programmes naming the cancer", () => {
  it("matches by name stem and alias, case-insensitively", () => {
    const i = { programs: ["Lung cancer trials", "Gastric cancer surgery", "Proton therapy", "NSCLC early detection"] };
    expect(programmesFor(i, { name: "Non-small cell lung cancer (NSCLC)", aka: ["NSCLC"] })).toEqual(["Lung cancer trials", "NSCLC early detection"]);
    expect(programmesFor(i, { name: "Gastric cancer", aka: [] })).toEqual(["Gastric cancer surgery"]);
    expect(programmesFor(i, { name: "Melanoma", aka: [] })).toEqual([]);
  });
  it("ignores aliases too short to be safe", () => {
    expect(programmesFor({ programs: ["CLL clinic"] }, { name: "Chronic lymphocytic leukaemia", aka: ["CLL"] })).toEqual([]);
  });
});

describe("centre table: rows", () => {
  const records = new Map<string, Entity>([
    ["t-yes", entity("t-yes", "trial", "Trial for this cancer")],
    ["t-no", entity("t-no", "trial", "Trial for another cancer")],
    ["proton", entity("proton", "technology", "Proton therapy")],
    ["oeci", entity("oeci", "institution", "OECI")],
  ]);
  const research = { fetched: "2026-09-17", source: "https://openalex.org", license: "CC0", subfield: 2730, years: [2022, 2026], unresolved: {}, institutions: {
    a: { openalexId: "I1", openalexName: "A", confidence: "ror", works: 300, cited: 4000, byYear: {}, openAccess: 1, clinicalTrials: 20, reviews: 1 },
  } } as unknown as ResearchIndex;
  const ctx: CentreContext = {
    lookup: (id) => records.get(id),
    cancerTrialIds: new Set(["t-yes"]),
    trialsOf: (id) => (id === "a" ? ["t-yes", "t-no"] : id === "b" ? ["t-no"] : []),
    research,
    rank: new Map([["a", 3]]),
  };
  const rows = buildCentreRows({ name: "Lung cancer", aka: [] }, [
    { inst: inst("a", { tags: ["oeci-accredited"], technologies: ["proton", "missing"], programs: ["Lung cancer service"], newsweekOncology2026: 12 }), via: ["this cancer"] },
    { inst: inst("b", { nci: "clinical", country: "US" }), via: ["Trial for another cancer"] },
    { inst: inst("c", { newsweekOncology2026: 2 }), via: ["this cancer"] },
  ], ctx);

  it("counts only trials linked to both the centre and the cancer, and resolves technologies that exist", () => {
    const a = rows.find((r) => r.id === "a")!;
    expect(a.trials.map((t) => t.id)).toEqual(["t-yes"]);
    expect(a.technologies.map((t) => t.name)).toEqual(["Proton therapy"]);
    expect(rows.find((r) => r.id === "b")!.trials).toEqual([]);
  });

  it("copies research counts from the index with the window, and leaves null where the centre is not matched", () => {
    const a = rows.find((r) => r.id === "a")!;
    expect(a.research).toEqual({ works: 300, cited: 4000, clinicalTrials: 20, years: [2022, 2026] });
    expect(rows.find((r) => r.id === "b")!.research).toBeNull();
  });

  it("carries designations, programmes, Newsweek rank and leadership rank from the records", () => {
    const a = rows.find((r) => r.id === "a")!;
    expect(a.designations.map((d) => d.label)).toEqual(["OECI accredited"]);
    expect(a.designations[0].href).toBe("/institutions/oeci/");
    expect(a.programmes).toEqual(["Lung cancer service"]);
    expect(a.newsweek).toBe(12);
    expect(a.leadershipRank).toBe(3);
    expect(rows.find((r) => r.id === "b")!.designations.map((d) => d.label)).toEqual(["NCI clinical"]);
  });

  it("orders by Newsweek rank, then trials for this cancer, then research output, then name", () => {
    expect(rows.map((r) => r.id)).toEqual(["c", "a", "b"]);
    const tie: CentreRow[] = [
      { ...rows[2], id: "z", name: "Z", trials: [], research: null, newsweek: undefined },
      { ...rows[2], id: "y", name: "Y", trials: [], research: { works: 5, cited: 0, clinicalTrials: 0, years: [2022, 2026] as [number, number] }, newsweek: undefined },
      { ...rows[2], id: "x", name: "X", trials: [{ id: "t", name: "T", route: "/trials/t/" }], research: null, newsweek: undefined },
    ];
    expect(sortCentreRows(tie).map((r) => r.id)).toEqual(["x", "y", "z"]);
  });
});

describe("centre table: packed form for the finder", () => {
  it("round-trips rows through pack and unpack, sharing institution facts and trial names across cancers", () => {
    const shared = inst("a", { tags: ["oeci-accredited"], newsweekOncology2026: 12 });
    const ctx: CentreContext = { lookup: (id) => (id === "t1" ? entity("t1", "trial", "Trial one") : undefined), cancerTrialIds: new Set(["t1"]), trialsOf: () => ["t1"], research: null };
    const one = buildCentreRows({ name: "Lung cancer", aka: [] }, [{ inst: shared, via: ["this cancer", "x", "y", "z", "w", "v", "u"] }], ctx);
    const two = buildCentreRows({ name: "Melanoma", aka: [] }, [{ inst: shared, via: ["this cancer"] }, { inst: inst("b"), via: ["Trial one"] }], ctx);
    const { pack, links } = packCentreRows({ lung: one, melanoma: two });
    expect(Object.keys(pack.institutions).sort()).toEqual(["a", "b"]);
    expect(pack.trials).toEqual({ t1: { name: "Trial one", route: "/trials/t1/" } });
    expect(links.lung[0].v).toHaveLength(5);
    expect(links.lung[0].vn).toBe(7);
    const back = unpackCentreRows(links.melanoma, pack);
    expect(back.map((r) => r.id)).toEqual(two.map((r) => r.id));
    expect(back[0]).toEqual(two[0]);
    expect(back[1].trials).toEqual([{ id: "t1", name: "Trial one", route: "/trials/t1/" }]);
    const lung = unpackCentreRows(links.lung, pack)[0];
    expect(lung.via).toEqual(one[0].via.slice(0, 5));
    expect(lung.viaTotal).toBe(7);
    expect(lung.designations).toEqual(one[0].designations);
    expect(JSON.stringify({ pack, links }).length).toBeLessThan(JSON.stringify({ lung: one, melanoma: two }).length);
  });
  it("skips links whose institution is missing from the pack", () => {
    expect(unpackCentreRows([{ i: "ghost", v: [], vn: 0, t: [], p: [] }], { institutions: {}, trials: {} })).toEqual([]);
  });
});

describe("centre table: over the corpus", () => {
  it("builds rows for a well-covered cancer, every trial counted belongs to the cancer, and no row invents an outcome figure", () => {
    const g = graph();
    const rows = centreRowsFor("tnbc");
    expect(rows.length).toBeGreaterThan(3);
    const cancerTrials = new Set((g.forCancer("tnbc").get("trial") ?? []).map((t) => t.id).concat(g.must("tnbc").kind === "cancer" ? (g.must("tnbc") as Extract<Entity, { kind: "cancer" }>).standardOfCare.flatMap((s) => s.refs) : []));
    for (const r of rows) {
      expect(g.get(r.id)?.kind).toBe("institution");
      for (const t of r.trials) expect(cancerTrials.has(t.id), `${r.id}: ${t.id}`).toBe(true);
      expect(Object.keys(r)).not.toContain("outcomes");
      expect(Object.keys(r)).not.toContain("volume");
      if (r.research) expect(r.research.works).toBeGreaterThanOrEqual(0);
    }
    expect(rows.some((r) => r.trials.length > 0)).toBe(true);
    expect(rows.some((r) => r.designations.length > 0)).toBe(true);
  });

  it("returns nothing for ids that are not cancers", () => {
    expect(centreRowsFor("pembrolizumab")).toEqual([]);
    expect(centreRowsFor("no-such-thing")).toEqual([]);
  });
});
