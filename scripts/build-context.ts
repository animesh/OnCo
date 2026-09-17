/**
 * LLM-ready context files: one clean Markdown document per record at public/api/v1/context/<id>.md
 * (TL;DR, summary, structured fields, sources, neighbours), an index at public/api/v1/context/index.md,
 * and public/llms.txt following the llms.txt convention (https://llmstxt.org). Everything is derived from
 * the same graph the site is built from; nothing is added.
 *
 *   npx tsx scripts/build-context.ts
 */
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { graph } from "../src/lib/graph";
import { KIND_META, KINDS, routeFor, type Entity } from "../src/lib/schema";
import { NAV_GROUPS } from "../src/lib/nav";
import { MACHINE } from "../src/lib/seo";
import { paragraphs } from "../src/lib/text";

const SITE = "https://onco.cc";
const g = graph();
const url = (e: { kind: Entity["kind"]; id: string }) => `${SITE}${routeFor(e)}`;
const link = (e: Entity) => `[${e.name}](${url(e)})`;
const names = (ids: string[]) => ids.map((id) => link(g.must(id))).join(", ");

function fields(e: Entity): string[] {
  const out: string[] = [];
  const row = (k: string, v?: string | number | boolean | null) => { if (v !== undefined && v !== null && v !== "" && v !== false) out.push(`- ${k}: ${v}`); };
  const list = (k: string, vs: string[]) => { if (vs.length) out.push(`- ${k}: ${vs.join("; ")}`); };
  row("Kind", KIND_META[e.kind].label);
  row("Status", e.status);
  row("Last checked", e.asOf);
  list("Also known as", e.aka);
  list("Tags", e.tags);
  switch (e.kind) {
    case "cancer": row("Group", e.group); row("Burden", e.burden); list("Subtypes", e.subtypes); list("Biomarkers", e.biomarkers); break;
    case "technology": row("Principle", e.principle); row("Generation", e.generation); row("Since", e.since); list("Strengths", e.strengths); list("Limitations", e.limitations); break;
    case "target": row("Symbol", e.symbol); row("Class", e.targetClass); row("Biology", e.biology); list("Where found", e.whereFound); break;
    case "drug": row("Brand", e.brand); row("Code", e.code); row("Modality", e.modality); row("Mechanism", e.mechanism); row("Payload", e.payload); row("Linker", e.linker); list("Approvals", e.approvals.map((a) => `${a.region} ${a.year}: ${a.indication}`)); if (e.dosing) row("Dosing", `${e.dosing.route}; ${e.dosing.schedule}`); list("Toxicity (grade 3+)", e.toxicity.filter((t) => t.grade3PlusPct !== undefined).map((t) => `${t.event} ${t.grade3PlusPct}%`)); break;
    case "company": row("HQ", e.hq); row("Type", e.companyType); row("Website", e.website); row("Ticker", e.ticker); break;
    case "institution": row("City", `${e.city}, ${e.country}`); row("Type", e.institutionType); row("NCI designation", e.nci); row("Website", e.website); break;
    case "trial": row("Registry id", e.nct); row("Phase", e.phase); row("Setting", e.setting); row("Sponsor", e.sponsor); row("Enrolled", e.enrolled); row("Result", e.result); list("Outcomes", e.outcomes.map((o) => `${o.endpoint}: ${o.arms.map((a) => `${a.name}${a.value !== undefined ? ` ${a.value}${o.unit === "%" ? "%" : o.unit ? ` ${o.unit}` : ""}` : ""}`).join(" vs ")}${o.hr !== undefined ? `, HR ${o.hr}` : ""}`)); row("Replication", e.replication); break;
    case "pairing": row("Pairs", `${g.must(e.a).name} + ${g.must(e.b).name}`); row("Type", e.pairingType); row("Rationale", e.rationale); row("Evidence", e.evidence); break;
    case "idea": row("Hypothesis", e.hypothesis); row("Rationale", e.rationale); row("Proposed test", e.test); row("Maturity", e.maturity); row("Actor", e.actor); break;
    case "paper": row("Journal", e.journal); row("Year", e.year); row("DOI", e.doi); row("Authors", e.authors); list("Findings", e.findings); row("What it means", e.whatItMeans); list("Caveats", e.caveats); break;
    case "person": row("Role", e.role); list("Specialisms", e.specialisms); break;
    case "bottleneck": row("Stage", e.stage); row("Severity", e.severity); list("Metrics", e.metrics.map((m) => `${m.label}: ${m.value}${m.source ? ` (${m.source})` : ""}`)); list("Causes", e.causes); break;
    case "pathway": row("Analogy", e.analogy); list("Interventions", e.interventions); break;
    case "journal": row("Publisher", e.publisher); row("Scope", e.scope); row("Access", e.access); break;
    case "collection": row("URL", e.url); row("Holds", e.holds); row("Licence", e.license); break;
    default: break;
  }
  return out;
}

