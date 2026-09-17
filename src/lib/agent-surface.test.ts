/**
 * The agent-facing surface of a record page: <link rel="alternate"> twins, typed JSON-LD with a BreadcrumbList, and
 * the hidden "Machine-readable versions" landmark. One record per kind is rendered with react-dom/server, the same
 * way Next renders these server components, and the HTML is inspected.
 */
import { readFileSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, it, expect } from "vitest";
import { graph } from "./graph";
import { KINDS, KIND_META, routeFor, type Entity, type Kind } from "./schema";
import { MACHINE, TITLE_MAX, entityMeta, entityTitle, machineRoutes } from "./seo";
import { JsonLd } from "@/components/JsonLd";
import { MachineLinks } from "@/components/MachineLinks";
import { createWebMCPTools } from "./webmcp-tools";

/** schema.org type expected per kind; kinds not listed fall back to Thing. */
const EXPECTED_TYPE: Partial<Record<Kind, string>> = {
  cancer: "MedicalCondition", drug: "Drug", trial: "MedicalTrial", company: "Organization", person: "Person",
  paper: "MedicalScholarlyArticle", term: "DefinedTerm", collection: "DataCatalog", journal: "Periodical",
};

const g = graph();
/** One record per live kind; for trials, one with a registry id so the identifier and sameAs paths are exercised. */
const samples: Entity[] = KINDS.flatMap((k) => {
  const all = g.kind(k);
  const pick = k === "trial" ? all.find((e) => e.kind === "trial" && e.nct) : all[0];
  return pick ? [pick] : [];
});

const jsonLdBlocks = (html: string): Array<Record<string, unknown>> =>
  [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/g)].map((m) => JSON.parse(m[1]));

describe("record page agent surface", () => {
  it("covers every kind that has records", () => {
    expect(samples.length).toBeGreaterThanOrEqual(15);
  });

  it.each(samples.map((e) => [e.kind, e] as const))("%s: alternate links point at the JSON and Markdown twins", (_k, e) => {
    const m = entityMeta(e);
    const types = m.alternates?.types as Record<string, Array<{ url: string; title: string }>>;
    const twins = machineRoutes(e);
    expect(m.alternates?.canonical).toBe(`https://onco.cc${routeFor(e)}`);
    expect(types["application/json"][0].url).toBe(twins.json.url);
    expect(types["text/markdown"][0].url).toBe(twins.markdown.url);
    expect(twins.json.url).toBe(`/api/v1/entities/${e.id}.json`);
    expect(twins.markdown.url).toBe(`/api/v1/context/${e.id}.md`);
    // Language is a client-side toggle on one URL, so there must be no hreflang variants.
    expect(m.alternates?.languages).toBeUndefined();
  });

  it.each(samples.map((e) => [e.kind, e] as const))("%s: JSON-LD is typed by kind, carries the twins and a BreadcrumbList", (k, e) => {
    const blocks = jsonLdBlocks(renderToStaticMarkup(createElement(JsonLd, { e })));
    expect(blocks).toHaveLength(2);
    const [node, crumbs] = blocks;
    expect(node["@type"]).toBe(EXPECTED_TYPE[k] ?? node["@type"]);
    expect(node.name).toBe(e.name);
    expect(node["@id"]).toBe(`https://onco.cc${routeFor(e)}`);
    if (e.aka.length) expect(node.alternateName).toEqual(expect.arrayContaining(e.aka));
    if (e.wikipedia) expect(node.sameAs).toContain(e.wikipedia);
    if (e.kind === "trial" && e.nct) {
      expect(node.identifier).toBe(e.nct);
      expect(node.sameAs).toContain(`https://clinicaltrials.gov/study/${e.nct}`);
    }
    const twins = machineRoutes(e);
    const docs = node.subjectOf as Array<{ url: string; encodingFormat: string }>;
    expect(docs.map((d) => d.url)).toEqual([`https://onco.cc${twins.markdown.url}`, `https://onco.cc${twins.json.url}`]);
    expect(crumbs["@type"]).toBe("BreadcrumbList");
    expect((crumbs.itemListElement as unknown[]).length).toBe(3);
  });

  it.each(samples.map((e) => [e.kind, e] as const))("%s: the hidden machine block is one labelled landmark with stamped links", (_k, e) => {
    const html = renderToStaticMarkup(createElement(MachineLinks, { e }));
    expect(html).toMatch(/^<nav aria-label="Machine-readable versions" class="sr-only" data-onco-id="[^"]+" data-onco-kind="[^"]+"/);
    expect(html).toContain(`data-onco-id="${e.id}"`);
    expect(html).toContain(`data-onco-kind="${e.kind}"`);
    const twins = machineRoutes(e);
    expect(html).toContain(`href="${twins.json.url}" type="application/json"`);
    expect(html).toContain(`href="${twins.markdown.url}" type="text/markdown"`);
    expect(html).toContain(`href="${encodeURI(`/api/v1/${KIND_META[e.kind].plural}.json`)}"`);
    for (const path of [MACHINE.search, MACHINE.openapi, MACHINE.triples, MACHINE.api, MACHINE.meta, MACHINE.llms]) expect(html).toContain(`href="${path}"`);
    expect(html).toContain(MACHINE.mcp.command);
    for (const t of [...MACHINE.mcp.tools, ...MACHINE.webmcp.tools]) expect(html).toContain(t);
    // The inline script stamps <main> in the static HTML; ids are kebab-case so nothing needs escaping, but check anyway.
    expect(html).toContain(`m.setAttribute("data-onco-id","${e.id}")`);
    expect(html).not.toContain("<script><");
  });

  it("wikidata sameAs uses the same IRI form as the triples file", () => {
    const withQid = g.entities.find((e) => e.id === "abemaciclib");
    expect(withQid).toBeDefined();
    const [node] = jsonLdBlocks(renderToStaticMarkup(createElement(JsonLd, { e: withQid! })));
    expect(node.sameAs).toContain("http://www.wikidata.org/entity/Q23901483");
  });
});

describe("machine tool names stay in step with their registrations", () => {
  it("MCP tool names match packages/onco-mcp/src/server.ts", () => {
    const src = readFileSync(new URL("../../packages/onco-mcp/src/server.ts", import.meta.url), "utf8");
    const registered = [...src.matchAll(/registerTool\("([a-z_]+)"/g)].map((m) => m[1]);
    expect(registered).toEqual([...MACHINE.mcp.tools]);
  });
  it("WebMCP tool names match src/lib/webmcp-tools.ts", () => {
    expect(createWebMCPTools().map((t) => t.name)).toEqual([...MACHINE.webmcp.tools]);
  });
});

describe("entity titles", () => {
  it("stay within the search-result title budget for every record", () => {
    const over = g.entities.map((e) => `${entityTitle(e)} · OnCo`).filter((t) => t.length > TITLE_MAX);
    expect(over).toEqual([]);
  });
  it("keep short names whole and cut long ones at a word boundary", () => {
    const short = g.entities.find((e) => e.kind === "target" && e.name.length < 20)!;
    expect(entityTitle(short)).toBe(`${short.name} · Target`);
    const trial = samples.find((e) => e.kind === "trial")!;
    if (trial.kind === "trial" && trial.nct) {
      const t = entityTitle(trial);
      expect(t.endsWith(` · ${trial.nct}`)).toBe(true);
      expect(t).not.toMatch(/\s…/);
    }
  });
});
