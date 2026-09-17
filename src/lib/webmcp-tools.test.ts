import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createWebMCPTools } from "./webmcp-tools";

const { loadSearch, search } = vi.hoisted(() => ({ loadSearch: vi.fn(), search: vi.fn() }));
vi.mock("@/components/SearchBox", () => ({ loadSearch }));
const [searchTool, entityTool] = createWebMCPTools();
const fetchMock = vi.fn();
beforeEach(() => {
  vi.stubGlobal("window", { location: { origin: "https://onco.example" } });
  vi.stubGlobal("fetch", fetchMock);
  search.mockReturnValue([{ id: "her2" }, { id: "drug-a" }, { id: "drug-b" }]);
  loadSearch.mockResolvedValue({ ms: { search }, byId: new Map([
    ["her2", { id: "her2", kind: "target", name: "HER2", route: "/targets/her2/" }],
    ["drug-a", { id: "drug-a", kind: "drug", name: "A", route: "/drugs/drug-a/" }],
    ["drug-b", { id: "drug-b", kind: "drug", name: "B", route: "/drugs/drug-b/" }],
  ]) });
});
afterEach(() => { vi.unstubAllGlobals(); vi.clearAllMocks(); });

describe("WebMCP public data tools", () => {
  it("filters before limiting, reuses search, and includes attribution", async () => {
    const result = await searchTool.execute({ query: " HER2 ", kind: "drug", limit: 1 });
    expect(search).toHaveBeenCalledWith("HER2");
    expect(result).toMatchObject({ data: { results: [{ id: "drug-a", url: "https://onco.example/drugs/drug-a/" }] }, attribution: expect.stringContaining("CC BY-NC 4.0"), disclaimer: expect.stringContaining("not medical advice") });
  });
  it.each([{}, null, { query: " " }, { query: "x", kind: "bad" }, { query: "x", limit: 21 }, { query: "x", limit: 0 }, { query: "x", limit: 1.5 }, { query: "x".repeat(301) }, { query: "x", extra: true }])("rejects invalid search input %j", async (input) => {
    expect(await searchTool.execute(input)).toMatchObject({ isError: true });
    expect(loadSearch).not.toHaveBeenCalled();
  });
  it.each(["../meta", "https://other.test", "a/b", "a?x=1", "a%2fb", ""]) ("rejects unsafe IDs %s before fetching", async (id) => {
    expect(await entityTool.execute({ id })).toMatchObject({ isError: true });
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it("returns the complete record with sources and neighbours", async () => {
    const record = { entity: { id: "her2", asOf: "2026-09-01", links: [{ url: "https://example.org/source" }] }, route: "/targets/her2/", neighbours: { drug: [{ id: "drug-a" }] } };
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify(record)));
    expect(await entityTool.execute({ id: "her2" })).toMatchObject({ data: { ...record, found: true, url: "https://onco.example/targets/her2/" } });
    expect(fetchMock).toHaveBeenCalledWith("/api/v1/entities/her2.json");
  });
  it("distinguishes a missing record from failed requests", async () => {
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 404 }));
    expect(await entityTool.execute({ id: "unknown" })).toMatchObject({ data: { found: false } });
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 503 }));
    expect(await entityTool.execute({ id: "her2" })).toMatchObject({ isError: true });
    fetchMock.mockResolvedValueOnce(new Response("bad json"));
    expect(await entityTool.execute({ id: "her2" })).toMatchObject({ isError: true });
  });
  it("returns empty search results and recoverable loading errors", async () => {
    search.mockReturnValueOnce([]);
    expect(await searchTool.execute({ query: "no match" })).toMatchObject({ data: { results: [] } });
    loadSearch.mockRejectedValueOnce(new Error("offline"));
    expect(await searchTool.execute({ query: "her2" })).toMatchObject({ isError: true });
    expect(await searchTool.execute({ query: "her2" })).not.toHaveProperty("isError");
  });
});