function contextMd(e: Entity): string {
  const parts: string[] = [`# ${e.name}`, "", `Source: ${url(e)}  `, `OnCo record \`${e.id}\` (${KIND_META[e.kind].label}). Data CC BY-NC 4.0, attribute "Data from OnCo (onco.cc)"; commercial use needs a licence.`, "", "## TL;DR", "", e.tldr, "", "## Summary", "", ...paragraphs(e.summary).flatMap((p) => [p, ""])];
  const f = fields(e);
  if (f.length) parts.push("## Fields", "", ...f, "");
  if (e.kind === "cancer") {
    if (e.standardOfCare.length) parts.push("## Standard of care", "", ...e.standardOfCare.map((s) => `- ${s.setting}: ${s.approach}${s.refs.length ? ` (${names(s.refs)})` : ""}`), "");
    if (e.stateOfArt.length) parts.push("## State of the art", "", ...e.stateOfArt.map((s) => `- ${s}`), "");
    if (e.openProblems.length) parts.push("## Open problems", "", ...e.openProblems.map((s) => `- ${s}`), "");
  }
  if (e.notes.length) parts.push("## Notes", "", ...e.notes.map((n) => `- ${n}`), "");
  const src: string[] = [];
  if (e.wikipedia) src.push(`- Wikipedia: ${e.wikipedia}`);
  for (const l of e.links) src.push(`- ${l.label}: ${l.url}`);
  if (src.length) parts.push("## Sources", "", ...src, "");
  const nb: string[] = [];
  for (const [k, list] of g.neighbours(e.id)) nb.push(`- ${KIND_META[k].plural}: ${list.map(link).join(", ")}`);
  if (nb.length) parts.push("## Connected records", "", ...nb, "");
  parts.push("---", `JSON: ${SITE}/api/v1/entities/${e.id}.json`);
  return parts.join("\n");
}

const dir = join(process.cwd(), "public", "api", "v1", "context");
rmSync(dir, { recursive: true, force: true });
mkdirSync(dir, { recursive: true });
for (const e of g.entities) writeFileSync(join(dir, `${e.id}.md`), contextMd(e));

const index: string[] = ["# OnCo context files", "", `One Markdown file per record, ${g.entities.length} in total. Each has the TL;DR, technical summary, structured fields, sources and connected records.`, ""];
for (const k of KINDS) {
  const list = g.kind(k);
  if (!list.length) continue;
  index.push(`## ${KIND_META[k].plural[0].toUpperCase()}${KIND_META[k].plural.slice(1)} (${list.length})`, "");
  for (const e of list) index.push(`- [${e.name}](${SITE}/api/v1/context/${e.id}.md): ${e.tldr}`);
  index.push("");
}
writeFileSync(join(dir, "index.md"), index.join("\n"));

