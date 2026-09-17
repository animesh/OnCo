/**
 * Emits the corpus as RDF: N-Triples for the whole graph at public/api/v1/onco.nt, and one small Turtle file per
 * record at public/api/v1/rdf/<id>.ttl (the record's own properties, outgoing relations and owl:sameAs, with the
 * prefixes declared once). The vocabulary is in scripts/rdf.ts, shared by both writers.
 *
 * The per-record files are only rewritten when their content changes, and files for ids that no longer exist are
 * removed, so incremental builds stay fast and the directory never holds stale records.
 *
 *   npx tsx scripts/build-triples.ts
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { graph } from "../src/lib/graph";
import { OWL_SAME_AS, RDF_TYPE, SCHEMA, SITE, iri, lit, recordTriples, toNTriples, toTurtle } from "./rdf";

const g = graph();
const lines: string[] = [];
let sameAs = 0;

const out = join(process.cwd(), "public", "api", "v1");
const rdfDir = join(out, "rdf");
mkdirSync(rdfDir, { recursive: true });

/** Write only when the content differs, so unchanged files keep their mtime and the static export stays incremental. */
function writeIfChanged(path: string, content: string): boolean {
  if (existsSync(path) && readFileSync(path, "utf8") === content) return false;
  writeFileSync(path, content);
  return true;
}

let written = 0;
const keep = new Set<string>();
for (const e of g.entities) {
  const triples = recordTriples(g, e);
  if (triples.some(([p]) => p === OWL_SAME_AS)) sameAs++;
  lines.push(...toNTriples(e, triples));
  const file = `${e.id}.ttl`;
  keep.add(file);
  if (writeIfChanged(join(rdfDir, file), toTurtle(e, triples))) written++;
}
let removed = 0;
for (const file of readdirSync(rdfDir)) if (file.endsWith(".ttl") && !keep.has(file)) { unlinkSync(join(rdfDir, file)); removed++; }

const dataset = iri(`${SITE}/api/v1/onco.nt`);
lines.push(`${dataset} ${iri(RDF_TYPE)} ${iri(`${SCHEMA}Dataset`)} .`);
lines.push(`${dataset} ${iri(`${SCHEMA}license`)} ${iri("https://creativecommons.org/licenses/by-nc/4.0/")} .`);
lines.push(`${dataset} ${iri(`${SCHEMA}name`)} ${lit("OnCo knowledge graph", "en")} .`);
writeFileSync(join(out, "onco.nt"), lines.join("\n") + "\n");

console.log(`triples: ${lines.length} triples for ${g.entities.length} records, ${sameAs} owl:sameAs links to Wikidata; rdf/<id>.ttl: ${keep.size} files (${written} written, ${keep.size - written} unchanged, ${removed} removed)`);
