import type { Entity } from "@/lib/schema";
import { KIND_META, routeFor } from "@/lib/schema";
import { MACHINE, absoluteUrl, machineRoutes } from "@/lib/seo";
import { MainDataAttrs } from "./MainDataAttrs";

/** Attributes every link in the block carries, so a script can pick a file by format without parsing link text. */
const stamp = (e: Entity, format: string) => ({ "data-onco-id": e.id, "data-onco-kind": e.kind, "data-onco-format": format });

/**
 * The machine-readable versions of one record, for agents and crawlers that read the page HTML. Visually hidden
 * (`sr-only`) so people see nothing new; a single labelled navigation landmark so screen-reader users meet one
 * collapsed region, not a wall of links. Every link is a real path and the same files appear in the page's
 * `<link rel="alternate">` tags and the JSON-LD `subjectOf`, all built from `machineRoutes`.
 *
 * Also stamps `data-onco-id` / `data-onco-kind` on `<main>`: the inline script does it in the static HTML (it runs
 * before hydration, and `<main>` is above it in the document), `MainDataAttrs` keeps it right after client-side
 * navigation.
 */
export function MachineLinks({ e }: { e: Entity }) {
  const twins = machineRoutes(e);
  const route = routeFor(e);
  const plural = KIND_META[e.kind].plural;
  const setMain = `var m=document.getElementById("main");if(m){m.setAttribute("data-onco-id",${JSON.stringify(e.id)});m.setAttribute("data-onco-kind",${JSON.stringify(e.kind)})}`.replace(/</g, "\\u003c");
  return (
    <nav aria-label="Machine-readable versions" className="sr-only" data-onco-id={e.id} data-onco-kind={e.kind} data-onco-route={route}>
      <h2>Machine-readable versions of {e.name}</h2>
      <ul>
        <li><a href={twins.json.url} type={twins.json.type} {...stamp(e, "json")}>JSON record with neighbours</a></li>
        <li><a href={twins.markdown.url} type={twins.markdown.type} {...stamp(e, "markdown")}>Markdown context for language models</a></li>
        <li><a href={twins.turtle.url} type={twins.turtle.type} {...stamp(e, "turtle")}>RDF Turtle for this record</a> (its triples, relations and owl:sameAs; the IRI of this record is {absoluteUrl(route)})</li>
        <li><a href={encodeURI(`/api/v1/${plural}.json`)} type="application/json" {...stamp(e, "kind-json")}>All {plural} as JSON</a></li>
        <li><a href={MACHINE.triples} type="application/n-triples" {...stamp(e, "rdf")}>RDF N-Triples for the whole corpus</a></li>
        <li><a href={MACHINE.search} type="application/json" {...stamp(e, "search")}>Search index: id, kind, name, TL;DR and route for every record</a></li>
        <li><a href={MACHINE.openapi} type="application/vnd.oai.openapi+json" {...stamp(e, "openapi")}>OpenAPI 3.1 description</a></li>
        <li><a href={MACHINE.api} {...stamp(e, "api")}>API root</a> and <a href={MACHINE.meta} type="application/json" {...stamp(e, "meta")}>meta.json</a></li>
        <li><a href={MACHINE.llms} type="text/plain" {...stamp(e, "llms")}>llms.txt</a></li>
      </ul>
      <p data-onco-mcp={MACHINE.mcp.command}>
        MCP server: <code>{MACHINE.mcp.command}</code>, tools {MACHINE.mcp.tools.join(", ")}. This record is <code>get_entity</code> or <code>context</code> with id <code>{e.id}</code>.
      </p>
      <p data-onco-webmcp={MACHINE.webmcp.tools.join(" ")}>WebMCP tools registered on this page: {MACHINE.webmcp.tools.join(", ")}.</p>
      <script dangerouslySetInnerHTML={{ __html: setMain }} />
      <MainDataAttrs id={e.id} kind={e.kind} />
    </nav>
  );
}