// llms.txt (https://llmstxt.org): deterministic (no timestamp) so the committed copy only changes when the corpus does.
const liveKinds = KINDS.filter((k) => g.kind(k).length);
const REPO = "https://github.com/judegomila/OnCo";
const llms: string[] = [
  "# OnCo",
  "",
  "> A public, cited knowledge graph of oncology: cancers, fronts, technologies, targets, treatments and tests, companies, institutions, people, pathways, trials, pairings, roadmaps, key papers, journals, bottlenecks and ideas, one page per object, each with a plain-English TL;DR, a technical summary, dated facts and links to primary sources. Not medical advice.",
  "",
  `${g.entities.length.toLocaleString("en-GB")} records in ${liveKinds.length} kinds: ${liveKinds.map((k) => `${g.kind(k).length.toLocaleString("en-GB")} ${KIND_META[k].plural}`).join(", ")}. Every fact is dated and linked to a primary source; where a number is not sourced it is omitted. Facts may be incomplete or out of date: cite the OnCo page and check the primary source it links before relying on anything that matters.`,
  "",
  "## Licence and attribution",
  "",
  "- Data: CC BY-NC 4.0 (https://creativecommons.org/licenses/by-nc/4.0/). Free for individual and educational use with attribution; commercial use must contact OnCo to pay for the data.",
  `- Attribution line: "Data from OnCo (onco.cc)" with a link to ${SITE}. When you answer from OnCo, cite the page URL after the fact.`,
  `- Code: MIT (${REPO}). Cite the software or the dataset with ${REPO}/blob/main/CITATION.cff.`,
  `- Not medical advice. Where a reader asks about their own care, point them to their clinical team and to the primary sources on the page.`,
  "",
  "## Best entry points for assistants",
  "",
  `- [One record as Markdown](${SITE}/api/v1/context/tnbc.md): /api/v1/context/<id>.md, the cleanest form of a record (TL;DR, summary, fields, sources, connected records); the index is at /api/v1/context/index.md`,
  `- [One record as JSON](${SITE}/api/v1/entities/tnbc.json): /api/v1/entities/<id>.json, with neighbours grouped by kind`,
  `- [Search documents](${SITE}/api/v1/search.json): compact id, kind, name, TL;DR and route for every record; find the id, then fetch its context file`,
  `- [Every record on one line](${SITE}/llms-full.txt): name, kind, TL;DR and context URL for the whole corpus`,
  `- [OpenAPI 3.1 description](${SITE}/api/v1/openapi.json): every file under /api/v1/ and the feeds`,
  `- [MCP server](${REPO}/tree/main/packages/onco-mcp): \`${MACHINE.mcp.command}\` gives Claude, Cursor and other MCP clients ${MACHINE.mcp.tools.slice(0, -1).join(", ")} and ${MACHINE.mcp.tools.at(-1)} tools over this API; the CLI is \`npx onco\``,
  "",
  "## For agents",
  "",
  `- [API root](${SITE}${MACHINE.api}): the file list and counts are in [meta.json](${SITE}${MACHINE.meta}); everything is static GET, no key, CORS open`,
  `- [Search index](${SITE}${MACHINE.search}): resolve a name or alias to an id here, then fetch /api/v1/context/<id>.md (Markdown) or /api/v1/entities/<id>.json (JSON)`,
  `- [OpenAPI 3.1](${SITE}${MACHINE.openapi}): machine-readable description of every route`,
  `- [RDF N-Triples](${SITE}${MACHINE.triples}): a record's IRI is its page URL; owl:sameAs links to Wikidata`,
  `- [RDF Turtle per record](${SITE}/api/v1/rdf/tnbc.ttl): /api/v1/rdf/<id>.ttl, one small file with the record's own triples, its outgoing relations and its owl:sameAs, prefixes declared once`,
  `- MCP: \`${MACHINE.mcp.command}\` (tools ${MACHINE.mcp.tools.join(", ")}). WebMCP: browsers with a model context get ${MACHINE.webmcp.tools.join(" and ")} on every page.`,
  `- Every record page carries <link rel="alternate"> tags to its Markdown, JSON and Turtle twins, schema.org JSON-LD (typed by kind, with a BreadcrumbList), and a hidden navigation landmark labelled "Machine-readable versions" whose links carry data-onco-id, data-onco-kind and data-onco-format; <main> carries data-onco-id and data-onco-kind.`,
  `- Language is a reader-side toggle on the same URL, so there is one URL per record and no hreflang variants.`,
  "",
  "## Machine-readable corpus",
  "",
  `- [All records as JSON](${SITE}/api/v1/all.json): every entity with defaults applied plus a backlink map (several megabytes)`,
  `- [All records as NDJSON](${SITE}/api/v1/all.ndjson): one entity per line with its route`,
  `- [Per kind](${SITE}/api/v1/drugs.json): /api/v1/<plural>.json and /api/v1/<plural>.csv for each kind listed below`,
  `- [Entity schema](${SITE}/api/v1/schema.json): JSON Schema (draft 2020-12) of one record, generated from the Zod schema that validates the corpus`,
  `- [RDF N-Triples](${SITE}/api/v1/onco.nt): schema.org terms, owl:sameAs to Wikidata`,
  `- [Concept index](${SITE}/api/v1/embeddings.json): TF-IDF vectors used by the site search (binary at embeddings.bin)`,
  `- [Similar pages](${SITE}/api/v1/similar.json): top 8 similar records per id with the shared links`,
  `- [Metadata](${SITE}/api/v1/meta.json): build date, counts per kind, licence, the file list`,
  `- [Feeds](${SITE}/feeds/changelog.xml): Atom feeds at /feeds/changelog.xml, /feeds/regulatory.xml, /feeds/calendar.xml, /feeds/pulse.xml and /newsletter/feed.xml; iCalendar at /catalysts/feed.ics`,
  `- [Releases](${REPO}/releases): the corpus attached to each tagged release as JSON, NDJSON, CSV and schema`,
  "",
  "## Kinds",
  "",
  ...liveKinds.map((k) => `- [${KIND_META[k].plural[0].toUpperCase()}${KIND_META[k].plural.slice(1)}](${SITE}/${KIND_META[k].route}/): ${KIND_META[k].blurb} JSON at /api/v1/${KIND_META[k].plural}.json`),
  "",
];
for (const grp of NAV_GROUPS) {
  llms.push(`## ${grp.label}`, "", ...grp.items.filter((it) => !it.href.startsWith("http")).map((it) => `- [${it.label}](${SITE}${it.href}): ${it.blurb}`), "");
}
llms.push("## Optional", "", `- [About and methodology](${SITE}/about/): rules for facts, ranking formulas, licence`, `- [Open API](${SITE}/api/): the corpus as JSON, with the endpoint list`, `- [Build on OnCo](${SITE}/build/): recipes, types, embeddable cards, the MCP server`, `- [Corrections](${SITE}/corrections/): every factual correction and how it was found`, `- [GitHub](${REPO}): edit any record with a pull request`, "");
writeFileSync(join(process.cwd(), "public", "llms.txt"), llms.join("\n"));

// llms-full.txt: the whole corpus in one file, one line per record (kind, name, TL;DR, context URL). The full
// per-record text would be tens of megabytes, so this is the digest an assistant can hold in one go; each line
// points at the record's Markdown context file for the rest. Gitignored (about a megabyte, regenerated each build).
const full: string[] = [
  "# OnCo: every record",
  "",
  `> ${g.entities.length.toLocaleString("en-GB")} records in ${liveKinds.length} kinds, one line each: name (kind): TL;DR, then the URL of the record's Markdown context file, which holds the technical summary, structured fields, sources and connected records. The site overview and licence are at ${SITE}/llms.txt. Data CC BY-NC 4.0, attribute "Data from OnCo (onco.cc)"; commercial use must contact OnCo. Not medical advice.`,
  "",
];
for (const k of liveKinds) {
  const list = g.kind(k);
  full.push(`## ${KIND_META[k].plural[0].toUpperCase()}${KIND_META[k].plural.slice(1)} (${list.length.toLocaleString("en-GB")})`, "", KIND_META[k].blurb, "");
  for (const e of list) full.push(`- ${e.name} (${KIND_META[k].label.toLowerCase()}): ${e.tldr.replace(/\s+/g, " ").trim()} ${SITE}/api/v1/context/${e.id}.md`);
  full.push("");
}
writeFileSync(join(process.cwd(), "public", "llms-full.txt"), full.join("\n"));

console.log(`context: ${g.entities.length} Markdown files, index.md, llms.txt and llms-full.txt written`);
